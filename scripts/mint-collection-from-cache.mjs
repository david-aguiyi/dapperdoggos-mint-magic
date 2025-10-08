#!/usr/bin/env node
// Mint a collection NFT on devnet using an existing metadata URI from cache.json
// Usage: node scripts/mint-collection-from-cache.mjs <keypair.json> [index]

import fs from "fs";
import { Connection, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error(
            "Usage: node scripts/mint-collection-from-cache.mjs <keypair.json> [index]"
        );
        process.exit(2);
    }
    const keypairPath = args[0];
    const index = args[1] ?? "0";

    const secret = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

    const cache = JSON.parse(fs.readFileSync("cache.json", "utf8"));
    const item = cache.items[index];
    if (!item) {
        console.error("No item at index", index);
        process.exit(3);
    }
    const uri = item.metadata_link;
    if (!uri) {
        console.error("No metadata_link for item", index);
        process.exit(4);
    }

    const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
    const mx = Metaplex.make(connection).use(keypairIdentity(keypair));

    console.log("Payer:", keypair.publicKey.toBase58());
    console.log("Using metadata URI from cache:", uri);

    console.log("Creating NFT from existing metadata URI...");
    const safeName = "DapperDoggos Collection";
    const { nft } = await mx.nfts().create({
        uri,
        name: safeName,
        sellerFeeBasisPoints: 0,
        isMutable: true,
        maxSupply: 0,
    });

    console.log("Collection NFT minted:", nft.address.toBase58());
    console.log("On-chain metadata:", nft.json);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
