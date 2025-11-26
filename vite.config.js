import { defineConfig } from "vite";
import FullReload from "vite-plugin-full-reload";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig(({ command, mode }) => ({
  define: {
    [command === "serve" ? "global" : "_global"]: {},
  },
  base: "/",
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      "lzma-web": "lzma-web/dist/index.js",
      "@": "src",
    },
  },
  css: {
    postcss: "config/postcss.config.cjs",
  },
  build: {
    sourcemap: mode === "development",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
    rollupOptions: {
      external: ["lzma-native"],
      input: "index.html",
      output: {
        manualChunks: {
          vendor: ["lzma-js", "lzma-web"],
          ui: ["./src/js/features/editor/editor-controller.js"],
        },
        entryFileNames: chunkInfo => {
          if (chunkInfo.name === "commonHelpers") {
            return "commonHelpers.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith(".html")) {
            return "[name].[ext]";
          }
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    FullReload(["./**/*.html"]),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  server: {
    host: "localhost",
    port: 5173,
  },
}));
