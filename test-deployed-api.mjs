#!/usr/bin/env node

/**
 * TEST DEPLOYED API
 * Tests the live backend API after Render deployment
 */

async function testDeployedAPI() {
    console.log('🧪 ========================================');
    console.log('    TESTING DEPLOYED BACKEND API');
    console.log('========================================');
    
    // Test wallet (your wallet)
    const TEST_WALLET = 'EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3';
    
    try {
        console.log('\n📡 Testing deployed backend API...');
        console.log('🎯 Wallet:', TEST_WALLET);
        console.log('🌐 API URL: https://dapperdoggos-api.onrender.com/mint');
        
        const response = await fetch('https://dapperdoggos-api.onrender.com/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: TEST_WALLET, quantity: 1 }),
        });
        
        const result = await response.json();
        console.log('\n📡 API Response Status:', response.status);
        console.log('📡 API Response:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('\n🎉 SUCCESS! Backend API is working!');
            console.log('✅ NFT Address:', result.mint);
            console.log('✅ Transaction:', result.signature);
            console.log('✅ Image:', result.image);
            console.log('✅ Wallet:', result.wallet);
            console.log('✅ Quantity:', result.quantity);
            
            console.log('\n🚀 MINTING SYSTEM IS FULLY WORKING!');
            console.log('💡 You can now mint NFTs on the website!');
            
            return true;
        } else {
            console.log('\n⚠️ Backend API error:');
            console.log('❌ Error:', result.error);
            console.log('❌ Message:', result.message);
            
            if (result.isInsufficientFunds) {
                console.log('\n💡 This is expected - you need more SOL in your wallet');
                console.log('💰 Required: ~0.11 SOL (0.1 SOL for NFT + fees)');
                console.log('💰 You have: 0.0240 SOL');
                console.log('💡 Add more SOL to your wallet and try again');
            } else if (result.isSoldOut) {
                console.log('\n💡 Candy Machine is sold out');
            } else {
                console.log('\n🔧 This might be a different issue');
                if (result.details) {
                    console.log('📋 Details:', result.details);
                }
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Run the test
testDeployedAPI().then(success => {
    if (success) {
        console.log('\n✅ DEPLOYED API TEST PASSED!');
        console.log('🎉 Your minting system is working perfectly!');
        process.exit(0);
    } else {
        console.log('\n⚠️ DEPLOYED API TEST FAILED');
        console.log('🔧 Check the error details above');
        process.exit(1);
    }
}).catch(console.error);
