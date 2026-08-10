import React, { useState, useRef, useCallback, useEffect } from "react";
import { Lock, Trophy, Sparkles, Coins, Swords, Users, Store, Award, Shuffle, ListOrdered, X, ChevronRight, Loader2 } from "lucide-react";
import { ANIME_MOVESETS, DEFAULT_MOVES_BY_TYPE } from "./animeMovesets";

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
function displayMoveName(slug) {
  return slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// Orden cronológico de grupos de versión de PokeAPI, usado para elegir el
// conjunto de movimientos de nivel más reciente disponible para cada Pokémon.
const VERSION_GROUP_ORDER = [
  "red-blue", "yellow",
  "gold-silver", "crystal",
  "ruby-sapphire", "emerald", "firered-leafgreen",
  "diamond-pearl", "platinum", "heartgold-soulsilver",
  "black-white", "black-2-white-2",
  "x-y", "omega-ruby-alpha-sapphire",
  "sun-moon", "ultra-sun-ultra-moon",
  "let-s-go-pikachu-let-s-go-eevee",
  "sword-shield",
  "brilliant-diamond-and-shining-pearl", "legends-arceus",
  "scarlet-violet",
];

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
   EFECTOS DE ESTADO Y CAMBIOS DE ESTADÍSTICAS
--------------------------------------------------------------- */

const STAT_ES = {
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Ataque Especial",
  "special-defense": "Defensa Especial",
  speed: "Velocidad",
  accuracy: "Precisión",
  evasion: "Evasión",
};

const STAT_ARTICLE_ES = {
  attack: "el",
  defense: "la",
  "special-attack": "el",
  "special-defense": "la",
  speed: "la",
  accuracy: "la",
  evasion: "la",
};

const AILMENT_APPLY_TEXT = {
  paralysis: "ha quedado paralizado",
  burn: "se ha quemado",
  poison: "ha sido envenenado",
  sleep: "se ha quedado dormido",
  freeze: "se ha congelado",
};

const AILMENT_VERB = {
  paralysis: "Puede paralizar",
  burn: "Puede quemar",
  poison: "Puede envenenar",
  sleep: "Puede dormir",
  freeze: "Puede congelar",
  confusion: "Puede confundir",
};

function statStageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

// Precisión/Evasión usan una escala distinta (base 3) al resto de stats.
function accuracyStageMultiplier(stage) {
  return stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage);
}

// Precisión efectiva de un movimiento: su % base modulado por los stages de
// Precisión del atacante y Evasión del defensor.
function getEffectiveAccuracy(attacker, defender, move) {
  const baseAcc = move.accuracy == null ? 100 : move.accuracy;
  const stage = Math.max(-6, Math.min(6, (attacker.statStages?.accuracy ?? 0) - (defender.statStages?.evasion ?? 0)));
  return baseAcc * accuracyStageMultiplier(stage);
}

function getEffectiveStat(poke, key) {
  const base = poke.stats[key] ?? 70;
  const stage = poke.statStages?.[key] ?? 0;
  return base * statStageMultiplier(stage);
}

function getEffectiveSpeed(poke) {
  let spd = getEffectiveStat(poke, "speed");
  if (poke.status === "paralysis") spd *= 0.5;
  return spd;
}

function statChangeText(change) {
  const abs = Math.abs(change);
  if (change > 0) return abs >= 2 ? "subió mucho" : "subió";
  return abs >= 2 ? "bajó mucho" : "bajó";
}

// Daño físico aproximado que se inflige un Pokémon confundido a sí mismo
// (tipo sin categoría, potencia fija, usando su propio Ataque/Defensa).
function confusionSelfDamage(poke) {
  const atk = getEffectiveStat(poke, "attack");
  const def = getEffectiveStat(poke, "defense");
  const levelFactor = Math.floor((2 * 50) / 5 + 2);
  const base = Math.floor((levelFactor * 40 * atk) / def / 50) + 2;
  return Math.max(1, base);
}

