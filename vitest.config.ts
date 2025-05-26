import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./__tests__/setup.ts",
        css: false,
    },
});

// import { defineConfig } from 'vitest/config';
// import path from 'path';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [react()],
//     test: {
//         environment: 'jsdom',
//         globals: true,
//         setupFiles: './__tests__/setup.ts',
//     },
//     resolve: {
//         alias: {
//             '@': path.resolve(__dirname, './src'),
//         },
//     },
// });

