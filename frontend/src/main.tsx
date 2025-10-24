import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    
    if (isDev) {
      // In development, only register if the service worker exists
      fetch('/sw.js')
        .then(response => {
          if (response.ok) {
            return navigator.serviceWorker.register('/sw.js');
          }
          throw new Error('Service worker not available in development');
        })
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration skipped in development: ', registrationError);
        });
    } else {
      // In production, register with proper error handling
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, reload the page
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
