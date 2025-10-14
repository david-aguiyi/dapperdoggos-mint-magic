# Fallback 1: Testing with Different Prices

## ✅ YES - You Can Test with Any Price!

With Fallback 1, you have **full control** over the Candy Machine guards, including payment amounts.

---

## 🎯 Three Ways to Test with Lower Prices

### **Option 1: Update Candy Machine Config (Recommended)**

Update your `config-mainnet.json` to change the price:

```json
{
  "guards": {
    "default": {
      "solPayment": {
        "value": 0.001,  // ← Change from 0.1 to 0.001 for testing
        "destination": "YOUR_WALLET_ADDRESS"
      }
    }
  }
}
```

Then re-deploy the Candy Machine config:
```bash
sugar guard update
```

**Pros:**
- ✅ Permanent until you change it again
- ✅ Works with both current approach AND Fallback 1
- ✅ Clean and official

**Cons:**
- ⚠️ Requires re-deploying Candy Machine config
- ⚠️ Affects ALL mints (not just testing)

---

### **Option 2: Use a Different Guard Group for Testing**

Create a test group in your Candy Machine config:

```json
{
  "guards": {
    "default": {
      "solPayment": {
        "value": 0.1,  // Production price
        "destination": "YOUR_WALLET_ADDRESS"
      }
    },
    "groups": [
      {
        "label": "test",
        "guards": {
          "solPayment": {
            "value": 0.001,  // Test price - super cheap!
            "destination": "YOUR_WALLET_ADDRESS"
          }
        }
      }
    ]
  }
}
```

Then in Fallback 1 code, specify the test group:

```javascript
// In mint-server-fallback1.mjs, line ~180
const mintBuilder = transactionBuilder()
    .add(
        mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard?.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            minter: receiverPublicKey,
            group: some('test'),  // ← Add this line to use "test" group!
        })
    );
```

**Pros:**
- ✅ Can switch between test and production easily
- ✅ Don't need to re-deploy config constantly
- ✅ Safe - production price stays the same

**Cons:**
- ⚠️ Requires initial config update with groups

---

### **Option 3: Remove solPayment Guard for Testing (Easiest)**

Temporarily remove the payment requirement entirely:

```json
{
  "guards": {
    "default": {
      // Remove solPayment entirely or comment it out
      // "solPayment": {
      //   "value": 0.1,
      //   "destination": "YOUR_WALLET_ADDRESS"
      // }
    }
  }
}
```

Then update:
```bash
sugar guard update
```

**Pros:**
- ✅ **FREE minting** for testing! 🎉
- ✅ Super fast to test
- ✅ No need to fund test wallets

**Cons:**
- ❌ **DANGEROUS** - Don't forget to re-enable payment!
- ❌ If someone finds your site, they could mint for free

---

## 🔧 How to Implement Option 2 (Best for Testing)

### Step 1: Update config-mainnet.json

```json
{
  "number": 250,
  "symbol": "DD",
  "sellerFeeBasisPoints": 500,
  "isMutable": true,
  "isSequential": false,
  "creators": [
    {
      "address": "YOUR_WALLET",
      "share": 100
    }
  ],
  "uploadMethod": "bundlr",
  "awsConfig": null,
  "nftStorageAuthToken": null,
  "shdwStorageAccount": null,
  "pinataConfig": null,
  "hiddenSettings": null,
  "guards": {
    "default": {
      "solPayment": {
        "value": 0.1,
        "destination": "YOUR_PRODUCTION_WALLET"
      }
    },
    "groups": [
      {
        "label": "test",
        "guards": {
          "solPayment": {
            "value": 0.001,
            "destination": "YOUR_TEST_WALLET"
          }
        }
      },
      {
        "label": "free",
        "guards": {}
      }
    ]
  }
}
```

### Step 2: Update Candy Machine Guards

```bash
sugar guard update
```

### Step 3: Modify Fallback 1 to Use Test Group

Add environment variable support:

```javascript
// In mint-server-fallback1.mjs
const MINT_GROUP = process.env.MINT_GROUP || null; // "test", "free", or null for default

// Then in the mintV2 call (around line 180):
const mintBuilder = transactionBuilder()
    .add(
        mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard?.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            minter: receiverPublicKey,
            ...(MINT_GROUP && { group: some(MINT_GROUP) }), // ← Add group if specified
        })
    );
```

### Step 4: Set Environment Variable on Render

In Render Dashboard:
1. Go to your service
2. Click "Environment"
3. Add: `MINT_GROUP` = `test`
4. Save and redeploy

**Now minting costs only 0.001 SOL!** 🎉

---

## 💰 Price Comparison

| Group | Price | Use Case |
|-------|-------|----------|
| `default` | 0.1 SOL | Production minting |
| `test` | 0.001 SOL | Testing with real payments |
| `free` | 0 SOL | Internal testing (risky!) |

---

## 🎯 Recommended Testing Flow

1. **Development/Testing:**
   - Set `MINT_GROUP=test` on Render
   - Mints cost 0.001 SOL
   - Easy to test multiple times

2. **Final Testing:**
   - Set `MINT_GROUP=default` 
   - Test with real 0.1 SOL price
   - Verify payment splitting works

3. **Production:**
   - Keep `MINT_GROUP=default` (or remove env var)
   - Full production price

---

## 🚨 Important: Don't Forget!

### Before Going Live:
```bash
# Check your environment variables
✅ MINT_GROUP = (empty or "default")
✅ Not set to "test" or "free"
```

### After Testing:
```bash
# Remove test wallets from your config
# Or just ignore them - they won't interfere
```

---

## ✅ Bottom Line

**With Fallback 1:**
- ✅ You can test with **0.001 SOL** (Option 2 - groups)
- ✅ You can test **FREE** (Option 3 - remove guard)
- ✅ You have **full control** over pricing
- ✅ Easy to switch between test and production

**Current approach:**
- ⚠️ Less flexible - harder to override guards
- ⚠️ Would require config changes + redeployment anyway

---

## 💡 My Recommendation for Testing

Use **Option 2 (Guard Groups)**:
1. Create `test` group with 0.001 SOL price
2. Set `MINT_GROUP=test` in Render during testing
3. Switch to `MINT_GROUP=default` (or remove) for production
4. **Best of both worlds!** ✅

