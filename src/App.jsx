import React, { useState, useRef, useCallback, useEffect } from "react";
import { Lock, Trophy, Sparkles, Coins, Swords, Users, Store, Award, Shuffle, ListOrdered, X, ChevronRight, Loader2 } from "lucide-react";

/* ---------------------------------------------------------------
   DATOS
--------------------------------------------------------------- */

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F0C808",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#5b4a3f",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
  grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
  steel: "Acero", fairy: "Hada",
};

const TRAINERS = [
  { id: "cintia", name: "Cintia", subtitle: "Campeona de Sinnoh", locked: true, color: "#c9a227",
    team: ["garchomp", "spiritomb", "lucario", "milotic", "roserade", "togekiss"] },
  { id: "maximo", name: "Máximo", subtitle: "Campeón de Hoenn", locked: false, color: "#8a7a5b",
    team: ["metagross", "skarmory", "aggron", "cradily", "armaldo", "claydol"] },
  { id: "dianta", name: "Dianta", subtitle: "Campeona de Kalos", locked: true, color: "#c25b8f",
    team: ["gardevoir", "hawlucha", "tyrantrum", "goodra", "aurorus", "gourgeist-average"] },
  { id: "lionel", name: "Lionel", subtitle: "Campeón de Galar", locked: true, color: "#d3652c",
    team: ["charizard", "dragapult", "aegislash", "rillaboom", "cinderace", "mr-rime"] },
  { id: "paul", name: "Paul", subtitle: "Rival de Sinnoh", locked: false, color: "#5b4a8a",
    team: ["electivire", "torterra", "ninjask", "ursaring", "ariados", "ambipom"] },
  { id: "gary", name: "Gary", subtitle: "Rival de Kanto", locked: false, color: "#3b6dc7",
    team: ["blastoise", "umbreon", "arcanine", "nidoking", "scizor", "electivire"] },
  { id: "iris", name: "Iris", subtitle: "Campeona de Teselia", locked: true, color: "#4a8a5b",
    team: ["dragonite", "excadrill", "emolga", "dragonair", "gigalith", "druddigon"] },
  { id: "ash", name: "Ash", subtitle: "Maestro Pokémon", locked: false, color: "#e3350d",
    team: ["pikachu", "dragonite", "sirfetchd", "gengar", "lucario", "goodra"] },
];

