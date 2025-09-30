import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: "app/renderer",
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/renderer"),
      "@components": path.resolve(__dirname, "app/renderer/components"),
      "@stores": path.resolve(__dirname, "app/renderer/stores"),
      "@lib": path.resolve(__dirname, "app/renderer/lib"),
      "@data": path.resolve(__dirname, "app/renderer/data"),
      "@assets": path.resolve(__dirname, "assets")
    }
  }
});
