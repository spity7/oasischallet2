import React from "react";
import { GlobalStyle } from "./styles/GlobalStyle";
import { GlobalProvider } from "./context/globalContext";
import AppRoutes from "./AppRoutes.js";

function App() {
  return (
    <>
      <GlobalStyle />
      <GlobalProvider>
        <AppRoutes />
      </GlobalProvider>
    </>
  );
}

export default App;
