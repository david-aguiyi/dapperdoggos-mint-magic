# 🚀 MAINNET DEPLOYMENT GUIDE - DapperDoggos

## 📊 Collection Overview
- **Total NFTs:** 250 unique DapperDoggos
- **Price:** $0.30 (~0.0015 SOL)
- **Royalties:** 5% on secondary sales
- **Revenue Wallet:** `EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3`
- **Potential Revenue:** $75 (if sold out)

---

## 💰 Cost Estimate

### Deployment Costs (Mainnet):
| Item | Cost | Notes |
|------|------|-------|
| **Upload 250 NFTs** | ~0.5-1 SOL | Via Bundlr/IRYS |
| **Create Collection** | ~0.02 SOL | Collection NFT |
| **Deploy Candy Machine** | ~0.05 SOL | Candy Machine v3 |
| **Transaction Fees** | ~0.01 SOL | Various txs |
| **TOTAL** | **~0.6-1.1 SOL** | **~$120-220** |

**⚠️ You need at least 1.5 SOL in your deployment wallet for safety**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Before You Start:

- [ ] You have a **mainnet wallet** with private key
- [ ] Wallet has **at least 1.5 SOL** (~$300)
- [ ] You've backed up your wallet private key
- [ ] You understand this is **REAL MONEY** on mainnet
- [ ] You're ready to launch immediately after deployment

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Prepare Assets**

```bash
node prepare-for-upload.mjs
```

**Expected Output:**
```
📦 Preparing assets for mainnet deployment...
✅ Prepared 50/250 assets...
✅ Prepared 100/250 assets...
✅ Prepared 150/250 assets...
✅ Prepared 200/250 assets...
✅ Prepared 250/250 assets...
✅ Successfully prepared 250 assets for upload!
📁 Assets ready in: ./assets-mainnet
```

**This creates:**
- `assets-mainnet/` folder
- 250 images (0.png - 249.png)
- 250 metadata files (0.json - 249.json)

---

### **STEP 2: Set Up Mainnet Wallet**

**Option A: Use Existing Wallet**
```bash
# Your wallet should already be at:
C:\Users\Agavid\.config\solana\mainnet.json
```

**Option B: Create New Mainnet Wallet** (Recommended for security)
```bash
solana-keygen new --outfile C:\Users\Agavid\.config\solana\mainnet.json
```

**Fund Your Wallet:**
1. Get the wallet address:
```bash
solana-keygen pubkey C:\Users\Agavid\.config\solana\mainnet.json
```

2. Send **at least 1.5 SOL** to that address from an exchange

3. Verify balance:
```bash
solana balance --keypair C:\Users\Agavid\.config\solana\mainnet.json --url https://api.mainnet-beta.solana.com
```

---

### **STEP 3: Upload Assets to IPFS/Arweave**

```bash
.\sugar-windows-latest.exe upload `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --config config-mainnet.json `
  --assets assets-mainnet `
  --cache cache-mainnet.json
```

**⏱️ This will take 10-30 minutes for 250 NFTs**

**Expected Output:**
```
[1/4] Loading assets
Found 250 asset pair(s), uploading files:
+--------------------+
| images    | 250    |
| metadata  | 250    |
+--------------------+

[2/4] Initializing upload
▪▪▪▪▪ Connected to Bundlr

[3/4] Uploading image files
[00:15:30] Upload successful ████████████ 250/250

[4/4] Uploading metadata files
[00:20:45] Upload successful ████████████ 250/250

✅ Command successful.
```

**⚠️ DO NOT INTERRUPT THIS PROCESS!**

---

### **STEP 4: Deploy Candy Machine**

```bash
.\sugar-windows-latest.exe deploy `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --config config-mainnet.json `
  --cache cache-mainnet.json
```

**Expected Output:**
```
[1/2] Loading candy machine
▪▪▪▪▪ Creating candy machine

[2/2] Creating candy machine
Candy machine created with ID: <CANDY_MACHINE_ID>

Collection mint: <COLLECTION_MINT_ID>

✅ Command successful.
```

**📝 SAVE THESE IDs! You'll need them!**

---

### **STEP 5: Verify Deployment**

```bash
.\sugar-windows-latest.exe show `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --cache cache-mainnet.json
```

**Check:**
- ✅ Items available: 250
- ✅ Items redeemed: 0
- ✅ Price: 0.0015 SOL
- ✅ Collection mint: <ID>

---

### **STEP 6: Update Frontend & Backend**

