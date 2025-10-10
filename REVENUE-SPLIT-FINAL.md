# 💰 DAPPERDOGGOS REVENUE SPLIT - FINAL SETUP

## ✅ WALLET CONFIGURATION

### **Artist Wallet (15%):**
```
EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w
```
- Receives mint payments initially
- Keeps 15% of primary sales
- Receives 15% of royalties (automatic)

### **Team Wallet (85%):**
```
2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q
```
- Receives 85% of primary sales (via script)
- Receives 85% of royalties (automatic)

---

## 🔄 HOW IT WORKS

### **PRIMARY SALES (Minting - 0.1 SOL each)**

**Step 1: User Mints**
```
User pays 0.1 SOL
      ↓
Artist Wallet receives 0.1 SOL
```

**Step 2: Run Split Script**
```bash
node split-payments.mjs split
```

**Step 3: Automatic Distribution**
```
Artist Wallet Balance: 10 SOL (from 100 mints)
              ↓
   Script sends 85% to Team
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Artist Keeps        Team Receives
1.5 SOL (15%)      8.5 SOL (85%)
```

---

### **SECONDARY SALES (Royalties - 5%)**

**100% AUTOMATIC - No script needed!**

```
NFT resells for 1 SOL
      ↓
5% Royalty = 0.05 SOL
      ↓
BLOCKCHAIN AUTOMATICALLY SPLITS:
      ↓
   ┌──────┴──────┐
   ↓             ↓
Artist        Team
0.0075 SOL    0.0425 SOL
(15%)         (85%)
```

---

## 📊 REVENUE EXAMPLES

### **Example 1: 50 NFTs Minted**

**Before Split:**
```
Artist Wallet: 5 SOL (from 50 mints)
Team Wallet: 0 SOL
```

**Run Script:**
```bash
node split-payments.mjs split
```

**After Split:**
```
Artist Wallet: 0.75 SOL (15% = keeps this)
Team Wallet: 4.25 SOL (85% = received this)
```

---

### **Example 2: 250 NFTs Minted (SOLD OUT!)**

**Before Split:**
```
Artist Wallet: 25 SOL (from 250 mints)
Team Wallet: 0 SOL
```

**Run Script:**
```bash
node split-payments.mjs split
```

**After Split:**
```
Artist Wallet: 3.75 SOL (15%)
Team Wallet: 21.25 SOL (85%)
```

---

### **Example 3: Royalties (Automatic)**

**100 NFTs trade at 0.5 SOL each:**
```
Trading Volume: 50 SOL
5% Royalty: 2.5 SOL

AUTOMATIC SPLIT (no action needed):
   ├─ Artist receives: 0.375 SOL (15%)
   └─ Team receives: 2.125 SOL (85%)
```

---

## ⚡ USING THE SPLIT SCRIPT

### **Check Balance:**
```bash
node split-payments.mjs status
```

**Output:**
```
💰 Payment Splitter Status
==================================================
💼 Collection Wallet (Artist):
   Address: EuKL...aj1w
   Balance: 10.0000 SOL
   Distributable: 9.9900 SOL

💸 Available to Distribute:
   🎨 Artist (15%): 1.4985 SOL (keeps in wallet)
   👥 Team (85%): 8.4915 SOL (will send)
```

---

### **Split Payments:**
```bash
node split-payments.mjs split
```

**Output:**
```
💰 Dapper Doggos Payment Splitter
==================================================
📊 Split: 15% Artist / 85% Team
==================================================

💼 Collection Wallet: EuKL...aj1w
   Current Balance: 10.0000 SOL
   Distributable: 9.9900 SOL

💸 Payment Distribution:
   🎨 Artist (15%) - Keeps: 1.4985 SOL (stays in wallet)
   👥 Team (85%) - Sending: 8.4915 SOL

📤 Creating transaction...
⏳ Confirming transaction...

✅ Payment split successful!
   Transaction: 5x7y9z...ABC123
   Explorer: https://explorer.solana.com/tx/5x7y9z...

💼 Artist Wallet Final Balance: 1.4985 SOL
```

---

## 📅 WHEN TO RUN THE SCRIPT

### **Option 1: After X Mints** ⭐ RECOMMENDED
- Run after every 25-50 mints
- Keeps balances updated
- Regular distribution

### **Option 2: Daily/Weekly**
- Set a schedule
- Run once per day or week
- Less frequent but organized

### **Option 3: Manual**
- Run whenever you want
- Check balance first with `status`
- Split when convenient

---

## 🔐 SECURITY NOTES

### **Keypair Required:**
The split script needs access to the Artist wallet's private key:
```
Location: C:\Users\Agavid\.config\solana\mainnet.json
```

⚠️ **IMPORTANT:**
- Keep this file secure
- Never share or commit to GitHub
- Backup the seed phrase

---

## 💡 TOTAL REVENUE TRACKING

### **If All 250 NFTs Sell:**

**Primary Sales:**
```
Total Minted: 250 × 0.1 SOL = 25 SOL ($5,000)

After Split:
   ├─ Artist: 3.75 SOL ($750)
   └─ Team: 21.25 SOL ($4,250)
```

**Plus Royalties (Year 1 estimate):**
```
If 100 NFTs trade at 0.5 SOL = 50 SOL volume
5% Royalty = 2.5 SOL

Automatic Split:
   ├─ Artist: 0.375 SOL ($75)
   └─ Team: 2.125 SOL ($425)
```

**TOTAL YEAR 1:**
```
Artist Total: 4.125 SOL ($825)
Team Total: 23.375 SOL ($4,675)
```

---

## ✅ CONFIGURATION STATUS

- ✅ Artist Wallet: `EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w`
- ✅ Team Wallet: `2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q`
- ✅ Mint Price: 0.1 SOL
- ✅ Primary Split: 15% Artist / 85% Team (script)
- ✅ Royalty Split: 15% Artist / 85% Team (automatic)
- ✅ Royalty Rate: 5%
- ✅ All 250 metadata files updated
- ✅ config-mainnet.json configured

---

## 🚀 READY TO DEPLOY!

Everything is configured correctly! Next steps:

1. Get 0.6 SOL in deployment wallet
2. Upload to Arweave
3. Deploy candy machine
4. Start minting!
5. Run split script after mints

---

**Questions? Check AUTO-SPLIT-SETUP.md for more details!** 🎯


