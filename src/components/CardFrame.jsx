import { Gem, Sparkles } from "lucide-react";

// Fase 1 del rediseño "carta coleccionable" (ver el pedido): SOLO construye
// las piezas reutilizables (este marco + la fuente + la página de
// referencia en CardFrameDemo.jsx). No se conecta todavía a ninguna
// pantalla real de la app — eso es explícitamente cosa de una fase
// posterior, para poder aprobar el conjunto visual antes de aplicarlo.

export const CARD_RARITY_ORDER = ["common", "uncommon", "rare", "epic", "pseudo-legendary", "legendary"];

// Paleta DELIBERADAMENTE PROPIA de este componente, no importada de
// RARITY_META (App.jsx): el pedido fija colores exactos para el nuevo
// estilo de carta que no siempre coinciden con los ya usados en el resto de
// la app — en particular, Pseudolegendario pasa de naranja (`#e3701e` en
// RARITY_META) a dorado (`#e3b23c`) aquí. Cuando una fase posterior aplique
// este marco a pantallas reales, habrá que decidir si se reconcilian ambas
// paletas o conviven aparte; se documenta aquí para que esa decisión no se
// tome sin darse cuenta del desajuste.
export const CARD_RARITY_META = {
  common: { label: "Común", color: "#9aa0ad", glow: false, corners: false, holo: false },
  uncommon: { label: "Poco Común", color: "#5fae5f", glow: false, corners: false, holo: false },
  rare: { label: "Raro", color: "#4a90d9", glow: true, corners: false, holo: false },
  epic: { label: "Épico", color: "#a75fd9", glow: true, corners: true, holo: false },
  "pseudo-legendary": { label: "Pseudolegendario", color: "#e3b23c", glow: true, corners: false, holo: false },
  // Legendario no tiene un color sólido de fondo (ver `card-holo-overlay` en
  // index.css): `color` aquí solo se usa como acento de la gema de esquina,
  // para que siga habiendo un color "ancla" identificable pese al gradiente
  // animado del borde.
  legendary: { label: "Legendario", color: "#e3b23c", glow: true, corners: false, holo: true },
};

// Adorno decorativo de esquina para la rareza Épica: doble línea en "L" que
// se rota según la esquina, con el mismo color del borde (redundante con
// él, a propósito). Puramente decorativo — `pointer-events-none` para que
// nunca capture clics del contenido real de la carta.
const EPIC_CORNER_ROTATION = { tl: 0, tr: 90, br: 180, bl: 270 };
const EPIC_CORNER_POSITION = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  br: "bottom-0 right-0",
  bl: "bottom-0 left-0",
};
function EpicCorner({ position, color }) {
  return (
    <svg
      className={`absolute ${EPIC_CORNER_POSITION[position]} pointer-events-none`}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{ transform: `rotate(${EPIC_CORNER_ROTATION[position]}deg)` }}
      aria-hidden="true"
    >
      <path d="M2 20 L2 7 Q2 2 7 2 L20 2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.85" />
      <path d="M2 13 L2 7 Q2 2 7 2 L13 2" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// Marco reutilizable por rareza (+ flag `shiny` opcional, combinable con
// cualquier rareza) para el nuevo estilo visual de carta coleccionable.
// Envuelve cualquier `children` que se le pase — no impone ninguna
// estructura interna, solo el marco/borde/efectos alrededor.
//
// Implementación del "borde" en sí: la técnica usada es un padding de unos
// pocos px sobre un div exterior con el color (o gradiente animado, para
// Legendario) de fondo, y un div interior con el fondo real de la carta que
// cubre todo menos ese padding — así el "borde" es sencillamente el fondo
// del div exterior asomando por el hueco, sin depender de trucos de
// `background-clip` con bordes en degradado (poco fiables entre
// navegadores para animarlos).
// `animated`: controla SOLO la animación del gradiente holográfico de
// Legendario (`card-holo-overlay`, ver index.css) — nada más de este
// componente se anima, así que el resto de rarezas lo ignora por completo.
// Pensado para Fase 2 (colección de Pokémon): con muchas cartas Legendario
// a la vez en una cuadrícula grande, animar el `background-position` de
// todas ellas en bucle es la única parte de este componente que dispara
// repintados continuos (el destello Shiny anima `transform`/`opacity`, que
// el navegador acelera por composición — barato incluso con muchas
// instancias a la vez, así que ESE no se desactiva nunca). Por eso se
// expone como prop en vez de decidirlo aquí dentro: la vista de cuadrícula
// puede pasar `animated={false}` (gradiente estático, misma paleta y
// aspecto, sin bucle) y reservar `animated` (por defecto `true`) para
// cuando se abre esa carta en concreto en detalle/edición.
export default function CardFrame({ rarity = "common", shiny = false, animated = true, children, className = "" }) {
  const meta = CARD_RARITY_META[rarity] || CARD_RARITY_META.common;
  const gemColor = meta.color;

  const frame = (
    <div
      className="relative rounded-2xl p-[3px] h-full"
      style={{
        background: meta.holo ? undefined : meta.color,
        boxShadow: meta.glow ? `0 0 16px ${meta.color}77` : "none",
      }}
    >
      {meta.holo && (
        <div className={`absolute inset-0 rounded-2xl card-holo-overlay${animated ? "" : " card-holo-static"}`} />
      )}

      <div className="relative rounded-[13px] overflow-hidden h-full" style={{ background: "#14161f" }}>
        {children}
      </div>

      {meta.corners && (
        <>
          <EpicCorner position="tl" color={meta.color} />
          <EpicCorner position="tr" color={meta.color} />
          <EpicCorner position="bl" color={meta.color} />
          <EpicCorner position="br" color={meta.color} />
        </>
      )}

      {/* Gema de rareza: redundante con el color del borde a propósito, para
          que la rareza se identifique aunque no se distingan bien los
          colores (ver el pedido). */}
      <div
        className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: "#0e1018", border: `1.5px solid ${gemColor}` }}
        title={meta.label}
      >
        <Gem size={12} color={gemColor} />
      </div>

      {shiny && (
        <div
          className="absolute -top-2 -left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center card-shiny-sparkle"
          style={{ background: "radial-gradient(circle, #fff6d0 0%, #f2b705 70%)", boxShadow: "0 0 10px #f2b705aa" }}
          title="Shiny"
        >
          <Sparkles size={14} color="#3a2a00" />
        </div>
      )}
    </div>
  );

  // Shiny añade ADEMÁS un fino borde exterior dorado extra envolviendo el
  // marco de rareza normal entero (no lo sustituye) — así un Pokémon shiny
  // se distingue incluso siendo de rareza Común, combinando ambas señales
  // (el destello de esquina de arriba + este anillo exterior).
  if (!shiny) return <div className={className}>{frame}</div>;
  return (
    <div
      className={`${className} rounded-[18px] p-[2px]`}
      style={{ background: "linear-gradient(135deg,#fff6d0,#f2b705,#fff6d0)" }}
    >
      {frame}
    </div>
  );
}
