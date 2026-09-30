import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`       -> production app for Netlify: /js, /css, /images folders
// `npm run build:demo`  -> one self-contained HTML file: the seeded, no-backend demo
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'demo' ? [viteSingleFile()] : [])],
  build: mode === 'demo'
    ? { outDir: 'dist-demo', assetsInlineLimit: 100_000_000, cssCodeSplit: false }
    : {
        outDir: 'dist',
        assetsInlineLimit: 0, // never inline images as base64
        rollupOptions: {
          output: {
            entryFileNames: 'js/[name]-[hash].js',
            chunkFileNames: 'js/[name]-[hash].js',
            assetFileNames: (a) => {
              const n = a.names?.[0] ?? a.name ?? '';
              if (/\.css$/i.test(n)) return 'css/[name]-[hash][extname]';
              if (/\.(woff2?|ttf|otf)$/i.test(n)) return 'fonts/[name]-[hash][extname]';
              return 'images/[name]-[hash][extname]';
            },
          },
        },
      },
}));