// Comprueba si un Pokémon puede actuar este turno (parálisis, sueño,
// congelación) y resuelve la confusión (33% de golpearse a sí mismo).
// Devuelve false si el Pokémon no llega a ejecutar su movimiento este turno.
function statusPreMoveCheck(poke, turns) {
  if (poke.status === "freeze") {
    if (Math.random() < 0.2) {
      poke.status = null;
      turns.push({ type: "statusText", text: `${poke.name} se ha descongelado` });
    } else {
      turns.push({ type: "statusText", text: `${poke.name} está congelado y no puede moverse` });
      return false;
    }
  } else if (poke.status === "sleep") {
    poke.sleepTurns -= 1;
    if (poke.sleepTurns <= 0) {
      poke.status = null;
      turns.push({ type: "statusText", text: `${poke.name} se ha despertado` });
    } else {
      turns.push({ type: "statusText", text: `${poke.name} está dormido` });
      return false;
    }
  } else if (poke.status === "paralysis") {
    if (Math.random() < 0.25) {
      turns.push({ type: "statusText", text: `${poke.name} está paralizado y no puede moverse` });
      return false;
    }
  }

  if (poke.confusionTurns > 0) {
    poke.confusionTurns -= 1;
    if (poke.confusionTurns <= 0) {
      turns.push({ type: "statusText", text: `${poke.name} ya no está confundido` });
    } else if (Math.random() < 1 / 3) {
      const dmg = confusionSelfDamage(poke);
      poke.hp = Math.max(0, poke.hp - dmg);
      turns.push({ type: "statusText", text: `${poke.name} está confundido y se hace daño a sí mismo (${dmg})` });
      return false;
    }
  }
  return true;
}

// Aplica el ailment (parálisis/quemadura/veneno/sueño/congelación/confusión)
// y los stat_changes de un movimiento ya acertado. Devuelve las entradas de
// log generadas; `inline: true` marca un cambio de stat en el propio usuario
// (se puede fusionar con la línea "X usó Y" en el log de combate).
function applyMoveEffects(attacker, defender, move) {
  const events = [];
  const isStatusMove = move.damageClass === "status";
  const target = move.selfTargeted ? attacker : defender;

  if (move.ailmentName && move.ailmentName !== "none") {
    const chance = move.ailmentChance > 0 ? move.ailmentChance : (isStatusMove ? 100 : 0);
    if (chance > 0 && Math.random() * 100 < chance) {
      if (move.ailmentName === "confusion") {
        if (!target.confusionTurns) {
          target.confusionTurns = 1 + Math.floor(Math.random() * 4);
          events.push({ type: "statusText", text: `${target.name} ha quedado confundido`, inline: false });
        }
      } else if (AILMENT_APPLY_TEXT[move.ailmentName] && !target.status) {
        target.status = move.ailmentName;
        if (move.ailmentName === "sleep") target.sleepTurns = 1 + Math.floor(Math.random() * 3);
        events.push({ type: "statusText", text: `${target.name} ${AILMENT_APPLY_TEXT[move.ailmentName]}`, inline: false });
      }
    }
  }

  if (move.statChanges && move.statChanges.length) {
    const chance = isStatusMove ? 100 : (move.statChance > 0 ? move.statChance : 0);
    if (chance > 0 && Math.random() * 100 < chance) {
      for (const sc of move.statChanges) {
        if (!(sc.stat in target.statStages)) continue;
        const before = target.statStages[sc.stat];
        const after = Math.max(-6, Math.min(6, before + sc.change));
        target.statStages[sc.stat] = after;
        if (after === before) continue;
        if (target === attacker) {
          events.push({ type: "statusText", text: `su ${STAT_ES[sc.stat]} ${statChangeText(sc.change)}`, inline: true });
        } else {
          events.push({ type: "statusText", text: `${target.name}: ${STAT_ARTICLE_ES[sc.stat]} ${STAT_ES[sc.stat]} ${statChangeText(sc.change)}`, inline: false });
        }
      }
    }
  }
  return events;
}

// Resumen breve del efecto secundario de un movimiento, para mostrar en el
// selector de movimientos (reutiliza los mismos datos cacheados del move).
// Movimientos dañinos cuya "power" en PokeAPI es null porque su daño real
// se calcula de forma especial (no encajan en la fórmula fija). Se les da
// una aproximación razonable para el motor simplificado de esta app:
// potencia fija para los de mecánica compleja, y un marcador para los dos
// casos que sí se resuelven en tiempo de combate (velocidad relativa / daño
// fijo igual al nivel).
const FIXED_POWER_OVERRIDES = { "horn-drill": 150, fissure: 150, "sheer-cold": 150, guillotine: 150, bide: 100, "low-kick": 60, "grass-knot": 60 };
const SPEED_RATIO_MOVES = new Set(["electro-ball", "gyro-ball"]);
const FIXED_LEVEL_MOVES = new Set(["night-shade", "seismic-toss"]);

function resolveVariablePower(entry) {
  if (entry.power != null || entry.damageClass === "status") return entry;
  if (SPEED_RATIO_MOVES.has(entry.name)) return { ...entry, specialDamage: "speed-ratio" };
  if (FIXED_LEVEL_MOVES.has(entry.name)) return { ...entry, specialDamage: "fixed-level" };
  if (FIXED_POWER_OVERRIDES[entry.name] != null) return { ...entry, power: FIXED_POWER_OVERRIDES[entry.name] };
  return entry;
}

