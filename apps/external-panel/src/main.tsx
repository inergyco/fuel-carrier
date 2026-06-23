import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  AppProviders,
  getPanelStorageKeys,
  ThemeProvider,
} from "@fuel-carrier/web-ui/providers";
import "./index.css";
import "./routeTree.gen";
import { router } from "./router";

const storageKeys = getPanelStorageKeys("external");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      themeNames={{ light: "external-light", dark: "external-dark" }}
      storageKey={storageKeys.theme}
    >
      <AppProviders router={router} localeStorageKey={storageKeys.locale} />
    </ThemeProvider>
  </StrictMode>,
);
