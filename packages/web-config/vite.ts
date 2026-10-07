import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type PluginOption, type UserConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const defaultApiProxyTarget = "http://localhost:3000";

export type PanelPwaManifest = {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
};

export type PanelViteConfigOptions = {
  port?: number;
  pwa: PanelPwaManifest;
  overrides?: UserConfig;
};

export function createPanelViteConfig({
  port,
  pwa,
  overrides = {},
}: PanelViteConfigOptions) {
  return defineConfig({
    plugins: createPanelPlugins(pwa),
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

export function createPanelPlugins(pwa: PanelPwaManifest): PluginOption[] {
  return [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    VitePWA(createPanelPwaOptions(pwa)),
  ];
}

function createPanelPwaOptions(pwa: PanelPwaManifest): Partial<VitePWAOptions> {
  return {
    registerType: "autoUpdate",
    injectRegister: "auto",
    includeAssets: [
      "favicon.svg",
      "apple-touch-icon.png",
      "pwa-192x192.png",
      "pwa-512x512.png",
    ],
    manifest: {
      name: pwa.name,
      short_name: pwa.shortName,
      description: pwa.description,
      theme_color: pwa.themeColor,
      background_color: pwa.backgroundColor,
      display: "standalone",
      orientation: "any",
      start_url: "/",
      scope: "/",
      lang: "fa",
      dir: "rtl",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "index.html",
      navigateFallbackDenylist: [/^\/api\//],
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp,webmanifest}"],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "NetworkOnly",
        },
      ],
    },
  };
}
