import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import compression from "vite-plugin-compression"; // gzip+br
import webFontDownload from "vite-plugin-webfont-dl";

/**
 * Starts the downloads the first render needs at the same time as the entry
 * script, instead of one after another:
 * - the App chunk (main.tsx imports it dynamically) and its CSS,
 * - the latin files of the two fonts visible above the fold (otherwise the
 *   browser only asks for them after React has rendered text, and the heading
 *   visibly swaps font).
 */
function startupPreloads() {
  const FONTS = [/\/geist-latin-wght-normal-[^/]+\.woff2$/, /\/unbounded-latin-wght-normal-[^/]+\.woff2$/];
  return {
    name: "startup-preloads",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const files = Object.values(ctx.bundle ?? {});
        const tags = [];
        for (const pattern of FONTS) {
          const font = files.find((file) => file.type === "asset" && pattern.test(`/${file.fileName}`));
          if (font) {
            tags.push({
              tag: "link",
              attrs: { rel: "preload", href: `/${font.fileName}`, as: "font", type: "font/woff2", crossorigin: "" },
              injectTo: "head",
            });
          }
        }
        const app = files.find(
          (file) =>
            file.type === "chunk" &&
            file.isDynamicEntry &&
            (file.moduleIds ?? Object.keys(file.modules ?? {})).some((id) => id.endsWith("/src/App.tsx"))
        );
        if (app) {
          const entry = files.find((file) => file.type === "chunk" && file.isEntry);
          for (const chunk of [app.fileName, ...app.imports.filter((name) => name !== entry?.fileName)]) {
            tags.push({ tag: "link", attrs: { rel: "modulepreload", href: `/${chunk}`, crossorigin: "" }, injectTo: "head" });
          }
          for (const css of app.viteMetadata?.importedCss ?? []) {
            tags.push({ tag: "link", attrs: { rel: "stylesheet", href: `/${css}`, crossorigin: "" }, injectTo: "head" });
          }
        }
        return { html, tags };
      },
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
    startupPreloads(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    // Every browser the site supports runs ES2020; older targets only add
    // helper code for syntax like ?. and ?? that browsers already understand.
    target: "es2020",
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
        },
      },
    },
    assetsDir: "assets",
    copyPublicDir: true,
    sourcemap: true,
    minify: "terser",
  },
});
