import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type UserConfig } from "vite";

const defaultApiProxyTarget = "http://localhost:3000";

export function createPanelViteConfig(overrides: UserConfig = {}) {
  return defineConfig({
    plugins: createPanelPlugins(),
    optimizeDeps: {
      include: ["leaflet", "react-leaflet"],
    },
    server: {
      fs: {
        // Allow importing from workspace packages (e.g. @fuel-carrier/web-ui).
        allow: ["../.."],
      },
      proxy: {
        "/api": {
          target: defaultApiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    ...overrides,
  });
}

export function createPanelPlugins() {
  return [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ];
}
