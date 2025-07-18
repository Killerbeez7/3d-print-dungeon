import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import compression from "vite-plugin-compression"; // gzip+br
import webFontDownload from "vite-plugin-webfont-dl";

/**
 * Replace render-blocking <link rel="stylesheet"> tags that Vite injects
 * into the generated index.html with the recommended non-blocking preload
 * pattern:
 *   <link rel="preload" as="style" href="..." onload="this.rel='stylesheet'">.
 * A <noscript> fallback is also added for users with JavaScript disabled.
 */
function nonBlockingCss() {
    return {
        name: "html-non-blocking-css",
        apply: "build",
        enforce: "post",
        transformIndexHtml(html) {
            return html.replace(
                /<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
                (_fullMatch, href) => {
                    const preload = `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
                    const fallback = `<noscript><link rel="stylesheet" href="${href}"></noscript>`;
                    return `${preload}\n${fallback}`;
                }
            );
        },
    };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        compression({ algorithm: "brotliCompress" }),
        webFontDownload(),
        nonBlockingCss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    base: "/",
    build: {
        target: "es2017", // ✅ Modern output to avoid legacy transpilation
        chunkSizeWarningLimit: 1500,
        assetsInlineLimit: 4096,
        rollupOptions: {
            output: {
                manualChunks: {
                    "three-core": ["three"],
                    "three-loaders": [
                        "three/examples/jsm/loaders/STLLoader",
                        "three/examples/jsm/loaders/OBJLoader",
                        "three/examples/jsm/exporters/GLTFExporter",
                    ],
                    stripe: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
                    fontawesome: [
                        "@fortawesome/fontawesome-svg-core",
                        "@fortawesome/free-brands-svg-icons",
                        "@fortawesome/free-regular-svg-icons",
                        "@fortawesome/free-solid-svg-icons",
                        "@fortawesome/react-fontawesome",
                    ],
                    "react-icons": ["react-icons"],
                },
            },
        },
        assetsDir: "assets",
        copyPublicDir: true,
        sourcemap: true,
        minify: "terser",
    },
});
