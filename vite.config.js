import { defineConfig } from "vite";
import { glob } from "glob";
import injectHTML from "vite-plugin-html-inject";
import FullReload from "vite-plugin-full-reload";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig(({ command, mode }) => ({
  define: {
    [command === "serve" ? "global" : "_global"]: {},
  },
  base: mode === "production" ? "/External-Mines-Programmator/" : "/",
  root: "src",
  css: {
    postcss: "./config/postcss.config.cjs",
  },
  build: {
    sourcemap: mode === "development",
    rollupOptions: {
      input: "./src/index.html",
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        entryFileNames: chunkInfo => {
          if (chunkInfo.name === "commonHelpers") {
            return "commonHelpers.js";
          }
          return "[name].js";
        },
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith(".html")) {
            return "[name].[ext]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [
    injectHTML(),
    FullReload(["./src/**/*.html"]),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  server: {
    host: "localhost",
    port: 5173,
  },
}));
