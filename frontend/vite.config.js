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
                    manualChunks: {
                        'vendor': ['react', 'react-dom', 'react-router-dom'],
                        'three-tier': ['three', '@react-three/fiber', '@react-three/drei'],
                        'query-engine': ['@tanstack/react-query'],
                        'ui-core': ['framer-motion', 'lucide-react'],
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
