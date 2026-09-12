import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split third-party code out of the application chunk. Without this
          // the single bundle lands near 573 kB, above the 512 KiB ceiling this
          // project holds every shipped text file to. Matching on the resolved
          // module path is deliberate: naming the bare "react-dom" specifier
          // only catches its re-export stub, because the real runtime lives in
          // react-dom/cjs/react-dom-client.production.js.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            return 'vendor';
          },
        },
      },
    },
    server: {
      // HMR can be disabled via the DISABLE_HMR env var, which also stops file
      // watching so an external editor writing files does not cause flicker.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