**A. Update `server/mint-server.mjs`:**

```javascript
// Change these lines:
const RPC = "https://api.mainnet-beta.solana.com";
const KEYPAIR = "C:\\Users\\Agavid\\.config\\solana\\mainnet.json";

// Update mint command:
const cmd = `.\\sugar-windows-latest.exe mint --keypair ${KEYPAIR} --rpc-url ${RPC} --receiver ${wallet} --cache cache-mainnet.json --log-level info`;

// Update show command:
const cmd = `.\\sugar-windows-latest.exe show --keypair ${KEYPAIR} --rpc-url ${RPC} --cache cache-mainnet.json`;
```

**B. Update `src/pages/Index.tsx` (for Solana Explorer links):**

Change `?cluster=devnet` to `?cluster=mainnet-beta` or remove it entirely.

---

### **STEP 7: Test Minting**

**⚠️ THIS WILL COST REAL MONEY ($0.30 + gas)**

1. Start backend:
```bash
npm run start:api
```

2. Start frontend:
```bash
npm run dev
```

3. Connect your Phantom wallet (switch to **MAINNET**)

4. Try minting 1 NFT to test

5. Verify:
   - Transaction succeeds
   - NFT appears in wallet
   - Counter updates
   - Money received in your wallet

---

### **STEP 8: LAUNCH! 🚀**

If test mint works:
1. ✅ Share your minting website
2. ✅ Promote on social media
3. ✅ Watch the mints roll in!

---

## 🔧 TROUBLESHOOTING

### "Insufficient funds"
- Add more SOL to your deployment wallet

### "Transaction timeout"
- Mainnet can be slow, wait and retry
- Consider using a faster RPC (QuickNode, Helius)

### "Collection not found"
- Check `cache-mainnet.json` has correct IDs
- Verify deployment completed successfully

### NFT not showing in wallet
- Mainnet indexing can take 5-30 minutes
- Check Solana Explorer instead
- Use XRAY by Helius

---

## 📊 POST-LAUNCH MONITORING

### Track Your Collection:
- **Solana Explorer:** https://explorer.solana.com/address/<CANDY_MACHINE_ID>
- **Magic Eden:** (wait 24-48h for listing)
- **Tensor:** (wait 24-48h for listing)

### Monitor Sales:
```bash
# Check how many minted:
.\sugar-windows-latest.exe show --cache cache-mainnet.json

# Check wallet balance:
solana balance --keypair C:\Users\Agavid\.config\solana\mainnet.json --url https://api.mainnet-beta.solana.com
```

---

## 💰 REVENUE TRACKING

### Primary Sales (Minting):
- **Per NFT:** $0.30
- **If 100 sold:** $30
- **If 250 sold:** $75

### Secondary Sales (Royalties):
- **5% of every resale**
- Automatically sent to your wallet

---

## 🔐 SECURITY

### ⚠️ CRITICAL:
- **NEVER share your private key!**
- **NEVER commit mainnet keypair to GitHub!**
- **Backup your wallet seed phrase!**
- Consider using a hardware wallet for large amounts

---

## 📝 QUICK REFERENCE

### Important Files:
| File | Purpose |
|------|---------|
| `config-mainnet.json` | Mainnet configuration |
| `cache-mainnet.json` | Deployment cache (created during upload) |
| `assets-mainnet/` | 250 NFT assets ready for upload |
| `server/mint-server.mjs` | Backend mint server (update for mainnet) |

### Important Commands:
```bash
# Prepare assets
node prepare-for-upload.mjs

# Upload
.\sugar-windows-latest.exe upload --config config-mainnet.json --cache cache-mainnet.json

# Deploy
.\sugar-windows-latest.exe deploy --config config-mainnet.json --cache cache-mainnet.json

# Check status
.\sugar-windows-latest.exe show --cache cache-mainnet.json

# Start servers
npm run start:api    # Backend
npm run dev          # Frontend
```

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] Mainnet wallet funded with 1.5+ SOL
- [ ] Assets uploaded successfully
- [ ] Candy machine deployed
- [ ] Frontend/backend updated for mainnet
- [ ] Test mint successful
- [ ] Website accessible
- [ ] Social media ready
- [ ] Marketing materials prepared

---

## 🎉 YOU'RE READY TO LAUNCH!

Good luck with your DapperDoggos collection! 🐕🚀

Remember: This is mainnet - real money is involved. Double-check everything!

---

**Need help?** Check the Sugar docs: https://docs.metaplex.com/developer-tools/sugar


