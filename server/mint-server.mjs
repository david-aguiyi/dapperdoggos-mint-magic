#!/usr/bin/env node
/**
 * FALLBACK 1: Raw Candy Machine Instructions
 * 
 * This approach bypasses Metaplex SDK's high-level mint() wrapper
 * and builds the transaction manually using raw program instructions.
 * 
 * Benefits:
 * - Full control over every account and parameter
 * - Can see exactly what's undefined causing the error
 * - No SDK abstraction issues
 * - Works with any Candy Machine version
 */

import express from "express";
import cors from "cors";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";
import os from "os";

// Import the raw mint instruction builder (CommonJS compatibility)
import * as mplCandyMachineCore from "@metaplex-foundation/mpl-candy-machine";
const { mintV2, safeFetchCandyMachine, safeFetchCandyGuard, mplCandyMachine: candyMachineProgram } = mplCandyMachineCore;

// Umi framework imports
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, generateSigner, transactionBuilder, some, signerIdentity, createSignerFromKeypair } from "@metaplex-foundation/umi";

// Configuration
const PORT = process.env.PORT || 3001;
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const KEYPAIR = process.env.SOL_KEYPAIR || "./mainnet.json";
const CANDY_MACHINE_ID = process.env.CANDY_MACHINE_ID || "4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt";

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting
const activeMints = new Map();

// Initialize Solana config
const initSolanaConfig = () => {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config', 'solana', 'cli');
    const configFile = path.join(configDir, 'config.yml');
    
    if (!fs.existsSync(configFile)) {
        console.log('Creating Solana CLI config...');
        fs.mkdirSync(configDir, { recursive: true });
        const configContent = `json_rpc_url: "${RPC}"\nwebsocket_url: ""\nkeypair_path: ${KEYPAIR}\naddress_labels:\n  "11111111111111111111111111111111": System Program\ncommitment: confirmed\n`;
        fs.writeFileSync(configFile, configContent);
        console.log('Solana config created at:', configFile);
    }
};

initSolanaConfig();

/**
 * FALLBACK 1 MINT ENDPOINT
 * Uses raw Candy Machine instructions via Umi framework
 */
