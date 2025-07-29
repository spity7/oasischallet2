// frontend/src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";

// Optional: Avoid styled-components console warnings
const ForwardingStyleSheetManager = ({ children }) => (
  <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
    {children}
  </StyleSheetManager>
);

const app = (
  <ForwardingStyleSheetManager>
    <RecoilRoot>
      <Router>
        <App />
      </Router>
    </RecoilRoot>
  </ForwardingStyleSheetManager>
);

createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app
);
