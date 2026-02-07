import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react({
            fastRefresh: true,
        }),
    ],

     build: {
        // Establece el límite de advertencia de tamaño de chunk a 1000 kB (1 MB)
        chunkSizeWarningLimit: 5000, 
    },
    //  server: {
    //     host: true,       // <--- importante
    //     port: 5173,       // <--- puedes cambiarlo si lo necesitas
    //     hmr: {
    //         host: '192.168.139.46', // <-- tu IP local (no localhost)
    //     },
    //     watch: {
    //         usePolling: true, // ← Importante para algunos sistemas
    //     },
    // },
});
