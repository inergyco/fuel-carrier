import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type UserConfig } from "vite";

const defaultApiProxyTarget = "http://localhost:3000";

export function createPanelViteConfig(
  port?: number,
  overrides: UserConfig = {},
) {
  return defineConfig({
    plugins: createPanelPlugins(),
    optimizeDeps: {
      include: [
        "@fuel-carrier/web-ui > leaflet",
        "@fuel-carrier/web-ui > react-leaflet",
        "@fuel-carrier/web-ui > maplibre-gl",
        "@fuel-carrier/web-ui > @maplibre/maplibre-gl-leaflet",
        "@fuel-carrier/web-ui > react-multi-date-picker",
        "@fuel-carrier/web-ui > react-multi-date-picker/plugins/time_picker",
        "@fuel-carrier/web-ui > react-date-object",
      ],
    },
    server: {
      ...(port != null ? { port, strictPort: true } : {}),
      fs: {
        // Allow importing from workspace packages (e.g. @fuel-carrier/web-ui).
        allow: ["../.."],
      },
      proxy: {
        "/api": {
          target: defaultApiProxyTarget,
          changeOrigin: true,
          ws: true,
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
