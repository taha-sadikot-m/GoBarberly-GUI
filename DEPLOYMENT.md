# Vercel Deployment Guide for GoBarberly

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GoBarberly ready for deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the build settings
   - Deploy! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## 📋 Build Configuration

The project is pre-configured with:

- **Framework**: React (Vite)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (recommended)

## 🔧 Manual Configuration (if needed)

If Vercel doesn't auto-detect, use these settings:

### Build Settings
```
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

### Environment Variables
None required for demo deployment.

### Domain Configuration
- Custom domains can be added in Vercel dashboard
- SSL certificates are automatic

## 🎯 Post-Deployment

After deployment:
1. ✅ Test all three user roles
2. ✅ Verify responsive design on mobile
3. ✅ Check all authentication flows
4. ✅ Confirm routing works correctly

## 🔐 Demo Credentials (for deployed app)

- **Super Admin**: `superadmin@gobarberly.com` / `admin123`
- **Admin**: `admin@gobarberly.com` / `admin123`  
- **Barbershop**: `barbershop@gobarberly.com` / `admin123`

## 🔄 Continuous Deployment

Once connected to GitHub, every push to main branch will:
- Automatically trigger a new deployment
- Run build process
- Deploy to production URL
- Update preview deployments for branches

---

Ready to deploy! 🚀