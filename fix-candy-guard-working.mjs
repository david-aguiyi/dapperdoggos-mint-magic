#!/usr/bin/env node

/**
 * Fix Candy Guard Wrapper Script
 * 
 * This script will wrap your Candy Machine with the Candy Guard
 * so that mintV2 instructions work properly.
 */

import { Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity, publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import * as mplCandyMachineModule from '@metaplex-foundation/mpl-candy-machine';
import fs from 'fs';

// Destructure the functions we need from the module
const { fetchCandyMachine, wrap, createCandyGuard, mplCandyMachine } = mplCandyMachineModule;

// Configuration
const RPC_URL = 'https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20';
const CANDY_MACHINE_ID = '4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt';
const CANDY_GUARD_ID = 'H7cAer9AGrEKcrfS2ZRN4DbdypJh1J518GVLj6e6r5gF';

// Path to your keypair file (same as backend)
const KEYPAIR_PATH = process.env.KEYPAIR || './keypair-mainnet.json';

async function fixCandyGuard() {
  console.log('🔧 Starting Candy Guard Fix...');
  console.log('🍬 Candy Machine:', CANDY_MACHINE_ID);
  console.log('🛡️ Candy Guard:', CANDY_GUARD_ID);
  
  try {
    // Check if keypair exists
    if (!fs.existsSync(KEYPAIR_PATH)) {
      console.error('❌ Keypair file not found:', KEYPAIR_PATH);
      console.log('\n📋 This script needs your authority keypair to wrap the Candy Machine.');
      console.log('Please provide the keypair file path:');
      console.log('  - Set KEYPAIR environment variable, or');
      console.log('  - Place keypair-mainnet.json in the current directory');
      process.exit(1);
    }

    // Load authority keypair
    console.log('🔑 Loading authority keypair from:', KEYPAIR_PATH);
    const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
    const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
    
    console.log('✅ Authority wallet:', authorityKeypair.publicKey.toString());

    // Initialize Umi (same as backend)
    console.log('🌐 Initializing Umi...');
    const umi = createUmi(RPC_URL);
    
    // Convert Solana keypair to Umi keypair format (same as backend)
    const umiKeypair = {
      publicKey: umiPublicKey(authorityKeypair.publicKey.toString()),
      secretKey: authorityKeypair.secretKey
    };
    
    // Create a signer from the keypair (same as backend)
    const authoritySigner = createSignerFromKeypair(umi, umiKeypair);
    
    // Set as the identity signer (same as backend)
    umi.use(signerIdentity(authoritySigner));
    
    // Register Candy Machine program (same as backend)
    if (typeof mplCandyMachine === 'function') {
      umi.use(mplCandyMachine());
      console.log('✅ Candy Machine program registered');
    }

    // Convert addresses to Umi format
    const candyMachineAddress = umiPublicKey(CANDY_MACHINE_ID);
    const candyGuardAddress = umiPublicKey(CANDY_GUARD_ID);

    // Fetch the Candy Machine to check current state
    console.log('📊 Fetching Candy Machine state...');
    const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
    
    console.log('Current Candy Machine mint authority:', candyMachine.mintAuthority);
    console.log('Candy Guard address:', CANDY_GUARD_ID);

    if (candyMachine.mintAuthority === candyGuardAddress) {
      console.log('\n✅ Candy Machine is already wrapped with this Candy Guard!');
      console.log('🚀 Your minting should work. If not, there may be another issue.');
      process.exit(0);
    }

    // First, create/initialize the Candy Guard
    console.log('\n🛡️ Creating/Initializing Candy Guard...');
    try {
      const createTx = await createCandyGuard(umi, {
        candyGuard: candyGuardAddress,
        authority: authoritySigner,
        guards: {
          // Add basic guards - you can customize these
          solPayment: {
            amount: 100_000_000, // 0.1 SOL in lamports
            destination: authoritySigner.publicKey,
          },
        },
      }).sendAndConfirm(umi);
      
      console.log('✅ Candy Guard created successfully!');
      console.log('📝 Creation signature:', createTx.signature);
    } catch (createError) {
      if (createError.message?.includes('already in use') || createError.message?.includes('already initialized')) {
        console.log('ℹ️ Candy Guard already exists, continuing with wrap...');
      } else {
        console.log('⚠️ Candy Guard creation failed:', createError.message);
        console.log('Continuing with wrap attempt...');
      }
    }

    // Wrap the Candy Machine with the Candy Guard
    console.log('\n🔗 Wrapping Candy Machine with Candy Guard...');
    console.log('This will update the mint authority to the Candy Guard address.');
    console.log('⏳ Sending transaction...');
    
    const tx = await wrap(umi, {
      candyMachine: candyMachineAddress,
      candyGuard: candyGuardAddress,
      authority: authoritySigner,
    }).sendAndConfirm(umi);

    console.log('\n✅ SUCCESS! Candy Machine wrapped with Candy Guard!');
    console.log('📝 Transaction signature:', tx.signature);
    console.log('🔗 View on Solscan:', `https://solscan.io/tx/${tx.signature}`);

    // Verify the change
    console.log('\n🔍 Verifying the change...');
    const updatedCandyMachine = await fetchCandyMachine(umi, candyMachineAddress);
    console.log('New mint authority:', updatedCandyMachine.mintAuthority);
    
    if (updatedCandyMachine.mintAuthority === candyGuardAddress) {
      console.log('✅ VERIFIED! Mint authority is now the Candy Guard!');
      console.log('\n🎉 Your Candy Machine is now properly configured!');
      console.log('🚀 Minting should work perfectly now!');
    } else {
      console.log('⚠️ WARNING: Mint authority was not updated as expected.');
      console.log('Expected:', CANDY_GUARD_ID);
      console.log('Got:', updatedCandyMachine.mintAuthority);
    }

  } catch (error) {
    console.error('\n❌ Error fixing Candy Guard:', error);
    
    if (error.message?.includes('already wrapped')) {
      console.log('\nℹ️ Candy Machine is already wrapped. This is actually good!');
      console.log('🚀 Your setup should work now. Try minting!');
    } else if (error.message?.includes('insufficient funds')) {
      console.log('\n💰 You need more SOL in your authority wallet for transaction fees.');
      console.log('Please add ~0.01 SOL and try again.');
    } else {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure you have enough SOL for transaction fees (~0.01 SOL)');
      console.log('2. Verify your keypair file has the correct authority');
      console.log('3. Check that the Candy Guard ID is correct:', CANDY_GUARD_ID);
      console.log('4. Ensure the Candy Machine ID is correct:', CANDY_MACHINE_ID);
    }
    
    process.exit(1);
  }
}

// Run the fix
console.log('═══════════════════════════════════════════════════');
console.log('    🛠️  Candy Guard Wrapper Fix Script');
console.log('═══════════════════════════════════════════════════\n');

fixCandyGuard().catch(console.error);

