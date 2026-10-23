import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: false,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      proxy: {
        "/api": env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3001",
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
