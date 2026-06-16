import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@fuel-carrier/web-ui/providers";
import "./index.css";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders router={router} />
  </StrictMode>,
);
