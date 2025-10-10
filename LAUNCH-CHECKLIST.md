# 🚀 DAPPERDOGGOS MAINNET LAUNCH - COMPLETE CHECKLIST

## 🌐 **Website:** dapperdoggos.com

---

## ✅ **PRE-LAUNCH CHECKLIST (Before Going Live)**

### **Technical Setup:**
- [ ] Domain `dapperdoggos.com` purchased and configured
- [ ] SSL certificate installed (HTTPS)
- [ ] DNS pointing to your server
- [ ] Frontend deployed to hosting
- [ ] Backend API server deployed

### **Wallet Configuration:**
- [x] Collection Wallet: `EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3`
- [x] Artist Wallet (15%): `EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w`
- [x] Team Wallet (85%): `2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q`
- [x] Split script configured
- [ ] All wallets tested and verified

### **NFT Collection:**
- [x] 250 unique NFTs generated
- [x] Metadata updated with creator split
- [x] Assets prepared in `assets-mainnet/`
- [x] Price set to 0.1 SOL
- [x] 5% royalty configured

### **Solana Setup:**
- [ ] Mainnet wallet funded with 0.6+ SOL
- [ ] Wallet backed up (seed phrase saved)
- [ ] RPC endpoint configured for mainnet
- [ ] Sugar CLI ready

---

## 📦 **DEPLOYMENT STEPS**

### **Step 1: Upload Assets to Arweave** ⏱️ 10-30 min

```bash
.\sugar-windows-latest.exe upload `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --config config-mainnet.json `
  --assets assets-mainnet `
  --cache cache-mainnet.json
```

**Expected Cost:** ~0.4 SOL (~$80)

**Check:**
- [ ] Upload successful
- [ ] All 250 items uploaded
- [ ] `cache-mainnet.json` created
- [ ] IPFS/Arweave links in cache

---

### **Step 2: Deploy Candy Machine** ⏱️ 2-5 min

```bash
.\sugar-windows-latest.exe deploy `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --config config-mainnet.json `
  --cache cache-mainnet.json
```

**Expected Cost:** ~0.05 SOL (~$10)

**Check:**
- [ ] Deployment successful
- [ ] Candy Machine ID received
- [ ] Collection Mint ID received
- [ ] Save both IDs!

---

### **Step 3: Verify Deployment**

```bash
.\sugar-windows-latest.exe show `
  --keypair C:\Users\Agavid\.config\solana\mainnet.json `
  --rpc-url https://api.mainnet-beta.solana.com `
  --cache cache-mainnet.json
```

**Verify:**
- [ ] Items available: 250
- [ ] Items redeemed: 0
- [ ] Price: 0.1 SOL (100000000 lamports)
- [ ] Symbol: DAPPER
- [ ] Royalty: 5% (500 basis points)
- [ ] Creator split: 15% / 85%

---

### **Step 4: Update Backend for Mainnet**

Edit `server/mint-server.mjs`:

```javascript
// Line 5-6: Update these
const RPC = "https://api.mainnet-beta.solana.com";
const KEYPAIR = "C:\\Users\\Agavid\\.config\\solana\\mainnet.json";

// Line ~20: Update cache file
const cmd = `.\sugar-windows-latest.exe mint --keypair ${KEYPAIR} --rpc-url ${RPC} --receiver ${wallet} --cache cache-mainnet.json --log-level info`;

// Line ~50: Update show command
const cmd = `.\sugar-windows-latest.exe show --keypair ${KEYPAIR} --rpc-url ${RPC} --cache cache-mainnet.json`;
```

**Check:**
- [ ] RPC updated to mainnet
- [ ] Keypair updated to mainnet
- [ ] Cache updated to cache-mainnet.json
- [ ] Backend restarted

---

### **Step 5: Update Frontend for Mainnet**

Edit `src/pages/Index.tsx`:

**Find all instances of:**
```typescript
?cluster=devnet
```

**Replace with:**
```typescript
?cluster=mainnet-beta
```

**Or simply remove** `?cluster=devnet` entirely (mainnet is default)

**Check:**
- [ ] Explorer links updated
- [ ] API endpoints correct
- [ ] Frontend rebuilt
- [ ] Changes deployed

---

### **Step 6: Test Mint (REAL MONEY!)**

1. Go to https://dapperdoggos.com
2. Switch Phantom to **MAINNET**
3. Connect wallet
4. Click "Mint DapperDoggo"
5. Confirm transaction

**Verify:**
- [ ] Transaction succeeds
- [ ] 0.1 SOL charged
- [ ] NFT appears in wallet
- [ ] Counter updates (1/250)
- [ ] Collection wallet receives payment
- [ ] Success dialog shows
- [ ] Twitter share works

---

## 📣 **LAUNCH DAY ACTIONS**

### **Hour 0: Go Live**

**1. Final Checks:**
- [ ] Website live at dapperdoggos.com
- [ ] Mint works correctly
- [ ] Mobile responsive
- [ ] All wallets compatible

**2. Social Media Preparation:**
- [ ] Prepare launch tweet
- [ ] Prepare launch thread
- [ ] Schedule follow-up tweets
- [ ] Have NFT images ready

**3. Community Setup:**
- [ ] Discord server live
- [ ] Channels configured
- [ ] Announcement ready
- [ ] Mod team briefed

---

### **Hour 1: Announce Launch**

**Twitter:**
```
🚨 DAPPERDOGGOS IS LIVE! 🚨

