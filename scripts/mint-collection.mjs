#!/usr/bin/env node
// Mint a single collection NFT on devnet using Metaplex JS (ES module .mjs)
// Usage: node scripts/mint-collection.mjs <path-to-keypair-json>

import fs from 'fs';
import { Connection, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/mint-collection.mjs <keypair.json>');
    process.exit(2);
  }
  const keypairPath = args[0];
  const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const mx = Metaplex.make(connection)
    .use(keypairIdentity(keypair));

  console.log('Payer:', keypair.publicKey.toBase58());

  console.log('Uploading metadata and image (using placeholder data)...');
  const { uri } = await mx.nfts().uploadMetadata({
    name: 'DapperDoggos Collection',
    description: 'DapperDoggos collection NFT (devnet collection)',
    image: 'https://placehold.co/600x600?text=DapperDoggos+Collection',
    symbol: 'DAPPER',
    attributes: [],
  });

  console.log('Metadata URI:', uri);

  console.log('Minting collection NFT...');
  const { nft } = await mx.nfts().create({
    uri,
    name: 'DapperDoggos Collection',
    sellerFeeBasisPoints: 0,
    isMutable: true,
    maxSupply: 0,
  });

  console.log('Collection NFT minted:', nft.address.toBase58());
  console.log('NFT metadata:', nft.json);
}

main().catch(err => { console.error(err); process.exit(1); });
