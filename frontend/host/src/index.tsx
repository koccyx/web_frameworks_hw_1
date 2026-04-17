import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../src/index.css";
import { HostApp } from "./HostApp";
import { store } from "@mf/shared";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <HostApp />
    </Provider>
  </StrictMode>
);
