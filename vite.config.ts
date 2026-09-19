import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // 1. Najpierw wyodrębniamy ikony (żeby nie wpadły do reacta)
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              // 2. Animacje
              if (id.includes("motion") || id.includes("framer-motion")) {
                return "vendor-motion";
              }
              // 3. AI / Gemini
              if (id.includes("@google/genai")) {
                return "vendor-genai";
              }
              // 4. Ścisły rdzeń React (tylko 45 KB gzipped!)
              if (
                id.includes("/react/") ||
                id.includes("/react-dom/") ||
                id.includes("/scheduler/")
              ) {
                return "vendor-react";
              }
              return "vendor";
            }
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});