function moveEffectSummary(move) {
  const parts = [];
  if (move.ailmentName && move.ailmentName !== "none" && AILMENT_VERB[move.ailmentName]) {
    const pct = move.ailmentChance > 0 ? move.ailmentChance : 100;
    parts.push(pct >= 100 ? `${AILMENT_VERB[move.ailmentName]} siempre` : `${AILMENT_VERB[move.ailmentName]} (${pct}%)`);
  }
  if (move.statChanges && move.statChanges.length) {
    const pct = move.damageClass === "status" ? null : (move.statChance > 0 ? move.statChance : null);
    const txt = move.statChanges.map((sc) => `${STAT_ES[sc.stat] || sc.stat} ${statChangeText(sc.change)}`).join(", ");
    parts.push(pct ? `${txt} (${pct}%)` : txt);
  }
  return parts.join(" · ");
}

// Descripción en español del movimiento a partir de flavor_text_entries de
// /move/{name}. Prioriza "es"; si no existe, usa "en" (limpio) como último
// recurso — PokeAPI tiene cobertura en español para la inmensa mayoría de
// movimientos de las entregas principales, así que esta ruta es rara.
function buildMoveDescription(data) {
  const entries = data.flavor_text_entries || [];
  const clean = (t) => t.replace(/[\n\f\r]+/g, " ").replace(/\s+/g, " ").trim();
  const pickLatest = (list) => {
    if (!list.length) return null;
    let best = list[0], bestIdx = VERSION_GROUP_ORDER.indexOf(list[0].version_group.name);
    for (const e of list) {
      const idx = VERSION_GROUP_ORDER.indexOf(e.version_group.name);
      if (idx > bestIdx) { bestIdx = idx; best = e; }
    }
    return clean(best.flavor_text);
  };
  const es = pickLatest(entries.filter((e) => e.language.name === "es"));
  if (es) return es;
  const en = pickLatest(entries.filter((e) => e.language.name === "en"));
  if (en) return en;
  return "Sin descripción disponible para este movimiento.";
}

/* ---------------------------------------------------------------
   UTILIDADES POKEAPI
--------------------------------------------------------------- */

