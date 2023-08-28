import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";
import PentaProvider from "./context/PentaProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <PentaProvider>
      <App />
    </PentaProvider>
  </HashRouter>
);
