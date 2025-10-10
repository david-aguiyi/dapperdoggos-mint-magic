import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: "127.0.0.1",
        port: 8080,
        proxy: {
            "/mint": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "esnext",
        minify: "terser",
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
    define: {
        global: "globalThis",
        __DEFINES__: {},
        __DEV__: false,
        __APP_CONFIG__: {},
        __LOVABLE_ENV__: {},
    },
});