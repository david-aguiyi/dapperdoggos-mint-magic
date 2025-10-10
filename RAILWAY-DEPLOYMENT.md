# 🚂 Railway Backend Deployment Guide

## 📋 Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app - FREE)
- Your Solana mainnet keypair JSON file

## 🚀 Step 1: Push to GitHub

1. **Initialize Git (if not already done)**:
```bash
git init
git add .
git commit -m "Prepare for Railway deployment"
```

2. **Create a new GitHub repository** and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/dapperdoggos-mint-magic.git
git branch -M main
git push -u origin main
```

## 🎯 Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app

2. **Click "Start a New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Choose your repository**: `dapperdoggos-mint-magic`

5. **Railway will automatically detect** your Node.js app

## ⚙️ Step 3: Configure Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to **"Variables"** tab
3. Add these environment variables:

```
PORT=3001
RPC_URL=https://api.mainnet-beta.solana.com
```

## 🔑 Step 4: Upload Solana Keypair

**IMPORTANT: Your keypair contains your wallet's private key!**

### Option A: Upload via Railway CLI (Recommended)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link to your project:
```bash
railway link
```

4. Upload your keypair:
```bash
railway run bash
# In the Railway shell:
mkdir -p /app
cat > /app/mainnet.json
# Paste your keypair JSON content, then press Ctrl+D
```

### Option B: Set as Environment Variable

1. Convert your keypair JSON to a single line
2. Add environment variable in Railway:
```
SOL_KEYPAIR=/app/mainnet.json
```
3. Create a startup script to write the keypair file

## 📦 Step 5: Upload Sugar Binary

Railway runs on Linux, so we need the Linux version of Sugar:

1. Download Sugar for Linux from: https://github.com/metaplex-foundation/sugar/releases

2. Upload via Railway CLI:
```bash
railway run bash
# Upload the sugar binary
wget https://github.com/metaplex-foundation/sugar/releases/download/sugar-v2.X.X/sugar-linux-x86_64
mv sugar-linux-x86_64 sugar
chmod +x sugar
```

3. **Update mint-server.mjs** to use `./sugar` instead of `.\sugar-windows-latest.exe`

## 🎬 Step 6: Deploy!

1. Railway will automatically deploy when you push to GitHub
2. Get your deployment URL: `https://your-app.railway.app`
3. Test the API: `https://your-app.railway.app/collection/status`

## ✅ Step 7: Verify Deployment

Test your backend:
```bash
curl https://your-app.railway.app/collection/status
```

You should see collection status!

## 🔄 Step 8: Update Frontend

Copy your Railway URL and update the frontend environment variable:
```
VITE_API_URL=https://your-app.railway.app
```

---

## 📝 Important Notes

- **Free Tier**: Railway gives $5/month credit for free
- **No Credit Card Required** for free tier
- **Automatic Deploys**: Every GitHub push triggers a new deployment
- **Logs**: Check logs in Railway dashboard for debugging
- **Custom Domain**: You can add your own domain in Railway settings

## 🆘 Troubleshooting

### Backend not starting?
- Check logs in Railway dashboard
- Verify all environment variables are set
- Make sure `cache-clean.json` exists

### Sugar command fails?
- Ensure Linux version of Sugar is uploaded
- Check file permissions (`chmod +x sugar`)
- Verify keypair path is correct

### Connection errors?
- Check if PORT is set to 3001
- Verify RPC_URL is correct
- Check firewall settings

---

## 🎉 Success!

Once deployed, your backend will be live at:
```
https://your-app.railway.app
```

Next: Deploy frontend to Vercel!


