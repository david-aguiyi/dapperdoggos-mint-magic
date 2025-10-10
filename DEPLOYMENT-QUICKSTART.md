# 🚀 DapperDoggos Deployment Quick Start

## 📦 What You're Deploying

- **Frontend** (React + Vite) → Vercel (Free, Fast CDN)
- **Backend** (Node.js + Sugar CLI) → Railway (Free $5/month credit)

---

## ⚡ Quick Deploy Checklist

### 1️⃣ Backend to Railway (15 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

Then:
1. Go to https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   - `PORT=3001`
   - `RPC_URL=https://api.mainnet-beta.solana.com`
5. Upload your Solana keypair (see RAILWAY-DEPLOYMENT.md)
6. Get your Railway URL: `https://your-app.railway.app`

### 2️⃣ Frontend to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click "Add New Project" → Import from GitHub
3. Select your repository
4. Add environment variable:
   - `VITE_API_URL=https://your-app.railway.app`
5. Click "Deploy"
6. Get your Vercel URL: `https://your-project.vercel.app`

---

## ✅ Verification

Test your deployment:

1. **Backend**: `https://your-app.railway.app/collection/status`
2. **Frontend**: `https://your-project.vercel.app`
3. **Try minting** an NFT!

---

## 📚 Detailed Guides

- **Railway Backend**: See [RAILWAY-DEPLOYMENT.md](./RAILWAY-DEPLOYMENT.md)
- **Vercel Frontend**: See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

---

## 🆘 Quick Fixes

### Backend not working?
- Check Railway logs
- Verify environment variables
- Make sure keypair is uploaded

### Frontend shows API error?
- Check `VITE_API_URL` in Vercel
- Test Railway backend directly
- Check CORS settings

### Minting fails?
- Verify keypair has SOL for fees
- Check collection status
- Review Railway logs

---

## 💰 Costs

- **Railway**: FREE ($5/month credit, no card required)
- **Vercel**: FREE (unlimited bandwidth for personal projects)
- **Total**: **$0/month** 🎉

---

## 🎯 Production Checklist

Before going live:

- [ ] Test minting on production
- [ ] Verify wallet connection works
- [ ] Check collection status updates
- [ ] Test error messages
- [ ] Verify payment amount (0.1 SOL)
- [ ] Test with low SOL balance (should show error)
- [ ] Test quantity selector
- [ ] Verify duplicate protection works
- [ ] Check NFT images load on Solscan
- [ ] Test Twitter share button

---

## 🌐 Custom Domain Setup

### For Frontend (Vercel):
1. Vercel Settings → Domains → Add Domain
2. Update your DNS records
3. SSL automatically configured

### For Backend (Railway):
1. Railway Settings → Custom Domain
2. Point CNAME to Railway
3. Update `VITE_API_URL` in Vercel

---

## 📊 Monitoring

- **Railway**: Check logs in dashboard
- **Vercel**: View analytics and logs
- **GitHub**: Auto-deploy on push

---

## 🎉 You're Ready!

Your NFT minting platform is now:
- ✅ Live on the internet
- ✅ Secured with HTTPS
- ✅ Auto-deploying from GitHub
- ✅ Protected from duplicate mints
- ✅ Ready for real users

**Share your link and start minting! 🐕✨**


