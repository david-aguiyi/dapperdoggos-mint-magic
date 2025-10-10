import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        // bind to IPv4 localhost to avoid IPv6 (::) binding issues on Windows
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
    plugins: [
        react(),
        mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        global: 'globalThis',
    },
}));