const NAME_OVERRIDES = { sirfetchd: "Sirfetch'd", "mr-rime": "Mr. Rime", "gourgeist-average": "Gourgeist" };
function displayName(slug) {
  return NAME_OVERRIDES[slug] || slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const GACHA_RARITIES = [
  { label: "Común", chance: "50%", color: "#9aa0ad" },
  { label: "Poco común", chance: "27%", color: "#5fae5f" },
  { label: "Raro", chance: "14%", color: "#4a90d9" },
  { label: "Épico", chance: "7%", color: "#a75fd9" },
  { label: "Legendario", chance: "2%", color: "#e3b23c" },
];

const CHAR_GACHA_RARITIES = [
  { label: "Rival", chance: "60%", color: "#9aa0ad" },
  { label: "Líder de Gimnasio", chance: "28%", color: "#5fae5f" },
  { label: "Alto Mando", chance: "9%", color: "#4a90d9" },
  { label: "Campeón/a", chance: "3%", color: "#e3b23c" },
];

const ACHIEVEMENTS = [
  "Primera victoria", "Racha de 3", "Campeón de Liga", "Equipo perfecto",
  "Coleccionista novato", "Sin ni un rasguño", "Gacha afortunado", "100 combates",
];

/* ---------------------------------------------------------------
   UTILIDADES POKEAPI
--------------------------------------------------------------- */

function useApiCache() {
  const pokeCache = useRef({});
  const typeCache = useRef({});

  const getPokemon = useCallback(async (slug) => {
    if (pokeCache.current[slug]) return pokeCache.current[slug];
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
      const data = await res.json();
      const stats = {};
      data.stats.forEach((s) => { stats[s.stat.name] = s.base_stat; });
      const entry = {
        slug,
        name: displayName(slug),
        types: data.types.map((t) => t.type.name),
        stats,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || null,
      };
      pokeCache.current[slug] = entry;
      return entry;
    } catch (e) {
      const fallback = {
        slug, name: displayName(slug), types: ["normal"],
        stats: { hp: 70, attack: 70, defense: 70, "special-attack": 70, "special-defense": 70, speed: 70 },
        sprite: null,
      };
      pokeCache.current[slug] = fallback;
      return fallback;
    }
  }, []);

  const getType = useCallback(async (name) => {
    if (typeCache.current[name]) return typeCache.current[name];
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${name}`);
      const data = await res.json();
      const rel = {
        double: data.damage_relations.double_damage_to.map((t) => t.name),
        half: data.damage_relations.half_damage_to.map((t) => t.name),
        zero: data.damage_relations.no_damage_to.map((t) => t.name),
      };
      typeCache.current[name] = rel;
      return rel;
    } catch (e) {
      const rel = { double: [], half: [], zero: [] };
      typeCache.current[name] = rel;
      return rel;
    }
  }, []);

  const typeMultiplier = useCallback(async (attackerTypes, defenderTypes) => {
    let mult = 1;
    for (const t of attackerTypes) {
      const rel = await getType(t);
      for (const dt of defenderTypes) {
        if (rel.double.includes(dt)) mult *= 2;
        else if (rel.half.includes(dt)) mult *= 0.5;
        else if (rel.zero.includes(dt)) mult *= 0;
      }
    }
    return mult;
  }, [getType]);

  const computePower = useCallback(async (p, defenderTypes) => {
    const atk = p.stats.attack ?? 70;
    const spa = p.stats["special-attack"] ?? 70;
    const spd = p.stats.speed ?? 70;
    const hp = p.stats.hp ?? 70;
    const mult = await typeMultiplier(p.types, defenderTypes);
    const base = (atk + spa) * 0.55 + spd * 0.28 + hp * 0.17;
    const dampedMult = 0.5 + mult * 0.5; // avoid instant-zero wipes
    const rand = 0.85 + Math.random() * 0.3;
    return base * dampedMult * rand;
  }, [typeMultiplier]);

  const simulateMatch = useCallback(async (trainerA, trainerB) => {
    const teamA = await Promise.all(trainerA.team.map((s) => getPokemon(s)));
    const teamB = await Promise.all(trainerB.team.map((s) => getPokemon(s)));
    let i = 0, j = 0;
    const log = [];
    while (i < teamA.length && j < teamB.length) {
      const pa = teamA[i], pb = teamB[j];
      const [powA, powB] = await Promise.all([computePower(pa, pb.types), computePower(pb, pa.types)]);
      if (powA >= powB) { log.push({ winner: pa, loser: pb, winnerTrainer: trainerA.id }); j++; }
      else { log.push({ winner: pb, loser: pa, winnerTrainer: trainerB.id }); i++; }
    }
    const aWon = j >= teamB.length;
    const remaining = aWon ? teamA.length - i : teamB.length - j;
    return {
      winnerId: aWon ? trainerA.id : trainerB.id,
      loserId: aWon ? trainerB.id : trainerA.id,
      remaining, log,
    };
  }, [getPokemon, computePower]);

  const preloadAll = useCallback(async () => {
    const slugs = [...new Set(TRAINERS.flatMap((t) => t.team))];
    const pokes = await Promise.all(slugs.map((s) => getPokemon(s)));
    const types = [...new Set(pokes.flatMap((p) => p.types))];
    await Promise.all(types.map((t) => getType(t)));
    return pokes;
  }, [getPokemon, getType]);

  return { getPokemon, getType, simulateMatch, preloadAll };
}

/* ---------------------------------------------------------------
   COMPONENTES DE APOYO
--------------------------------------------------------------- */

function PokeballIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="18" fill="#fff" stroke="#20222c" strokeWidth="2.5" />
      <path d="M2 20a18 18 0 0 1 36 0z" fill="#e3350d" stroke="#20222c" strokeWidth="2.5" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="#20222c" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="6" fill="#fff" stroke="#20222c" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="2.4" fill="#20222c" />
    </svg>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: TYPE_COLORS[type] + "33", color: TYPE_COLORS[type], border: `1px solid ${TYPE_COLORS[type]}66` }}
    >
      {TYPE_ES[type] || type}
    </span>
  );
}

function ComingSoonModal({ open, onClose, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-w-sm w-[90%] rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(160deg,#1b1e2b,#12141d)", border: "1px solid #2c2f42" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-[#7c8199] hover:text-white">
          <X size={18} />
        </button>
        <div className="flex justify-center mb-3"><Sparkles size={30} color="#f2b705" /></div>
        <h3 className="font-display text-xl text-white mb-1">{title}</h3>
        <p className="text-sm text-[#9aa0b4] leading-relaxed">
          Esta función todavía está en el laboratorio del Profesor. ¡Vuelve pronto, entrenador!
        </p>
        <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
             style={{ background: "#f2b70522", color: "#f2b705", border: "1px solid #f2b70555" }}>
          PRÓXIMAMENTE
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: TORNEO
--------------------------------------------------------------- */

function TorneoTab({ api, coins, setCoins }) {
  const [phase, setPhase] = useState("setup"); // setup, loading, ready, finished
  const [userTrainerId, setUserTrainerId] = useState("ash");
  const [pairMode, setPairMode] = useState("position");
  const [standings, setStandings] = useState([]);
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  const unlockedTrainers = TRAINERS.filter((t) => !t.locked);

  async function startTournament() {
    setPhase("loading");
    setError(null);
    try {
      await api.preloadAll();
      let order = TRAINERS.map((t) => t.id);
      if (pairMode === "random") {
        order = [...order];
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
      }
      setStandings(order.map((id, idx) => ({ id, points: 0, seed: idx })));
      setHistory([]);
      setRound(0);
      setPhase("ready");
    } catch (e) {
      setError("No se pudo conectar con PokeAPI. Comprueba tu conexión e inténtalo de nuevo.");
      setPhase("setup");
    }
  }

  function sortedStandings(list) {
    return [...list].sort((a, b) => b.points - a.points || a.seed - b.seed);
  }

  async function simulateRound() {
    setSimulating(true);
    const ordered = sortedStandings(standings);
    const pairs = [];
    for (let i = 0; i < ordered.length; i += 2) pairs.push([ordered[i], ordered[i + 1]]);

    const results = [];
    for (const [pA, pB] of pairs) {
      const trainerA = TRAINERS.find((t) => t.id === pA.id);
      const trainerB = TRAINERS.find((t) => t.id === pB.id);
      const res = await api.simulateMatch(trainerA, trainerB);
      results.push({ a: trainerA, b: trainerB, ...res });
    }

    const updated = standings.map((s) => {
      const r = results.find((res) => res.a.id === s.id || res.b.id === s.id);
      if (r && r.winnerId === s.id) return { ...s, points: s.points + r.remaining };
      return s;
    });

    const newRound = round + 1;
    setStandings(updated);
    setHistory((h) => [...h, { round: newRound, results }]);
    setRound(newRound);
    setSimulating(false);

    if (newRound >= 4) {
      const final = sortedStandings(updated);
      const userIdx = final.findIndex((s) => s.id === userTrainerId);
      const reward = Math.max(50, 400 - userIdx * 50);
      setCoins((c) => c + reward);
      setPhase("finished");
    }
  }

  function reset() {
    setPhase("setup");
    setStandings([]);
    setHistory([]);
    setRound(0);
  }

  const trainerById = (id) => TRAINERS.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      {phase === "setup" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2">
              <Swords size={22} color="#e3350d" /> Elige tu entrenador
            </h2>
            <p className="text-sm text-[#9aa0b4]">Competirás junto a los otros 7 entrenadores de la Liga en un torneo de 4 rondas.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {unlockedTrainers.map((t) => (
              <button
                key={t.id}
                onClick={() => setUserTrainerId(t.id)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: userTrainerId === t.id ? `linear-gradient(160deg, ${t.color}33, #14161f)` : "#14161f",
                  border: userTrainerId === t.id ? `1.5px solid ${t.color}` : "1px solid #262a3a",
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm mb-2"
                     style={{ background: t.color + "33", color: t.color }}>
                  {t.name[0]}
                </div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-[11px] text-[#8a8fa3]">{t.subtitle}</div>
              </button>
            ))}
          </div>

          <div>
            <h3 className="font-display text-lg text-white mb-2 flex items-center gap-2">
              <ListOrdered size={18} color="#f2b705" /> Modo de enfrentamientos
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPairMode("position")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: pairMode === "position" ? "#e3350d22" : "#14161f", border: pairMode === "position" ? "1px solid #e3350d" : "1px solid #262a3a", color: pairMode === "position" ? "#ff6b4a" : "#c7cbdb" }}
              >
                <ListOrdered size={15} /> Por posición (1º vs 2º, 3º vs 4º...)
              </button>
              <button
                onClick={() => setPairMode("random")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: pairMode === "random" ? "#e3350d22" : "#14161f", border: pairMode === "random" ? "1px solid #e3350d" : "1px solid #262a3a", color: pairMode === "random" ? "#ff6b4a" : "#c7cbdb" }}
              >
                <Shuffle size={15} /> Aleatorio
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-[#ff8a8a] bg-[#e3350d1a] border border-[#e3350d44] rounded-lg p-3">{error}</div>}

          <button
            onClick={startTournament}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-display text-lg text-white"
            style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
          >
            Iniciar torneo <ChevronRight size={18} />
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 text-[#9aa0b4]">
          <Loader2 className="animate-spin mb-3" size={30} color="#e3350d" />
          Cargando datos de PokeAPI (stats, tipos y movimientos)...
        </div>
      )}

      {(phase === "ready" || phase === "finished") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-2xl text-white flex items-center gap-2">
              {phase === "finished" ? <Trophy size={22} color="#f2b705" /> : <Swords size={22} color="#e3350d" />}
              {phase === "finished" ? "Torneo finalizado" : `Ronda ${round} de 4`}
            </h2>
            {phase === "ready" && (
              <button
                disabled={simulating}
                onClick={simulateRound}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
              >
                {simulating ? <Loader2 className="animate-spin" size={16} /> : <Swords size={16} />}
                {simulating ? "Simulando..." : `Simular ronda ${round + 1}`}
              </button>
            )}
            {phase === "finished" && (
              <button onClick={reset} className="px-5 py-2.5 rounded-lg font-semibold text-white" style={{ background: "#262a3a" }}>
                Nuevo torneo
              </button>
            )}
          </div>

          {/* Clasificación */}
          <div className="rounded-xl overflow-hidden border border-[#262a3a]">
            <div className="px-4 py-2.5 bg-[#181b26] text-[11px] uppercase tracking-wide text-[#8a8fa3] font-semibold grid grid-cols-[2rem_1fr_5rem]">
              <span>#</span><span>Entrenador</span><span className="text-right">Puntos</span>
            </div>
            {sortedStandings(standings).map((s, idx) => {
              const t = trainerById(s.id);
              const isUser = s.id === userTrainerId;
              return (
                <div key={s.id}
                  className="px-4 py-2.5 grid grid-cols-[2rem_1fr_5rem] items-center text-sm"
                  style={{ background: isUser ? "#e3350d14" : idx % 2 ? "#14161f" : "#12141c", borderTop: "1px solid #1e2130" }}>
                  <span className="font-display text-[#8a8fa3]">
                    {phase === "finished" && idx === 0 ? <Trophy size={15} color="#f2b705" /> : idx + 1}
                  </span>
                  <span className="flex items-center gap-2 text-white font-medium">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-display" style={{ background: t.color + "33", color: t.color }}>{t.name[0]}</span>
                    {t.name} {isUser && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e3350d33] text-[#ff8a6a]">TÚ</span>}
                  </span>
                  <span className="text-right font-display text-lg text-[#f2b705]">{s.points}</span>
                </div>
              );
            })}
          </div>

          {phase === "finished" && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#f2b70522,#12141c)", border: "1px solid #f2b70544" }}>
              <Coins size={22} color="#f2b705" />
              <div className="text-sm text-[#e5e7f0]">
                Has ganado <span className="text-[#f2b705] font-bold">monedas de torneo</span> según tu posición final. Saldo actual: <span className="font-bold text-white">{coins}</span>
              </div>
            </div>
          )}

          {/* Historial de rondas */}
          <div className="space-y-4">
            {[...history].reverse().map((h) => (
              <div key={h.round}>
                <h4 className="text-xs uppercase tracking-wide text-[#8a8fa3] font-semibold mb-2">Ronda {h.round}</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {h.results.map((r, i) => {
                    const won = r.winnerId === r.a.id;
                    return (
                      <div key={i} className="rounded-lg p-3 bg-[#14161f] border border-[#262a3a]">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className={won ? "text-white font-bold" : "text-[#8a8fa3]"}>{r.a.name}</span>
                          <span className="text-[10px] text-[#5c6178]">VS</span>
                          <span className={!won ? "text-white font-bold" : "text-[#8a8fa3]"}>{r.b.name}</span>
                        </div>
                        <div className="text-[12px] text-[#9aa0b4] flex items-center gap-1.5">
                          <Trophy size={12} color="#f2b705" />
                          {(won ? r.a.name : r.b.name)} gana quedándole <span className="text-[#f2b705] font-semibold">{r.remaining}</span> Pokémon en pie
                          <span className="ml-auto font-display text-[#f2b705]">+{r.remaining} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: PERSONAJES
--------------------------------------------------------------- */

function PersonajesTab({ api, onSoon }) {
  const [sprites, setSprites] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const t of TRAINERS.filter((t) => !t.locked)) {
        for (const slug of t.team) {
          const p = await api.getPokemon(slug);
          if (!cancelled) setSprites((s) => ({ ...s, [slug]: p }));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Users size={22} color="#e3350d" /> Entrenadores</h2>
        <p className="text-sm text-[#9aa0b4]">Empiezas con 4 entrenadores desbloqueados. El resto forman parte de la Liga como rivales, pero no puedes jugar con ellos... todavía.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TRAINERS.map((t) => (
          <div key={t.id} className="rounded-xl p-4 relative overflow-hidden" style={{ background: "#14161f", border: "1px solid #262a3a", opacity: t.locked ? 0.6 : 1 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg" style={{ background: t.color + "33", color: t.color }}>{t.name[0]}</div>
              <div>
                <div className="text-white font-semibold flex items-center gap-2">{t.name} {t.locked && <Lock size={13} color="#8a8fa3" />}</div>
                <div className="text-[11px] text-[#8a8fa3]">{t.subtitle}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {t.team.map((slug) => {
                const p = sprites[slug];
                return (
                  <div key={slug} className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "#0e1018", border: "1px solid #22263a" }} title={displayName(slug)}>
                    {t.locked ? <Lock size={14} color="#4c5066" /> : p?.sprite ? <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" /> : <Loader2 className="animate-spin" size={14} color="#4c5066" />}
                  </div>
                );
              })}
            </div>
            {t.locked && (
              <button onClick={() => onSoon("Comprar entrenador")} className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#f2b70522", color: "#f2b705", border: "1px solid #f2b70555" }}>
                Desbloquear con monedas de torneo
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => onSoon("Comprar personajes")} className="rounded-xl p-5 text-left" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
          <Coins size={20} color="#f2b705" className="mb-2" />
          <div className="text-white font-semibold">Comprar personajes</div>
          <div className="text-xs text-[#8a8fa3] mt-1">Desbloquea nuevos entrenadores con monedas de torneo.</div>
        </button>
        <button onClick={() => onSoon("Crea tu propio entrenador")} className="rounded-xl p-5 text-left" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
          <Sparkles size={20} color="#e3350d" className="mb-2" />
          <div className="text-white font-semibold">Crea tu propio entrenador</div>
          <div className="text-xs text-[#8a8fa3] mt-1">Diseña tu personaje y arma tu propio equipo Pokémon.</div>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: TIENDA
--------------------------------------------------------------- */

function TiendaTab({ onSoon }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Store size={22} color="#e3350d" /> Tienda</h2>
        <p className="text-sm text-[#9aa0b4]">Gasta tus monedas de torneo en gachas de Pokémon y entrenadores.</p>
      </div>

      <div className="rounded-xl p-5" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
        <h3 className="font-display text-lg text-white mb-1">Gacha Pokémon</h3>
        <p className="text-xs text-[#8a8fa3] mb-4">Un único gacha general con todos los Pokémon, o gachas específicos por tipo elemental. Cada 4 repetidos obtienes automáticamente 1 Pokémon nuevo garantizado.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {GACHA_RARITIES.map((r) => (
            <div key={r.label} className="rounded-lg p-2.5 text-center" style={{ background: r.color + "1a", border: `1px solid ${r.color}44` }}>
              <div className="text-[11px] font-semibold" style={{ color: r.color }}>{r.label}</div>
              <div className="text-lg font-display text-white">{r.chance}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onSoon("Gacha general")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}>Gacha general</button>
          {["fire", "water", "grass", "electric", "dragon"].map((t) => (
            <button key={t} onClick={() => onSoon(`Gacha de tipo ${TYPE_ES[t]}`)} className="px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: TYPE_COLORS[t] + "22", color: TYPE_COLORS[t], border: `1px solid ${TYPE_COLORS[t]}55` }}>
              {TYPE_ES[t]}
            </button>
          ))}
          <button onClick={() => onSoon("Más gachas por tipo")} className="px-3 py-2 rounded-lg text-xs font-semibold text-[#8a8fa3]" style={{ background: "#1c1f2c", border: "1px solid #2c2f42" }}>+13 tipos más</button>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
        <h3 className="font-display text-lg text-white mb-1">Venta y gacha de entrenadores</h3>
        <p className="text-xs text-[#8a8fa3] mb-4">Compra entrenadores concretos o pruébalos en el gacha de personajes. Cada 6 repetidos obtienes 1 entrenador nuevo garantizado.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {CHAR_GACHA_RARITIES.map((r) => (
            <div key={r.label} className="rounded-lg p-2.5 text-center" style={{ background: r.color + "1a", border: `1px solid ${r.color}44` }}>
              <div className="text-[11px] font-semibold" style={{ color: r.color }}>{r.label}</div>
              <div className="text-lg font-display text-white">{r.chance}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onSoon("Gacha de entrenadores")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#f2b705,#c99a04)" }}>Tirar gacha</button>
          <button onClick={() => onSoon("Comprar entrenador directo")} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#e5e7f0]" style={{ background: "#1c1f2c", border: "1px solid #2c2f42" }}>Comprar directamente</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: LOGROS
--------------------------------------------------------------- */

function LogrosTab({ onSoon }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Award size={22} color="#e3350d" /> Logros</h2>
        <p className="text-sm text-[#9aa0b4]">Completa retos en la Liga para desbloquear insignias especiales.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => (
          <button key={a} onClick={() => onSoon(a)} className="rounded-xl p-4 text-left" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
            <Lock size={18} color="#5c6178" className="mb-3" />
            <div className="text-sm text-[#c7cbdb] font-medium">{a}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP
--------------------------------------------------------------- */

export default function App() {
  const api = useApiCache();
  const [tab, setTab] = useState("torneo");
  const [coins, setCoins] = useState(500);
  const [soon, setSoon] = useState(null);

  const tabs = [
    { id: "torneo", label: "Torneo", icon: Swords },
    { id: "personajes", label: "Personajes", icon: Users },
    { id: "tienda", label: "Tienda", icon: Store },
    { id: "logros", label: "Logros", icon: Award },
  ];

  return (
    <div className="w-full min-h-screen" style={{ background: "#0c0e15", fontFamily: "Inter, sans-serif" }}>
      <header className="px-5 py-4 flex items-center justify-between border-b sticky top-0 z-40" style={{ borderColor: "#1e2130", background: "linear-gradient(180deg,#12141d,#0c0e15)" }}>
        <div className="flex items-center gap-2.5">
          <PokeballIcon size={26} />
          <div>
            <div className="font-display text-xl text-white leading-none">Liga de Campeones</div>
            <div className="text-[11px] text-[#6b7086]">Torneo de entrenadores del anime</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#f2b70518", border: "1px solid #f2b70544" }}>
          <Coins size={15} color="#f2b705" />
          <span className="text-sm font-display text-[#f2b705]">{coins}</span>
        </div>
      </header>

      <nav className="flex px-5 gap-1 border-b overflow-x-auto sticky top-[65px] z-30" style={{ borderColor: "#1e2130", background: "#0c0e15" }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              style={{ borderColor: active ? "#e3350d" : "transparent", color: active ? "#fff" : "#8a8fa3" }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main className="p-5 max-w-5xl mx-auto">
        {tab === "torneo" && <TorneoTab api={api} coins={coins} setCoins={setCoins} />}
        {tab === "personajes" && <PersonajesTab api={api} onSoon={setSoon} />}
        {tab === "tienda" && <TiendaTab onSoon={setSoon} />}
        {tab === "logros" && <LogrosTab onSoon={setSoon} />}
      </main>

      <ComingSoonModal open={!!soon} title={soon} onClose={() => setSoon(null)} />
    </div>
  );
}
