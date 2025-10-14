#!/usr/bin/env node
/**
 * METAPLEX SDK ONLY APPROACH
 * Uses only Metaplex SDK - no Umi, no guards
 */

import express from "express";
import cors from "cors";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";
import os from "os";

// Initialize Solana config
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

initSolanaConfig();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const RPC = process.env.RPC_URL || "https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20";
const KEYPAIR = process.env.SOL_KEYPAIR || "./keypair-mainnet.json";
const CANDY_MACHINE_ID = process.env.CANDY_MACHINE_ID || "4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt";

const activeMints = new Map();

app.post("/mint", async (req, res) => {
    const { wallet, quantity = 1 } = req.body;
    
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }
    
    if (quantity < 1 || quantity > 5) {
        return res.status(400).json({ 
            error: "Invalid Quantity",
            message: "Quantity must be between 1 and 5"
        });
    }

    const mintKey = `${wallet}-${quantity}`;
    if (activeMints.has(mintKey)) {
        return res.status(429).json({ 
            error: "Rate Limited",
            message: "Please wait before minting again"
        });
    }
    activeMints.set(mintKey, Date.now());
    
    // Clean up after 30 seconds
    setTimeout(() => {
        activeMints.delete(mintKey);
        console.log(`🧹 Cleaned up rate limit for ${mintKey}`);
    }, 30000);

    console.log('\n🚀 ========================================');
    console.log('METAPLEX SDK ONLY: No Umi, No Guards');
    console.log('==========================================');
    console.log(`📋 Minting for wallet: ${wallet}, quantity: ${quantity}`);
    console.log('🚀 FORCE DEPLOY v17 - METAPLEX SDK ONLY - ' + new Date().toISOString());

    try {
        // Initialize connection and Metaplex
        const connection = new Connection(RPC, "confirmed");
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        
        console.log('🔑 Authority wallet:', authorityKeypair.publicKey.toString());
        
        // Check authority wallet balance
        const authorityBalance = await connection.getBalance(authorityKeypair.publicKey);
        const authorityBalanceSOL = authorityBalance / 1e9;
        console.log('💰 Authority balance:', authorityBalanceSOL.toFixed(4), 'SOL');
        
        if (authorityBalanceSOL < 0.01) {
            console.log('⚠️ WARNING: Authority wallet has low balance for transaction fees');
            console.log('💡 Consider adding more SOL to the authority wallet');
        }
        
        const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
        
        // Load Candy Machine
        const candyMachineAddress = new PublicKey(CANDY_MACHINE_ID);
        const candyMachine = await metaplex.candyMachines().findByAddress({ 
            address: candyMachineAddress 
        });
        
        console.log('🍬 Candy Machine loaded:', {
            address: candyMachine.address.toBase58(),
            itemsAvailable: candyMachine.itemsAvailable.toString(),
            itemsMinted: candyMachine.itemsMinted.toString(),
        });

        // Check if sold out
        const remaining = candyMachine.itemsAvailable.toNumber() - candyMachine.itemsMinted.toNumber();
        if (remaining < quantity) {
            activeMints.delete(mintKey);
            return res.status(400).json({ 
                error: "Not enough NFTs available",
                message: `Only ${remaining} NFT(s) remaining`,
                isSoldOut: remaining === 0
            });
        }

        // Mint to user's wallet (authority pays gas, user gets NFT)
        const receiverPubkey = new PublicKey(wallet);
        console.log('🎯 Minting to:', receiverPubkey.toString());
        console.log('💸 Authority pays gas, user gets NFT');
        
        const mintResults = [];
        
        for (let i = 0; i < quantity; i++) {
            console.log(`\n📦 Minting NFT ${i + 1}/${quantity}...`);
            
            try {
                // Use Metaplex SDK only (no guards)
                console.log('🎯 Using Metaplex SDK for minting...');
                
                const nft = await candyMachine.mint({
                    owner: receiverPubkey,
                    payer: authorityKeypair.publicKey,
                });
                
                console.log('✅ Metaplex mint successful!');
                console.log('📝 Signature:', nft.response.signature);
                
                const mintAddress = nft.nft.address.toString();
                const signature = nft.response.signature;
                
                console.log(`✅ Minted: ${mintAddress}`);
                console.log(`📝 Signature: ${signature}`);
                
                mintResults.push({
                    mint: mintAddress,
                    signature: signature,
                    name: nft.nft.name || `DapperDoggo #${i + 1}`,
                });
                
            } catch (mintError) {
                console.error(`❌ Failed to mint NFT ${i + 1}:`, mintError);
                console.error(`❌ Error stack:`, mintError.stack);
                activeMints.delete(mintKey);
                
                // Check for insufficient funds error
                if (mintError.message?.includes('Insufficient funds')) {
                    return res.status(400).json({
                        error: 'Insufficient Funds',
                        message: 'Authority wallet needs more SOL for transaction fees. Please add ~0.01 SOL to the authority wallet.',
                        isInsufficientFunds: true,
                        authorityWallet: authorityKeypair.publicKey.toString(),
                        requiredAmount: '0.01',
                        details: 'The backend authority wallet needs more SOL to pay for transaction fees.'
                    });
                }
                
                return res.status(500).json({
                    error: 'Mint Failed',
                    message: `Failed to mint NFT ${i + 1}: ${mintError.message}`,
                    details: mintError.toString()
                });
            }
        }

        // Get metadata
        let image = null;
        try {
            const firstNFT = await metaplex.nfts().findByMint({ 
                mintAddress: new PublicKey(mintResults[0].mint) 
            });
            image = firstNFT.json?.image || null;
        } catch (metadataError) {
            console.error('⚠️ Metadata fetch failed:', metadataError.message);
        }

        activeMints.delete(mintKey);

        console.log('\n✅ MINT SUCCESSFUL!');
        
        res.status(200).json({
            success: true,
            message: `Successfully minted ${quantity} NFT(s)!`,
            mint: mintResults[0].mint,
            signature: mintResults[0].signature,
            image: image,
            wallet: wallet,
            quantity: quantity
        });
    } catch (error) {
        console.error('\n❌ MINT FAILED:', error);
        console.error('Stack:', error.stack);
        
        activeMints.delete(mintKey);
        
        let errorMessage = 'Mint Failed';
        let details = error.message;

        if (error.logs) {
            details += '\nProgram Logs:\n| ' + error.logs.join('\n| ');
        }
        
        res.status(500).json({ 
            error: errorMessage,
            message: details,
            details: error.toString()
        });
    }
});

