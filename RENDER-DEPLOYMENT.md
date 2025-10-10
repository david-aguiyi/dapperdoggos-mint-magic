# 🎨 Render Backend Deployment Guide

## 📋 Prerequisites
- GitHub account
- Render account (sign up at https://render.com - FREE, no credit card)
- Your Solana mainnet keypair JSON file

## 🚀 Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🎯 Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Authorize Render to access your repositories

## 🔧 Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `dapperdoggos-mint-magic`
3. Configure the service:

```
Name: dapperdoggos-backend
Environment: Node
Region: Oregon (or closest to you)
Branch: main
Build Command: npm install
Start Command: npm start
```

4. Select **Free** plan

## ⚙️ Step 4: Add Environment Variables

In the Environment section, click "Add Environment Variable" for each:

```
PORT=3001
RPC_URL=https://api.mainnet-beta.solana.com
```

## 🔑 Step 5: Upload Solana Keypair

### Method 1: Using Render Shell (Easiest)

1. After deployment, go to your service
2. Click "Shell" tab (top right)
3. In the shell, create the keypair file:

```bash
cd /opt/render/project/src
cat > mainnet.json
# Paste your entire keypair JSON content
# Press Ctrl+D when done
chmod 600 mainnet.json
```

4. Add environment variable in Render:
```
SOL_KEYPAIR=/opt/render/project/src/mainnet.json
```

### Method 2: Using Environment Variable

1. Copy your entire keypair JSON as a single line:
```json
[1,2,3,4,5...] 
```

2. Add as environment variable:
```
SOLANA_KEYPAIR_JSON=[1,2,3,4,5...]
```

3. Update `server/mint-server.mjs` to write this to a file on startup

## 📦 Step 6: Upload Sugar Binary

Render runs on Linux, so we need Linux Sugar:

1. After first deployment, go to Shell tab
2. Run these commands:

```bash
cd /opt/render/project/src
curl -L https://github.com/metaplex-foundation/sugar/releases/download/sugar-v2.6.0/sugar-linux-x86_64 -o sugar
chmod +x sugar
```

3. Update `server/mint-server.mjs` to use `./sugar` instead of `.\sugar-windows-latest.exe`

## 🎬 Step 7: Deploy!

1. Click "Create Web Service"
2. Render will automatically deploy
3. Wait 2-5 minutes for deployment
4. Get your URL: `https://dapperdoggos-backend.onrender.com`

## ✅ Step 8: Verify Deployment

Test your backend:
```bash
curl https://dapperdoggos-backend.onrender.com/collection/status
```

You should see collection data!

## 🔄 Step 9: Update Frontend

In Vercel, set environment variable:
```
VITE_API_URL=https://dapperdoggos-backend.onrender.com
```

---

## ⚡ Important: Free Tier Limitations

**Render's free tier sleeps after 15 minutes of inactivity**

### Solutions:

#### Option 1: Accept the sleep (Recommended for testing)
- First request after sleep takes ~30 seconds
- Subsequent requests are instant
- Perfect for low-traffic testing

#### Option 2: Keep-alive ping
Add to your frontend to ping every 10 minutes:
```javascript
// In src/pages/Index.tsx
useEffect(() => {
    const keepAlive = setInterval(() => {
        fetch(`${apiBase}/collection/status`).catch(() => {});
    }, 10 * 60 * 1000); // Every 10 minutes
    
    return () => clearInterval(keepAlive);
}, []);
```

#### Option 3: Use UptimeRobot (Free)
- Sign up at https://uptimerobot.com
- Add your Render URL
- It pings every 5 minutes
- Keeps your service awake

#### Option 4: Upgrade to Paid ($7/month)
- No sleep
- Always-on service
- Better performance

---

## 📝 Files to Copy

Copy these files to your backend directory:

**`cache-clean.json`** - Your candy machine cache
**`mainnet.json`** - Your Solana keypair (via Shell)
**`sugar`** - Sugar Linux binary (via Shell)

---

## 🔧 Auto-Deploy Setup

Render automatically deploys when you push to GitHub!

Every `git push` triggers a new deployment.

---

## 🆘 Troubleshooting

### Service won't start?
- Check logs in Render dashboard
- Verify all environment variables
- Make sure `npm start` works locally

### Sugar command fails?
- Ensure you uploaded Linux version
- Check file permissions: `chmod +x sugar`
- Verify path in mint-server.mjs

### Keypair not found?
- Check path: `/opt/render/project/src/mainnet.json`
- Verify file exists in Shell
- Check permissions: `chmod 600 mainnet.json`

### Service is slow?
- First request after sleep takes ~30 seconds
- Use keep-alive ping or UptimeRobot
- Consider upgrading to paid tier

---

## 💰 Costs

- **Free Tier**: FREE forever
  - 750 hours/month
  - 512MB RAM
  - Shared CPU
  - Sleeps after 15 min inactivity

- **Starter Plan**: $7/month
  - No sleep
  - 512MB RAM
  - Always-on

---

## 🎉 Success!

Your backend is now live at:
```
https://dapperdoggos-backend.onrender.com
```

Next: Deploy frontend to Vercel!

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Support: https://render.com/support

---

## ✅ Deployment Checklist

- [ ] GitHub repo pushed
- [ ] Render account created
- [ ] Web service created
- [ ] Environment variables set
- [ ] Keypair uploaded
- [ ] Sugar binary uploaded
- [ ] Service deployed successfully
- [ ] Tested `/collection/status` endpoint
- [ ] Updated Vercel with Render URL
- [ ] Tested full minting flow

---

**Congratulations! Your backend is deployed on Render! 🎨**


