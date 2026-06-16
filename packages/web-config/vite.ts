import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type UserConfig } from "vite";

export function createPanelViteConfig(overrides: UserConfig = {}) {
  return defineConfig({
    plugins: createPanelPlugins(),
    ...overrides,
  });
}

export function createPanelPlugins() {
  return [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ];
}
