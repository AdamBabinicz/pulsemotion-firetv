import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Rejestracja Service Workera dla PWA i buforowania offline
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "PulseMotion PWA Service Worker registered:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });
  });
}
