#!/usr/bin/env node
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";

// Configuration
const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const KEYPAIR = process.env.SOL_KEYPAIR || "./mainnet.json";
const CANDY_MACHINE_ID = process.env.CANDY_MACHINE_ID || "4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt";

console.log('🧪 Testing Candy Machine Configuration...\n');

async function testCandyMachine() {
    try {
        // Initialize connection
        console.log('1️⃣ Connecting to Solana RPC:', RPC);
        const connection = new Connection(RPC, "confirmed");
        
        // Load the authority keypair
        console.log('2️⃣ Loading authority keypair from:', KEYPAIR);
        const keypairData = JSON.parse(fs.readFileSync(KEYPAIR, "utf8"));
        const authorityKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
        console.log('   ✅ Authority wallet:', authorityKeypair.publicKey.toString());
        
        // Check authority balance
        const balance = await connection.getBalance(authorityKeypair.publicKey);
        console.log('   💰 Authority balance:', (balance / 1e9).toFixed(4), 'SOL\n');
        
        // Initialize Metaplex with authority identity
        console.log('3️⃣ Initializing Metaplex SDK...');
        const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
        console.log('   ✅ Metaplex initialized\n');
        
        // Load candy machine
        console.log('4️⃣ Loading Candy Machine:', CANDY_MACHINE_ID);
        const candyMachineAddress = new PublicKey(CANDY_MACHINE_ID);
        const candyMachine = await metaplex.candyMachines().findByAddress({ address: candyMachineAddress });
        
        console.log('   ✅ Candy Machine loaded successfully!\n');
        console.log('📊 CANDY MACHINE DETAILS:');
        console.log('   Address:', candyMachine.address.toBase58());
        console.log('   Version:', candyMachine.version);
        console.log('   Items Available:', candyMachine.itemsAvailable.toString());
        console.log('   Items Minted:', candyMachine.itemsMinted.toString());
        console.log('   Items Remaining:', (candyMachine.itemsAvailable.toNumber() - candyMachine.itemsMinted.toNumber()));
        console.log('   Authority:', candyMachine.authorityAddress.toBase58());
        console.log('   Mint Authority:', candyMachine.mintAuthorityAddress.toBase58());
        console.log('   Collection Mint:', candyMachine.collectionMintAddress.toBase58());
        
        if (candyMachine.candyGuard) {
            console.log('\n🛡️ CANDY GUARD DETAILS:');
            console.log('   Guard Address:', candyMachine.candyGuard.address.toBase58());
            console.log('   Guards:', JSON.stringify(candyMachine.candyGuard.guards, null, 2));
        }
        
        console.log('\n5️⃣ Testing mint transaction builder...');
        try {
            // Try to build a mint transaction (without sending)
            const testWallet = new PublicKey("2A7ywPP2fr8iHiLXuA3XRyXAn9dPBSDkhwJ4txJgenne");
            
            console.log('   Building mint transaction for test wallet:', testWallet.toString());
            const mintBuilder = await metaplex.candyMachines().builders().mint({
                candyMachine,
                owner: testWallet,
            });
            
            console.log('   ✅ Transaction builder created successfully!');
            console.log('   Transaction uses', mintBuilder.getInstructions().length, 'instruction(s)');
            console.log('   Transaction uses', mintBuilder.getSigners().length, 'signer(s)');
            
            // Try to get the transaction
            const transaction = mintBuilder.toTransaction();
            console.log('   ✅ Transaction compiled successfully!');
            console.log('   Fee payer:', transaction.feePayer?.toString() || 'Not set');
            console.log('   Recent blockhash needed:', !transaction.recentBlockhash);
            
        } catch (builderError) {
            console.error('   ❌ Transaction builder failed:', builderError.message);
            console.error('   Stack:', builderError.stack);
        }
        
        console.log('\n✅ TEST COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testCandyMachine();

