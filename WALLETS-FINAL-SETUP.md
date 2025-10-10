# 💰 DAPPERDOGGOS - FINAL WALLET CONFIGURATION

## ✅ CORRECT WALLET SETUP

### **Collection Wallet (Receives Mint Payments):**
```
EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3
```
- Receives all mint payments initially
- Temporary holding wallet
- Splits to Artist & Team

### **Artist Wallet (15%):**
```
EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w
```
- Receives 15% of primary sales (via script)
- Receives 15% of royalties (automatic)

### **Team Wallet (85%):**
```
2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q
```
- Receives 85% of primary sales (via script)
- Receives 85% of royalties (automatic)

---

## 🔄 REVENUE FLOW

### **PRIMARY SALES (Minting - 0.1 SOL each)**

```
User mints NFT
      ↓
Collection Wallet receives 0.1 SOL
      ↓
Run: node split-payments.mjs split
      ↓
    ┌─────────┴──────────┐
    ↓                    ↓
Artist Wallet        Team Wallet
0.015 SOL (15%)     0.085 SOL (85%)
```

**Example after 100 mints:**
```
Collection Wallet: 10 SOL
            ↓
Run split script
            ↓
   ┌────────┴─────────┐
   ↓                  ↓
Artist: 1.5 SOL    Team: 8.5 SOL
```

---

### **SECONDARY SALES (Royalties - 5%)**

**100% AUTOMATIC - No script needed!**

```
NFT resells for 1 SOL
      ↓
5% Royalty = 0.05 SOL
      ↓
BLOCKCHAIN SPLITS AUTOMATICALLY:
      ↓
   ┌──────┴──────┐
   ↓             ↓
Artist         Team
0.0075 SOL     0.0425 SOL
(15%)          (85%)
```

---

## ⚡ USING THE SPLIT SCRIPT

### **Check Current Balance:**
```bash
node split-payments.mjs status
```

**Output Example:**
```
💰 Payment Splitter Status
==================================================
💼 Collection Wallet:
   Address: EWHc...LwW3
   Balance: 10.0000 SOL
   Distributable: 9.9900 SOL

💸 Available to Distribute:
   🎨 Artist (15%): 1.4985 SOL
   👥 Team (85%): 8.4915 SOL

🎯 Target Wallets:
   🎨 Artist: EuKL...aj1w
   👥 Team: 2KHb...oY1q
```

---

### **Split Payments:**
```bash
node split-payments.mjs split
```

**Output Example:**
```
💰 Dapper Doggos Payment Splitter
==================================================
📊 Split: 15% Artist / 85% Team
==================================================

💼 Collection Wallet: EWHc...LwW3
   Current Balance: 10.0000 SOL
   Distributable: 9.9900 SOL

💸 Payment Distribution:
   🎨 Artist (15%): 1.4985 SOL
   👥 Team (85%): 8.4915 SOL

📤 Creating transaction...
⏳ Confirming transaction...

✅ Payment split successful!
   Transaction: 5x7y9z...ABC123
   Explorer: https://explorer.solana.com/tx/5x7y9z...

💼 Collection Wallet Final Balance: 0.0100 SOL
```

---

## 📊 COMPLETE REVENUE BREAKDOWN

### **If All 250 NFTs Sell:**

**Primary Sales:**
```
Total Minted: 250 × 0.1 SOL = 25 SOL ($5,000)

Collection Wallet receives all 25 SOL initially
            ↓
Run: node split-payments.mjs split
            ↓
      ┌─────────┴──────────┐
      ↓                    ↓
Artist: 3.75 SOL       Team: 21.25 SOL
($750)                 ($4,250)
```

**Plus Royalties (Year 1 estimate):**
```
100 NFTs trade at 0.5 SOL = 50 SOL volume
5% Royalty = 2.5 SOL

AUTOMATIC SPLIT:
   ├─ Artist: 0.375 SOL ($75)
   └─ Team: 2.125 SOL ($425)
```

**TOTAL YEAR 1:**
```
Artist: 3.75 + 0.375 = 4.125 SOL ($825)
Team: 21.25 + 2.125 = 23.375 SOL ($4,675)
```

---

## 🔐 KEYPAIR REQUIRED

The split script needs the Collection Wallet's private key:

**Location:** `C:\Users\Agavid\.config\solana\devnet.json` (or mainnet.json)

⚠️ **IMPORTANT:**
- Keep this file secure
- Never share or commit to GitHub
- Backup your seed phrase
- Only use for legitimate splits

---

## ⏰ WHEN TO RUN SPLITS

### **Option 1: After X Mints** ⭐ RECOMMENDED
```bash
# After every 25-50 mints
node split-payments.mjs split
```

### **Option 2: Scheduled** 
- Daily: Run once per day
- Weekly: Run once per week
- Set up Windows Task Scheduler

### **Option 3: Manual**
- Check balance anytime with `status`
- Split when convenient

---

## ✅ ALL CONFIGURATIONS UPDATED

- ✅ `config-mainnet.json` - Mint destination: Collection Wallet
- ✅ `config_fresh.json` - Devnet mint destination: Collection Wallet  
- ✅ `split-payments.mjs` - Configured with all 3 wallets
- ✅ All 250 metadata files - Royalty split 15%/85%
- ✅ Price set to 0.1 SOL

---

## 🚀 READY TO DEPLOY!

Everything is correctly configured now!

**Next Steps:**
1. Get 0.6 SOL in deployment wallet
2. Upload 250 NFTs to Arweave
3. Deploy candy machine to mainnet
4. Start minting!
5. Run split script periodically

---

**Questions? Everything is documented and ready to go!** 🎯


