# 🔄 AUTOMATIC PRIMARY SALES SPLIT - Setup Guide

## 🎯 Goal
Automatically split mint revenue 15% Artist / 85% Team without manual work.

---

## 💡 TWO OPTIONS

### **OPTION 1: Use Collection Wallet + Auto-Split Script** ⭐ RECOMMENDED

This is what I set up for you!

**How it works:**
```
User mints → Collection Wallet (temp holding)
           ↓
Run script: node split-payments.mjs
           ↓
      ┌────────┴────────┐
      ↓                 ↓
Artist Wallet       Team Wallet
   (15%)              (85%)
```

**Advantages:**
- ✅ One-click splitting
- ✅ Can batch multiple mints
- ✅ Saves on transaction fees
- ✅ Full transparency

**Setup:**
1. Use separate collection wallet for receiving mints
2. Run split script after X mints or daily/weekly
3. Script automatically calculates and sends 15%/85%

---

### **OPTION 2: Direct to Team + Manual Split**

**How it works:**
```
User mints → Team Wallet (100%)
           ↓
Team manually sends 15% to Artist
```

**Advantages:**
- ✅ Simpler setup
- ✅ No script needed

**Disadvantages:**
- ❌ Requires manual calculation
- ❌ Requires trust
- ❌ More work

---

## 🚀 OPTION 1 SETUP (Automatic with Script)

### **Step 1: Set Up Collection Wallet**

You need a dedicated wallet to receive mint payments. Options:

**A. Use Your Current Devnet Wallet:**
```
EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3
```

**B. Create New Collection Wallet:**
```bash
solana-keygen new --outfile collection-wallet.json
```

### **Step 2: Update Config**

Update `config-mainnet.json`:
```json
"guards": {
    "solPayment": {
        "amount": 100000000,
        "destination": "COLLECTION_WALLET_ADDRESS"  ← Use dedicated wallet
    }
}
```

### **Step 3: Configure Split Script**

Already done! ✅

`split-payments.mjs` is configured with:
- Artist: `EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w` (15%)
- Team: `2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q` (85%)

### **Step 4: Run Split Script**

**After 10 mints (1 SOL accumulated):**
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
   Current Balance: 1.0000 SOL
   Distributable: 0.9900 SOL

💸 Payment Distribution:
   🎨 Artist (15%): 0.1485 SOL
   👥 Team (85%): 0.8415 SOL

✅ Payment split successful!
```

### **Step 5: Automate (Optional)**

**Set up scheduled splitting:**

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at midnight
4. Action: Run `node split-payments.mjs split`
5. Done! Auto-splits every day

**Or manually run after every 10-50 mints**

---

## ⚡ QUICK COMPARISON

| Feature | Auto-Split Script | Manual Split |
|---------|------------------|--------------|
| **Effort** | Run command | Calculate & send |
| **Speed** | 5 seconds | 2-5 minutes |
| **Accuracy** | 100% precise | Human error risk |
| **Transparency** | Full audit trail | Trust-based |
| **Gas Fees** | Batch = lower | Per transfer |
| **Setup** | 5 minutes | None |

---

## 💰 EXAMPLE SCENARIOS

### **Scenario A: 50 NFTs Minted**

**Collection Wallet has:** 5 SOL

**Run script:**
```bash
node split-payments.mjs split
```

**Instant result:**
- Artist receives: 0.75 SOL (15%)
- Team receives: 4.25 SOL (85%)
- Transaction fee: ~0.00001 SOL

**Time:** 5 seconds ⚡

---

### **Scenario B: 250 NFTs Minted (Sold Out!)**

**Collection Wallet has:** 25 SOL

**Run script:**
```bash
node split-payments.mjs split
```

**Instant result:**
- Artist receives: 3.75 SOL (15%)
- Team receives: 21.25 SOL (85%)
- Transaction fee: ~0.00001 SOL

**Time:** 5 seconds ⚡

---

## 🎯 WHICH OPTION DO YOU WANT?

### **Option 1: Auto-Split (Recommended)** ⭐
- I'll set up collection wallet
- Configure everything
- You run one command to split

### **Option 2: Current Setup (Manual)**
- Keep team wallet receiving 100%
- Team manually sends 15% to artist
- No script needed

---

## 📝 WHAT I NEED FROM YOU

**For Option 1 (Auto-Split):**

Choose one:
1. **Use existing wallet as collection wallet:**
   `EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3`

2. **Create new dedicated collection wallet** (more professional)

**For Option 2 (Manual):**
- Nothing! Current setup works
- Team sends 15% to artist manually

---

Let me know which you prefer and I'll configure it! 🚀


