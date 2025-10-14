#!/usr/bin/env node
/**
 * SIMPLE METAPLEX SDK APPROACH
 * Works with Candy Machines that don't have Candy Guards
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
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const KEYPAIR = process.env.SOL_KEYPAIR || "./mainnet.json";
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

    const mintKey = `${wallet}-${Date.now()}`;
    if (activeMints.has(wallet)) {
        return res.status(429).json({ 
            error: "Rate Limited",
            message: "Please wait before minting again"
        });
    }
    activeMints.set(wallet, mintKey);

    console.log('\n🚀 ========================================');
    console.log('SIMPLE SDK: Metaplex JS (CM without Guard)');
    console.log('==========================================');
    console.log(`📋 Minting for wallet: ${wallet}, quantity: ${quantity}`);

    try {
        // Initialize connection and Metaplex
        const connection = new Connection(RPC, "confirmed");
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        
        console.log('🔑 Authority wallet:', authorityKeypair.publicKey.toString());
        console.log('🚀 FORCE DEPLOY v4 - UNDEFINED ERROR FIXED - ' + new Date().toISOString());
        
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
            activeMints.delete(wallet);
            return res.status(400).json({ 
                error: "Not enough NFTs available",
                message: `Only ${remaining} NFT(s) remaining`,
                isSoldOut: remaining === 0
            });
        }

        // Mint to user's wallet (backend pays gas, NFT goes to user)
        const receiverPubkey = new PublicKey(wallet);
        console.log('🎯 Minting to:', receiverPubkey.toString());
        console.log('💸 Payer:', authorityKeypair.publicKey.toString());
        
        const mintResults = [];
        
        for (let i = 0; i < quantity; i++) {
            console.log(`\n📦 Minting NFT ${i + 1}/${quantity}...`);
            
            try {
                // Mint with simple parameters
                const { nft, response } = await metaplex.candyMachines().mint({
                    candyMachine,
                    owner: receiverPubkey,
                });
                
                console.log('🔍 Mint result:', { nft, response });
                
                // Validate the response
                if (!nft || !nft.address) {
                    throw new Error('NFT object is missing address');
                }
                if (!response || !response.signature) {
                    throw new Error('Response object is missing signature');
                }
                
                console.log(`✅ Minted: ${nft.address.toString()}`);
                console.log(`📝 Signature: ${response.signature}`);
                
                mintResults.push({
                    mint: nft.address.toString(),
                    signature: response.signature,
                    name: nft.name || `DapperDoggo #${i + 1}`,
                });
            } catch (mintError) {
                console.error(`❌ Failed to mint NFT ${i + 1}:`, mintError);
                activeMints.delete(mintKey);
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

        activeMints.delete(wallet);

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
        
        activeMints.delete(wallet);
        
            res.status(500).json({ 
            error: 'Mint Failed',
            message: error.message,
            details: error.toString()
            });
        }
    });

// RPC Proxy endpoint - allows frontend to use backend's RPC
app.post("/rpc-proxy", async (req, res) => {
    try {
        const connection = new Connection(RPC, "confirmed");
        const { method, params } = req.body;
        
        // Proxy the RPC call
        const result = await connection._rpcRequest(method, params);
        res.json(result);
    } catch (error) {
        console.error('RPC proxy error:', error);
        res.status(500).json({ error: 'RPC request failed' });
    }
});

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

        res.json({
            itemsRedeemed: candyMachine.itemsMinted.toString(),
            itemsAvailable: candyMachine.itemsAvailable.toString(),
            isSoldOut: candyMachine.itemsMinted.toNumber() >= candyMachine.itemsAvailable.toNumber()
        });
    } catch (error) {
        console.error('Error fetching collection status:', error);
        res.status(500).json({ error: 'Failed to fetch collection status' });
    }
});

app.listen(PORT, () => {
    console.log(`\n✨ Mint API listening on http://localhost:${PORT}`);
    console.log(`📋 Using Metaplex JS SDK (simple approach)`);
    console.log(`🍬 Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`🌐 RPC: ${RPC}\n`);
});

