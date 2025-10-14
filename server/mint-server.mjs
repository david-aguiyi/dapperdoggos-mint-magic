#!/usr/bin/env node
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";
import os from "os";

// Initialize Solana config for compatibility
const initSolanaConfig = () => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config', 'solana', 'cli');
    const configFile = path.join(configDir, 'config.yml');
    
    if (!fs.existsSync(configFile)) {
        console.log('Creating Solana CLI config...');
        fs.mkdirSync(configDir, { recursive: true });
        const configContent = `json_rpc_url: "${process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'}"\nwebsocket_url: ""\nkeypair_path: ${process.env.SOL_KEYPAIR || '/etc/secrets/mainnet.json'}\naddress_labels:\n  "11111111111111111111111111111111": System Program\ncommitment: confirmed\n`;
        fs.writeFileSync(configFile, configContent);
        console.log('Solana config created at:', configFile);
    }
};

// Initialize on startup
initSolanaConfig();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const KEYPAIR = process.env.SOL_KEYPAIR || `${process.env.USERPROFILE}\\.config\\solana\\mainnet.json`;
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const CANDY_MACHINE_ID = "4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt";

// Track active mint requests to prevent duplicates
const activeMints = new Map();

// Mint endpoint - Using Metaplex SDK
app.post("/mint", async (req, res) => {
    const { wallet, quantity = 1 } = req.body;
    console.log(`🎯 Minting request for wallet: ${wallet}, quantity: ${quantity}`);
    
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }
    
    // Check for duplicate mint requests
    const mintKey = `${wallet}-${quantity}`;
    if (activeMints.has(mintKey)) {
        console.log(`⚠️ Duplicate mint request detected for ${mintKey}, rejecting`);
        return res.status(429).json({ 
            error: "Mint already in progress", 
            message: "Please wait for the current mint to complete before starting another one."
        });
    }
    
    // Mark this mint as active
    activeMints.set(mintKey, Date.now());
    
    // Clean up after 2 minutes (in case something goes wrong)
    setTimeout(() => {
        activeMints.delete(mintKey);
    }, 120000);
    
    if (quantity < 1 || quantity > 10) {
        activeMints.delete(mintKey);
        return res.status(400).json({ error: "Quantity must be between 1 and 10" });
    }
    
    // Check wallet balance before minting
    try {
        const connection = new Connection(RPC, "confirmed");
        const walletPubkey = new PublicKey(wallet);
        const balance = await connection.getBalance(walletPubkey);
        const balanceInSol = balance / 1000000000; // Convert lamports to SOL
        
        // Calculate required amount (price + estimated gas fees)
        const pricePerNft = 0.1; // SOL per NFT (PRODUCTION PRICE)
        const estimatedGasFees = 0.01 * quantity; // ~0.01 SOL per NFT for gas
        const requiredAmount = (pricePerNft * quantity) + estimatedGasFees;
        
        console.log(`💰 Balance check: ${balanceInSol} SOL available, ${requiredAmount} SOL required`);
        
        if (balanceInSol < requiredAmount) {
            activeMints.delete(mintKey);
            return res.status(400).json({ 
                error: "Insufficient Balance 💰", 
                message: `You need at least ${requiredAmount.toFixed(2)} SOL (${(pricePerNft * quantity).toFixed(3)} SOL for ${quantity} NFT${quantity > 1 ? 's' : ''} + ~${estimatedGasFees.toFixed(2)} SOL gas fees). You currently have ${balanceInSol.toFixed(2)} SOL. Please add more SOL to your wallet.`,
                isInsufficientFunds: true,
                requiredAmount: requiredAmount.toFixed(2),
                currentBalance: balanceInSol.toFixed(2)
            });
        }
    } catch (balanceCheckError) {
        console.error("⚠️ Balance check error:", balanceCheckError);
        // Continue with mint if balance check fails (fallback)
    }
    
    // Use Metaplex SDK for minting with Candy Machine v3 MintV2 instruction
    try {
        console.log('🚀 Starting Metaplex SDK mint (CMv3 MintV2) - DEPLOYED VERSION...');
        
        // Initialize connection
        const connection = new Connection(RPC, "confirmed");
        
        // Load the authority keypair
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        console.log('🔑 Authority wallet:', authorityKeypair.publicKey.toString());
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
        
        // Load candy machine
        const candyMachineAddress = new PublicKey(CANDY_MACHINE_ID);
        const candyMachine = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress });
        
        console.log('🍬 Candy Machine loaded:', {
            address: candyMachine.address.toBase58(),
            itemsAvailable: candyMachine.itemsAvailable.toString(),
            itemsMinted: candyMachine.itemsMinted.toString(),
        });
        
        // Check if sold out
        if (candyMachine.itemsAvailable.toNumber() < quantity) {
            activeMints.delete(mintKey);
            return res.status(400).json({
                error: "Not enough NFTs available",
                message: `Only ${candyMachine.itemsAvailable.toString()} NFT(s) remaining, but you requested ${quantity}`,
                isSoldOut: candyMachine.itemsAvailable.toNumber() === 0
            });
        }
        
        // Mint NFTs - use the standard mint with payer parameter
        const receiverPubkey = new PublicKey(wallet);
        const mintResults = [];
        
        for (let i = 0; i < quantity; i++) {
            console.log(`🎨 Minting NFT ${i + 1}/${quantity}...`);
            
            // Mint with MintV2 instruction (required for CMv3)
            const { nft, response } = await metaplex.candyMachines().mintV2({
                candyMachine,
                owner: receiverPubkey,
                payer: receiverPubkey,
            });
            
            mintResults.push({
                mint: nft.address.toString(),
                signature: response.signature,
                name: nft.name,
            });
            
            console.log(`✅ Minted NFT ${i + 1}: ${nft.address.toString()}, Signature: ${response.signature}`);
        }
        
        // Clean up active mint tracking
        activeMints.delete(mintKey);
        
        // Get the first minted NFT details for response
        const firstMint = mintResults[0];
        let image = null;
        
        // Fetch image metadata
        try {
            console.log('🖼️ Fetching NFT metadata...');
            const mintPubkey = new PublicKey(firstMint.mint);
            const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
            
            if (nft && nft.json && nft.json.image) {
                image = nft.json.image;
                console.log('✅ Image found:', image);
            }
        } catch (imageError) {
            console.error('⚠️ Error fetching NFT image:', imageError);
            // Continue without image
        }
        
        console.log(`🎉 Mint complete! Signature: ${firstMint.signature}`);
        
        // Return success response
        return res.json({
            success: true,
            message: `Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`,
            mint: firstMint.mint,
            signature: firstMint.signature,
            explorerUrl: `https://explorer.solana.com/tx/${firstMint.signature}?cluster=mainnet-beta`,
            image: image || '/nfts/1.png', // Fallback image
            allMints: mintResults,
            quantity,
            wallet
        });
        
    } catch (mintError) {
        console.error('❌ Metaplex mint error:', mintError);
        activeMints.delete(mintKey);
        
        // Handle specific Metaplex errors
        if (mintError.message?.includes('insufficient') || mintError.message?.includes('InsufficientFunds')) {
            return res.status(400).json({
                error: "Insufficient Balance 💰",
                message: `Minting failed due to insufficient funds. Please ensure both your wallet and the authority wallet have enough SOL.`,
                isInsufficientFunds: true
            });
        }
        
        if (mintError.message?.includes('sold out') || mintError.message?.includes('No items available')) {
            return res.status(400).json({
                error: "Collection Sold Out! 🎉",
                message: "All DapperDoggos have been minted!",
                isSoldOut: true
            });
        }
        
        return res.status(500).json({
            error: "Mint Failed",
            message: mintError.message || "An error occurred during minting",
            details: mintError.toString()
        });
    }
});

