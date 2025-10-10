# 💰 Payment Splitting Guide - Dapper Doggos

## Overview

Your NFT collection has **two types of revenue** that need to be split:

### 1️⃣ **Primary Sales (Mint Revenue)** 
- Money from users minting NFTs for the first time
- Goes to collection wallet initially
- **Manually split** using the `split-payments.mjs` script

### 2️⃣ **Secondary Sales (Royalties)**
- Money from NFTs being resold on marketplaces
- **Automatically split** by the blockchain
- Configured in `config_fresh.json` creators array

---

## 🎨 Revenue Split Breakdown

| Recipient | Primary Sales | Secondary Sales |
|-----------|--------------|-----------------|
| **Artist Wallet** | 15% | 15% |
| **Team/Marketing Wallet** | 85% | 85% |
| **Royalty Rate** | - | 5% of sale price |

**Example:**
- NFT mints for $0.30 → Artist gets $0.045, Team gets $0.255
- NFT resells for $10 → 5% royalty = $0.50 total → Artist gets $0.075, Team gets $0.425

---

## 🔧 Setup Instructions

### Step 1: Get Your Wallet Addresses

You need **3 wallet addresses**:

1. **Collection Wallet** (receives mint payments)
   - Current: `EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3`
   - This can stay the same or be changed

2. **Artist Wallet** (15% recipient)
   - Replace `ARTIST_WALLET_ADDRESS_HERE` with actual address
   - Example: `ArtistXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

3. **Team/Marketing Wallet** (85% recipient)
   - Replace `TEAM_MARKETING_WALLET_ADDRESS_HERE` with actual address
   - Example: `TeamXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

### Step 2: Update Configuration Files

#### A. Update `config_fresh.json` (for secondary sales/royalties)

```json
"creators": [
    {
        "address": "YOUR_ARTIST_WALLET_ADDRESS",
        "share": 15
    },
    {
        "address": "YOUR_TEAM_WALLET_ADDRESS",
        "share": 85
    }
],
```

#### B. Update `split-payments.mjs` (for primary sales)

Edit lines 20-26:

```javascript
// The wallet that receives mint payments
collectionWallet: "EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3",

// Artist wallet (gets 15% of revenue)
artistWallet: "YOUR_ARTIST_WALLET_ADDRESS",

// Team/Marketing wallet (gets 85% of revenue)
teamWallet: "YOUR_TEAM_WALLET_ADDRESS",
```

---

### Step 3: Update Generated Metadata

The 250 NFTs in `generated-nfts/metadata/` also need the creator split. Run this script:

```bash
node update-metadata-creators.mjs
```

(Script will be created in next step)

---

## 🚀 How to Use Payment Splitter

### Check Current Balance
```bash
node split-payments.mjs status
```

**Output:**
```
💰 Payment Splitter Status
==================================================
💼 Collection Wallet:
   Address: EWH...LwW3
   Balance: 1.5000 SOL
   Distributable: 1.4900 SOL

💸 Available to Distribute:
   🎨 Artist (15%): 0.2235 SOL
   👥 Team (85%): 1.2665 SOL
```

### Split and Send Payments
```bash
node split-payments.mjs split
```

**Output:**
```
💰 Dapper Doggos Payment Splitter
==================================================
📊 Split: 15% Artist / 85% Team
==================================================

💼 Collection Wallet: EWH...LwW3
   Current Balance: 1.5000 SOL
   Distributable: 1.4900 SOL

💸 Payment Distribution:
   🎨 Artist (15%): 0.2235 SOL
   👥 Team (85%): 1.2665 SOL

✅ Payment split successful!
   Transaction: 5x7y9...
   Explorer: https://explorer.solana.com/tx/5x7y9...
```

---

## 📅 When to Run the Splitter

### Option 1: Manual (Recommended for Testing)
- Run manually after mints
- Check balance with `status` command
- Split when enough funds accumulate

### Option 2: Scheduled (for Production)
- Set up a cron job (Linux/Mac) or Task Scheduler (Windows)
- Run daily, weekly, or after X mints
- Example cron: `0 0 * * * cd /path/to/project && node split-payments.mjs split`

### Option 3: Automated (Advanced)
- Integrate into your mint server
- Auto-split after every N mints
- Requires modifying `server/mint-server.mjs`

---

## 🔒 Security Notes

### Collection Wallet Private Key
- The `split-payments.mjs` script needs access to the collection wallet's private key
- Current location: `C:\Users\Agavid\.config\solana\devnet.json`
- **⚠️ NEVER share or commit this file to GitHub!**

### Recommendations:
1. **Use a dedicated collection wallet** separate from your main wallet
2. **Only keep enough SOL for operations** in the collection wallet
3. **Regularly distribute funds** to artist/team wallets
4. **For mainnet:** Consider using a hardware wallet or multisig

---

## 💡 Revenue Scenarios

### Scenario 1: Sell 100 NFTs at $0.30 each
- **Total Revenue:** $30.00
- **Artist Gets:** $4.50 (15%)
- **Team Gets:** $25.50 (85%)

### Scenario 2: Sell All 250 NFTs at $0.30 each
- **Total Revenue:** $75.00
- **Artist Gets:** $11.25 (15%)
- **Team Gets:** $63.75 (85%)

### Scenario 3: Secondary Market (1 NFT resold for $10)
- **Royalty (5%):** $0.50
- **Artist Gets:** $0.075 (15% of royalty)
- **Team Gets:** $0.425 (85% of royalty)

---

## 🛠️ Troubleshooting

### "Missing candy guard id" Error
- Update the candy machine with: `.\sugar-windows-latest.exe deploy`

### "Insufficient funds" Error
- Collection wallet needs at least 0.01 SOL for transaction fees
- Add funds before running splitter

### Transaction Fails
- Check RPC endpoint is correct (devnet vs mainnet)
- Verify wallet addresses are valid Solana addresses
- Ensure keypair has permissions

---

## 📝 Checklist Before Mainnet

- [ ] Replace all placeholder wallet addresses
- [ ] Update `config_fresh.json` with real addresses
- [ ] Update `split-payments.mjs` with real addresses
- [ ] Update all 250 metadata files with creator info
- [ ] Test payment splitter on devnet
- [ ] Verify royalties work on test marketplace
- [ ] Switch RPC to mainnet in all files
- [ ] Deploy candy machine to mainnet
- [ ] Do a test mint and verify payment splitting
- [ ] Set up payment splitting schedule

---

## 📞 Quick Reference

**Check balance:**
```bash
node split-payments.mjs status
```

**Distribute payments:**
```bash
node split-payments.mjs split
```

**View candy machine:**
```bash
.\sugar-windows-latest.exe show --cache cache_fresh.json
```

**Deploy/update candy machine:**
```bash
.\sugar-windows-latest.exe deploy --cache cache_fresh.json
```

---

## 🎯 Next Steps

1. Provide your Artist and Team wallet addresses
2. Update configuration files with real addresses
3. Test payment splitting on devnet
4. Verify everything works before mainnet deployment

---

Need help? The payment splitter is ready to use once you provide the wallet addresses! 🚀