app.post("/mint", async (req, res) => {
    const { wallet, quantity = 1 } = req.body;
    
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }
    
    // Validate quantity
    if (quantity < 1 || quantity > 5) {
        return res.status(400).json({ 
            error: "Invalid Quantity",
            message: "Quantity must be between 1 and 5"
        });
    }

    // Rate limiting
    const mintKey = `${wallet}-${Date.now()}`;
    if (activeMints.has(wallet)) {
        return res.status(429).json({ 
            error: "Rate Limited",
            message: "Please wait before minting again"
        });
    }
    activeMints.set(wallet, mintKey);

    console.log('\n🚀 ========================================');
    console.log('FALLBACK 1: Raw Candy Machine Instructions');
    console.log('==========================================');
    console.log(`📋 Minting request for wallet: ${wallet}, quantity: ${quantity}`);

    try {
        // Step 1: Initialize Umi (new Metaplex framework)
        console.log('\n1️⃣ Initializing Umi framework...');
        const umi = createUmi(RPC);
        
        // Register Candy Machine program with Umi
        if (typeof candyMachineProgram === 'function') {
            umi.use(candyMachineProgram());
            console.log('   ✅ Candy Machine program registered');
        }
        
        // Load keypair
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        console.log('   🔑 Authority wallet:', authorityKeypair.publicKey.toString());
        
        // Convert to Umi keypair and set as identity (proper way)
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairData));
        const umiSigner = createSignerFromKeypair(umi, umiKeypair);
        umi.use(signerIdentity(umiSigner));
        
        console.log('   ✅ Umi initialized with authority identity');

        // Step 2: Fetch Candy Machine data
        console.log('\n2️⃣ Fetching Candy Machine data...');
        const candyMachinePublicKey = publicKey(CANDY_MACHINE_ID);
        const candyMachine = await safeFetchCandyMachine(umi, candyMachinePublicKey);
        
        if (!candyMachine) {
            throw new Error('Candy Machine not found at address: ' + CANDY_MACHINE_ID);
        }

        console.log('   ✅ Candy Machine loaded:', {
            address: candyMachine.publicKey,
            itemsRedeemed: candyMachine.itemsRedeemed.toString(),
            itemsAvailable: candyMachine.data.itemsAvailable.toString(),
            authority: candyMachine.authority,
            mintAuthority: candyMachine.mintAuthority,
            collectionMint: candyMachine.collectionMint,
        });

        // Check if sold out
        const itemsRemaining = Number(candyMachine.data.itemsAvailable) - Number(candyMachine.itemsRedeemed);
        if (itemsRemaining < quantity) {
            activeMints.delete(wallet);
            return res.status(400).json({ 
                error: "Not enough NFTs available",
                message: `Only ${itemsRemaining} NFT(s) remaining, but you requested ${quantity}`,
                isSoldOut: itemsRemaining === 0
            });
        }

        // Step 3: Fetch Candy Guard (if exists)
        console.log('\n3️⃣ Fetching Candy Guard...');
        let candyGuard = null;
        if (candyMachine.mintAuthority.__kind === 'Some') {
            const guardAddress = candyMachine.mintAuthority.value;
            candyGuard = await safeFetchCandyGuard(umi, guardAddress);
            console.log('   ✅ Candy Guard loaded:', {
                address: guardAddress,
                guards: candyGuard?.guards
            });
        } else {
            console.log('   ℹ️ No Candy Guard configured');
        }

        // Step 4: Build mint transaction using raw instructions
        console.log('\n4️⃣ Building mint transaction...');
        const receiverPublicKey = publicKey(wallet);
        console.log('   🎯 Minting to wallet:', wallet);
        console.log('   🔑 Payer (authority):', authorityKeypair.publicKey.toString());

        const mintResults = [];

        for (let i = 0; i < quantity; i++) {
            console.log(`\n   📦 Minting NFT ${i + 1}/${quantity}...`);

            // Generate new NFT mint account
            const nftMint = generateSigner(umi);
            console.log(`      🆕 New NFT mint address: ${nftMint.publicKey}`);

            // Build the mint instruction
            let mintBuilder = transactionBuilder()
                .add(
                    mintV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        candyGuard: candyGuard?.publicKey,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.authority,
                        minter: receiverPublicKey,
                        // Umi automatically derives these accounts:
                        // - metadata PDA
                        // - master edition PDA
                        // - token account
                        // - associated token account
                    })
                );

            // Send and confirm transaction
            console.log('      📤 Sending transaction...');
            const result = await mintBuilder.sendAndConfirm(umi, {
                confirm: { commitment: 'confirmed' },
            });

            // Convert signature from Umi format (Uint8Array) to base58 string
            const signature = typeof result.signature === 'string' 
                ? result.signature 
                : Buffer.from(result.signature).toString('base64');
            
            console.log(`      ✅ NFT ${i + 1} minted successfully!`);
            console.log(`         Mint Address: ${nftMint.publicKey}`);
            console.log(`         Signature: ${signature}`);

            // Store mint result with proper string conversions
            const mintAddress = typeof nftMint.publicKey === 'string' 
                ? nftMint.publicKey 
                : nftMint.publicKey.toString();
            
            mintResults.push({
                mint: mintAddress,
                signature: signature,
                name: `DapperDoggo #${candyMachine.itemsRedeemed + BigInt(i + 1)}`,
            });
        }

        // Step 5: Fetch NFT metadata for first minted NFT
        console.log('\n5️⃣ Fetching NFT metadata...');
        let image = null;
            try {
            // Use original Metaplex SDK to fetch metadata (it's good at this part)
                const connection = new Connection(RPC, "confirmed");
            const metaplex = Metaplex.make(connection);
            const nft = await metaplex.nfts().findByMint({ 
                mintAddress: new PublicKey(mintResults[0].mint) 
            });
            
            if (nft?.json?.image) {
                        image = nft.json.image;
                console.log('   ✅ Image URL:', image);
            }
        } catch (metadataError) {
            console.error('   ⚠️ Error fetching metadata:', metadataError.message);
        }

        // Clean up rate limiting
        activeMints.delete(wallet);

        console.log('\n✅ ========================================');
        console.log('MINT COMPLETED SUCCESSFULLY!');
        console.log('==========================================\n');

        // Return success response
        res.status(200).json({
                success: true, 
            message: `Successfully minted ${quantity} NFT(s) using raw instructions!`,
            mint: mintResults[0].mint,
            signature: mintResults[0].signature,
            image: image,
            wallet: wallet,
            quantity: quantity,
            allMints: mintResults
        });

    } catch (error) {
        console.error('\n❌ ========================================');
        console.error('MINT FAILED!');
        console.error('==========================================');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('==========================================\n');

        activeMints.delete(wallet);

            res.status(500).json({ 
            error: 'Mint Failed',
            message: error.message,
            details: error.toString()
        });
    }
});

/**
 * Collection status endpoint
 */
app.get("/collection/status", async (req, res) => {
    try {
        const umi = createUmi(RPC);
        
        // Register Candy Machine program
        if (typeof candyMachineProgram === 'function') {
            umi.use(candyMachineProgram());
        }
        
        const candyMachinePublicKey = publicKey(CANDY_MACHINE_ID);
        const candyMachine = await safeFetchCandyMachine(umi, candyMachinePublicKey);
        
        if (!candyMachine) {
            return res.status(404).json({ error: "Candy Machine not found" });
        }

        res.json({
            itemsRedeemed: candyMachine.itemsRedeemed.toString(),
            itemsAvailable: candyMachine.data.itemsAvailable.toString(),
            isSoldOut: candyMachine.itemsRedeemed >= candyMachine.data.itemsAvailable
        });
    } catch (error) {
        console.error('Error fetching collection status:', error);
        res.status(500).json({ error: 'Failed to fetch collection status' });
    }
});

app.listen(PORT, () => {
    console.log(`\n✨ FALLBACK 1 Mint API listening on http://localhost:${PORT}`);
    console.log(`📋 Using raw Candy Machine instructions via Umi`);
    console.log(`🍬 Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`🌐 RPC: ${RPC}\n`);
});

