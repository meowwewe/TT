import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Frontend root element #root is missing");
}

const router = getRouter();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
