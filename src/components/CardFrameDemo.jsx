import CardFrame, { CARD_RARITY_META, CARD_RARITY_ORDER } from "./CardFrame.jsx";

// Página de REFERENCIA para la Fase 1 del rediseño "carta coleccionable" —
// ver el pedido: no está conectada a ninguna ruta/tab real de la app
// (ver main.jsx: solo se monta si la URL lleva el hash #card-frame-demo),
// solo sirve para revisar el conjunto visual de las 6 rarezas + shiny antes
// de aprobar que una fase posterior lo aplique a Pokémon/entrenadores de
// verdad. Es intencionadamente un archivo aislado y desechable.

// Subconjunto de TYPE_COLORS (App.jsx) copiado aquí a propósito, para no
// tener que exportar nada de App.jsx en esta fase que es solo de
// construcción de piezas nuevas — evita tocar ninguna pantalla existente.
const DEMO_TYPE_COLORS = {
  grass: "#78C850", fire: "#F08030", water: "#6890F0",
  electric: "#F0C808", psychic: "#F85888", dragon: "#7038F8",
};

// Un Pokémon de ejemplo distinto por rareza, solo para que la demo no se
// vea repetitiva — sin ninguna relación con la rareza real de cada especie
// en el gacha de la app (esto es puro placeholder visual).
const DEMO_CARDS = [
  { rarity: "common", name: "Bulbasaur", type: "grass", hp: 45 },
  { rarity: "uncommon", name: "Charmeleon", type: "fire", hp: 58 },
  { rarity: "rare", name: "Starmie", type: "water", hp: 60 },
  { rarity: "epic", name: "Alakazam", type: "psychic", hp: 55 },
  { rarity: "pseudo-legendary", name: "Dragonite", type: "dragon", hp: 91 },
  { rarity: "legendary", name: "Zapdos", type: "electric", hp: 90 },
];

function DemoCardContent({ name, type, hp }) {
  const color = DEMO_TYPE_COLORS[type] || "#9aa0ad";
  return (
    <div className="p-4 flex flex-col h-full min-h-[220px] w-[180px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-card-name text-white text-lg leading-tight">{name}</div>
        <div className="text-[11px] text-[#f2b705] font-semibold shrink-0 mt-0.5">HP {hp}</div>
      </div>
      <span
        className="self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-3"
        style={{ background: color + "26", color, border: `1px solid ${color}66` }}
      >
        {type}
      </span>
      <div className="flex-1 rounded-lg mb-3" style={{ background: "#0e1018" }} />
      <div className="text-[10px] text-[#6b7086] leading-snug">
        Texto de relleno del cuerpo de la carta: aquí irán los movimientos o
        el detalle real en una fase posterior.
      </div>
    </div>
  );
}

export default function CardFrameDemo() {
  return (
    <div className="min-h-screen w-full p-8" style={{ background: "#0c0e15" }}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl text-white mb-1">
            Referencia — Fase 1: marcos de carta por rareza
          </h1>
          <p className="text-sm text-[#9aa0b4] max-w-2xl">
            Página de solo revisión, no conectada a ninguna pantalla real de la app (ver{" "}
            <code className="text-[#f2b705]">src/components/CardFrame.jsx</code>). Sirve para
            aprobar el conjunto visual antes de que una fase posterior lo aplique a Pokémon y
            entrenadores de verdad.
          </p>
        </div>

        <section>
          <h2 className="font-display text-lg text-white mb-3">Las 6 rarezas</h2>
          <div className="flex flex-wrap gap-6">
            {DEMO_CARDS.map((c) => (
              <div key={c.rarity} className="flex flex-col items-center gap-2">
                <CardFrame rarity={c.rarity}>
                  <DemoCardContent name={c.name} type={c.type} hp={c.hp} />
                </CardFrame>
                <div className="text-xs font-semibold" style={{ color: CARD_RARITY_META[c.rarity].color }}>
                  {CARD_RARITY_META[c.rarity].label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-white mb-3">Con el flag Shiny activo</h2>
          <p className="text-xs text-[#6b7086] mb-3">
            El destello dorado debe distinguirse incluso en la rareza más discreta (Común) — por
            eso se incluye esa combinación aquí a propósito, además de una rareza alta.
          </p>
          <div className="flex flex-wrap gap-6">
            {["common", "epic", "legendary"].map((rarity) => {
              const c = DEMO_CARDS.find((d) => d.rarity === rarity);
              return (
                <div key={`shiny-${rarity}`} className="flex flex-col items-center gap-2">
                  <CardFrame rarity={rarity} shiny>
                    <DemoCardContent name={c.name} type={c.type} hp={c.hp} />
                  </CardFrame>
                  <div className="text-xs font-semibold" style={{ color: CARD_RARITY_META[rarity].color }}>
                    {CARD_RARITY_META[rarity].label} · Shiny
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="text-[11px] text-[#5c6178] max-w-2xl">
          <p className="mb-1">
            Orden de rareza usado: {CARD_RARITY_ORDER.map((r) => CARD_RARITY_META[r].label).join(" → ")}.
          </p>
          <p>
            Nombre de carta en la fuente nueva (Cinzel) vía la clase <code>.font-card-name</code>;
            el resto de este texto de referencia sigue en Rajdhani/Inter, igual que el resto de
            la app.
          </p>
        </section>
      </div>
    </div>
  );
}
