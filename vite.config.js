import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import compression from "vite-plugin-compression"; // gzip+br

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss(), compression({ algorithm: "brotliCompress" })],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    base: "/",
    build: {
        chunkSizeWarningLimit: 1500,
        assetsInlineLimit: 4096,
        rollupOptions: {
            output: {
                manualChunks: undefined, // leave Vite defaults
            },
        },
        assetsDir: "assets",
        copyPublicDir: true,
        sourcemap: false,
        minify: 'terser',
    }
});
