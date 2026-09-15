import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PixelFrameDemo from "./components/PixelFrameDemo.jsx";
import "./index.css";

// Ruta oculta de solo revisión (no forma parte de la navegación real de la
// app): #pixel-frame-demo muestra el sistema "pixel art retro" (ver
// PixelFrameDemo.jsx). La ruta #card-frame-demo del sistema "carta
// coleccionable" (TCG, Fases 1-4) se retira en la Fase 7 junto con
// CardFrame.jsx/CardFrameDemo.jsx, ya reemplazado por completo en toda la
// app — visitar ese hash ahora simplemente carga la app normal.
const RootComponent = window.location.hash === "#pixel-frame-demo" ? PixelFrameDemo : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
