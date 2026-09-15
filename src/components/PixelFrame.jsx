// Fase 5 del rediseño: sistema base "pixel art retro" (inspirado en la era
// GBA / Pokémon Gen 3-4), pensado para SUSTITUIR a CardFrame.jsx (sistema
// "carta coleccionable" TCG de las Fases 1-4) en las Fases 6-7. Esta fase
// solo construye las piezas — no se conecta todavía a ninguna pantalla real
// de la app (ver PixelFrameDemo.jsx, la única que lo usa por ahora).
// CardFrame.jsx NO se toca ni se borra: sigue siendo el sistema realmente
// activo en la app hasta que una fase posterior lo reemplace de verdad.

export const PIXEL_RARITY_ORDER = ["common", "uncommon", "rare", "epic", "pseudo-legendary", "legendary"];

// Colores PLANOS (sin degradados/brillos difusos, ver el pedido) — mismos
// valores que las variables CSS `--pixel-rarity-*` de index.css, repetidos
// aquí como constantes de JS (no se puede leer una custom property de CSS
// directamente en un valor de comparación/lógica de JS sin getComputedStyle,
// así que se duplican a propósito; si se cambia un color hay que cambiarlo
// en los dos sitios).
export const PIXEL_RARITY_META = {
  common: { label: "Común", color: "#a8a8a8" },
  uncommon: { label: "Poco Común", color: "#5cc95c" },
  rare: { label: "Raro", color: "#4a90e2" },
  epic: { label: "Épico", color: "#a855e2" },
  "pseudo-legendary": { label: "Pseudolegendario", color: "#ff9933" },
  // Único caso animado: borde por pasos entre 3 tonos (ver
  // `.pixel-border-legendary`/`pixel-legendary-cycle` en index.css) en vez
  // de un color fijo — `color` aquí es solo el tono "ancla" para la gema de
  // esquina y cualquier otro uso no animado (texto, listados).
  legendary: { label: "Legendario", color: "#ffd700", animated: true },
};

// Dibuja un icono diminuto a partir de un "bitmap" (array de strings de
// '0'/'1', incorruptible por escalado porque son divs reales, no una
// imagen) — perfectamente nítido sin necesidad de ningún truco de
// image-rendering, que es justo el problema que este sistema quiere evitar
// (ver el pedido: "sin antialiasing"). `unit` es el tamaño en px de CADA
// "pixel" del bitmap.
function PixelBitmap({ rows, color, unit = 2 }) {
  const cols = rows[0]?.length || 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${unit}px)`,
        gridTemplateRows: `repeat(${rows.length}, ${unit}px)`,
        lineHeight: 0,
      }}
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <div key={`${x}-${y}`} style={{ width: unit, height: unit, background: cell === "1" ? color : "transparent" }} />
        ))
      )}
    </div>
  );
}

// Diamante simple para la "gema" de rareza (esquina superior): distinto a
// propósito del sparkle de shiny de abajo, para que no se confundan al
// combinarse en la misma tarjeta.
const GEM_BITMAP = ["010", "111", "010"];
// Sparkle de 4 puntas para el indicador shiny — silueta reconocible de
// "destello" incluso a un tamaño diminuto.
const SPARKLE_BITMAP = ["00100", "01110", "11111", "01110", "00100"];

// Cursor de menú retro reutilizable (ver el pedido, punto 5): un
// triángulo "▶" que oscila/parpadea con `.pixel-cursor` (steps discretos,
// ver index.css) — pensado para colocarse junto a la opción seleccionada
// de un menú/lista en las Fases 6-7. No conectado a ningún menú real
// todavía.
export function PixelCursor({ color = "#ffcc33", size = 14, className = "" }) {
  return (
    <span
      className={`pixel-cursor inline-block ${className}`}
      style={{ color, fontSize: size, lineHeight: 1, fontFamily: "monospace" }}
      aria-hidden="true"
    >
      ▶
    </span>
  );
}

// Marco por rareza del sistema pixel art: borde sólido recto (sin
// border-radius en ningún elemento, ver el pedido), sombra dura desplazada
// sin blur en vez de box-shadow difuso, gema de rareza + sparkle shiny
// dibujados como bitmaps de pixeles reales (ver arriba). Misma API que
// CardFrame (rarity/shiny/children/className) a propósito, para que las
// Fases 6-7 puedan intercambiar uno por otro sin tener que rediseñar cada
// punto de uso.
export default function PixelFrame({ rarity = "common", shiny = false, children, className = "" }) {
  const meta = PIXEL_RARITY_META[rarity] || PIXEL_RARITY_META.common;
  return (
    <div
      className={`relative ${meta.animated ? "pixel-border-legendary" : ""} ${className}`}
      style={{
        border: `3px solid ${meta.color}`,
        borderRadius: 0,
        background: "var(--pixel-panel)",
        boxShadow: "4px 4px 0 0 #00000066",
      }}
    >
      {children}

      {/* Gema de rareza, esquina superior derecha: bloque sólido con un
          margen de 1 "pixel" respecto al borde, nunca redondeada. */}
      <div className="absolute top-1 right-1" style={{ background: "var(--pixel-panel)", padding: 1 }}>
        <PixelBitmap rows={GEM_BITMAP} color={meta.color} unit={3} />
      </div>

      {shiny && (
        <div className="absolute top-1 left-1" style={{ background: "var(--pixel-panel)", padding: 1 }} title="Shiny">
          <PixelBitmap rows={SPARKLE_BITMAP} color="var(--pixel-gold)" unit={2.5} />
        </div>
      )}
    </div>
  );
}
