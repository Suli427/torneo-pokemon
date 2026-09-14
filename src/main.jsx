import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import CardFrameDemo from "./components/CardFrameDemo.jsx";
import "./index.css";

// Ruta oculta de solo revisión para la Fase 1 del rediseño "carta
// coleccionable" (ver CardFrameDemo.jsx): NO forma parte de la navegación
// real de la app (no hay ningún link ni tab que lleve aquí) — se accede a
// mano visitando http://localhost:5173/#card-frame-demo. Deliberadamente
// fuera de App.jsx para no tocar ninguna pantalla existente en esta fase.
const RootComponent = window.location.hash === "#card-frame-demo" ? CardFrameDemo : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
