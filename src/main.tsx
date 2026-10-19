import React from "react";
import ReactDOM from "react-dom/client";
import ReduxProvider from "@/state/ReduxProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider>
      <main>
        <App />
      </main>
    </ReduxProvider>
  </React.StrictMode>
);