250 unique NFTs on Solana
0.1 SOL each (~$20)

🎨 Hand-crafted layers
💎 5% royalties
🔥 Limited forever

Mint NOW: dapperdoggos.com

RT to spread! 🚀

#SolanaNFT #DapperDoggos #NFTLaunch

[Attach best NFT image]
```

- [ ] Launch tweet posted
- [ ] Thread posted
- [ ] Pinned to profile
- [ ] Announced in crypto groups

**Discord:**
- [ ] @everyone announcement
- [ ] Mint link shared
- [ ] First minters celebrated

---

### **Hours 2-24: Monitor & Engage**

**Every 2 Hours:**
- [ ] Check mint progress
- [ ] Reply to comments
- [ ] RT mint announcements
- [ ] Update stats

**Updates:**
```
Hour 4: "10 minted! 🔥"
Hour 8: "25 minted! 📈"
Hour 12: "50 minted! 🚀"
Hour 24: "100 minted! 🎉"
```

---

## 📊 **DAY 2-7: GROWTH PHASE**

### **Daily Tasks:**

**Morning (9am):**
- [ ] Check overnight mints
- [ ] Post collection update
- [ ] Engage with community

**Afternoon (2pm):**
- [ ] Feature holder NFT
- [ ] Share trait spotlight
- [ ] Reply to questions

**Evening (7pm):**
- [ ] Post reminder to mint
- [ ] Share success stories
- [ ] RT community posts

**Night (10pm):**
- [ ] Run revenue split if needed
- [ ] Plan next day content
- [ ] Check marketplace listings

---

### **Revenue Management:**

**After 25 Mints:**
```bash
node split-payments.mjs split
```
- [ ] 15% to Artist
- [ ] 85% to Team
- [ ] Record transaction

**After 50 Mints:**
- [ ] Split again
- [ ] Announce milestone
- [ ] Celebrate with community

---

## 🏆 **MILESTONES TO CELEBRATE**

### **First 10 Mints (Day 1)**
```
Tweet: "10 DapperDoggos found their homes! 🎉
       240 left - join the pack!
       dapperdoggos.com"
```

### **50 Mints (Week 1)**
```
Tweet: "🎉 20% SOLD! 🎉
       50 Doggos minted!
       Thanks to our amazing community! 🙏
       200 left → dapperdoggos.com"
```

### **100 Mints (Week 2)**
```
Tweet: "🚨 40% SOLD OUT! 🚨
       100 DapperDoggos claimed!
       150 remaining at mint price!
       Get yours → dapperdoggos.com 🔥"
```

### **250 Mints (SOLD OUT!)**
```
Tweet: "🎉🎉🎉 SOLD OUT! 🎉🎉🎉
       
       All 250 DapperDoggos have found their homes!
       
       Thank you to our incredible community! 💙
       
       Secondary market now open on @MagicEden
       
       #DapperDoggos #SoldOut #Solana"
