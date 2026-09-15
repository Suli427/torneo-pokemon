import { useEffect, useState } from "react";
import PixelFrame, { PIXEL_RARITY_META, PIXEL_RARITY_ORDER, PixelCursor } from "./PixelFrame.jsx";

// Página de REFERENCIA para la Fase 5 del rediseño (sistema "pixel art
// retro") — ver el pedido: no está conectada a ninguna ruta/tab real de la
// app (ver main.jsx: solo se monta con el hash #pixel-frame-demo), solo
// sirve para revisar el conjunto visual antes de aprobar que las Fases 6-7
// lo apliquen de verdad, sustituyendo al sistema de carta TCG (Fases 1-4,
// ver CardFrameDemo.jsx, que sigue existiendo intacta aparte de esta).
//
// Fetch DIRECTO a PokeAPI en vez de reutilizar `useApiCache` (App.jsx): ese
// hook vive dentro de App.jsx y no está pensado para usarse fuera del árbol
// de componentes real de la app — igual que CardFrameDemo.jsx ya optó por
// datos de ejemplo propios en vez de enganchar el resto de la app, esta
// demo se mantiene deliberadamente aislada y desechable.
const DEMO_SLUG = "pikachu";

function usePixelDemoSprite(slug) {
  const [sprites, setSprites] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
        const data = await res.json();
        if (!cancelled) {
          setSprites({
            pixel: data.sprites?.front_default || null,
            pixelShiny: data.sprites?.front_shiny || null,
            name: slug,
          });
        }
      } catch (e) {
        if (!cancelled) setSprites({ pixel: null, pixelShiny: null, name: slug });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);
  return sprites;
}

function PixelDemoCardContent({ title, subtitle, footer }) {
  return (
    <div className="p-3 flex flex-col" style={{ width: 160, minHeight: 190 }}>
      <div className="font-pixel-body text-sm mb-1" style={{ color: "var(--pixel-text)" }}>{title}</div>
      {subtitle && <div className="font-pixel-body text-[10px] mb-2" style={{ color: "var(--pixel-gold)" }}>{subtitle}</div>}
      <div className="flex-1 flex items-center justify-center mb-2" style={{ background: "var(--pixel-bg)", border: "2px solid #00000055" }}>
        {footer}
      </div>
    </div>
  );
}

