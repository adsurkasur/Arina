import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "../dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
});