```

---

## 📈 **MARKETPLACE SUBMISSIONS**

### **Day 2-3: Submit to Marketplaces**

**Magic Eden:**
- URL: https://magiceden.io/creators/apply
- [ ] Submit collection details
- [ ] Provide Candy Machine ID
- [ ] Add description & images
- [ ] Wait for approval (24-48h)

**Tensor:**
- URL: https://tensor.trade
- [ ] Connect wallet
- [ ] Import collection
- [ ] Verify details

**OpenSea:**
- URL: https://opensea.io
- [ ] Import Solana collection
- [ ] Add banner & profile image
- [ ] Write description

**Info Needed:**
```
Collection Name: DapperDoggos
Symbol: DAPPER
Supply: 250
Candy Machine: [FROM cache-mainnet.json]
Collection Mint: [FROM cache-mainnet.json]
Website: https://dapperdoggos.com
Twitter: @YourTwitterHandle
Discord: Your Discord Link
```

---

## 💰 **REVENUE TRACKING**

### **Daily Spreadsheet:**

| Date | Mints Today | Total Minted | Revenue (SOL) | Artist Split | Team Split |
|------|-------------|--------------|---------------|--------------|------------|
| Jan 15 | 25 | 25 | 2.5 | 0.375 | 2.125 |
| Jan 16 | 30 | 55 | 5.5 | 0.825 | 4.675 |
| ... | ... | ... | ... | ... | ... |

**Run splits weekly or after 50 mints**

---

## 📞 **IMPORTANT LINKS**

### **Your Assets:**
- Website: https://dapperdoggos.com
- Twitter: @[YourHandle]
- Discord: [Your Discord]

### **Tools:**
- Candy Machine Explorer: https://explorer.solana.com/address/[CANDY_MACHINE_ID]
- Collection Explorer: https://explorer.solana.com/address/[COLLECTION_MINT_ID]
- Magic Eden: https://magiceden.io/marketplace/dapperdoggos (after listing)

### **Analytics:**
- Solscan: https://solscan.io
- Hello Moon: https://hellomoon.io
- Solana Floor: https://solanafloor.com

---

## 🔒 **SECURITY CHECKLIST**

**Before Launch:**
- [ ] Private keys backed up
- [ ] Seed phrases written down
- [ ] NOT committed to GitHub
- [ ] Stored securely offline
- [ ] Test wallets have no real funds

**After Launch:**
- [ ] Monitor for scams/phishing
- [ ] Verify all transactions
- [ ] Keep keys secure
- [ ] Regular security audits

---

## 📝 **FINAL PRE-FLIGHT CHECK**

**T-Minus 10 Minutes:**
- [ ] Website loads: dapperdoggos.com ✅
- [ ] Wallet connects ✅
- [ ] Mint button works ✅
- [ ] Price shows 0.1 SOL ✅
- [ ] Counter shows 0/250 ✅
- [ ] Twitter share tested ✅
- [ ] Mobile responsive ✅
- [ ] Discord ready ✅
- [ ] Launch tweet drafted ✅
- [ ] Coffee/energy drink ready ☕

**T-Minus 0: LAUNCH! 🚀**

Post launch tweet → Monitor → Engage → Grow! 🎉

---

## 🎯 **SUCCESS METRICS**

### **Day 1 Goals:**
- 10-25 mints
- 50+ website visitors
- 100+ tweet impressions
- Active Discord

### **Week 1 Goals:**
- 50+ mints (20% sold)
- Listed on Magic Eden
- 500+ Twitter followers
- Growing community

### **Month 1 Goals:**
- 150+ mints (60% sold)
- Active trading
- 0.15+ SOL floor price
- Strong holder base

### **Ultimate Goal:**
- 250/250 SOLD OUT! 🎉
- 1+ SOL floor price
- 1000+ Twitter followers
- Thriving community

---

## 📱 **UPDATED TWITTER SHARE**

When users mint and click "Share on Twitter":

```
🐕 DAPPERDOGGOS IS LIVE! 🚀

✨ 250 Unique NFTs
💰 Only 0.1 SOL ($20)
🎨 Layered Artwork
💎 5% Royalties

Just minted mine! 🔥

Mint now: dapperdoggos.com

#SolanaNFT #DapperDoggos #NFTLaunch
```

**This is free marketing!** Every mint = potential viral tweet! 🔥

---

## 🎉 **YOU'RE READY!**

Everything is configured and ready to launch:

✅ 250 unique NFTs ready  
✅ Price: 0.1 SOL  
✅ Wallet splits configured  
✅ Twitter marketing optimized  
✅ Multi-wallet support  
✅ Website: dapperdoggos.com  

**Next Steps:**
1. Get 0.6 SOL for deployment
2. Run upload command
3. Deploy candy machine
4. Update backend/frontend
5. LAUNCH! 🚀

---

**Time to make DapperDoggos the hottest NFT collection on Solana!** 🐕🔥

Good luck! 🎯


