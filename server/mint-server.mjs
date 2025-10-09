#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fetch from "node-fetch";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const KEYPAIR =
    process.env.SOL_KEYPAIR ||
    `${process.env.USERPROFILE}\\.config\\solana\\devnet.json`;
const RPC = process.env.RPC_URL || "https://api.devnet.solana.com";

app.post("/mint", (req, res) => {
    const { wallet } = req.body;
    console.log("Minting request for wallet:", wallet);
    
    if (!wallet) {
        return res.status(400).json({ error: "Wallet address is required" });
    }
    
    const cmd = `.\\sugar-windows-latest.exe mint --keypair ${KEYPAIR} --rpc-url ${RPC} --receiver ${wallet} --cache cache_fresh.json --log-level info`;
    exec(cmd, { cwd: process.cwd(), timeout: 60000 }, async (err, stdout, stderr) => {
        if (err) {
            // Check if collection is sold out
            const combinedOutput = (stdout || '') + (stderr || '');
            console.log("Sugar output:", { stdout, stderr, combinedOutput });
            
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
            return res.status(500).json({ error: err.message, stderr });
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

        if (signature) {
            res.json({ 
                success: true, 
                mint, 
                signature, 
                image, 
                wallet,
                explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
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
app.get("/collection/status", (req, res) => {
    // Get real-time status from blockchain using Sugar
    const cmd = `.\\sugar-windows-latest.exe show --keypair ${KEYPAIR} --rpc-url ${RPC} --cache cache_fresh.json`;
    
    exec(cmd, { cwd: process.cwd(), timeout: 30000 }, (err, stdout, stderr) => {
        if (err) {
            console.error("Error getting collection status:", err);
            // Fallback to cache file
            try {
                const cachePath = './cache_fresh.json';
                const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                const items = cacheData.items || {};
                const itemsArray = Object.values(items);
                const totalItems = itemsArray.length;
                
                return res.json({
                    success: true,
                    itemsRedeemed: 0,
                    itemsAvailable: totalItems,
                    totalItems,
                    symbol: "DAPPER",
                    candyMachineId: cacheData.program?.candyMachine || null,
                    collectionMint: cacheData.program?.collectionMint || null,
                    isSoldOut: false,
                    progress: 0
                });
            } catch (e) {
                return res.status(500).json({ error: "Failed to get collection status" });
            }
        }
        
        // Parse the Sugar output
        const redeemedMatch = stdout.match(/items redeemed:\s+(\d+)/i);
        const availableMatch = stdout.match(/items available:\s+(\d+)/i);
        const candyMachineMatch = stdout.match(/Candy machine ID:\s+([A-Za-z0-9]+)/);
        const collectionMintMatch = stdout.match(/collection mint:\s+([A-Za-z0-9]+)/i);
        
        const itemsRedeemed = redeemedMatch ? parseInt(redeemedMatch[1]) : 0;
        const totalItems = availableMatch ? parseInt(availableMatch[1]) : 6;
        const itemsAvailable = totalItems - itemsRedeemed;
        const candyMachineId = candyMachineMatch ? candyMachineMatch[1] : null;
        const collectionMint = collectionMintMatch ? collectionMintMatch[1] : null;
        
        res.json({
            success: true,
            itemsRedeemed,
            itemsAvailable,
            totalItems,
            symbol: "DAPPER",
            candyMachineId,
            collectionMint,
            isSoldOut: itemsAvailable === 0,
            progress: totalItems > 0 ? (itemsRedeemed / totalItems) * 100 : 0
        });
    });
});

app.listen(PORT, () =>
    console.log(`Mint API listening on http://localhost:${PORT}`)
);
