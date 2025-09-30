import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/renderer"),
      "@components": path.resolve(__dirname, "app/renderer/components"),
      "@stores": path.resolve(__dirname, "app/renderer/stores"),
      "@lib": path.resolve(__dirname, "app/renderer/lib"),
      "@data": path.resolve(__dirname, "app/renderer/data")
    }
  }
});