// Collection status endpoint
app.get("/collection/status", async (req, res) => {
    try {
        // Use direct Solana web3 calls instead of Sugar
        const connection = new Connection(RPC, "confirmed");
        const cacheData = JSON.parse(fs.readFileSync('./cache-mainnet.json', 'utf8'));
        const candyMachineId = cacheData.program?.candyMachine;
        
        if (!candyMachineId) {
            return res.status(500).json({ error: "Candy machine ID not found" });
        }
        
        // For now, return static data from cache
        const items = cacheData.items || {};
        const itemsArray = Object.values(items);
        const totalItems = itemsArray.length;
        
        // You can implement real-time blockchain queries here later
        // For now, return static data that matches your mainnet candy machine
        res.json({
            success: true,
            itemsRedeemed: 4, // This should be fetched from blockchain in production
            itemsAvailable: 250,
            totalItems: 254,
            symbol: "DAPPER",
            candyMachineId,
            collectionMint: cacheData.program?.collectionMint || null,
            isSoldOut: false,
            progress: 1.6 // 4/254
        });
    } catch (error) {
        console.error("Error getting collection status:", error);
        res.status(500).json({ error: "Failed to get collection status" });
    }
});

app.listen(PORT, () =>
    console.log(`✨ Mint API listening on http://localhost:${PORT}`)
);
