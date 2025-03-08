import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'; // Bundle all node_modules into a "vendor" chunk
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000, // Adjust to your desired limit (e.g., 1000 KB)
    },
});
