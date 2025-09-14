# PWA Deployment Guide for SkillBridge

## 🚀 Deploy to Vercel

Your PWA is now ready for deployment! Here's how to deploy to [https://skill-bridge-web.vercel.app/](https://skill-bridge-web.vercel.app/):

### Option 1: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from the root directory (where vercel.json is located)
vercel --prod
```

### Option 1b: Deploy Frontend Only
```bash
# If deploying just the frontend directory
cd frontend
vercel --prod
```

### Option 2: Git-based Deployment
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add PWA support with native manifest and service worker"
   git push origin main
   ```

2. Vercel will automatically deploy from your GitHub repository.

### Option 3: Manual Upload
1. Run `npm run build` to create the dist folder
2. Upload the entire `dist` folder contents to Vercel

## ✅ PWA Features Included

- **📱 Install Prompt**: Users will see an install button on supported browsers
- **🔄 Offline Support**: App works offline with cached content
- **⚡ Fast Loading**: Service worker caches assets for instant loading
- **🎨 Custom Icons**: Uses your `skillmobprev-removebg-preview.png` and `deskprev.png` as preview images
- **📋 App Shortcuts**: Quick access to "Create Request" and "My Requests"

## 🧪 Testing PWA Features

After deployment, test the PWA features:

1. **Chrome/Edge**: Look for the install button in the address bar or menu
2. **Mobile Safari**: Use "Add to Home Screen" from the share menu
3. **Desktop**: Install button should appear in the browser toolbar

## 📁 Files Created/Modified

- `public/manifest.json` - PWA manifest with your custom icons
- `public/sw.js` - Service worker for offline functionality
- `src/components/PWAInstallPrompt.tsx` - Smart install prompt component
- `index.html` - Updated with PWA meta tags
- `src/main.tsx` - Service worker registration
- `vercel.json` - Optimized deployment configuration

## 🔧 Troubleshooting

If deployment fails:
1. Check that all files in `public/` are included
2. Verify `vercel.json` configuration
3. Ensure build completes successfully with `npm run build`
4. Check Vercel deployment logs for specific errors

Your PWA is now ready for production! 🎉
