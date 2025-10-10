# ⚡ Vercel Frontend Deployment Guide

## 📋 Prerequisites
- Vercel account (sign up at https://vercel.com - FREE)
- Your Railway backend URL from previous deployment
- GitHub repository

## 🚀 Step 1: Prepare Frontend

Your frontend is already configured with `vercel.json`!

## 🎯 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com

2. **Click "Add New Project"**

3. **Import your GitHub repository**: `dapperdoggos-mint-magic`

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend.railway.app
     ```
   - Replace `your-backend.railway.app` with your actual Railway URL

6. **Click "Deploy"** 🚀

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? dapperdoggos
# - Directory? ./
# - Override settings? No

# Set environment variable
vercel env add VITE_API_URL
# Enter your Railway backend URL when prompted

# Deploy to production
vercel --prod
```

## ⚙️ Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Add:

```
VITE_API_URL = https://your-backend.railway.app
```

Make sure to add it for all environments (Production, Preview, Development)

## ✅ Step 4: Verify Deployment

Your site will be live at:
```
https://your-project.vercel.app
```

Test it:
1. Visit your Vercel URL
2. Click "Connect Wallet"
3. Try minting (make sure you have SOL!)

## 🌐 Step 5: Add Custom Domain (Optional)

1. Go to **"Settings" → "Domains"** in Vercel
2. Click **"Add Domain"**
3. Enter your domain (e.g., `dapperdoggos.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

## 🔄 Step 6: Enable Auto-Deploy

Vercel automatically deploys when you push to GitHub!

- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches

## 📝 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend.railway.app` | Railway backend URL |

## 🆘 Troubleshooting

### Build fails?
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Make sure `npm run build` works locally

### API requests fail?
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Test Railway backend directly

### Wallet not connecting?
- Check browser console for errors
- Verify wallet extension is installed
- Try in incognito mode

### Assets not loading?
- Check if files exist in `dist/assets/`
- Verify `vercel.json` configuration
- Check browser network tab

---

## 🎨 Custom Configuration

### Update Backend URL

If you change your Railway backend URL:

1. Go to Vercel project settings
2. Update `VITE_API_URL` environment variable
3. Trigger new deployment:
   ```bash
   vercel --prod
   ```

### Performance Optimization

Vercel automatically handles:
- ✅ Global CDN
- ✅ HTTP/2
- ✅ Gzip/Brotli compression
- ✅ Image optimization
- ✅ Cache headers

---

## 🎉 Success!

Your frontend is now live at:
```
https://your-project.vercel.app
```

## 📊 Next Steps

1. **Test thoroughly** on production
2. **Share your mint link** with users
3. **Monitor analytics** in Vercel dashboard
4. **Set up custom domain** for professional look

---

## 🔗 Complete URLs

After deployment, you'll have:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Custom Domain** (optional): `https://dapperdoggos.com`

## 💡 Pro Tips

1. **Preview Deployments**: Every GitHub branch gets its own preview URL
2. **Analytics**: Enable Vercel Analytics for visitor insights
3. **Monitoring**: Check Vercel logs for errors
4. **Rollback**: Easily rollback to previous deployments in Vercel dashboard

---

Congratulations! Your DapperDoggos NFT minting site is now LIVE! 🎉🐕


