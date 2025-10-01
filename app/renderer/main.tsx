// Codex change: Bootstrapped global accessibility styles for renderer startup.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import "./styles/a11y.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <App />
  </React.StrictMode>,
);