function useApiCache() {
  const pokeCache = useRef({});
  const typeCache = useRef({});
  const moveCache = useRef({});
  const movesetCache = useRef({});

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

  const getMove = useCallback(async (name) => {
    if (moveCache.current[name]) return moveCache.current[name];
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
      const data = await res.json();
      const rawAilment = data.meta?.ailment?.name || "none";
      const entry = resolveVariablePower({
        name: data.name,
        power: data.power,
        accuracy: data.accuracy,
        pp: data.pp,
        type: data.type.name,
        damageClass: data.damage_class?.name || "physical",
        priority: data.priority || 0,
        // "toxic" (mal envenenado) se trata como veneno normal, sin daño creciente.
        ailmentName: rawAilment === "toxic" ? "poison" : rawAilment,
        ailmentChance: data.meta?.ailment_chance ?? 0,
        statChanges: (data.stat_changes || []).map((sc) => ({ stat: sc.stat.name, change: sc.change })),
        statChance: data.meta?.stat_chance ?? 0,
        selfTargeted: data.target?.name === "user",
        description: buildMoveDescription(data),
      });
      moveCache.current[name] = entry;
      return entry;
    } catch (e) {
      const entry = {
        name, power: 40, accuracy: 100, pp: 35, type: "normal", damageClass: "physical", priority: 0,
        ailmentName: "none", ailmentChance: 0, statChanges: [], statChance: 0, selfTargeted: false,
        description: "Sin descripción disponible para este movimiento.",
      };
      moveCache.current[name] = entry;
      return entry;
    }
  }, []);

  // Moveset fijo del anime para esta combinación entrenador+Pokémon; si no
  // existe, cae a movimientos genéricos de daño por tipo, y siempre se
  // rellena con Tackle/Struggle si faltan movimientos o ninguno hace daño.
  const getMoveset = useCallback(async (trainerId, slug) => {
    const cacheKey = `${trainerId}:${slug}`;
    if (movesetCache.current[cacheKey]) return movesetCache.current[cacheKey];

    let chosenNames = ANIME_MOVESETS[cacheKey];
    if (!chosenNames) {
      const poke = await getPokemon(slug);
      const primaryType = poke.types[0];
      chosenNames = (DEFAULT_MOVES_BY_TYPE[primaryType] || DEFAULT_MOVES_BY_TYPE.normal).slice(0, 4);
    }
    const moves = await Promise.all(chosenNames.map((n) => getMove(n)));
    while (moves.length < 4) {
      moves.push(await getMove(moves.length === 3 ? "tackle" : "struggle"));
    }
    const hasDamage = moves.some((m) => m.damageClass !== "status" && (m.power || m.specialDamage));
    if (!hasDamage) {
      moves[moves.length - 1] = await getMove("tackle");
    }
    movesetCache.current[cacheKey] = moves;
    return moves;
  }, [getPokemon, getMove]);

  // Fórmula de daño oficial simplificada a nivel 50 para ambos combatientes.
  // Usa stats efectivos (stages -6..+6) y aplica la quemadura (mitad de
  // ataque físico) como en los juegos.
  const computeDamage = useCallback(async (attacker, defender, move) => {
    // Night Shade / Seismic Toss: daño fijo igual al nivel (50), sin STAB
    // ni multiplicadores de ataque/defensa, solo respeta la inmunidad de tipo.
    if (move.specialDamage === "fixed-level") {
      const mult = await typeMultiplier([move.type], defender.types);
      return { damage: mult > 0 ? 50 : 0, isCrit: false, mult };
    }
    let power = move.power;
    if (move.specialDamage === "speed-ratio") {
      const ratio = getEffectiveSpeed(attacker) / Math.max(1, getEffectiveSpeed(defender));
      power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
    }
    let atkStat = move.damageClass === "special" ? getEffectiveStat(attacker, "special-attack") : getEffectiveStat(attacker, "attack");
    if (move.damageClass === "physical" && attacker.status === "burn") atkStat *= 0.5;
    const defStat = move.damageClass === "special" ? getEffectiveStat(defender, "special-defense") : getEffectiveStat(defender, "defense");
    const levelFactor = Math.floor((2 * 50) / 5 + 2);
    let base = Math.floor((levelFactor * power * atkStat) / defStat / 50);
    base = Math.floor(base + 2);
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const mult = await typeMultiplier([move.type], defender.types);
    const isCrit = Math.random() < 1 / 24;
    const critMult = isCrit ? 1.5 : 1;
    const rand = 0.85 + Math.random() * 0.15;
    let damage = Math.floor(base * stab * mult * critMult * rand);
    damage = mult > 0 ? Math.max(1, damage) : 0;
    return { damage, isCrit, mult };
  }, [typeMultiplier]);

  // Estimación determinista de daño esperado (sin crítico/azar) usada por la
  // IA para elegir el mejor movimiento contra el rival actual.
  const expectedDamage = useCallback(async (attacker, defender, move) => {
    if (move.damageClass === "status" || (!move.power && !move.specialDamage)) return 0;
    const acc = getEffectiveAccuracy(attacker, defender, move);
    if (move.specialDamage === "fixed-level") {
      const mult = await typeMultiplier([move.type], defender.types);
      return mult > 0 ? 50 * (acc / 100) : 0;
    }
    let power = move.power;
    if (move.specialDamage === "speed-ratio") {
      const ratio = getEffectiveSpeed(attacker) / Math.max(1, getEffectiveSpeed(defender));
      power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
    }
    let atkStat = move.damageClass === "special" ? getEffectiveStat(attacker, "special-attack") : getEffectiveStat(attacker, "attack");
    if (move.damageClass === "physical" && attacker.status === "burn") atkStat *= 0.5;
    const defStat = move.damageClass === "special" ? getEffectiveStat(defender, "special-defense") : getEffectiveStat(defender, "defense");
    const levelFactor = Math.floor((2 * 50) / 5 + 2);
    const base = Math.floor((levelFactor * power * atkStat) / defStat / 50) + 2;
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const mult = await typeMultiplier([move.type], defender.types);
    return base * stab * mult * (acc / 100);
  }, [typeMultiplier]);

  // Elige el movimiento con mayor daño esperado. Excepción no bloqueante:
  // por debajo del 40% de PS, si el Pokémon tiene un movimiento de estado
  // que sube sus propias stats y no lo ha usado aún este combate, lo
  // prioriza una única vez antes de volver a centrarse en el daño.
  const chooseMove = useCallback(async (attacker, defender) => {
    const hpRatio = attacker.hp / attacker.maxHp;
    if (hpRatio < 0.4 && !attacker.usedSetupMove) {
      const setupIdx = attacker.moves.findIndex((m) =>
        m.damageClass === "status" && m.selfTargeted && m.statChanges?.some((sc) => sc.change > 0)
      );
      if (setupIdx !== -1) {
        attacker.usedSetupMove = true;
        return attacker.moves[setupIdx];
      }
    }

    const scores = await Promise.all(attacker.moves.map((m) => expectedDamage(attacker, defender, m)));
    let bestIdx = 0;
    for (let k = 1; k < scores.length; k++) if (scores[k] > scores[bestIdx]) bestIdx = k;
    return attacker.moves[bestIdx];
  }, [expectedDamage]);

  const executeMove = useCallback(async (attacker, defender, move) => {
    if (move.damageClass === "status" || (!move.power && !move.specialDamage)) {
      const events = applyMoveEffects(attacker, defender, move);
      return { hit: true, damage: 0, crit: false, status: true, events };
    }
    const acc = getEffectiveAccuracy(attacker, defender, move);
    if (Math.random() * 100 >= acc) {
      return { hit: false, damage: 0, crit: false, status: false, events: [] };
    }
    const { damage, isCrit } = await computeDamage(attacker, defender, move);
    defender.hp = Math.max(0, defender.hp - damage);
    const events = defender.hp > 0 ? applyMoveEffects(attacker, defender, move) : [];
    return { hit: true, damage, crit: isCrit, status: false, events };
  }, [computeDamage]);

  // Resuelve un único turno: ambos movimientos ya elegidos, orden por
  // prioridad/velocidad (con parálisis afectando la velocidad efectiva),
  // ejecuta cada ataque y aplica el daño residual de quemadura/veneno al
  // final. Muta pa.hp / pb.hp directamente.
  const resolveTurn = useCallback(async (pa, pb, moveA, moveB, trainerAId, trainerBId) => {
    const turns = [];
    const prioA = moveA.priority || 0;
    const prioB = moveB.priority || 0;
    let aFirst;
    if (prioA !== prioB) aFirst = prioA > prioB;
    else {
      const spA = getEffectiveSpeed(pa), spB = getEffectiveSpeed(pb);
      aFirst = spA !== spB ? spA > spB : Math.random() < 0.5;
    }
    const order = aFirst
      ? [[pa, pb, moveA, trainerAId], [pb, pa, moveB, trainerBId]]
      : [[pb, pa, moveB, trainerBId], [pa, pb, moveA, trainerAId]];

    for (const [attacker, defender, move, atkTrainer] of order) {
      if (attacker.hp <= 0 || defender.hp <= 0) continue;

      if (!statusPreMoveCheck(attacker, turns)) {
        if (attacker.hp <= 0) turns.push({ type: "faint", pokemon: attacker.name });
        continue;
      }

      const result = await executeMove(attacker, defender, move);
      let inlineEffect = null;
      const extraEvents = [];
      for (const ev of result.events || []) {
        if (!inlineEffect && ev.inline) inlineEffect = ev.text;
        else extraEvents.push(ev);
      }
      turns.push({
        type: "move",
        pokemon: attacker.name,
        trainerId: atkTrainer,
        move: displayMoveName(move.name),
        hit: result.hit,
        crit: result.crit,
        status: result.status,
        damage: result.damage,
        target: defender.name,
        effectText: inlineEffect,
      });
      turns.push(...extraEvents);
      if (defender.hp <= 0) {
        turns.push({ type: "faint", pokemon: defender.name });
      }
    }

    for (const poke of [pa, pb]) {
      if (poke.hp <= 0) continue;
      if (poke.status === "burn") {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.hp = Math.max(0, poke.hp - dmg);
        turns.push({ type: "statusText", text: `${poke.name} sufre el daño de la quemadura` });
      } else if (poke.status === "poison") {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.hp = Math.max(0, poke.hp - dmg);
        turns.push({ type: "statusText", text: `${poke.name} sufre el daño del veneno` });
      } else {
        continue;
      }
      if (poke.hp <= 0) turns.push({ type: "faint", pokemon: poke.name });
    }

    return turns;
  }, [executeMove]);

  // Combate 1 contra 1 por turnos hasta que uno de los dos se quede a 0 PS
  // (IA para ambos lados).
  const simulateDuel = useCallback(async (pa, pb, trainerAId, trainerBId) => {
    const turns = [];
    let guard = 0;
    while (pa.hp > 0 && pb.hp > 0 && guard < 100) {
      guard++;
      const [moveA, moveB] = await Promise.all([chooseMove(pa, pb), chooseMove(pb, pa)]);
      turns.push(...(await resolveTurn(pa, pb, moveA, moveB, trainerAId, trainerBId)));
    }
    const winnerSide = pa.hp > 0 ? "a" : "b";
    return { pokemonAName: pa.name, pokemonBName: pb.name, trainerAId, trainerBId, winnerSide, turns };
  }, [chooseMove, resolveTurn]);

  const preparePokemonForBattle = useCallback(async (trainerId, slug) => {
    const base = await getPokemon(slug);
    const moves = await getMoveset(trainerId, slug);
    const baseHp = base.stats.hp ?? 70;
    // PS a nivel 50 (IV=31, EV=0): floor((2*base+31)*50/100) + 50 + 10
    const maxHp = Math.floor(((2 * baseHp + 31) * 50) / 100) + 60;
    return {
      ...base, moves, maxHp, hp: maxHp,
      status: null, sleepTurns: 0, confusionTurns: 0, usedSetupMove: false,
      statStages: { attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0, accuracy: 0, evasion: 0 },
    };
  }, [getPokemon, getMoveset]);

  const prepareTeam = useCallback(async (trainer) => {
    return Promise.all(trainer.team.map((s) => preparePokemonForBattle(trainer.id, s)));
  }, [preparePokemonForBattle]);

  const simulateMatch = useCallback(async (trainerA, trainerB) => {
    const teamA = await prepareTeam(trainerA);
    const teamB = await prepareTeam(trainerB);
    let i = 0, j = 0;
    const log = [];
    while (i < teamA.length && j < teamB.length) {
      const pa = teamA[i], pb = teamB[j];
      const duel = await simulateDuel(pa, pb, trainerA.id, trainerB.id);
      log.push(duel);
      if (duel.winnerSide === "a") j++; else i++;
    }
    const aWon = j >= teamB.length;
    const remaining = aWon ? teamA.length - i : teamB.length - j;
    return {
      winnerId: aWon ? trainerA.id : trainerB.id,
      loserId: aWon ? trainerB.id : trainerA.id,
      remaining, log,
    };
  }, [prepareTeam, simulateDuel]);

  const preloadAll = useCallback(async () => {
    const slugs = [...new Set(TRAINERS.flatMap((t) => t.team))];
    const pokes = await Promise.all(slugs.map((s) => getPokemon(s)));
    const types = [...new Set(pokes.flatMap((p) => p.types))];
    await Promise.all(types.map((t) => getType(t)));

    // El moveset depende de entrenador+Pokémon (anime), no solo de la
    // especie, así que se precarga por cada combinación real del torneo.
    const pairs = TRAINERS.flatMap((t) => t.team.map((slug) => [t.id, slug]));
    const movesets = await Promise.all(pairs.map(([trainerId, slug]) => getMoveset(trainerId, slug)));
    const moveTypes = [...new Set(movesets.flat().map((m) => m.type))];
    await Promise.all(moveTypes.map((t) => getType(t)));
    return pokes;
  }, [getPokemon, getType, getMoveset]);

  return { getPokemon, getType, simulateMatch, preloadAll, prepareTeam, resolveTurn, chooseMove };
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

