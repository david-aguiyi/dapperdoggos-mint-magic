#!/usr/bin/env node

/**
 * COMPREHENSIVE BACKEND TEST
 * Test all possible causes of the error
 */

async function comprehensiveBackendTest() {
    console.log('🧪 ========================================');
    console.log('    COMPREHENSIVE BACKEND TEST');
    console.log('========================================');
    
    const testCases = [
        {
            name: 'Invalid Address (Original)',
            wallet: '3sFMYSOLVcXLDHeBSnE1MgdY8DcrP8q4WCNbvxoXN9zd',
            expectedError: 'Non-base58 character'
        },
        {
            name: 'Valid Address (Your Wallet)',
            wallet: 'EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3',
            expectedError: 'Insufficient funds'
        },
        {
            name: 'System Program ID (Valid)',
            wallet: '11111111111111111111111111111112',
            expectedError: 'Insufficient funds'
        },
        {
            name: 'Empty Address',
            wallet: '',
            expectedError: 'Wallet address is required'
        },
        {
            name: 'Invalid Quantity (0)',
            wallet: 'EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3',
            quantity: 0,
            expectedError: 'Invalid Quantity'
        },
        {
            name: 'Invalid Quantity (6)',
            wallet: 'EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3',
            quantity: 6,
            expectedError: 'Invalid Quantity'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log(`🎯 Wallet: ${testCase.wallet}`);
        if (testCase.quantity) {
            console.log(`📊 Quantity: ${testCase.quantity}`);
        }
        
        try {
            const body = {
                wallet: testCase.wallet,
                ...(testCase.quantity && { quantity: testCase.quantity })
            };
            
            console.log('📤 Request body:', JSON.stringify(body));
            
            const response = await fetch('https://dapperdoggos-api.onrender.com/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            
            const result = await response.json();
            console.log(`📡 Status: ${response.status}`);
            console.log(`📋 Error: ${result.error || 'None'}`);
            console.log(`📋 Message: ${result.message || 'None'}`);
            
            // Check if the error matches expectations
            if (testCase.expectedError) {
                if (result.message?.includes(testCase.expectedError)) {
                    console.log(`✅ Expected error found: "${testCase.expectedError}"`);
                } else {
                    console.log(`❌ Expected "${testCase.expectedError}" but got: "${result.message}"`);
                }
            }
            
            // Special check for the original problematic address
            if (testCase.name === 'Invalid Address (Original)') {
                if (result.message?.includes('Non-base58 character')) {
                    console.log('🔍 DIAGNOSIS: The address format is definitely invalid');
                } else {
                    console.log('🔍 DIAGNOSIS: Different error - investigating further...');
                    console.log('📋 Full details:', result.details);
                }
            }
            
        } catch (error) {
            console.log(`❌ Network error: ${error.message}`);
        }
        
        console.log('─'.repeat(50));
    }
    
    // Test collection status to ensure backend is responsive
    console.log('\n📋 Testing collection status endpoint...');
    try {
        const response = await fetch('https://dapperdoggos-api.onrender.com/collection/status');
        const result = await response.json();
        console.log(`📡 Status: ${response.status}`);
        console.log(`📊 Collection data:`, result);
        console.log('✅ Collection status endpoint working');
    } catch (error) {
        console.log(`❌ Collection status error: ${error.message}`);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('This test checks all possible causes of the error:');
    console.log('1. Invalid wallet address format');
    console.log('2. Valid addresses with insufficient funds');
    console.log('3. Missing wallet parameter');
    console.log('4. Invalid quantity parameters');
    console.log('5. Backend connectivity');
}

comprehensiveBackendTest().catch(console.error);
