import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { promises as fs } from 'fs';

// Vite plugin to copy PWA assets to the root of the build directory
const copyPwaAssets = () => ({
  name: 'copy-pwa-assets',
  async writeBundle() {
    const pwaAssets = [
      'icon-192x192.png',
      'icon-512x512.png',
      'favicon.ico',
      'favicon-16x16.png',
      'favicon-32x32.png',
      'apple-touch-icon.png',
      'safari-pinned-tab.svg',
      'manifest.json',
      'robots.txt',
      'site.webmanifest'
    ];

    for (const asset of pwaAssets) {
      try {
        await fs.copyFile(
          path.resolve(__dirname, 'public', asset),
          path.resolve(__dirname, 'dist', asset)
        );
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code !== 'ENOENT') {
          console.warn(`Failed to copy PWA asset ${asset}:`, error);
        }
      }
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    copyPwaAssets()
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep the original filenames for PWA assets
          const pwaAssets = [
            'icon-192x192.png',
            'icon-512x512.png',
            'favicon.ico',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'apple-touch-icon.png',
            'safari-pinned-tab.svg',
            'manifest.json',
            'robots.txt',
            'site.webmanifest'
          ];
          
          if (assetInfo.name && pwaAssets.includes(assetInfo.name)) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
