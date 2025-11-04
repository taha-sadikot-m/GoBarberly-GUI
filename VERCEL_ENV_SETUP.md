# 🚀 Vercel Deployment Environment Variables

## Required Environment Variables for Vercel

You need to set these environment variables in your Vercel dashboard:

### Go to: https://vercel.com/your-username/go-barberly-gui/settings/environment-variables

Add these variables:

```
VITE_API_URL=https://gobarberly-backend.onrender.com
VITE_APP_NAME=GoBarberly
VITE_APP_VERSION=1.0.0
VITE_ENABLE_API_LOGGING=false
VITE_TOKEN_REFRESH_INTERVAL=300000
VITE_ENVIRONMENT=production
```

## Backend CORS Configuration

Your backend already supports Vercel deployments through this regex pattern:
```python
r"^https://.*\.vercel\.app$"
```

## Deployment Steps

1. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable with Production scope

2. **Redeploy**
   - After adding environment variables, redeploy your project
   - Vercel will rebuild with the new environment variables

3. **Verify**
   - Check that your deployed app uses `https://gobarberly-backend.onrender.com` instead of localhost
   - Test login functionality

## Troubleshooting

If you still see localhost URLs:
1. Clear browser cache
2. Check browser Network tab to see actual API calls
3. Verify environment variables are set correctly in Vercel dashboard
4. Ensure deployment used the new environment variables

## Local Development vs Production

- **Local (.env)**: Uses `https://gobarberly-backend.onrender.com` or can be switched to `http://localhost:8000`
- **Production (.env.production)**: Always uses `https://gobarberly-backend.onrender.com`
- **Vercel**: Uses environment variables set in Vercel dashboard