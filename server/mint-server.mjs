#!/usr/bin/env node
/**
 * SIMPLE METAPLEX SDK APPROACH
 * Works with Candy Machines that don't have Candy Guards
 */

import express from "express";
import cors from "cors";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { fetchCandyMachine, mintV2, mint } from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { transactionBuilder, publicKey as umiPublicKey, generateSigner } from '@metaplex-foundation/umi';
import * as mplCandyMachineModule from '@metaplex-foundation/mpl-candy-machine';
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

    const mintKey = `${wallet}-${quantity}`;
    if (activeMints.has(mintKey)) {
        return res.status(429).json({ 
            error: "Rate Limited",
            message: "Please wait before minting again"
        });
    }
    activeMints.set(mintKey, Date.now());
    
    // Clean up after 30 seconds (much shorter timeout)
    setTimeout(() => {
        activeMints.delete(mintKey);
        console.log(`🧹 Cleaned up rate limit for ${mintKey}`);
    }, 30000);

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
        
        // Check authority wallet balance
        const authorityBalance = await connection.getBalance(authorityKeypair.publicKey);
        const authorityBalanceSOL = authorityBalance / 1e9;
        console.log('💰 Authority balance:', authorityBalanceSOL.toFixed(4), 'SOL');
        
        if (authorityBalanceSOL < 0.01) {
            console.log('⚠️ WARNING: Authority wallet has low balance for transaction fees');
            console.log('💡 Consider adding more SOL to the authority wallet');
        }
        
        console.log('🚀 FORCE DEPLOY v16 - STANDARD MINT ONLY - NO GUARD - ' + new Date().toISOString());
        
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

        // Mint to user's wallet (backend pays gas, NFT goes to user)
        const receiverPubkey = new PublicKey(wallet);
        console.log('🎯 Minting to:', receiverPubkey.toString());
        console.log('💸 Payer:', authorityKeypair.publicKey.toString());
        
        const mintResults = [];
        
        for (let i = 0; i < quantity; i++) {
            console.log(`\n📦 Minting NFT ${i + 1}/${quantity}...`);
            
            try {
                // Use Umi framework - this should work without undefined account issues
                console.log('🎯 Using Umi framework for minting...');
                
                // Create Umi instance with proper signer
                const umi = createUmi(RPC);
                
                // Convert Solana keypair to Umi keypair format
                const umiKeypair = {
                    publicKey: umiPublicKey(authorityKeypair.publicKey.toString()),
                    secretKey: authorityKeypair.secretKey
                };
                
                // Create a signer from the keypair
                const authoritySigner = createSignerFromKeypair(umi, umiKeypair);
                
                // Set as the identity signer
                umi.use(signerIdentity(authoritySigner));
                
                // Register Candy Machine program
                const { mplCandyMachine } = mplCandyMachineModule;
                if (typeof mplCandyMachine === 'function') {
                    umi.use(mplCandyMachine());
                    console.log('✅ Candy Machine program registered');
                }
                
                // Fetch Candy Machine with Umi
                const candyMachineAddress = umiPublicKey(CANDY_MACHINE_ID);
                const umiCandyMachine = await fetchCandyMachine(umi, candyMachineAddress);
                
                console.log('🍬 Umi Candy Machine loaded:', {
                    address: umiCandyMachine.publicKey,
                    itemsRedeemed: umiCandyMachine.itemsRedeemed.toString(),
                    itemsAvailable: umiCandyMachine.data.itemsAvailable.toString(),
                });
                
                // Generate new NFT mint account
                const nftMint = generateSigner(umi);
                
                // Use ONLY standard mint (no guard required)
                console.log('🎯 Using standard mint (no guard required)...');
                const tx = await transactionBuilder()
                    .add(setComputeUnitLimit(umi, { units: 800_000 }))
                    .add(
                        mint(umi, {
                            candyMachine: umiCandyMachine.publicKey,
                            nftMint,
                            collectionMint: umiCandyMachine.collectionMint,
                            collectionUpdateAuthority: umiCandyMachine.authority,
                        })
                    )
                    .sendAndConfirm(umi);
                
                console.log('✅ Umi mint successful!');
                console.log('📝 Signature:', tx.signature);
                
                const mintResult = {
                    nft: {
                        address: nftMint.publicKey,
                        name: `DapperDoggo #${i + 1}`
                    },
                    response: {
                        signature: tx.signature
                    }
                };
                
                console.log('🔍 Raw mint result:', mintResult);
                console.log('🔍 Mint result type:', typeof mintResult);
                console.log('🔍 Mint result keys:', Object.keys(mintResult || {}));
                
                // Safely extract nft and response
                const nft = mintResult?.nft;
                const response = mintResult?.response;
                
                console.log('🔍 NFT object:', nft);
                console.log('🔍 Response object:', response);
                
                // Validate the response with detailed error messages
                if (!nft) {
                    throw new Error('Mint result does not contain NFT object');
                }
                if (!nft.address) {
                    throw new Error('NFT object does not contain address property');
                }
                if (!response) {
                    throw new Error('Mint result does not contain response object');
                }
                if (!response.signature) {
                    throw new Error('Response object does not contain signature property');
                }
                
                // Safely convert to strings
                const mintAddress = nft.address?.toString ? nft.address.toString() : String(nft.address);
                const signature = response.signature?.toString ? response.signature.toString() : String(response.signature);
                
                console.log(`✅ Minted: ${mintAddress}`);
                console.log(`📝 Signature: ${signature}`);
                
                mintResults.push({
                    mint: mintAddress,
                    signature: signature,
                    name: nft.name || `DapperDoggo #${i + 1}`,
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

