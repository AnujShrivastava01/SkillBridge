# Vercel Deployment Fix for SkillBridge PWA

## 🔧 **Fixed Issues:**

### 1. **Simplified vercel.json**
- Removed deprecated `builds` configuration
- Removed `buildCommand` and `outputDirectory` (Vercel auto-detects)
- Simplified to just `rewrites` for SPA routing

### 2. **Current vercel.json (Fixed)**
```json
{
  "rewrites": [
    {
      "source": "/((?!assets|favicon\\.ico|robots\\.txt|manifest\\.json|sw\\.js|icon-|apple-touch-icon|masked-icon|safari-pinned-tab|mstile-).*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🚀 **Deployment Steps:**

### **Option 1: Vercel CLI**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# For production deployment
vercel --prod
```

### **Option 2: Git Integration**
```bash
# Commit and push changes
git add .
git commit -m "Fix Vercel deployment for PWA"
git push origin main
```

### **Option 3: Manual Upload**
1. Run `npm run build`
2. Upload the `dist` folder contents to Vercel
3. Set build command to `npm run build`
4. Set output directory to `dist`

## 🛠️ **Alternative vercel.json (If Still Failing)**

If the simplified version doesn't work, try this more explicit configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "dest": "/sw.js"
    },
    {
      "src": "/manifest.json", 
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🔍 **Common Vercel Deployment Issues & Solutions:**

### **Issue 1: Build Command Not Found**
**Solution:** Vercel should auto-detect, but you can set it manually:
- Build Command: `npm run build`
- Output Directory: `dist`

### **Issue 2: PWA Files Not Found**
**Solution:** Ensure files are in `public` folder:
- ✅ `public/manifest.json`
- ✅ `public/sw.js`
- ✅ `public/icon-192x192.png`
- ✅ `public/icon-512x512.png`

### **Issue 3: Service Worker Not Loading**
**Solution:** Check the service worker path in `main.tsx`:
```javascript
navigator.serviceWorker.register('/sw.js')
```

### **Issue 4: SPA Routing Issues**
**Solution:** The `rewrites` in vercel.json should handle this:
```json
{
  "rewrites": [
    {
      "source": "/((?!assets|favicon\\.ico|robots\\.txt|manifest\\.json|sw\\.js|icon-|apple-touch-icon|masked-icon|safari-pinned-tab|mstile-).*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📱 **Testing After Deployment:**

### **1. Check PWA Files**
Visit these URLs on your deployed site:
- `https://your-domain.vercel.app/manifest.json`
- `https://your-domain.vercel.app/sw.js`

### **2. Test PWA Installation**
- **Mobile**: Look for "Add to Home Screen" prompt
- **Desktop**: Look for install icon in address bar
- **DevTools**: Application → Service Workers (should show registered)

### **3. Test Offline**
- Go offline in DevTools
- App should still work (basic pages cached)

## 🎯 **Quick Fix Commands:**

```bash
# 1. Clean build
rm -rf dist
npm run build

# 2. Test locally
npx serve dist

# 3. Deploy to Vercel
vercel --prod
```

## 📞 **If Still Failing:**

1. **Check Vercel Logs**: Go to your Vercel dashboard → Functions → View logs
2. **Verify Build**: Ensure `npm run build` works locally
3. **Check Dependencies**: Ensure all dependencies are in `package.json`
4. **Environment Variables**: Check if any are missing in Vercel settings

## ✅ **Expected Result:**

After successful deployment:
- ✅ App loads on your Vercel domain
- ✅ PWA files are accessible
- ✅ "Add to Home Screen" works on mobile
- ✅ Install prompt appears on desktop
- ✅ Offline functionality works

Your PWA should now deploy successfully on Vercel! 🎉
