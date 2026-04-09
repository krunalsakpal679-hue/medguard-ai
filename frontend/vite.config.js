import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * High-performance clinical build configuration for MedGuard AI.
 */
export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        plugins: [
            react(),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: !isProd,
            minify: 'esbuild',
            esbuild: {
                drop: isProd ? ['console', 'debugger'] : [],
            },
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            if (id.includes('three') || id.includes('@react-three')) return 'vendor-3d';
                            if (id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-ui';
                            return 'vendor';
                        }
                    },
                },
            },
        },
        server: {
            port: 5173,
            host: true,
        },
        preview: {
            port: 4173,
            host: true,
        }
    };
});
