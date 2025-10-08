import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
                secure: false,
            },
            "/api": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
                secure: false,
            },
        },
        headers: {
            "Content-Security-Policy":
                "default-src 'self'; connect-src 'self' http://127.0.0.1:3001 ws://127.0.0.1:3001; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
        },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
        Boolean
    ),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