// Collection status endpoint
app.get("/collection/status", async (req, res) => {
    try {
        const connection = new Connection(RPC, "confirmed");
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        
        const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
        
        const candyMachineAddress = new PublicKey(CANDY_MACHINE_ID);
        const candyMachine = await metaplex.candyMachines().findByAddress({ 
            address: candyMachineAddress 
        });
        
        const itemsMinted = candyMachine.itemsMinted.toNumber();
        const itemsAvailable = candyMachine.itemsAvailable.toNumber();
        const isSoldOut = itemsMinted >= itemsAvailable;
        
        res.json({
            itemsRedeemed: itemsMinted,
            itemsAvailable: itemsAvailable,
            isSoldOut: isSoldOut,
            remaining: itemsAvailable - itemsMinted
        });
    } catch (error) {
        console.error('Error fetching collection status:', error);
        res.status(500).json({ error: 'Failed to fetch collection status' });
    }
});

app.listen(PORT, () => {
    console.log('🚀 Starting DapperDoggos Mint Server...');
    console.log('ℹ️ Using Metaplex SDK only (no Sugar CLI needed)');
    console.log('🌟 Starting Mint API server...');
    console.log(`✨ Mint API listening on http://localhost:${PORT}`);
    console.log('📋 Using Metaplex JS SDK (simple approach)');
    console.log('🍬 Candy Machine:', CANDY_MACHINE_ID);
    console.log('🌐 RPC:', RPC);
    console.log('');
});
