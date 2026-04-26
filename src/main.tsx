import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { defaultLogoImage } from "./assets/defaultImages";
import "./index.css";

const favicon =
  document.querySelector<HTMLLinkElement>("link[rel='icon']") ??
  document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = defaultLogoImage;
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
