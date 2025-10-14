#!/usr/bin/env node

/**
 * Fix Candy Guard Wrapper Script
 * 
 * This script will:
 * 1. Load your authority keypair
 * 2. Update the Candy Machine's mint authority to point to the Candy Guard
 * 3. This is a ONE-TIME blockchain transaction
 */

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import * as mplCandyMachine from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

// Configuration
const RPC_URL = 'https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20';
const CANDY_MACHINE_ID = '4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt';
const CANDY_GUARD_ID = 'H7cAer9AGrEKcrfS2ZRN4DbdypJh1J518GVLj6e6r5gF';

// Path to your keypair file
const KEYPAIR_PATH = './keypair-mainnet.json';

async function fixCandyGuard() {
  console.log('🔧 Starting Candy Guard Fix...');
  
  try {
    // Check if keypair exists
    if (!fs.existsSync(KEYPAIR_PATH)) {
      console.error('❌ Keypair file not found:', KEYPAIR_PATH);
      console.log('Please make sure your keypair-mainnet.json file is in the current directory');
      process.exit(1);
    }

    // Load authority keypair
    console.log('🔑 Loading authority keypair...');
    const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
    const authorityKeypair = {
      publicKey: new PublicKey(keypairData.slice(32)),
      secretKey: new Uint8Array(keypairData)
    };
    
    console.log('✅ Authority wallet:', authorityKeypair.publicKey.toString());

    // Initialize Umi
    console.log('🌐 Initializing connection...');
    const umi = createUmi(RPC_URL).use(keypairIdentity(authorityKeypair));

    // Convert addresses to Umi format
    const candyMachineAddress = umiPublicKey(CANDY_MACHINE_ID);
    const candyGuardAddress = umiPublicKey(CANDY_GUARD_ID);

    console.log('🍬 Candy Machine:', CANDY_MACHINE_ID);
    console.log('🛡️ Candy Guard:', CANDY_GUARD_ID);

    // Check current state
    console.log('📊 Checking current Candy Machine state...');
    
    // Find the PDAs
    const [candyMachineAuthorityPda] = mplCandyMachine.findCandyMachineAuthorityPda(umi, {
      candyMachine: candyMachineAddress,
    });
    
    const [candyGuardAuthorityPda] = mplCandyMachine.findCandyGuardAuthorityPda(umi, {
      candyGuard: candyGuardAddress,
    });

    console.log('📍 Candy Machine Authority PDA:', candyMachineAuthorityPda);
    console.log('📍 Candy Guard Authority PDA:', candyGuardAuthorityPda);

    // Wrap the Candy Machine with the Candy Guard
    console.log('🔗 Wrapping Candy Machine with Candy Guard...');
    
    const wrapTransaction = await mplCandyMachine.wrapCandyMachine(umi, {
      candyMachine: candyMachineAddress,
      candyGuard: candyGuardAddress,
      authority: umi.identity,
    }).sendAndConfirm(umi);

    console.log('✅ Candy Machine wrapped successfully!');
    console.log('📝 Transaction signature:', wrapTransaction.signature);

    console.log('\n🎉 SUCCESS! Your Candy Machine is now properly wrapped with the Candy Guard!');
    console.log('🚀 Your minting should now work perfectly!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Test your website minting');
    console.log('2. The "AccountNotInitialized" error should be gone');
    console.log('3. All minting approaches should work now');

  } catch (error) {
    console.error('❌ Error fixing Candy Guard:', error);
    
    if (error.message?.includes('already wrapped')) {
      console.log('ℹ️ Candy Machine is already wrapped. This is good!');
      console.log('🚀 Your setup should work now. Try minting!');
    } else {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure you have enough SOL for transaction fees');
      console.log('2. Verify your keypair-mainnet.json file is correct');
      console.log('3. Check that the Candy Guard and Candy Machine IDs are correct');
    }
    
    process.exit(1);
  }
}

// Run the fix
fixCandyGuard().catch(console.error);
