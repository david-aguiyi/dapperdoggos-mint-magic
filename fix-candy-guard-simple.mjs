#!/usr/bin/env node

/**
 * Simple Candy Guard Fix Script
 * 
 * This script will wrap your Candy Machine with the Candy Guard using Solana CLI
 */

import { Connection, PublicKey, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import * as mplCandyMachine from '@metaplex-foundation/mpl-candy-machine';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import fs from 'fs';

// Configuration
const RPC_URL = 'https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20';
const CANDY_MACHINE_ID = '4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt';
const CANDY_GUARD_ID = 'H7cAer9AGrEKcrfS2ZRN4DbdypJh1J518GVLj6e6r5gF';

// Path to your keypair file
const KEYPAIR_PATH = './keypair-mainnet.json';

async function fixCandyGuard() {
  console.log('🔧 Starting Simple Candy Guard Fix...');
  
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
    const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log('✅ Authority wallet:', authorityKeypair.publicKey.toString());

    // Initialize Umi
    console.log('🌐 Initializing connection...');
    const umi = createUmi(RPC_URL);
    
    // Create a simple identity from the keypair
    const identity = {
      publicKey: umiPublicKey(authorityKeypair.publicKey.toString()),
      signMessage: async (message) => {
        // For this simple script, we'll use the authority keypair directly
        return authorityKeypair.secretKey;
      },
      signTransaction: async (transaction) => {
        // Sign with the authority keypair
        transaction.sign(authorityKeypair);
        return transaction;
      },
      signAllTransactions: async (transactions) => {
        // Sign all transactions
        transactions.forEach(tx => tx.sign(authorityKeypair));
        return transactions;
      }
    };
    
    umi.identity = identity;

    // Convert addresses to Umi format
    const candyMachineAddress = umiPublicKey(CANDY_MACHINE_ID);
    const candyGuardAddress = umiPublicKey(CANDY_GUARD_ID);

    console.log('🍬 Candy Machine:', CANDY_MACHINE_ID);
    console.log('🛡️ Candy Guard:', CANDY_GUARD_ID);

    // Try to wrap the Candy Machine with the Candy Guard
    console.log('🔗 Attempting to wrap Candy Machine with Candy Guard...');
    
    try {
      const wrapTransaction = await mplCandyMachine.wrapCandyMachine(umi, {
        candyMachine: candyMachineAddress,
        candyGuard: candyGuardAddress,
        authority: identity,
      }).sendAndConfirm(umi);

      console.log('✅ Candy Machine wrapped successfully!');
      console.log('📝 Transaction signature:', wrapTransaction.signature);

      console.log('\n🎉 SUCCESS! Your Candy Machine is now properly wrapped with the Candy Guard!');
      console.log('🚀 Your minting should now work perfectly!');
      
    } catch (wrapError) {
      if (wrapError.message?.includes('already wrapped')) {
        console.log('ℹ️ Candy Machine is already wrapped. This is good!');
        console.log('🚀 Your setup should work now. Try minting!');
      } else {
        console.error('❌ Error wrapping Candy Machine:', wrapError.message);
        console.log('\n🔧 This might mean:');
        console.log('1. The Candy Machine is already properly configured');
        console.log('2. The Candy Guard ID might be incorrect');
        console.log('3. You might not have the right permissions');
        
        console.log('\n💡 Try minting anyway - it might already work!');
      }
    }

  } catch (error) {
    console.error('❌ Error in fix script:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have enough SOL for transaction fees');
    console.log('2. Verify your keypair-mainnet.json file is correct');
    console.log('3. Check that the Candy Guard and Candy Machine IDs are correct');
    console.log('4. Try minting anyway - the issue might be elsewhere');
  }
}

// Run the fix
fixCandyGuard().catch(console.error);
