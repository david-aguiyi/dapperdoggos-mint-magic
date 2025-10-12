#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fetch from "node-fetch";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";
import os from "os";

// Initialize Solana config for Sugar CLI
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
const KEYPAIR =
    process.env.SOL_KEYPAIR ||
    `${process.env.USERPROFILE}\\.config\\solana\\mainnet.json`;
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

// Detect OS and use appropriate Sugar binary
const isWindows = process.platform === "win32";
const SUGAR_CMD = isWindows ? ".\\sugar-windows-latest.exe" : "./sugar";

// Track active mint requests to prevent duplicates
const activeMints = new Map();

app.post("/mint", async (req, res) => {
    const { wallet, quantity = 1 } = req.body;
    console.log(`Minting request for wallet: ${wallet}, quantity: ${quantity}`);
    
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }
    
    // Check for duplicate mint requests
    const mintKey = `${wallet}-${quantity}`;
    if (activeMints.has(mintKey)) {
        console.log(`Duplicate mint request detected for ${mintKey}, rejecting`);
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
        const pricePerNft = 0.003; // SOL per NFT (TESTING PRICE)
        const estimatedGasFees = 0.01 * quantity; // ~0.01 SOL per NFT for gas
        const requiredAmount = (pricePerNft * quantity) + estimatedGasFees;
        
        console.log(`Balance check: ${balanceInSol} SOL available, ${requiredAmount} SOL required`);
        
        if (balanceInSol < requiredAmount) {
            return res.status(400).json({ 
                error: "Insufficient Balance 💰", 
                message: `You need at least ${requiredAmount.toFixed(2)} SOL (${(pricePerNft * quantity).toFixed(1)} SOL for ${quantity} NFT${quantity > 1 ? 's' : ''} + ~${estimatedGasFees.toFixed(2)} SOL gas fees). You currently have ${balanceInSol.toFixed(2)} SOL. Please add more SOL to your wallet.`,
                isInsufficientFunds: true,
                requiredAmount: requiredAmount.toFixed(2),
                currentBalance: balanceInSol.toFixed(2)
            });
        }
    } catch (balanceCheckError) {
        console.error("Balance check error:", balanceCheckError);
        // Continue with mint if balance check fails (fallback)
    }
    
    const cmd = `${SUGAR_CMD} mint --keypair ${KEYPAIR} --rpc-url ${RPC} --receiver ${wallet} --cache cache-mainnet.json --log-level info --number ${quantity}`;
    exec(cmd, { cwd: process.cwd(), timeout: 120000 }, async (err, stdout, stderr) => {
        if (err) {
            // Check for various error conditions
            const combinedOutput = (stdout || '') + (stderr || '');
            console.log("Sugar output:", { stdout, stderr, combinedOutput });
            
            // Check if collection is sold out
            if (combinedOutput.includes('0 item(s) available') || 
                combinedOutput.includes('items available') ||
                combinedOutput.includes('AccountNotFound') ||
                combinedOutput.includes('timeout')) {
                return res.status(400).json({ 
                    error: "Collection Sold Out! 🎉", 
                    message: "All DapperDoggos have been minted!",
                    isSoldOut: true 
                });
            }
            
            // Check for partial mint (this should not happen with pre-check, but handle it)
            const partialMintMatch = combinedOutput.match(/Minted (\d+)\/(\d+) of the items/);
            if (partialMintMatch) {
                const minted = partialMintMatch[1];
                const requested = partialMintMatch[2];
                return res.status(400).json({ 
                    error: "Partial Mint Occurred", 
                    message: `Only ${minted} out of ${requested} NFTs were minted due to insufficient balance. Please check your wallet and contact support if needed.`,
                    isPartialMint: true,
                    mintedCount: parseInt(minted),
                    requestedCount: parseInt(requested)
                });
            }
            
            // Check for insufficient funds
            if (combinedOutput.includes('insufficient funds') || 
                combinedOutput.includes('insufficient lamports') ||
                combinedOutput.includes('Attempt to debit an account but found no record of a prior credit') ||
                combinedOutput.includes('InsufficientFunds') ||
                combinedOutput.toLowerCase().includes('not enough sol')) {
                const requiredAmount = (quantity * 0.1).toFixed(1);
                return res.status(400).json({ 
                    error: "Insufficient Balance 💰", 
                    message: `You need at least ${requiredAmount} SOL to mint ${quantity} NFT${quantity > 1 ? 's' : ''}. Please add more SOL to your wallet and try again.`,
                    isInsufficientFunds: true,
                    requiredAmount
                });
            }
            
            // Clean up active mint tracking on error
            activeMints.delete(mintKey);
            return res.status(500).json({ 
                error: err.message, 
                stderr,
                stdout: stdout || '',
                combinedOutput: combinedOutput || '',
                command: cmd
            });
        }
        // Try to parse mint and signature from stdout
        const mintMatch = stdout.match(/Mint:\s+([A-Za-z0-9]+)/m);
        const sigMatch = stdout.match(/Signature:\s+([A-Za-z0-9]+)/m);
        const mint = mintMatch ? mintMatch[1] : null;
        const signature = sigMatch ? sigMatch[1] : null;

        let image = null;
        if (mint) {
            // Preferred: use Metaplex to fetch on-chain metadata for the minted token.
            try {
                // Create connection and metaplex instance
                const connection = new Connection(RPC, "confirmed");

                // If a keypair file exists, load it and set identity so metaplex can use any helpers that require identity.
                let metaplex = Metaplex.make(connection);
                try {
                    if (fs.existsSync(KEYPAIR)) {
                        const raw = JSON.parse(
                            fs.readFileSync(KEYPAIR, "utf8")
                        );
                        // raw is an array of numbers -> convert to Keypair
                        // Metaplex JS keypairIdentity accepts a Keypair from @solana/web3.js; construct one if present
                        // We'll only set identity if the parsed file looks like a keypair array
                        if (Array.isArray(raw) && raw.length > 0) {
                            // lazy-load Keypair to avoid top-level require
                            const { Keypair } = await import("@solana/web3.js");
                            const kp = Keypair.fromSecretKey(Buffer.from(raw));
                            metaplex = metaplex.use(keypairIdentity(kp));
                        }
                    }
                } catch (e) {
                    // ignore identity errors; identity is not required to read metadata
                }

                // Attempt to fetch NFT metadata by mint address
                try {
                    const mintPubkey = new PublicKey(mint);
                    let nft = null;

                    // Try to fetch via Metaplex (with polling to allow indexers to catch up)
                    const maxAttempts = 30;
                    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                        try {
                            nft = await metaplex
                                .nfts()
                                .findByMint({ mintAddress: mintPubkey });
                        } catch (e) {
                            nft = null;
                        }
                        if (nft) break;
                        await new Promise((r) => setTimeout(r, 1000));
                    }

                    if (nft && nft.json && nft.json.image) {
                        image = nft.json.image;
                    } else {
                        // If Metaplex didn't resolve, try to derive the metadata PDA and load the on-chain metadata
                        try {
                            const { programs } = await import(
                                "@metaplex-foundation/js"
                            );
                            const METADATA_PROGRAM_ID =
                                programs.metadata.MetadataProgram.programId;
                            const [metadataPDA] =
                                await PublicKey.findProgramAddress(
                                    [
                                        Buffer.from("metadata"),
                                        METADATA_PROGRAM_ID.toBuffer(),
                                        mintPubkey.toBuffer(),
                                    ],
                                    METADATA_PROGRAM_ID
                                );

                            const acc = await connection.getAccountInfo(
                                metadataPDA,
                                "confirmed"
                            );
                            if (acc && acc.data) {
                                try {
                                    const md = await metaplex
                                        .nfts()
                                        .load({ metadata: metadataPDA });
                                    if (md && md.json && md.json.image) {
                                        image = md.json.image;
                                    }
                                } catch (e2) {
                                    // final fallback: Solana FM quick API
                                    try {
                                        const metadataUrl = `https://api.solana.fm/v0/addresses/${mint}/metadata?cluster=devnet-alpha`;
                                        const r = await fetch(metadataUrl);
                                        const j = await r.json();
                                        if (
                                            j &&
                                            j.metadata &&
                                            j.metadata.image
                                        ) {
                                            image = j.metadata.image;
                                        }
                                    } catch (e3) {
                                        // ignore
                                    }
                                }
                            }
                        } catch (e2) {
                            // ignore
                        }
                    }
                } catch (e) {
                    // last-resort fallback: Solana FM quick API
                    try {
                        const metadataUrl = `https://api.solana.fm/v0/addresses/${mint}/metadata?cluster=devnet-alpha`;
                        const r = await fetch(metadataUrl);
                        const j = await r.json();
                        if (j && j.metadata && j.metadata.image) {
                            image = j.metadata.image;
                        }
                    } catch (e2) {
                        // ignore
                    }
                }
            } catch (e) {
                // ignore overall metadata resolution errors and leave image null
            }
        }

        // Clean up active mint tracking
        activeMints.delete(mintKey);

        if (signature) {
            res.json({ 
                success: true, 
                mint, 
                signature, 
                image, 
                wallet,
                explorerUrl: `https://explorer.solana.com/tx/${signature}`,
                message: "NFT minted successfully!"
            });
        } else {
            res.status(500).json({ 
                error: "Failed to parse mint result", 
                raw: stdout,
                stderr 
            });
        }
    });
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
            itemsRedeemed: 4, // Static value matching your mainnet data
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
    console.log(`Mint API listening on http://localhost:${PORT}`)
);