function battleTurnLine(turn) {
  if (turn.type === "faint") return `☠️ ${turn.pokemon} se debilita`;
  if (turn.type === "statusText") return turn.text;
  if (!turn.hit) return `${turn.pokemon} usa ${turn.move}... ¡pero falla!`;
  if (turn.status) {
    return turn.effectText
      ? `${turn.pokemon} usó ${turn.move} → ${turn.effectText}`
      : `${turn.pokemon} usó ${turn.move}`;
  }
  const effectSuffix = turn.effectText ? ` (${turn.effectText})` : "";
  return `${turn.pokemon} usa ${turn.move} → ${turn.damage} de daño a ${turn.target}${turn.crit ? " (¡Golpe crítico!)" : ""}${effectSuffix}`;
}

function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color = pct > 50 ? "#5fae5f" : pct > 20 ? "#f2b705" : "#e3350d";
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-[#8a8fa3] mb-0.5">
        <span>PS</span><span>{Math.max(0, hp)} / {maxHp}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-[#0e1018] border border-[#22263a]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function BattlerCard({ poke, label }) {
  return (
    <div className="rounded-xl p-3 flex-1" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
      <div className="flex items-center gap-3 mb-2">
        {poke.sprite && <img src={poke.sprite} alt={poke.name} className="w-14 h-14 object-contain" />}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-[#8a8fa3]">{label}</div>
          <div className="text-white font-semibold text-sm truncate">{poke.name}</div>
          <div className="flex gap-1 mt-1">
            {poke.types.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
        </div>
      </div>
      <HpBar hp={poke.hp} maxHp={poke.maxHp} />
    </div>
  );
}

// Pantalla de combate interactiva: el usuario elige el movimiento de su
// Pokémon activo en cada turno; el rival lo controla la IA (chooseMove).
function InteractiveBattle({ api, trainerA, trainerB, userSide, onFinish }) {
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(0);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { winnerId, loserId, remaining }
  const logEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ta, tb] = await Promise.all([api.prepareTeam(trainerA), api.prepareTeam(trainerB)]);
      if (!cancelled) { setTeamA(ta); setTeamB(tb); }
    })();
    return () => { cancelled = true; };
  }, [api, trainerA, trainerB]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log]);

  if (!teamA || !teamB) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#9aa0b4]">
        <Loader2 className="animate-spin mb-3" size={26} color="#e3350d" />
        Preparando tu combate...
      </div>
    );
  }

  const pa = teamA[idxA];
  const pb = teamB[idxB];
  const userPoke = userSide === "a" ? pa : pb;
  const aiPoke = userSide === "a" ? pb : pa;
  const userTrainer = userSide === "a" ? trainerA : trainerB;
  const aiTrainer = userSide === "a" ? trainerB : trainerA;

  async function handleUserMove(move) {
    if (busy || result) return;
    setBusy(true);
    const aiMove = await api.chooseMove(aiPoke, userPoke);
    const moveA = userSide === "a" ? move : aiMove;
    const moveB = userSide === "a" ? aiMove : move;
    const turns = await api.resolveTurn(pa, pb, moveA, moveB, trainerA.id, trainerB.id);
    setLog((l) => [...l, ...turns]);

    let newIdxA = idxA, newIdxB = idxB;
    if (pa.hp <= 0) newIdxA = idxA + 1;
    else if (pb.hp <= 0) newIdxB = idxB + 1;

    if (newIdxA >= teamA.length || newIdxB >= teamB.length) {
      const aWon = newIdxB >= teamB.length;
      const remaining = aWon ? teamA.length - newIdxA : teamB.length - newIdxB;
      // Al terminar el combate no hay "siguiente" Pokémon: nos quedamos en el
      // último índice válido para poder seguir mostrando su tarjeta a 0 PS.
      setIdxA(Math.min(newIdxA, teamA.length - 1));
      setIdxB(Math.min(newIdxB, teamB.length - 1));
      setResult({
        winnerId: aWon ? trainerA.id : trainerB.id,
        loserId: aWon ? trainerB.id : trainerA.id,
        remaining,
      });
    } else {
      setIdxA(newIdxA);
      setIdxB(newIdxB);
    }
    setBusy(false);
  }

  const userWon = result && result.winnerId === userTrainer.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BattlerCard poke={userPoke} label={`Tú (${userTrainer.name})`} />
        <div className="text-[10px] text-[#5c6178] font-display">VS</div>
        <BattlerCard poke={aiPoke} label={aiTrainer.name} />
      </div>

      <div className="rounded-lg p-3 bg-[#0e1018] border border-[#1e2130] text-[12px] text-[#9aa0b4] h-40 overflow-y-auto space-y-0.5">
        {log.length === 0 && <div className="text-[#5c6178]">Elige un movimiento para empezar el combate.</div>}
        {log.map((t, i) => <div key={i}>{battleTurnLine(t)}</div>)}
        <div ref={logEndRef} />
      </div>

      {!result ? (
        <div>
          <div className="text-xs text-[#8a8fa3] mb-2">Movimientos de {userPoke.name}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {userPoke.moves.map((m, i) => {
              const isStatus = m.damageClass === "status" || (!m.power && !m.specialDamage);
              const categoryLabel = isStatus ? "Estado" : m.damageClass === "special" ? "Especial" : "Físico";
              const powerLabel = isStatus ? "—" : (m.power ?? "Variable");
              const effectSummary = moveEffectSummary(m);
              return (
                <button
                  key={i}
                  disabled={busy}
                  onClick={() => handleUserMove(m)}
                  className="rounded-lg p-3 text-left disabled:opacity-50"
                  style={{ background: "#14161f", border: "1px solid #262a3a" }}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-white font-semibold text-sm">{displayMoveName(m.name)}</span>
                    <TypeBadge type={m.type} />
                  </div>
                  <div className="text-[11px] text-[#8a8fa3] mb-1.5">
                    {categoryLabel} · Potencia {powerLabel} · Precisión {m.accuracy ?? "—"} · PP {m.pp ?? "—"}
                  </div>
                  <div
                    className="text-[11px] text-[#6b7086] leading-snug mb-1"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {m.description}
                  </div>
                  {effectSummary && (
                    <div className="text-[11px] font-semibold" style={{ color: "#f2b705" }}>{effectSummary}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-3"
          style={{
            background: userWon ? "linear-gradient(135deg,#5fae5f22,#12141c)" : "linear-gradient(135deg,#e3350d22,#12141c)",
            border: userWon ? "1px solid #5fae5f55" : "1px solid #e3350d55",
          }}
        >
          <div className="text-sm text-[#e5e7f0]">
            {userWon ? "¡Has ganado tu combate!" : "Has perdido tu combate."} Quedan <span className="font-bold text-white">{result.remaining}</span> Pokémon en pie del ganador.
          </div>
          <button
            onClick={() => onFinish({ ...result, log: [{ pokemonAName: trainerA.name, pokemonBName: trainerB.name, turns: log }] })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
          >
            Continuar <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function TorneoTab({ api, coins, setCoins }) {
  const [phase, setPhase] = useState("setup"); // setup, loading, ready, finished
  const [userTrainerId, setUserTrainerId] = useState("ash");
  const [pairMode, setPairMode] = useState("position");
  const [standings, setStandings] = useState([]);
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState({});
  const [interactiveMatch, setInteractiveMatch] = useState(null); // { trainerA, trainerB, userSide, idx }
  const [pendingRoundResults, setPendingRoundResults] = useState(null);

  function toggleMatch(key) {
    setExpandedMatches((e) => ({ ...e, [key]: !e[key] }));
  }

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

  function finalizeRound(results) {
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

  async function simulateRound() {
    setSimulating(true);
    const ordered = sortedStandings(standings);
    const pairs = [];
    for (let i = 0; i < ordered.length; i += 2) pairs.push([ordered[i], ordered[i + 1]]);

    const userPairIdx = pairs.findIndex(([pA, pB]) => pA.id === userTrainerId || pB.id === userTrainerId);
    const results = new Array(pairs.length);

    await Promise.all(pairs.map(async ([pA, pB], idx) => {
      if (idx === userPairIdx) return;
      const trainerA = TRAINERS.find((t) => t.id === pA.id);
      const trainerB = TRAINERS.find((t) => t.id === pB.id);
      const res = await api.simulateMatch(trainerA, trainerB);
      results[idx] = { a: trainerA, b: trainerB, ...res };
    }));

    if (userPairIdx === -1) {
      finalizeRound(results);
      return;
    }

    const [pA, pB] = pairs[userPairIdx];
    const trainerA = TRAINERS.find((t) => t.id === pA.id);
    const trainerB = TRAINERS.find((t) => t.id === pB.id);
    setPendingRoundResults(results);
    setInteractiveMatch({
      trainerA, trainerB,
      userSide: trainerA.id === userTrainerId ? "a" : "b",
      idx: userPairIdx,
    });
    setSimulating(false);
  }

  function handleInteractiveFinish(matchResult) {
    const { trainerA, trainerB, idx } = interactiveMatch;
    const results = [...pendingRoundResults];
    results[idx] = { a: trainerA, b: trainerB, ...matchResult };
    setInteractiveMatch(null);
    setPendingRoundResults(null);
    finalizeRound(results);
  }

  function reset() {
    setPhase("setup");
    setStandings([]);
    setHistory([]);
    setRound(0);
    setInteractiveMatch(null);
    setPendingRoundResults(null);
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

      {phase === "ready" && interactiveMatch && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-white flex items-center gap-2">
            <Swords size={22} color="#e3350d" /> Tu combate — Ronda {round + 1}
          </h2>
          <InteractiveBattle
            api={api}
            trainerA={interactiveMatch.trainerA}
            trainerB={interactiveMatch.trainerB}
            userSide={interactiveMatch.userSide}
            onFinish={handleInteractiveFinish}
          />
        </div>
      )}

      {(phase === "ready" || phase === "finished") && !interactiveMatch && (
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
                    const key = `${h.round}-${i}`;
                    const isOpen = !!expandedMatches[key];
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
                        <button
                          onClick={() => toggleMatch(key)}
                          className="mt-2 text-[11px] font-semibold text-[#8a8fa3] hover:text-[#c7cbdb]"
                        >
                          {isOpen ? "Ocultar combate ▲" : "Ver combate ▼"}
                        </button>
                        {isOpen && (
                          <div className="mt-2 space-y-3 max-h-64 overflow-y-auto text-[11px] text-[#9aa0b4] bg-[#0e1018] rounded-lg p-2.5 border border-[#1e2130]">
                            {r.log.map((duel, di) => (
                              <div key={di}>
                                <div className="text-[#c7cbdb] font-semibold mb-1">
                                  {duel.pokemonAName} vs {duel.pokemonBName}
                                </div>
                                <div className="space-y-0.5">
                                  {duel.turns.map((t, ti) => (
                                    <div key={ti}>{battleTurnLine(t)}</div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
