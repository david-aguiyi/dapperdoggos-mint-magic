# Get Free RPC API Key (2 Minutes)

## 🚨 Problem
All free public RPCs now require API keys:
- ❌ api.mainnet-beta.solana.com → 403 Forbidden
- ❌ solana-mainnet.rpc.extrnode.com → 401 Unauthorized  
- ❌ mainnet.helius-rpc.com → 401 Missing API key
- ❌ rpc.ankr.com/solana → 403 Not allowed

## ✅ Solution: Get Free Helius API Key

### **Step 1: Sign Up (30 seconds)**
1. Go to: https://www.helius.dev/
2. Click "Start Building" or "Sign Up"
3. Sign up with email or GitHub
4. Verify email

### **Step 2: Create API Key (10 seconds)**
1. Go to Dashboard: https://dashboard.helius.dev/
2. Click "Create New Project"
3. Name it: "DapperDoggos"
4. Click "Create"
5. Copy the API key (looks like: `abc123def456...`)

### **Step 3: Use in Code (5 seconds)**

Tell me the API key and I'll add it to the code!

Or you can add it yourself:

**In `src/App.tsx`, change:**
```typescript
const RPC_URL = 'https://rpc.ankr.com/solana';
```

**To:**
```typescript
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE';
```

---

## 🆓 Free Tier Limits

**Helius Free Tier:**
- ✅ 100,000 requests/day
- ✅ Plenty for your NFT collection
- ✅ No credit card required
- ✅ Upgradable if needed

---

## ⚡ Alternative: Use Backend RPC

If you don't want to sign up, I can make the frontend use your backend's RPC through a proxy endpoint.

**Which would you prefer?**
1. Get free Helius API key (recommended, 2 min)
2. Proxy through backend (I'll implement it)

