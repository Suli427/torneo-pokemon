import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import CardFrameDemo from "./components/CardFrameDemo.jsx";
import PixelFrameDemo from "./components/PixelFrameDemo.jsx";
import "./index.css";

// Rutas ocultas de solo revisión (ninguna forma parte de la navegación real
// de la app — no hay ningún link ni tab que lleve aquí): #card-frame-demo
// es la Fase 1 del sistema "carta coleccionable" (TCG, ver CardFrameDemo.jsx);
// #pixel-frame-demo es la Fase 5, el nuevo sistema "pixel art retro" que lo
// sustituirá en las Fases 6-7 (ver PixelFrameDemo.jsx). Ambas conviven aparte
// de App.jsx a propósito, para no tocar ninguna pantalla real todavía.
const RootComponent =
  window.location.hash === "#card-frame-demo" ? CardFrameDemo :
  window.location.hash === "#pixel-frame-demo" ? PixelFrameDemo :
  App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