export default function PixelFrameDemo() {
  const sprites = usePixelDemoSprite(DEMO_SLUG);

  return (
    <div className="min-h-screen w-full p-8" style={{ background: "var(--pixel-bg)" }}>
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="font-pixel-title text-lg mb-3" style={{ color: "var(--pixel-text)" }}>
            PIXEL FRAME
          </h1>
          <p className="font-pixel-body text-sm max-w-2xl" style={{ color: "var(--pixel-text)" }}>
            Página de solo revisión, Fase 5 del rediseño — no conectada a ninguna pantalla real de
            la app (ver <code style={{ color: "var(--pixel-gold)" }}>src/components/PixelFrame.jsx</code>).
            Sistema pensado para sustituir al de "carta coleccionable" (TCG) de las Fases 1-4 en
            las Fases 6-7.
          </p>
        </div>

        <section>
          <h2 className="font-pixel-title text-xs mb-4" style={{ color: "var(--pixel-gold)" }}>LAS 6 RAREZAS</h2>
          <div className="flex flex-wrap gap-6">
            {PIXEL_RARITY_ORDER.map((rarity) => (
              <div key={rarity} className="flex flex-col items-center gap-2">
                <PixelFrame rarity={rarity}>
                  <PixelDemoCardContent
                    title="MAGIKARP"
                    subtitle="AGUA"
                    footer={<div className="font-pixel-body text-[10px]" style={{ color: "var(--pixel-text)" }}>Sin sprite</div>}
                  />
                </PixelFrame>
                <div className="font-pixel-body text-xs" style={{ color: PIXEL_RARITY_META[rarity].color }}>
                  {PIXEL_RARITY_META[rarity].label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-pixel-title text-xs mb-2" style={{ color: "var(--pixel-gold)" }}>CON SHINY ACTIVO</h2>
          <p className="font-pixel-body text-xs mb-4" style={{ color: "var(--pixel-text)" }}>
            El sparkle pixelado debe distinguirse incluso en Común, la rareza más discreta.
          </p>
          <div className="flex flex-wrap gap-6">
            {["common", "epic", "legendary"].map((rarity) => (
              <div key={`shiny-${rarity}`} className="flex flex-col items-center gap-2">
                <PixelFrame rarity={rarity} shiny>
                  <PixelDemoCardContent
                    title="MAGIKARP"
                    subtitle="AGUA · SHINY"
                    footer={<div className="font-pixel-body text-[10px]" style={{ color: "var(--pixel-text)" }}>Sin sprite</div>}
                  />
                </PixelFrame>
                <div className="font-pixel-body text-xs" style={{ color: PIXEL_RARITY_META[rarity].color }}>
                  {PIXEL_RARITY_META[rarity].label} · Shiny
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-pixel-title text-xs mb-4" style={{ color: "var(--pixel-gold)" }}>SPRITE PIXEL REAL</h2>
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <PixelFrame rarity="rare">
                <PixelDemoCardContent
                  title="PIKACHU"
                  subtitle="ELÉCTRICO"
                  footer={
                    sprites?.pixel ? (
                      <img src={sprites.pixel} alt="Pikachu" className="pixel-render" style={{ width: 80, height: 80 }} />
                    ) : (
                      <div className="font-pixel-body text-[10px]" style={{ color: "var(--pixel-text)" }}>Cargando...</div>
                    )
                  }
                />
              </PixelFrame>
              <div className="font-pixel-body text-xs" style={{ color: "var(--pixel-text)" }}>pixelSprite (front_default)</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <PixelFrame rarity="rare" shiny>
                <PixelDemoCardContent
                  title="PIKACHU"
                  subtitle="ELÉCTRICO · SHINY"
                  footer={
                    sprites?.pixelShiny ? (
                      <img src={sprites.pixelShiny} alt="Pikachu shiny" className="pixel-render" style={{ width: 80, height: 80 }} />
                    ) : (
                      <div className="font-pixel-body text-[10px]" style={{ color: "var(--pixel-text)" }}>Cargando...</div>
                    )
                  }
                />
              </PixelFrame>
              <div className="font-pixel-body text-xs" style={{ color: "var(--pixel-text)" }}>pixelShinySprite (front_shiny)</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-pixel-title text-xs mb-4" style={{ color: "var(--pixel-gold)" }}>TIPOGRAFÍAS Y CURSOR</h2>
          <div style={{ background: "var(--pixel-panel)", border: "3px solid #00000066", boxShadow: "4px 4px 0 0 #00000066" }} className="p-4 max-w-md">
            <div className="font-pixel-title text-base mb-3" style={{ color: "var(--pixel-text)" }}>PRESS START 2P</div>
            <div className="font-pixel-body text-sm mb-4" style={{ color: "var(--pixel-text)" }}>
              Pixelify Sans — pensada para bloques de texto largos como este, el log de combate, o
              las descripciones de movimientos, manteniendo el aire pixel sin cansar la vista.
            </div>
            <div className="space-y-1.5">
              {["Atacar", "Cambiar Pokémon", "Objetos", "Huir"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  {i === 1 ? <PixelCursor /> : <span style={{ width: 14, display: "inline-block" }} />}
                  <span className="font-pixel-body text-sm" style={{ color: i === 1 ? "var(--pixel-gold)" : "var(--pixel-text)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="font-pixel-body text-xs max-w-2xl" style={{ color: "#8a8fa3" }}>
          <p className="mb-1">Orden de rareza: {PIXEL_RARITY_ORDER.map((r) => PIXEL_RARITY_META[r].label).join(" -> ")}.</p>
          <p>Ningún elemento de esta página usa border-radius, degradados, ni sombras difusas — a propósito, ver el pedido.</p>
        </section>
      </div>
    </div>
  );
}
