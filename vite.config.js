import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    base: "/",
    build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("@google/model-viewer")) {
                        return "model-viewer";
                    }
                    if (id.includes("three")) {
                        return "three-js";
                    }
                    if (id.includes("firebase")) {
                        return "firebase";
                    }
                    if (id.includes("node_modules")) {
                        return "vendor";
                    }
                },
            },
        },
        assetsDir: "assets",
        copyPublicDir: true,
    },
});
