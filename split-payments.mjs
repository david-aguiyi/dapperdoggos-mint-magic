import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

/**
 * PAYMENT SPLITTING UTILITY
 * 
 * This script splits mint revenue from the collection wallet to:
 * - 15% to Artist Wallet
 * - 85% to Team/Marketing Wallet
 * 
 * SETUP:
 * 1. Replace wallet addresses below with your actual addresses
 * 2. Run this script periodically or after mints to distribute funds
 * 3. Make sure the keypair has enough SOL for transaction fees (~0.00001 SOL per tx)
 */

// ============= CONFIGURATION =============

const CONFIG = {
    // The wallet that receives mint payments (Collection/Connection wallet)
    collectionWallet: "EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3",
    
    // Artist wallet (receives 15% of revenue)
    artistWallet: "EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w",
    
    // Team/Marketing wallet (receives 85% of revenue)
    teamWallet: "2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q",
    
    // Revenue split percentages
    artistShare: 15,  // 15%
    teamShare: 85,    // 85%
    
    // RPC endpoint
    rpcUrl: "https://api.devnet.solana.com", // Change to mainnet when ready
    
    // Keypair path (wallet that holds the collection wallet's private key)
    keypairPath: "C:\\Users\\Agavid\\.config\\solana\\devnet.json",
    
    // Minimum balance to keep in collection wallet (for rent + fees)
    minBalance: 0.01 * LAMPORTS_PER_SOL // Keep 0.01 SOL for fees
};

// ============= PAYMENT SPLITTING LOGIC =============

class PaymentSplitter {
    constructor() {
        this.connection = new Connection(CONFIG.rpcUrl, 'confirmed');
        this.collectionKeypair = this.loadKeypair(CONFIG.keypairPath);
        this.artistPubkey = new PublicKey(CONFIG.artistWallet);
        this.teamPubkey = new PublicKey(CONFIG.teamWallet);
    }

    loadKeypair(keypairPath) {
        const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        return Keypair.fromSecretKey(new Uint8Array(secretKey));
    }

    async getBalance() {
        const balance = await this.connection.getBalance(this.collectionKeypair.publicKey);
        return balance;
    }

    async splitPayments() {
        console.log('💰 Dapper Doggos Payment Splitter');
        console.log('=' .repeat(50));
        console.log(`📊 Split: ${CONFIG.artistShare}% Artist / ${CONFIG.teamShare}% Team`);
        console.log('=' .repeat(50));

        // Get current balance
        const balance = await this.getBalance();
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        
        console.log(`\n💼 Collection Wallet: ${this.collectionKeypair.publicKey.toString()}`);
        console.log(`   Current Balance: ${balanceSOL.toFixed(4)} SOL`);

        // Calculate distributable amount (keeping minimum for fees)
        const distributable = balance - CONFIG.minBalance;
        
        if (distributable <= 0) {
            console.log(`\n⚠️  No funds to distribute (keeping ${(CONFIG.minBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL for fees)`);
            return;
        }

        const distributableSOL = distributable / LAMPORTS_PER_SOL;
        console.log(`   Distributable: ${distributableSOL.toFixed(4)} SOL`);

        // Calculate splits
        const artistAmount = Math.floor(distributable * (CONFIG.artistShare / 100));
        const teamAmount = Math.floor(distributable * (CONFIG.teamShare / 100));
        
        const artistSOL = artistAmount / LAMPORTS_PER_SOL;
        const teamSOL = teamAmount / LAMPORTS_PER_SOL;

        console.log(`\n💸 Payment Distribution:`);
        console.log(`   🎨 Artist (${CONFIG.artistShare}%): ${artistSOL.toFixed(4)} SOL`);
        console.log(`   👥 Team (${CONFIG.teamShare}%): ${teamSOL.toFixed(4)} SOL`);

        // Create transaction
        console.log(`\n📤 Creating transaction...`);
        
        const transaction = new Transaction();

        // Add transfer to artist
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: this.collectionKeypair.publicKey,
                toPubkey: this.artistPubkey,
                lamports: artistAmount
            })
        );

        // Add transfer to team
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: this.collectionKeypair.publicKey,
                toPubkey: this.teamPubkey,
                lamports: teamAmount
            })
        );

        // Send transaction
        try {
            const signature = await this.connection.sendTransaction(
                transaction,
                [this.collectionKeypair],
                { skipPreflight: false }
            );

            console.log(`\n⏳ Confirming transaction...`);
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log(`\n✅ Payment split successful!`);
            console.log(`   Transaction: ${signature}`);
            console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

            // Show final balances
            const finalBalance = await this.getBalance();
            const finalSOL = finalBalance / LAMPORTS_PER_SOL;
            console.log(`\n💼 Collection Wallet Final Balance: ${finalSOL.toFixed(4)} SOL`);

            return {
                success: true,
                signature,
                artistAmount: artistSOL,
                teamAmount: teamSOL,
                totalDistributed: artistSOL + teamSOL
            };

        } catch (error) {
            console.error(`\n❌ Error sending transaction:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async showStatus() {
        console.log('💰 Payment Splitter Status');
        console.log('=' .repeat(50));
        
        const balance = await this.getBalance();
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        const distributable = Math.max(0, balance - CONFIG.minBalance);
        const distributableSOL = distributable / LAMPORTS_PER_SOL;

        console.log(`\n💼 Collection Wallet:`);
        console.log(`   Address: ${this.collectionKeypair.publicKey.toString()}`);
        console.log(`   Balance: ${balanceSOL.toFixed(4)} SOL`);
        console.log(`   Distributable: ${distributableSOL.toFixed(4)} SOL`);

        if (distributable > 0) {
            const artistAmount = (distributable * (CONFIG.artistShare / 100)) / LAMPORTS_PER_SOL;
            const teamAmount = (distributable * (CONFIG.teamShare / 100)) / LAMPORTS_PER_SOL;
            
            console.log(`\n💸 Available to Distribute:`);
            console.log(`   🎨 Artist (${CONFIG.artistShare}%): ${artistAmount.toFixed(4)} SOL`);
            console.log(`   👥 Team (${CONFIG.teamShare}%): ${teamAmount.toFixed(4)} SOL`);
        }

        console.log(`\n🎯 Target Wallets:`);
        console.log(`   🎨 Artist: ${CONFIG.artistWallet}`);
        console.log(`   👥 Team: ${CONFIG.teamWallet}`);
    }
}

// ============= MAIN EXECUTION =============

async function main() {
    try {
        const splitter = new PaymentSplitter();
        
        const args = process.argv.slice(2);
        const command = args[0] || 'split';

        if (command === 'status' || command === 'check') {
            await splitter.showStatus();
        } else if (command === 'split' || command === 'distribute') {
            await splitter.splitPayments();
        } else {
            console.log('Usage:');
            console.log('  node split-payments.mjs split     - Split and distribute payments');
            console.log('  node split-payments.mjs status    - Show current status');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();

