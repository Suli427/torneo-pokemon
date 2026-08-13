import React, { useState, useRef, useCallback, useEffect } from "react";
import { Lock, Trophy, Sparkles, Coins, Swords, Users, Store, Award, Shuffle, ListOrdered, X, ChevronRight, Loader2, Boxes, Star, Check } from "lucide-react";
import { TRAINER_MOVESETS, TRAINER_MOVESETS_ADVANCED, DEFAULT_MOVES_BY_TYPE } from "./trainerMovesets";
import { GACHA_POOL } from "./gachaPool";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from "./achievements";
import {
  ACHIEVEMENT_PROGRESS_STORAGE_KEY, loadStoredAchievementProgress, reconstructProgress,
  buildDerivedContext, evaluateAchievements, getProgressCounter,
  applyTournamentResult, applyGachaPull, applyCombatMechanics,
} from "./achievementProgress";

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
  { id: "cintia", name: "Cintia", subtitle: "Campeona de Sinnoh", locked: true, price: 900, color: "#c9a227",
    team: ["garchomp", "spiritomb", "lucario", "milotic", "roserade", "togekiss"] },
  { id: "maximo", name: "Máximo", subtitle: "Campeón de Hoenn", locked: false, color: "#8a7a5b",
    team: ["metagross", "skarmory", "aggron", "cradily", "armaldo", "claydol"] },
  { id: "dianta", name: "Dianta", subtitle: "Campeona de Kalos", locked: true, price: 1100, color: "#c25b8f",
    team: ["gardevoir", "hawlucha", "tyrantrum", "goodra", "aurorus", "gourgeist-average"] },
  { id: "lionel", name: "Lionel", subtitle: "Campeón de Galar", locked: true, price: 1200, color: "#d3652c",
    team: ["charizard", "dragapult", "aegislash-shield", "rillaboom", "cinderace", "mr-rime"] },
  { id: "paul", name: "Paul", subtitle: "Rival de Sinnoh", locked: false, color: "#5b4a8a",
    team: ["electivire", "torterra", "ninjask", "ursaring", "ariados", "ambipom"] },
  { id: "gary", name: "Gary", subtitle: "Rival de Kanto", locked: false, color: "#3b6dc7",
    team: ["blastoise", "umbreon", "arcanine", "nidoking", "scizor", "electivire"] },
  { id: "iris", name: "Iris", subtitle: "Campeona de Teselia", locked: true, price: 1000, color: "#4a8a5b",
    team: ["dragonite", "excadrill", "emolga", "dragonair", "gigalith", "druddigon"] },
  { id: "ash", name: "Ash", subtitle: "Maestro Pokémon", locked: false, color: "#e3350d",
    // Pikachu sustituido por Raichu: sin evolucionar, Pikachu se queda muy
    // corto de daño para el nivel del resto del roster (ver moveset propio
    // y coherente en trainerMovesets.js, no heredado del de Pikachu).
    team: ["raichu", "dragonite", "sirfetchd", "gengar", "lucario", "goodra"] },

  // --- Entrenadores nuevos (bloqueados, comprables con monedas de torneo) ---
  { id: "lance", name: "Lance", subtitle: "Campeón de Kanto/Johto", locked: true, price: 1050, color: "#8a2e2e",
    team: ["gyarados", "dragonite", "dragonite", "charizard", "aerodactyl", "kingdra"] },
  { id: "wallace", name: "Wallace", subtitle: "Campeón de Hoenn", locked: true, price: 1150, color: "#1f8a9e",
    team: ["milotic", "ludicolo", "whiscash", "gyarados", "wailord", "starmie"] },
  { id: "alder", name: "Alder", subtitle: "Campeón de Teselia", locked: true, price: 950, color: "#6b8e23",
    team: ["volcarona", "bouffalant", "vanilluxe", "druddigon", "escavalier", "accelgor"] },
  { id: "alain", name: "Alain", subtitle: "Rival de Kalos", locked: true, price: 900, color: "#b8452f",
    team: ["charizard", "bisharp", "unfezant", "weavile", "metagross", "tyranitar"] }, // TODO: revisar equipo (6º Pokémon: Tyranitar, elegido por mí)
  { id: "sabino", name: "Sabino", subtitle: "Rival de Kalos", locked: true, price: 750, color: "#4a90d9",
    team: ["sceptile", "slaking", "aegislash-shield", "salamence", "clawitzer", "beedrill"] },
  { id: "benito", name: "Benito", subtitle: "Rival de Sinnoh", locked: true, price: 800, color: "#e08a2e",
    team: ["empoleon", "roserade", "heracross", "rapidash", "staraptor", "floatzel"] },
  { id: "trip", name: "Trip", subtitle: "Rival de Teselia", locked: true, price: 700, color: "#6c7a89",
    team: ["serperior", "conkeldurr", "jellicent-male", "vanilluxe", "darmanitan-standard", "boldore"] },
  { id: "cameron", name: "Cameron", subtitle: "Copa Junior de Teselia", locked: true, price: 750, color: "#8e44ad",
    team: ["lucario", "hydreigon", "samurott", "swanna", "flygon", "magnezone"] }, // TODO: revisar equipo (5º y 6º Pokémon)
  { id: "red", name: "Red", subtitle: "Maestro Pokémon legendario", locked: true, price: 1400, color: "#7a1f1f",
    team: ["raichu", "charizard", "snorlax", "espeon", "venusaur", "blastoise"] },
  { id: "cyrus", name: "Cyrus", subtitle: "Líder del Team Galactic", locked: true, price: 1050, color: "#34495e",
    team: ["weavile", "crobat", "gyarados", "honchkrow", "houndoom", "magnezone"] }, // TODO: revisar equipo (6º Pokémon)
  { id: "n", name: "N", subtitle: "Rey del Equipo Plasma", locked: true, price: 1000, color: "#27ae60",
    team: ["zoroark", "carracosta", "klinklang", "vanilluxe", "archeops", "darmanitan-standard"] }, // TODO: revisar equipo (6º Pokémon)
  { id: "giovanni", name: "Giovanni", subtitle: "Líder del Team Rocket", locked: true, price: 1100, color: "#45484c",
    team: ["nidoking", "nidoqueen", "rhyperior", "persian", "kangaskhan", "crobat"] }, // TODO: revisar equipo (6º Pokémon)
  { id: "colress", name: "Colress", subtitle: "Científico del Equipo Plasma", locked: true, price: 950, color: "#16a085",
    team: ["klinklang", "escavalier", "beheeyem", "magnezone", "metang", "porygon-z"] }, // TODO: revisar equipo (6º Pokémon)
];

// Un entrenador está desbloqueado si ya lo estaba por defecto (locked:false
// en TRAINERS) o si su id está en la lista de comprados persistida. Nunca
// se muta el array TRAINERS original: el estado de desbloqueo se calcula
// combinando ambas fuentes donde haga falta.
function isTrainerUnlocked(trainer, purchasedTrainerIds) {
  return !trainer.locked || purchasedTrainerIds.includes(trainer.id);
}

const COINS_STORAGE_KEY = "liga-pokemon:coins";
const UNLOCKED_TRAINERS_STORAGE_KEY = "liga-pokemon:unlocked-trainers";

// Envuelto en try/catch: si localStorage está bloqueado (incógnito
// estricto, etc.) la app sigue funcionando en memoria, solo sin persistir.
function loadStoredCoins() {
  try {
    const raw = localStorage.getItem(COINS_STORAGE_KEY);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return n;
    }
  } catch (e) { /* localStorage no disponible */ }
  return 500;
}

function loadStoredPurchasedTrainers() {
  try {
    const raw = localStorage.getItem(UNLOCKED_TRAINERS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) { /* localStorage no disponible */ }
  return [];
}

const COLLECTION_STORAGE_KEY = "liga-pokemon:collection";
const CUSTOM_TRAINER_STORAGE_KEY = "liga-pokemon:custom-trainer";

// Colección de Pokémon conseguidos en el gacha: [{ slug, moves: [4 nombres],
// obtainedAt, shiny }]. Mismo patrón try/catch que coins/purchasedTrainers.
function loadStoredCollection() {
  try {
    const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) { /* localStorage no disponible */ }
  return [];
}

const TOURNAMENT_HISTORY_STORAGE_KEY = "liga-pokemon:tournament-history";
const TOURNAMENT_HISTORY_LIMIT = 20;

// Historial de torneos jugados: [{ date, mode, trainerId, trainerName,
// finalPosition, points, coinsEarned }], más recientes primero, limitado a
// las últimas TOURNAMENT_HISTORY_LIMIT entradas. Mismo patrón try/catch que
// el resto de datos persistidos.
function loadStoredTournamentHistory() {
  try {
    const raw = localStorage.getItem(TOURNAMENT_HISTORY_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) { /* localStorage no disponible */ }
  return [];
}

const OWNED_TRAINER_MOVESETS_STORAGE_KEY = "liga-pokemon:owned-trainer-movesets";

// Movesets EDITADOS por el usuario para entrenadores comprados que usa para
// jugar él mismo (no el entrenador propio creado desde cero, que tiene su
// propia estructura vía `collection`): { [`${trainerId}:${slug}`]: [4
// nombres de movimiento] }. Independiente de TRAINER_MOVESETS/
// TRAINER_MOVESETS_ADVANCED (que la CPU sigue usando siempre sin
// modificar, ver App.jsx); solo se lee/escribe cuando el propio usuario
// juega CON ese entrenador. Mismo patrón try/catch que el resto.
function loadStoredOwnedTrainerMovesets() {
  try {
    const raw = localStorage.getItem(OWNED_TRAINER_MOVESETS_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
    }
  } catch (e) { /* localStorage no disponible */ }
  return {};
}

// Identidad única de una entrada de colección: slug + shiny, ya que ahora
// una misma especie puede tener hasta dos entradas independientes (normal y
// shiny), cada una con su propio moveset. Se usa tanto para comprobar
// repetidos en el gacha como para referenciar Pokémon concretos del equipo
// del entrenador propio.
function collectionEntryKey(entry) {
  return `${entry.slug}::${entry.shiny ? "shiny" : "normal"}`;
}
function findCollectionEntry(collection, slug, shiny) {
  return collection.find((c) => c.slug === slug && !!c.shiny === !!shiny);
}

// Entrenador propio del usuario: { name, team: [6 { slug, shiny }] } o null
// si aún no se ha creado. Solo puede existir uno. `team` ya no es un array
// de slugs sueltos (formato antiguo, antes de distinguir shiny en la
// colección): se normaliza aquí por compatibilidad con partidas guardadas
// previas. Recibe la colección ya cargada para poder desambiguar esas
// entradas antiguas: si la colección solo tiene una variante (normal o
// shiny) de esa especie, se infiere de ahí; si hay ambigüedad (tiene
// ambas) o ya no la tiene, se asume la normal por defecto.
function loadStoredCustomTrainer(collection) {
  try {
    const raw = localStorage.getItem(CUSTOM_TRAINER_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj.name === "string" && Array.isArray(obj.team) && obj.team.length === 6) {
        const team = obj.team.map((t) => {
          if (typeof t !== "string") return { slug: t.slug, shiny: !!t.shiny };
          const matches = collection.filter((c) => c.slug === t);
          const shiny = matches.length === 1 ? !!matches[0].shiny : false;
          return { slug: t, shiny };
        });
        return { name: obj.name, team };
      }
    }
  } catch (e) { /* localStorage no disponible */ }
  return null;
}

const NAME_OVERRIDES = { sirfetchd: "Sirfetch'd", "mr-rime": "Mr. Rime", "gourgeist-average": "Gourgeist", "aegislash-shield": "Aegislash" };
// `w[0].toUpperCase()` asume que cada trozo entre guiones no está vacío;
// algunos slugs de la propia API (ej. las dos variantes "--physical"/
// "--special" de los movimientos Z, con guion doble) rompen esa asunción y
// dejaban algún trozo vacío tras el split, lanzando un TypeError al
// intentar leer w[0] de undefined. Se filtran los trozos vacíos antes de
// mapear, así cualquier slug con formato inesperado degrada con
// normalidad (ej. "breakneck-blitz--physical" → "Breakneck Blitz Physical")
// en vez de romper la pantalla entera.
function displayName(slug) {
  return NAME_OVERRIDES[slug] || slug.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
function displayMoveName(slug) {
  return slug.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
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

// Las 6 rarezas del gacha de Pokémon (src/gachaPool.js), en orden de menos a
// más rara. `chance` son las probabilidades de sorteo (deben sumar 100 y
// son las mismas tanto en el gacha general como en cualquier gacha de tipo).
const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "pseudo-legendary", "legendary"];
const RARITY_META = {
  common: { label: "Común", chance: 45, color: "#9aa0ad" },
  uncommon: { label: "Poco común", chance: 25, color: "#5fae5f" },
  rare: { label: "Raro", chance: 15, color: "#4a90d9" },
  epic: { label: "Épico", chance: 8, color: "#a75fd9" },
  "pseudo-legendary": { label: "Pseudolegendario", chance: 5, color: "#e3701e" },
  legendary: { label: "Legendario", chance: 2, color: "#e3b23c" },
};

// Reembolso en monedas cuando la tirada saca un Pokémon repetido, según la
// rareza obtenida y el tipo de gacha (el de tipo cuesta más por tirada, así
// que reembolsa más).
const GENERAL_GACHA_COST = 500;
const TYPE_GACHA_COST = 700;
const GENERAL_GACHA_REFUND = { common: 100, uncommon: 150, rare: 300, epic: 500, "pseudo-legendary": 700, legendary: 1000 };
const TYPE_GACHA_REFUND = { common: 140, uncommon: 210, rare: 420, epic: 700, "pseudo-legendary": 980, legendary: 1400 };

// Probabilidad de que un Pokémon NUEVO (no repetido) salga en su variante
// shiny, tirada aparte e independiente del sorteo de rareza/especie.
const SHINY_CHANCE = 0.01;

const ALL_TYPES = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

// Sortea una rareza entre `rarities` (subconjunto de RARITY_ORDER),
// respetando el peso relativo de RARITY_META.chance entre ellas.
function rollRarityAmong(rarities) {
  const total = rarities.reduce((sum, r) => sum + RARITY_META[r].chance, 0);
  let roll = Math.random() * total;
  for (const r of rarities) {
    roll -= RARITY_META[r].chance;
    if (roll < 0) return r;
  }
  return rarities[rarities.length - 1];
}

// Resuelve una tirada completa de gacha sobre `pool` (el general completo, o
// uno ya filtrado por tipo): sortea una rareza entre las 6 con sus
// probabilidades reales, y si esa rareza no tiene ningún candidato en este
// pool concreto, la descarta y vuelve a sortear entre las que quedan (con
// las probabilidades de esas restantes), hasta encontrar una con al menos
// un Pokémon disponible. Devuelve también qué rarezas tuvo que descartar,
// para poder avisar de ello en la interfaz.
function rollGachaPokemon(pool) {
  let remaining = [...RARITY_ORDER];
  const emptyRarities = [];
  while (remaining.length > 0) {
    const rarity = rollRarityAmong(remaining);
    const candidates = pool.filter((p) => p.rarity === rarity);
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return { chosen, rarity, emptyRarities };
    }
    emptyRarities.push(rarity);
    remaining = remaining.filter((r) => r !== rarity);
  }
  return null;
}

// Número total de rondas de un torneo (Swiss por puntos): único punto de
// verdad, usado tanto en la condición de "torneo finalizado" como en toda
// la interfaz que muestra "Ronda X de N".
const TOURNAMENT_ROUNDS = 5;


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
  toxic: "ha sido gravemente envenenado",
};

const AILMENT_VERB = {
  paralysis: "Puede paralizar",
  burn: "Puede quemar",
  poison: "Puede envenenar",
  sleep: "Puede dormir",
  freeze: "Puede congelar",
  confusion: "Puede confundir",
  toxic: "Puede envenenar gravemente",
};

// Abreviaturas cortas al estilo de los juegos originales, para los badges
// de stat y de estado en la pantalla de combate.
const STAT_SHORT_ES = {
  attack: "ATQ",
  defense: "DEF",
  "special-attack": "ATQ.E",
  "special-defense": "DEF.E",
  speed: "VEL",
  accuracy: "PRE",
  evasion: "EVA",
};

// Reutiliza colores ya presentes en TYPE_COLORS para no introducir una
// paleta nueva que desentone con el resto de la app.
const STATUS_BADGE_META = {
  paralysis: { label: "PAR", color: "#f2b705", title: "Paralizado: puede fallar el turno y su Velocidad se reduce a la mitad" },
  burn: { label: "QUEM", color: TYPE_COLORS.fire, title: "Quemado: pierde PS cada turno y su ataque físico se reduce a la mitad" },
  poison: { label: "VEN", color: TYPE_COLORS.poison, title: "Envenenado: pierde PS al final de cada turno" },
  toxic: { label: "TOX", color: "#a75fd9", title: "Gravemente envenenado: pierde PS cada turno, cada vez más" },
  sleep: { label: "DUERME", color: "#9aa0b4", title: "Dormido: no puede actuar hasta que se despierte" },
  freeze: { label: "CONG", color: TYPE_COLORS.ice, title: "Congelado: no puede actuar hasta que se descongele" },
};
const CONFUSION_BADGE_META = { label: "CONF", color: TYPE_COLORS.psychic, title: "Confundido: puede golpearse a sí mismo en vez de actuar" };

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

// `stageClamp` opcional: transforma el stage antes de aplicar el
// multiplicador. Se usa en golpes críticos para ignorar bajadas propias de
// Ataque/Ataque Especial (Math.max(0, stage)) o subidas de Defensa/Defensa
// Especial del rival (Math.min(0, stage)), sin tocar el resto de casos.
function getEffectiveStat(poke, key, stageClamp) {
  const base = poke.stats[key] ?? 70;
  let stage = poke.statStages?.[key] ?? 0;
  if (stageClamp) stage = stageClamp(stage);
  return base * statStageMultiplier(stage);
}

// `weather` (en realidad el objeto compartido de clima+campo+viento afín del
// combate) es opcional para no romper llamadas antiguas: si se pasa y el
// equipo de `poke` tiene Viento Afín activo, duplica la Velocidad efectiva
// como un multiplicador aparte de los stages normales (se aplican ambos de
// forma independiente, stages primero y luego este x2).
function getEffectiveSpeed(poke, weather) {
  let spd = getEffectiveStat(poke, "speed");
  if (poke.status === "paralysis") spd *= 0.5;
  if (weather?.tailwind?.[poke.trainerId] > 0) spd *= 2;
  return spd;
}

/* ---------------------------------------------------------------
   DIFICULTAD DE LA CPU
--------------------------------------------------------------- */

const DIFFICULTY_META = {
  normal: {
    label: "Normal",
    desc: "Ataca con el movimiento de mayor daño esperado. Nunca cambia de Pokémon por voluntad propia.",
  },
  hard: {
    label: "Difícil",
    desc: "Prioriza rematar, cura por drenaje si está muy tocada, usa Protección con criterio y Viento Afín en el momento oportuno; cambia de Pokémon ante una desventaja de tipo severa.",
  },
  master: {
    label: "Maestro",
    desc: "Todo lo de Difícil, y además planifica 2 turnos por adelantado (movimientos y cambios incluidos) para elegir su mejor jugada.",
  },
};

// Reordena el equipo (mutando el array in-place) para que empiece por un
// Pokémon aleatorio, conservando el orden relativo del resto para las
// entradas posteriores tras debilitamientos (es una simple rotación: si el
// elegido es el de índice r, el equipo pasa a ser [r, r+1, ..., fin, 0, ...,
// r-1]). No afecta a la lógica de emparejamientos/clasificación del torneo:
// solo cambia qué Pokémon concreto ocupa cada índice antes de empezar el
// combate, el resto del motor sigue consumiendo el equipo por índice igual
// que siempre.
function rotateTeamRandomStart(team) {
  if (!team || team.length < 2) return team;
  const r = Math.floor(Math.random() * team.length);
  if (r === 0) return team;
  const rotated = [...team.slice(r), ...team.slice(0, r)];
  team.splice(0, team.length, ...rotated);
  return team;
}

// ¿Quién actúa primero entre dos movimientos ya elegidos? Misma regla que
// resolveTurn (prioridad, luego Velocidad efectiva, empate 50/50), como
// función pura reutilizable por la simulación a 2 turnos de Maestro (no
// necesita acceso al resto del motor de combate).
function attackerMovesFirst(moveA, moveB, pokeA, pokeB, weather) {
  const prioA = moveA ? (moveA.priority || 0) : -100;
  const prioB = moveB ? (moveB.priority || 0) : -100;
  if (prioA !== prioB) return prioA > prioB;
  const spA = getEffectiveSpeed(pokeA, weather), spB = getEffectiveSpeed(pokeB, weather);
  if (spA !== spB) return spA > spB;
  return Math.random() < 0.5;
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

// PokeAPI no expone un flag estructurado y fiable para "requiere recarga"
// (meta.category es "damage", igual que cualquier otro movimiento dañino;
// solo se menciona en el texto libre de effect_entries). Se usa una lista
// fija, más fiable, con los movimientos de este tipo presentes en el roster
// (y otros habituales de la serie por si se añaden en el futuro).
const RECHARGE_MOVES = new Set([
  "hyper-beam", "giga-impact", "blast-burn", "frenzy-plant", "hydro-cannon",
  "roar-of-time", "rock-wrecker", "gigavolt-havoc", "prismatic-laser",
  "meteor-assault", "eternabeam",
]);

// PokeAPI tampoco expone un flag estructurado para "movimiento de furia"
// (meta.min_turns/max_turns vienen a null incluso en Enfado/Danza
// Pétalo/Golpes Furia; el "2-3 turnos" solo aparece como texto libre en
// effect_entries). Se usa una lista fija, igual que con la recarga.
const THRASHING_MOVES = new Set(["outrage", "petal-dance", "thrash"]);

// Familia de movimientos de protección (meta.category = "unique", no hay
// forma estructurada de agruparlos aparte de por nombre). Comparten la
// misma mecánica: bloquean el movimiento rival ese turno y su
// probabilidad de éxito se reduce a la mitad en usos consecutivos.
const PROTECT_MOVES = new Set(["protect", "detect", "baneful-bunker", "spiky-shield", "kings-shield"]);

// Movimientos que hacen daño Y ADEMÁS fuerzan al OBJETIVO a retirarse y ser
// sustituido por otro Pokémon de su equipo (Cola Dragón/Dragon Tail, Giro
// Vil/Circle Throw: mismo efecto que Rugido/Whirlwind pero después de
// golpear en vez de sin dañar). Solo tiene efecto si el golpe conecta de
// verdad (no bloqueado por Protección, no inmune) y el objetivo sigue vivo
// tras el daño (si el golpe lo debilita, se sustituye por el flujo normal de
// debilitamiento, no por este forzado) y le queda algún otro Pokémon vivo.
const DRAG_OUT_MOVES = new Set(["dragon-tail", "circle-throw"]);

// Movimientos que hacen daño Y ADEMÁS permiten (de forma obligatoria) a
// quien los usa cambiar de Pokémon justo después de golpear (Cambio de
// Voltios/Volt Switch, Ala Voltios no, U-turn). Mismas condiciones que
// DRAG_OUT_MOVES pero sobre el propio atacante en vez del objetivo.
const SWITCH_OUT_MOVES = new Set(["volt-switch", "u-turn"]);

// Placaje de Cuerpo (Body Press): movimiento físico que, en vez de usar el
// Ataque del atacante, usa su propia Defensa (con sus stages) como
// estadística ofensiva. Caso hardcodeado por nombre, igual que el resto de
// excepciones de esta sección: no hay forma estructurada de detectarlo vía
// la API.
const BODY_PRESS_MOVES = new Set(["body-press"]);

// Supercolmillo (Super Fang): daño fijo igual a la mitad de los PS ACTUALES
// del objetivo (no máximos), redondeado hacia abajo, ignorando la fórmula de
// daño normal (sin STAB/tipo/crítico salvo la inmunidad de tipo binaria,
// igual que los movimientos de FIXED_LEVEL_MOVES). Se marca con
// specialDamage="fixed-half-hp" en resolveVariablePower.
const SUPER_FANG_MOVES = new Set(["super-fang"]);

// Bostezo (Yawn): no aplica sueño de inmediato, sino que marca al objetivo
// con un contador que lo duerme al FINAL DEL TURNO SIGUIENTE (ver tickYawn),
// si para entonces sigue en combate, no ha sido cambiado y no tiene ya otro
// estado no volátil.
const YAWN_MOVES = new Set(["yawn"]);

// Movimientos de "dos turnos con invulnerabilidad" (Golpe Fantasma/Phantom
// Force; Cavar/Fly/Dig comparten la misma mecánica real pero no están en el
// roster actual, así que no se incluyen aquí todavía — añadir su nombre a
// este set basta para extenderlo en el futuro sin más cambios). El primer
// turno el usuario "desaparece" (invulnerable, sin daño); el segundo se
// repite el mismo movimiento automáticamente (reutilizando lockedMove, el
// mismo campo que ya usan los movimientos de furia) y golpea con normalidad.
const TWO_TURN_MOVES = new Set(["phantom-force"]);

// Viento Afín (Tailwind): duplica la Velocidad de TODO el equipo del
// entrenador que lo usa (no solo el Pokémon activo) durante 4 turnos. Es un
// efecto de "lado del combate" (por trainerId), no por Pokémon individual;
// se guarda en weather.tailwind = { [trainerId]: turnosRestantes }.
const TAILWIND_MOVES = new Set(["tailwind"]);

// Movimientos "drenadores" (meta.drain > 0, ej. Giga Drain/Absorber) que
// curan al atacante un % del daño infligido. Come Sueños comparte esa
// mecánica pero además exige que el objetivo esté dormido para siquiera
// impactar; el resto de drenadores no tienen ese requisito.
const SLEEP_ONLY_DRAIN_MOVES = new Set(["dream-eater"]);

// PokeAPI no distingue "mal envenenado" (Tóxico) de veneno normal: el campo
// meta.ailment.name de /move/toxic devuelve "poison" igual que cualquier
// movimiento venenoso normal (no existe "toxic" en el enum move-ailment).
// Es la única forma fiable de identificarlo, por nombre.
const TOXIC_MOVES = new Set(["toxic", "poison-fang"]);

// Movimientos que activan el clima de combate (a nivel de combate entero,
// no por Pokémon). No hay campo estructurado en PokeAPI que agrupe estos
// cuatro movimientos ni que diga a qué clima concreto corresponde cada uno,
// así que se identifica por nombre, igual que el resto de mecánicas
// especiales de este archivo.
const WEATHER_MOVES = { "sunny-day": "sun", "rain-dance": "rain", sandstorm: "sandstorm", hail: "hail" };

const WEATHER_META = {
  sun: { icon: "☀️", label: "Día Soleado", color: "#f2b705" },
  rain: { icon: "🌧️", label: "Lluvia", color: "#4a90d9" },
  sandstorm: { icon: "🌪️", label: "Tormenta de Arena", color: "#B8A038" },
  hail: { icon: "❄️", label: "Granizo", color: "#98D8D8" },
};

const WEATHER_START_TEXT = {
  sun: "¡El campo de batalla se ha llenado de un fuerte rayo de sol!",
  rain: "¡Ha comenzado a llover con fuerza sobre el campo de batalla!",
  sandstorm: "¡Se ha levantado una tormenta de arena!",
  hail: "¡Ha comenzado a granizar con fuerza!",
};

const WEATHER_CONTINUE_TEXT = {
  sun: "El sol sigue brillando intensamente",
  rain: "La lluvia sigue cayendo",
  sandstorm: "La tormenta de arena sigue azotando el campo",
  hail: "El granizo sigue cayendo",
};

const WEATHER_END_TEXT = {
  sun: "El sol ha dejado de brillar",
  rain: "La lluvia ha parado",
  sandstorm: "La tormenta de arena ha amainado",
  hail: "El granizo ha dejado de caer",
};

// Multiplicador de daño por clima: se aplica entre STAB y la efectividad de
// tipo, igual que en los juegos (solo afecta a movimientos de Fuego/Agua
// bajo Sol/Lluvia; Tormenta de Arena y Granizo no alteran el daño, solo
// causan daño residual al final del turno, ver applyWeatherResidualDamage).
function weatherDamageMultiplier(weather, moveType) {
  if (!weather || !weather.type) return 1;
  if (weather.type === "sun") {
    if (moveType === "fire") return 1.5;
    if (moveType === "water") return 0.5;
  } else if (weather.type === "rain") {
    if (moveType === "water") return 1.5;
    if (moveType === "fire") return 0.5;
  }
  return 1;
}

// Daño residual de Tormenta de Arena/Granizo al final del turno: 1/16 de
// los PS máximos, salvo para los tipos inmunes de cada clima.
function applyWeatherResidualDamage(poke, weather, turns) {
  if (!weather || !weather.type || poke.hp <= 0) return;
  const immuneTypes = weather.type === "sandstorm" ? ["rock", "ground", "steel"] : weather.type === "hail" ? ["ice"] : null;
  if (!immuneTypes) return;
  if (poke.types.some((t) => immuneTypes.includes(t))) return;
  const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
  poke.hp = Math.max(0, poke.hp - dmg);
  const stormLabel = weather.type === "sandstorm" ? "la tormenta de arena" : "el granizo";
  turns.push({ type: "statusText", text: `${poke.name} sufre daño por ${stormLabel}` });
  if (poke.hp <= 0) turns.push({ type: "faint", pokemon: poke.name });
}

// Al final de cada turno completo (ambos bandos ya actuaron, o bien se
// resolvió un cambio de Pokémon), el clima cuenta un turno menos, salvo el
// turno en el que se acaba de activar (justSet): ese primer turno no
// descuenta para que "5 turnos" dure realmente 5 turnos completos.
function tickWeatherDuration(weather, turns) {
  if (!weather || !weather.type) return;
  if (weather.justSet) {
    weather.justSet = false;
    return;
  }
  weather.turnsLeft -= 1;
  if (weather.turnsLeft <= 0) {
    turns.push({ type: "statusText", text: WEATHER_END_TEXT[weather.type] });
    weather.type = null;
    weather.turnsLeft = 0;
  } else {
    turns.push({ type: "statusText", text: WEATHER_CONTINUE_TEXT[weather.type] });
  }
}

/* ---------------------------------------------------------------
   CAMPOS DE BATALLA (TERRAIN)
--------------------------------------------------------------- */

// Movimientos que activan un campo de batalla (a nivel de combate entero,
// afecta a ambos entrenadores por igual, sustituye a cualquier campo
// anterior en vez de apilarse). Mismo patrón de identificación por nombre
// que WEATHER_MOVES.
const TERRAIN_MOVES = {
  "electric-terrain": "electric",
  "grassy-terrain": "grassy",
  "misty-terrain": "misty",
  "psychic-terrain": "psychic",
};

const TERRAIN_META = {
  electric: { icon: "⚡", label: "Campo Eléctrico", color: TYPE_COLORS.electric },
  grassy: { icon: "🌿", label: "Campo de Hierba", color: TYPE_COLORS.grass },
  misty: { icon: "🌫️", label: "Campo de Niebla", color: TYPE_COLORS.fairy },
  psychic: { icon: "🔮", label: "Campo Psíquico", color: TYPE_COLORS.psychic },
};

const TERRAIN_START_TEXT = {
  electric: "¡Ha aparecido un Campo Eléctrico bajo los pies de los combatientes!",
  grassy: "¡Ha crecido un Campo de Hierba bajo los pies de los combatientes!",
  misty: "¡Una Niebla misteriosa ha cubierto el campo de batalla!",
  psychic: "¡El campo de batalla se ha vuelto extraño gracias al Campo Psíquico!",
};

const TERRAIN_CONTINUE_TEXT = {
  electric: "El Campo Eléctrico sigue crepitando",
  grassy: "El Campo de Hierba sigue creciendo",
  misty: "La niebla del campo sigue presente",
  psychic: "El Campo Psíquico sigue activo",
};

const TERRAIN_END_TEXT = {
  electric: "El Campo Eléctrico ha desaparecido",
  grassy: "El Campo de Hierba ha desaparecido",
  misty: "La niebla del campo se ha disipado",
  psychic: "El Campo Psíquico ha desaparecido",
};

// El proyecto no modela vuelo/levitación de forma explícita: se usa como
// aproximación razonable que cualquier Pokémon de tipo Volador "no toca el
// suelo" y por tanto no se ve afectado por ningún campo de batalla; el resto
// de Pokémon se consideran "con los pies en el suelo" sin excepción.
function isGrounded(poke) {
  return !poke.types.includes("flying");
}

// Potencia x1.3 a los movimientos del tipo asociado al campo activo, solo si
// quien ataca está "con los pies en el suelo" (el campo boostea a quien lo
// pisa, no a quien recibe el golpe).
function terrainPowerMultiplier(weather, move, attacker) {
  if (!weather?.terrainType || !isGrounded(attacker)) return 1;
  if (weather.terrainType === "electric" && move.type === "electric") return 1.3;
  if (weather.terrainType === "grassy" && move.type === "grass") return 1.3;
  if (weather.terrainType === "psychic" && move.type === "psychic") return 1.3;
  return 1;
}

// Campo de Hierba debilita a la mitad Terremoto/Magnitud/Excavar contra un
// objetivo en el suelo; Campo de Niebla debilita a la mitad los movimientos
// de tipo Dragón contra un objetivo en el suelo. Aquí el que importa es el
// DEFENSOR (el campo protege a quien lo pisa del golpe, no a quien ataca).
const GRASSY_TERRAIN_WEAKENED_MOVES = new Set(["earthquake", "magnitude", "bulldoze"]);
function terrainDamageReductionMultiplier(weather, move, defender) {
  if (!weather?.terrainType || !isGrounded(defender)) return 1;
  if (weather.terrainType === "grassy" && GRASSY_TERRAIN_WEAKENED_MOVES.has(move.name)) return 0.5;
  if (weather.terrainType === "misty" && move.type === "dragon") return 0.5;
  return 1;
}

// Campo Eléctrico: los Pokémon en el suelo no pueden quedarse dormidos por
// ningún medio (ni Bostezo, ni un movimiento de sueño directo).
function terrainBlocksSleep(weather, poke) {
  return weather?.terrainType === "electric" && isGrounded(poke);
}

// Campo de Niebla: los Pokémon en el suelo no pueden recibir NINGÚN estado
// no volátil nuevo ni ser confundidos.
function terrainBlocksStatus(weather, poke) {
  return weather?.terrainType === "misty" && isGrounded(poke);
}

// Campo Psíquico: los movimientos con prioridad > 0 dirigidos a un objetivo
// en el suelo fallan automáticamente.
function terrainBlocksPriorityAgainst(weather, defender) {
  return weather?.terrainType === "psychic" && isGrounded(defender);
}

// Campo de Hierba: los Pokémon en el suelo recuperan 1/16 de sus PS máximos
// al final de cada turno.
function applyGrassyTerrainHeal(poke, weather, turns) {
  if (weather?.terrainType !== "grassy" || poke.hp <= 0 || poke.hp >= poke.maxHp || !isGrounded(poke)) return;
  const heal = Math.max(1, Math.floor(poke.maxHp / 16));
  poke.hp = Math.min(poke.maxHp, poke.hp + heal);
  turns.push({ type: "statusText", text: `${poke.name} recupera PS gracias al Campo de Hierba` });
}

// Mismo patrón que tickWeatherDuration (5 turnos completos, el turno de
// activación no descuenta), pero para el campo de batalla, guardado en las
// mismas propiedades weather.terrain* del objeto de clima/campo compartido.
function tickTerrainDuration(weather, turns) {
  if (!weather || !weather.terrainType) return;
  if (weather.terrainJustSet) {
    weather.terrainJustSet = false;
    return;
  }
  weather.terrainTurnsLeft -= 1;
  if (weather.terrainTurnsLeft <= 0) {
    turns.push({ type: "statusText", text: TERRAIN_END_TEXT[weather.terrainType] });
    weather.terrainType = null;
    weather.terrainTurnsLeft = 0;
  } else {
    turns.push({ type: "statusText", text: TERRAIN_CONTINUE_TEXT[weather.terrainType] });
  }
}

// Viento Afín: se guarda como weather.tailwind = { [trainerId]: turnos },
// independiente de qué Pokémon esté activo en ese equipo. Se descuenta 1
// turno al final de cada turno completo para cada entrenador que lo tenga
// activo, y se elimina la entrada al llegar a 0 (sin mensaje de "continúa",
// ya que el indicador visual ya muestra los turnos restantes en todo
// momento).
function tickTailwindDuration(weather, turns) {
  if (!weather || !weather.tailwind) return;
  for (const trainerId of Object.keys(weather.tailwind)) {
    weather.tailwind[trainerId] -= 1;
    if (weather.tailwind[trainerId] <= 0) {
      delete weather.tailwind[trainerId];
      const t = TRAINERS.find((tr) => tr.id === trainerId);
      turns.push({ type: "statusText", text: `El Viento Afín ha dejado de soplar para el equipo de ${t ? t.name : trainerId}` });
    }
  }
}

// Bostezo (Yawn): al final del turno SIGUIENTE al que se aplicó (no el
// mismo turno), si el objetivo sigue en combate y no tiene ya otro estado no
// volátil, se queda dormido (respetando las mismas protecciones de campo que
// cualquier otro sueño). poke.yawnTurns se inicializa a 2 al aplicarse: el
// primer tick (fin del turno en que se usó) lo baja a 1 sin activar nada, el
// segundo tick (fin del turno siguiente) lo baja a 0 y aplica el sueño.
function tickYawn(poke, turns, weather) {
  if (!poke.yawnTurns || poke.hp <= 0) return;
  poke.yawnTurns -= 1;
  if (poke.yawnTurns > 0) return;
  poke.yawnTurns = 0;
  if (poke.status) return;
  if (terrainBlocksSleep(weather, poke)) {
    turns.push({ type: "statusText", text: `¡${poke.name} tenía sueño, pero el Campo Eléctrico se lo impide!` });
    return;
  }
  if (terrainBlocksStatus(weather, poke)) {
    turns.push({ type: "statusText", text: `¡${poke.name} tenía sueño, pero el Campo de Niebla se lo impide!` });
    return;
  }
  poke.status = "sleep";
  poke.sleepTurns = 1 + Math.floor(Math.random() * 3);
  turns.push({ type: "statusText", text: `¡${poke.name} se ha quedado dormido!` });
}

// Restaura el estado que debe perderse al salir del campo de batalla, tanto
// en un cambio voluntario (resolveSwitchTurn) como en uno forzado por un
// movimiento (Cola Dragón sobre el rival, o el autocambio de Cambio de
// Voltios/U-turn): stages de stat, Protección/su racha, el contador
// creciente de Tóxico, el flag de Bostezo pendiente, la confusión (item 8:
// no debe persistir al cambiar), y cualquier bloqueo de furia/carga en
// curso (un Pokémon forzado a salir a mitad de Enfado o de la fase de carga
// de Golpe Fantasma pierde ese estado, igual que en los juegos reales).
function resetPokemonOnSwitchOut(poke) {
  poke.statStages = { attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0, accuracy: 0, evasion: 0 };
  poke.protected = false;
  poke.protectChain = 0;
  poke.toxicCounter = 0;
  poke.yawnTurns = 0;
  poke.confusionTurns = 0;
  poke.lockedMove = null;
  poke.lockedTurnsRemaining = 0;
  poke.invulnerable = false;
}

/* ---------------------------------------------------------------
   FIN CAMPOS DE BATALLA
--------------------------------------------------------------- */

// PokeAPI no expone ningún campo que marque a Persecución como especial: su
// mecánica real (golpea primero y a doble potencia contra un objetivo que
// se está cambiando) se resuelve a mano en resolveSwitchTurn.
const PURSUIT_MOVES = new Set(["pursuit"]);

// Reparte el número de golpes de un movimiento de golpes múltiples según la
// probabilidad vigente desde la Gen V (35/35/15/15 para 2/3/4/5 golpes,
// el caso estándar con min_hits=2/max_hits=5). Si algún movimiento futuro
// tuviera un rango distinto, cae a un sorteo uniforme dentro de ese rango.
function rollMultiHitCount(minHits, maxHits) {
  if (minHits === 2 && maxHits === 5) {
    const r = Math.random() * 100;
    if (r < 35) return 2;
    if (r < 70) return 3;
    if (r < 85) return 4;
    return 5;
  }
  return minHits + Math.floor(Math.random() * (maxHits - minHits + 1));
}

// El `target` de PokeAPI describe solo a quién va el DAÑO del movimiento;
// para esta familia viene como "selected-pokemon" (el rival) igual que
// cualquier movimiento de daño normal, pero el movimiento en realidad se
// autobaja una stat propia al atacar como coste (no hay ningún movimiento
// real que "suba una stat del rival" al golpearlo, así que ese caso
// positivo ya se resuelve de forma genérica más abajo por el signo del
// cambio; esta lista cubre solo la excepción de bajada de stat propia).
// IMPORTANTE: esto NO debe confundirse con `move.selfTargeted` (que sigue
// reflejando fielmente target.name==="user" tal cual lo da la API): estos
// movimientos SÍ dañan al rival y SÍ deben poder ser bloqueados por
// Protección igual que cualquier otro golpe, solo su stat_changes va al
// propio atacante. Por eso viven en una lista aparte, usada únicamente al
// resolver a quién afecta cada stat_changes, nunca para decidir si el
// movimiento ataca al rival o si Protección lo bloquea.
const DAMAGE_MOVE_SELF_STAT_CHANGES = new Set([
  "draco-meteor", "leaf-storm", "overheat", "psycho-boost", "fleur-cannon",
  "close-combat", "superpower", "hammer-arm",
]);

// Comprueba si un Pokémon puede actuar este turno (recarga, parálisis,
// sueño, congelación) y resuelve la confusión (33% de golpearse a sí
// mismo). Devuelve false si el Pokémon no llega a ejecutar su movimiento
// este turno.
function statusPreMoveCheck(poke, turns) {
  // Amedrentar (flinch): solo tiene efecto si el objetivo no ha actuado
  // todavía este turno cuando lo recibe (por eso se comprueba aquí, al
  // principio del turno del propio Pokémon, y se limpia siempre al final
  // de resolveTurn/resolveSwitchTurn — si ya había actuado antes de que se
  // lo aplicaran, el flag queda sin consumir y se descarta sin más).
  if (poke.flinched) {
    poke.flinched = false;
    turns.push({ type: "statusText", text: `¡${poke.name} se encogió de miedo y no puede moverse!` });
    return false;
  }

  if (poke.mustRecharge) {
    poke.mustRecharge = false;
    turns.push({ type: "statusText", text: `${poke.name} debe descansar y no puede atacar este turno` });
    return false;
  }

  if (poke.status === "freeze") {
    if (Math.random() < 0.2) {
      poke.status = null;
      turns.push({ type: "statusText", text: `${poke.name} se ha descongelado` });
    } else {
      turns.push({ type: "statusText", text: `${poke.name} está congelado y no puede moverse` });
      return false;
    }
  } else if (poke.status === "sleep") {
    // El turno en el que el Pokémon se queda dormido (golpeado por el
    // rival) no cuenta como un turno de sueño "perdido": si a este Pokémon
    // le toca actuar dentro del mismo resolveTurn en que se durmió, pierde
    // el turno sin gastar contador (se consume abajo, en resolveTurn, si
    // no se usa aquí). A partir de su siguiente turno real, se comprueba
    // el contador ANTES de decrementar para que un valor de 1-3 turnos
    // produzca exactamente esa cantidad de turnos dormido, ni uno menos.
    if (poke.justFellAsleep) {
      turns.push({ type: "statusText", text: `${poke.name} está profundamente dormido y no puede atacar` });
      return false;
    }
    if (poke.sleepTurns > 0) {
      poke.sleepTurns -= 1;
      turns.push({ type: "statusText", text: `${poke.name} está profundamente dormido y no puede atacar` });
      return false;
    } else {
      poke.status = null;
      poke.sleepTurns = 0;
      turns.push({ type: "statusText", text: `¡${poke.name} se ha despertado!` });
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

// Daño de fin de turno por quemadura/veneno/veneno grave (Tóxico). El de
// Tóxico crece: 1/16 el primer turno que se aplica, 2/16 el siguiente,
// 3/16 el de después... usando toxicCounter (se reinicia a 0 al salir del
// combate por un cambio, así que si vuelve a entrar el conteo arranca de
// nuevo en 1/16, no continúa el anterior).
function applyResidualStatusDamage(poke, turns) {
  if (poke.hp <= 0) return;
  if (poke.status === "burn") {
    const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
    poke.hp = Math.max(0, poke.hp - dmg);
    turns.push({ type: "statusText", text: `${poke.name} sufre el daño de la quemadura` });
  } else if (poke.status === "poison") {
    const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
    poke.hp = Math.max(0, poke.hp - dmg);
    turns.push({ type: "statusText", text: `${poke.name} sufre el daño del veneno` });
  } else if (poke.status === "toxic") {
    const tick = Math.max(1, poke.toxicCounter || 0);
    const dmg = Math.max(1, Math.floor((poke.maxHp * tick) / 16));
    poke.hp = Math.max(0, poke.hp - dmg);
    poke.toxicCounter = tick + 1;
    turns.push({ type: "statusText", text: `${poke.name} sufre el daño del veneno grave` });
  } else {
    return;
  }
  if (poke.hp <= 0) turns.push({ type: "faint", pokemon: poke.name });
}

// Drenado/retroceso (meta.drain de PokeAPI): positivo cura al atacante un %
// del daño infligido (Giga Drain, Absorber, Come Sueños...), negativo le
// resta un % de ese mismo daño como retroceso (Envite Ígneo, Placaje,
// Golpe Cabeza...). Solo se llama cuando el golpe conectó de verdad
// (damage>0 y mult>0): si el movimiento falló por precisión o quedó
// bloqueado por Protección, no hay daño infligido y por tanto tampoco
// drenado ni retroceso. El retroceso puede debilitar al propio atacante
// (correcto, ocurre también en los juegos reales); en ese caso se añade un
// evento de debilitamiento para que resolveTurn/resolveSwitchTurn lo
// reflejen en el log igual que cualquier otro debilitamiento.
function applyDrainOrRecoil(attacker, damage, move, events) {
  if (!move.drain || damage <= 0) return;
  if (move.drain > 0) {
    const heal = Math.floor((damage * move.drain) / 100);
    if (heal > 0) {
      const before = attacker.hp;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      if (attacker.hp > before) {
        events.push({ type: "statusText", text: `¡${attacker.name} restauró PS gracias a ${displayMoveName(move.name)}!`, inline: false });
      }
    }
  } else {
    const recoil = Math.floor((damage * Math.abs(move.drain)) / 100);
    if (recoil > 0) {
      attacker.hp = Math.max(0, attacker.hp - recoil);
      events.push({ type: "statusText", text: `¡${attacker.name} se resiente por el retroceso! (-${recoil} PS)`, inline: false });
      if (attacker.hp <= 0) events.push({ type: "faint", pokemon: attacker.name });
    }
  }
}

// Aplica el ailment (parálisis/quemadura/veneno/sueño/congelación/confusión)
// y los stat_changes de un movimiento ya acertado. Devuelve las entradas de
// log generadas; `inline: true` marca un cambio de stat en el propio usuario
// (se puede fusionar con la línea "X usó Y" en el log de combate).
// `mult` es el multiplicador de tipo ya calculado por computeDamage: si es 0
// (el rival es inmune) y el movimiento no es de estado ni se dirige a uno
// mismo, no debe aplicar NINGÚN efecto secundario sobre el rival (ni
// ailment ni stat_changes), igual que en los juegos. Los cambios sobre uno
// mismo (target "user") no se ven afectados por la inmunidad del rival NI
// por si el golpe deja al rival a 0 PS (`defenderFainted`): un movimiento
// como Draco Meteor baja el Ataque Especial de quien lo usa aunque ese
// mismo golpe debilite al rival.
function applyMoveEffects(attacker, defender, move, mult = 1, defenderFainted = false, weather = null) {
  const events = [];
  const isStatusMove = move.damageClass === "status";
  const target = move.selfTargeted ? attacker : defender;
  const targetsOpponent = !move.selfTargeted;

  if (targetsOpponent && !isStatusMove && mult === 0) {
    events.push({ type: "statusText", text: `No afectó a ${defender.name} (inmune)`, inline: false });
    return events;
  }

  // Si el golpe debilitó al rival, no tiene sentido aplicarle ailments (no
  // se puede paralizar/quemar/confundir algo ya fuera de combate) — pero
  // eso NO debe tocar los efectos que van sobre el PROPIO atacante: la
  // bajada de stat de Combate Cercano, Proeza, Meteoro Dragón... (o la
  // curación por drenaje de Come Sueños/Giga Drain) ocurre por el mero
  // hecho de haber atacado, sea o no letal para el rival. Por eso este
  // "saltar si se debilitó" solo se aplica al bloque de ailment (que va
  // sobre `target`, el rival salvo en movimientos realmente selfTargeted);
  // los stat_changes se filtran uno a uno más abajo, según a quién vaya
  // cada uno en concreto.
  const skipAilment = targetsOpponent && defenderFainted;

  if (!skipAilment && move.ailmentName && move.ailmentName !== "none") {
    const chance = move.ailmentChance > 0 ? move.ailmentChance : (isStatusMove ? 100 : 0);
    if (chance > 0 && Math.random() * 100 < chance) {
      if (move.ailmentName === "confusion") {
        if (!target.confusionTurns) {
          if (terrainBlocksStatus(weather, target)) {
            events.push({ type: "statusText", text: `¡El Campo de Niebla protege a ${target.name} de la confusión!`, inline: false });
          } else {
            target.confusionTurns = 1 + Math.floor(Math.random() * 4);
            events.push({ type: "statusText", text: `${target.name} ha quedado confundido`, inline: false });
          }
        }
      } else if (AILMENT_APPLY_TEXT[move.ailmentName] && !target.status) {
        if (move.ailmentName === "sleep" && terrainBlocksSleep(weather, target)) {
          events.push({ type: "statusText", text: `¡El Campo Eléctrico evita que ${target.name} se duerma!`, inline: false });
        } else if (terrainBlocksStatus(weather, target)) {
          events.push({ type: "statusText", text: `¡El Campo de Niebla protege a ${target.name} de los estados alterados!`, inline: false });
        } else {
          target.status = move.ailmentName;
          if (move.ailmentName === "sleep") {
            target.sleepTurns = 1 + Math.floor(Math.random() * 3);
            target.justFellAsleep = true;
          }
          if (move.ailmentName === "toxic") {
            target.toxicCounter = 1;
          }
          events.push({ type: "statusText", text: `${target.name} ${AILMENT_APPLY_TEXT[move.ailmentName]}`, inline: false });
        }
      }
    }
  }

  if (move.statChanges && move.statChanges.length) {
    const chance = isStatusMove ? 100 : (move.statChance > 0 ? move.statChance : 0);
    if (chance > 0 && Math.random() * 100 < chance) {
      // Solo el PRIMER cambio de stat sobre uno mismo se marca `inline`
      // (resolveTurn fusiona como mucho un evento inline en la línea "usó
      // X"); si un movimiento como Combate Cercano baja dos stats propias
      // a la vez, el segundo evento se muestra como línea aparte pero con
      // el nombre explícito, para no dejar un "su Defensa bajó" ambiguo
      // colgando justo después de haber nombrado al rival en la línea del
      // golpe.
      let selfInlineUsed = false;
      for (const sc of move.statChanges) {
        // En un movimiento de daño, una SUBIDA de stat en los datos de la
        // API siempre es sobre quien ataca (no existe ningún movimiento
        // real que "suba una stat del rival" como efecto secundario de
        // golpearlo, ej. Meteor Mash, Ancient Power, Steel Wing...); una
        // bajada respeta el target ya resuelto para el movimiento (el
        // rival), salvo los de DAMAGE_MOVE_SELF_STAT_CHANGES (Combate
        // Cercano, Proeza, Meteoro Dragón...), que bajan una stat propia
        // como coste pese a dañar al rival.
        const scTarget = (!isStatusMove && (sc.change > 0 || DAMAGE_MOVE_SELF_STAT_CHANGES.has(move.name))) ? attacker : target;
        // Igual que con el ailment: si este cambio concreto va sobre el
        // rival y ya quedó debilitado por el golpe, se omite; si va sobre
        // el propio atacante, se aplica siempre (el rival esté o no
        // debilitado no cambia nada sobre lo que le pasa a quien atacó).
        if (scTarget !== attacker && defenderFainted) continue;
        if (!(sc.stat in scTarget.statStages)) continue;
        const before = scTarget.statStages[sc.stat];
        const after = Math.max(-6, Math.min(6, before + sc.change));
        scTarget.statStages[sc.stat] = after;
        if (after === before) {
          // El stage ya estaba en el límite (-6/+6) en la misma dirección
          // del cambio: no tiene ningún efecto, se avisa igual que en los
          // juegos reales.
          if (sc.change > 0 && before === 6) {
            const article = STAT_ARTICLE_ES[sc.stat] === "el" ? "El" : "La";
            events.push({ type: "statusText", text: `¡${article} ${STAT_ES[sc.stat]} de ${scTarget.name} ya no puede subir más!`, inline: false });
          } else if (sc.change < 0 && before === -6) {
            const article = STAT_ARTICLE_ES[sc.stat] === "el" ? "El" : "La";
            events.push({ type: "statusText", text: `¡${article} ${STAT_ES[sc.stat]} de ${scTarget.name} ya no puede bajar más!`, inline: false });
          }
          continue;
        }
        if (scTarget === attacker && !selfInlineUsed) {
          selfInlineUsed = true;
          events.push({ type: "statusText", text: `su ${STAT_ES[sc.stat]} ${statChangeText(sc.change)}`, inline: true });
        } else if (scTarget === attacker) {
          const article = STAT_ARTICLE_ES[sc.stat] === "el" ? "El" : "La";
          events.push({ type: "statusText", text: `¡${article} ${STAT_ES[sc.stat]} de ${scTarget.name} también ${statChangeText(sc.change)}!`, inline: false });
        } else {
          events.push({ type: "statusText", text: `${scTarget.name}: ${STAT_ARTICLE_ES[sc.stat]} ${STAT_ES[sc.stat]} ${statChangeText(sc.change)}`, inline: false });
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
// Los cuatro fulminantes (horn-drill/guillotine/fissure/sheer-cold) tenían
// aquí una potencia fija de 150 en una implementación anterior; ya NO se
// tratan como movimientos de daño normal (ver OHKO_MOVES/isOHKO más abajo),
// así que se quitan de esta lista para que su `power` se quede en null.
const FIXED_POWER_OVERRIDES = { bide: 100 };
const SPEED_RATIO_MOVES = new Set(["electro-ball", "gyro-ball"]);
const FIXED_LEVEL_MOVES = new Set(["night-shade", "seismic-toss"]);

// Hierba Lazo (Grass Knot) y Patada Baja (Low Kick): su potencia real
// depende del PESO del OBJETIVO (no del atacante), no del `power` que da la
// API — que además no viene como null para estos dos (a diferencia de los
// casos de arriba), sino como un valor "placeholder" (1) que NO representa
// su potencia real; por eso este chequeo va ANTES del `entry.power != null`
// de más abajo, si no, nunca se llegaría a activar. Tabla oficial (idéntica
// para ambos movimientos desde que Patada Baja pasó a depender del peso en
// la Gen III): resuelta en tiempo de combate por weightBasedPower(), ya que
// necesita el peso del objetivo, que solo se conoce al ejecutar el golpe.
const WEIGHT_BASED_POWER_MOVES = new Set(["grass-knot", "low-kick"]);

function resolveVariablePower(entry) {
  if (WEIGHT_BASED_POWER_MOVES.has(entry.name)) return { ...entry, specialDamage: "weight-based" };
  if (entry.power != null || entry.damageClass === "status") return entry;
  if (SPEED_RATIO_MOVES.has(entry.name)) return { ...entry, specialDamage: "speed-ratio" };
  if (FIXED_LEVEL_MOVES.has(entry.name)) return { ...entry, specialDamage: "fixed-level" };
  if (SUPER_FANG_MOVES.has(entry.name)) return { ...entry, specialDamage: "fixed-half-hp" };
  if (FIXED_POWER_OVERRIDES[entry.name] != null) return { ...entry, power: FIXED_POWER_OVERRIDES[entry.name] };
  return entry;
}

// Tabla oficial de potencia según el peso del objetivo (en kg). weightKg
// puede faltar si el fetch de /pokemon/{slug} falló y se usó el fallback sin
// peso (ver getPokemon): 60kg de fallback da una potencia media (80),
// razonable para no penalizar ni beneficiar el golpe en ese caso raro.
function weightBasedPower(weightKg) {
  const w = weightKg ?? 60;
  if (w < 10) return 20;
  if (w < 25) return 40;
  if (w < 50) return 60;
  if (w < 100) return 80;
  if (w < 200) return 100;
  return 120;
}

function moveEffectSummary(move) {
  const parts = [];
  if (move.ailmentName && move.ailmentName !== "none" && AILMENT_VERB[move.ailmentName]) {
    const pct = move.ailmentChance > 0 ? move.ailmentChance : 100;
    const who = move.selfTargeted ? " (a sí mismo)" : "";
    parts.push((pct >= 100 ? `${AILMENT_VERB[move.ailmentName]} siempre` : `${AILMENT_VERB[move.ailmentName]} (${pct}%)`) + who);
  }
  if (move.statChanges && move.statChanges.length) {
    const pct = move.damageClass === "status" ? null : (move.statChance > 0 ? move.statChance : null);
    // Misma regla que en applyMoveEffects: en un movimiento de daño, una
    // subida de stat siempre es sobre quien ataca aunque move.selfTargeted
    // sea false (ej. Meteor Mash, Ancient Power, Steel Wing...), y los de
    // DAMAGE_MOVE_SELF_STAT_CHANGES (Combate Cercano, Proeza...) bajan una
    // stat propia como coste pese a no ser selfTargeted tampoco.
    const allSelf = move.statChanges.every((sc) =>
      move.selfTargeted || (move.damageClass !== "status" && sc.change > 0) || DAMAGE_MOVE_SELF_STAT_CHANGES.has(move.name)
    );
    const who = allSelf ? "Propio: " : "Rival: ";
    const txt = move.statChanges.map((sc) => `${STAT_ES[sc.stat] || sc.stat} ${statChangeText(sc.change)}`).join(", ");
    parts.push(who + (pct ? `${txt} (${pct}%)` : txt));
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
  const learnableMovesCache = useRef({});

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
        // /pokemon/{slug} da el peso en hectogramos; se convierte a kg aquí,
        // una única vez, para que el resto del motor (weightBasedPower) ya
        // trabaje directamente en kg.
        weightKg: typeof data.weight === "number" ? data.weight / 10 : null,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || null,
        shinySprite: data.sprites?.other?.["official-artwork"]?.front_shiny || data.sprites?.front_shiny || null,
      };
      pokeCache.current[slug] = entry;
      return entry;
    } catch (e) {
      const fallback = {
        slug, name: displayName(slug), types: ["normal"],
        stats: { hp: 70, attack: 70, defense: 70, "special-attack": 70, "special-defense": 70, speed: 70 },
        weightKg: null,
        sprite: null, shinySprite: null,
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
      // La API no distingue Tóxico de veneno normal (ambos dan "poison" en
      // meta.ailment.name); se identifica por nombre via TOXIC_MOVES.
      const ailmentName = TOXIC_MOVES.has(data.name) && rawAilment === "poison" ? "toxic" : rawAilment;
      const entry = resolveVariablePower({
        name: data.name,
        power: data.power,
        accuracy: data.accuracy,
        pp: data.pp,
        type: data.type.name,
        damageClass: data.damage_class?.name || "physical",
        priority: data.priority || 0,
        ailmentName,
        ailmentChance: data.meta?.ailment_chance ?? 0,
        statChanges: (data.stat_changes || []).map((sc) => ({ stat: sc.stat.name, change: sc.change })),
        statChance: data.meta?.stat_chance ?? 0,
        selfTargeted: data.target?.name === "user",
        drain: data.meta?.drain ?? 0,
        // meta.category "ohko" es un campo estructurado fiable (a diferencia
        // de la recarga o la furia, que no tienen ninguno propio).
        isOHKO: data.meta?.category?.name === "ohko",
        flinchChance: data.meta?.flinch_chance ?? 0,
        minHits: data.meta?.min_hits ?? null,
        maxHits: data.meta?.max_hits ?? null,
        description: buildMoveDescription(data),
      });
      moveCache.current[name] = entry;
      return entry;
    } catch (e) {
      const entry = {
        name, power: 40, accuracy: 100, pp: 35, type: "normal", damageClass: "physical", priority: 0,
        ailmentName: "none", ailmentChance: 0, statChanges: [], statChance: 0, selfTargeted: false, drain: 0,
        isOHKO: false, flinchChance: 0, minHits: null, maxHits: null,
        description: "Sin descripción disponible para este movimiento.",
      };
      moveCache.current[name] = entry;
      return entry;
    }
  }, []);

  // Moveset fijo del anime para esta combinación entrenador+Pokémon; si no
  // existe, cae a movimientos genéricos de daño por tipo, y siempre se
  // rellena con Tackle/Struggle si faltan movimientos o ninguno hace daño.
  //
  // `difficulty` decide qué TABLA de movesets fijos se usa para la CPU:
  // Normal usa siempre TRAINER_MOVESETS (sin cambios); Difícil/Maestro usan
  // TRAINER_MOVESETS_ADVANCED (con sinergia de equipo), cayendo a
  // TRAINER_MOVESETS si ese Pokémon en concreto no tuviera entrada ahí. Se
  // cachea por separado para cada tier ("normal"/"advanced": ver
  // `tierCacheKey`) para que jugar un torneo en una dificultad no deje en
  // caché el moveset equivocado para la siguiente vez que el mismo
  // entrenador aparezca con la otra dificultad.
  //
  // ANTES de mirar la tabla que corresponda por dificultad, se comprueba la
  // entrada "primed:" (ver primeMoveset/clearPrimedMovesets): así, el
  // entrenador propio, la Ruleta Pokémon, o un entrenador comprado que el
  // USUARIO esté jugando siempre usan su moveset real (editado o no) sin
  // que la dificultad de la CPU les afecte nunca, tal y como pide el
  // pedido ("Este segundo conjunto se aplica únicamente a la CPU").
  const getMoveset = useCallback(async (trainerId, slug, difficulty = "normal") => {
    const primedKey = `primed:${trainerId}:${slug}`;
    if (movesetCache.current[primedKey]) return movesetCache.current[primedKey];

    const tier = (difficulty === "hard" || difficulty === "master") ? "advanced" : "normal";
    const tierCacheKey = `${tier}:${trainerId}:${slug}`;
    if (movesetCache.current[tierCacheKey]) return movesetCache.current[tierCacheKey];

    const plainKey = `${trainerId}:${slug}`;
    let chosenNames = tier === "advanced"
      ? (TRAINER_MOVESETS_ADVANCED[plainKey] || TRAINER_MOVESETS[plainKey])
      : TRAINER_MOVESETS[plainKey];
    if (!chosenNames) {
      const poke = await getPokemon(slug);
      const primaryType = poke.types[0];
      chosenNames = (DEFAULT_MOVES_BY_TYPE[primaryType] || DEFAULT_MOVES_BY_TYPE.normal).slice(0, 4);
    }
    const moves = await Promise.all(chosenNames.map((n) => getMove(n)));
    while (moves.length < 4) {
      moves.push(await getMove(moves.length === 3 ? "tackle" : "struggle"));
    }
    const hasDamage = moves.some((m) => m.damageClass !== "status" && (m.power || m.specialDamage || m.isOHKO));
    if (!hasDamage) {
      moves[moves.length - 1] = await getMove("tackle");
    }
    movesetCache.current[tierCacheKey] = moves;
    return moves;
  }, [getPokemon, getMove]);

  // Precarga movesetCache para trainerId:slug con un moveset YA decidido de
  // antemano: el entrenador propio (con los movimientos de su colección de
  // gacha), la Ruleta Pokémon (aleatorios pero aprendibles), o un
  // entrenador COMPRADO que el usuario ha editado (ver item 5). Se guarda
  // bajo un namespace "primed:" aparte de los tiers normal/advanced (ver
  // getMoveset), que SIEMPRE se comprueba primero: así el equipo que
  // controla el propio usuario nunca se ve afectado por la dificultad de
  // la CPU elegida para esa partida.
  const primeMoveset = useCallback(async (trainerId, slug, moveNames) => {
    const moves = await Promise.all(moveNames.map((n) => getMove(n)));
    movesetCache.current[`primed:${trainerId}:${slug}`] = moves;
  }, [getMove]);

  // Se llama al empezar CADA torneo, antes de volver a primar lo que haga
  // falta para el equipo del propio usuario en esa partida concreta: sin
  // esto, un moveset "primed:" de una partida anterior (por ejemplo, el
  // usuario jugó una vez con Lance editando su Dragonite) se quedaría en
  // caché para siempre y contaminaría una partida FUTURA en la que Lance
  // aparezca como CPU normal, ignorando por completo TRAINER_MOVESETS/
  // TRAINER_MOVESETS_ADVANCED para él (justo lo que el pedido pide evitar).
  const clearPrimedMovesets = useCallback(() => {
    for (const key of Object.keys(movesetCache.current)) {
      if (key.startsWith("primed:")) delete movesetCache.current[key];
    }
  }, []);

  // Nombres de movimientos que una especie puede aprender realmente según
  // /pokemon/{slug} (level-up, huevo, tutor o MT/MO), para el moveset
  // aleatorio del gacha (a diferencia de getMoveset, que usa el moveset fijo
  // del anime o el genérico por tipo). Se cachea aparte, por especie.
  const getLearnableMoveNames = useCallback(async (slug) => {
    if (learnableMovesCache.current[slug]) return learnableMovesCache.current[slug];
    // Smeargle en la API real solo tiene Esquema (Sketch) como movimiento de
    // level-up (el resto de métodos tampoco le dan casi nada), lo que lo
    // dejaría prácticamente sin nada que aprender con la lógica normal de
    // abajo. En los juegos, gracias a Esquema, Smeargle puede copiar y
    // aprender de forma permanente CUALQUIER movimiento del juego: se trata
    // como caso especial aquí, en la única función de la que dependen tanto
    // el moveset aleatorio del gacha (assignRandomMoveset) como el editor de
    // movimientos de la colección (getLearnableMovesDetailed), así que
    // ambos heredan el pool ampliado sin ningún cambio propio.
    //
    // Se trae la lista de TODOS los movimientos existentes (solo nombres,
    // /move con límite alto) en una única petición ligera — mucho más barato
    // que consultar el detalle de cada uno. Para el editor de movimientos,
    // que sí resuelve el detalle de TODOS los nombres devueltos de golpe (a
    // diferencia del gacha, que ya recorta a 40 al azar antes de resolver
    // detalles), se recorta aquí a 400 movimientos para no disparar ~937
    // peticiones simultáneas la primera vez que se abre; se mezclan antes de
    // recortar para no sesgar hacia los movimientos más antiguos del juego
    // (la API los devuelve más o menos en orden de aparición histórica).
    if (slug === "smeargle") {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/move?limit=2000");
        const data = await res.json();
        // Se descartan las variantes técnicas "--physical"/"--special" de
        // los movimientos Z (guion doble): no son movimientos seleccionables
        // de verdad, solo entradas auxiliares de la propia API para calcular
        // su daño según el movimiento base, y confunden más que ayudan en
        // un selector pensado para elegir un movimiento real.
        const allNames = (data.results || []).map((m) => m.name).filter((n) => !n.includes("--"));
        for (let i = allNames.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allNames[i], allNames[j]] = [allNames[j], allNames[i]];
        }
        const names = allNames.slice(0, 400);
        learnableMovesCache.current[slug] = names;
        return names;
      } catch (e) {
        learnableMovesCache.current[slug] = [];
        return [];
      }
    }
    const validMethods = new Set(["level-up", "egg", "tutor", "machine"]);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
      const data = await res.json();
      const names = [...new Set(
        (data.moves || [])
          .filter((m) => m.version_group_details.some((d) => validMethods.has(d.move_learn_method.name)))
          .map((m) => m.move.name)
      )];
      learnableMovesCache.current[slug] = names;
      return names;
    } catch (e) {
      learnableMovesCache.current[slug] = [];
      return [];
    }
  }, []);

  // Lista completa de movimientos aprendibles de verdad por una especie, ya
  // resueltos con todos sus datos (tipo, categoría, potencia, precisión,
  // PP...), para el editor manual de movimientos de la colección. Reutiliza
  // getLearnableMoveNames + el moveCache ya existente vía getMove.
  const getLearnableMovesDetailed = useCallback(async (slug) => {
    const names = await getLearnableMoveNames(slug);
    const resolved = await Promise.all(names.map((n) => getMove(n)));
    return resolved.sort((a, b) => a.name.localeCompare(b.name));
  }, [getLearnableMoveNames, getMove]);

  // Moveset aleatorio pero aprendible de verdad para un Pokémon nuevo del
  // gacha: 4 movimientos al azar de entre los que la especie puede aprender,
  // priorizando que al menos 2 sean de daño real (para que el Pokémon no
  // quede inservible en combate); si el pool aprendible es muy reducido,
  // completa con Tackle/Struggle igual que getMoveset.
  const assignRandomMoveset = useCallback(async (slug) => {
    const names = await getLearnableMoveNames(slug);
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const resolved = await Promise.all(shuffled.slice(0, 40).map((n) => getMove(n)));
    const isDamaging = (m) => m.damageClass !== "status" && (m.power || m.specialDamage || m.isOHKO);
    const damaging = resolved.filter(isDamaging);
    const others = resolved.filter((m) => !isDamaging(m));

    const chosen = [];
    // Al menos 2 de daño real, si el pool aprendible los tiene.
    chosen.push(...damaging.slice(0, 2));
    const rest = [...damaging.slice(2), ...others].sort(() => Math.random() - 0.5);
    for (const m of rest) {
      if (chosen.length >= 4) break;
      if (!chosen.some((c) => c.name === m.name)) chosen.push(m);
    }
    while (chosen.length < 4) {
      chosen.push(await getMove(chosen.length === 3 ? "tackle" : "struggle"));
    }
    return chosen.slice(0, 4).map((m) => m.name);
  }, [getLearnableMoveNames, getMove]);

  // Fórmula de daño oficial simplificada a nivel 50 para ambos combatientes.
  // Usa stats efectivos (stages -6..+6) y aplica la quemadura (mitad de
  // ataque físico) como en los juegos.
  const computeDamage = useCallback(async (attacker, defender, move, weather) => {
    // Night Shade / Seismic Toss: daño fijo igual al nivel (50), sin STAB
    // ni multiplicadores de ataque/defensa, solo respeta la inmunidad de tipo.
    if (move.specialDamage === "fixed-level") {
      const mult = await typeMultiplier([move.type], defender.types);
      return { damage: mult > 0 ? 50 : 0, isCrit: false, mult };
    }
    // Supercolmillo: daño fijo igual a la mitad de los PS ACTUALES del
    // objetivo (no máximos), redondeado hacia abajo, mínimo 1. Sin STAB, sin
    // multiplicador de clima/campo, sin crítico; solo respeta la inmunidad
    // de tipo binaria, igual que Night Shade/Seismic Toss arriba.
    if (move.specialDamage === "fixed-half-hp") {
      const mult = await typeMultiplier([move.type], defender.types);
      return { damage: mult > 0 ? Math.max(1, Math.floor(defender.hp / 2)) : 0, isCrit: false, mult };
    }
    let power = move.power;
    if (move.specialDamage === "speed-ratio") {
      const ratio = getEffectiveSpeed(attacker, weather) / Math.max(1, getEffectiveSpeed(defender, weather));
      power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
    } else if (move.specialDamage === "weight-based") {
      // Hierba Lazo/Patada Baja: potencia según el peso del OBJETIVO, no el
      // `power` de la API (que para estos dos es un placeholder sin
      // significado real, ver WEIGHT_BASED_POWER_MOVES). A partir de aquí
      // sigue la fórmula de daño estándar sin ninguna otra excepción (STAB,
      // tipo, crítico, aleatoriedad...).
      power = weightBasedPower(defender.weightKg);
    }

    // El crítico se decide antes de leer los stages: ignora bajadas propias
    // de Ataque/Ataque Especial (nunca peor que stage 0) y subidas de
    // Defensa/Defensa Especial del rival (nunca mejor que stage 0), pero
    // conserva subidas propias y bajadas del rival tal cual. Sin crítico,
    // los stages se usan reales sin ningún clamp especial.
    const isCrit = Math.random() < 1 / 24;
    const atkStageClamp = isCrit ? (s) => Math.max(0, s) : undefined;
    const defStageClamp = isCrit ? (s) => Math.min(0, s) : undefined;

    // Placaje de Cuerpo (Body Press): usa la propia Defensa del atacante (con
    // sus stages) en vez de su Ataque, aunque sigue siendo un movimiento
    // físico a todos los demás efectos (quemadura incluida, más abajo).
    let atkStat = move.damageClass === "special"
      ? getEffectiveStat(attacker, "special-attack", atkStageClamp)
      : BODY_PRESS_MOVES.has(move.name)
        ? getEffectiveStat(attacker, "defense", atkStageClamp)
        : getEffectiveStat(attacker, "attack", atkStageClamp);
    if (move.damageClass === "physical" && attacker.status === "burn") atkStat *= 0.5;
    const defStat = move.damageClass === "special"
      ? getEffectiveStat(defender, "special-defense", defStageClamp)
      : getEffectiveStat(defender, "defense", defStageClamp);
    const levelFactor = Math.floor((2 * 50) / 5 + 2);
    let base = Math.floor((levelFactor * power * atkStat) / defStat / 50);
    base = Math.floor(base + 2);
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const weatherMult = weatherDamageMultiplier(weather, move.type);
    const terrainMult = terrainPowerMultiplier(weather, move, attacker) * terrainDamageReductionMultiplier(weather, move, defender);
    const mult = await typeMultiplier([move.type], defender.types);
    const critMult = isCrit ? 1.5 : 1;
    const rand = 0.85 + Math.random() * 0.15;
    let damage = Math.floor(base * stab * weatherMult * terrainMult * mult * critMult * rand);
    damage = mult > 0 ? Math.max(1, damage) : 0;
    return { damage, isCrit, mult };
  }, [typeMultiplier]);

  // Estimación determinista de daño esperado (sin crítico/azar) usada por la
  // IA para elegir el mejor movimiento contra el rival actual.
  const expectedDamage = useCallback(async (attacker, defender, move, weather) => {
    // Fulminantes: no siguen la fórmula normal, su "daño esperado" es la
    // probabilidad de acierto multiplicada por los PS actuales del rival
    // (que es lo que realmente arriesgan/ganan al usarlos).
    if (move.isOHKO) {
      if (move.name === "sheer-cold" && defender.types.includes("ice")) return 0;
      const acc = move.accuracy == null ? 100 : move.accuracy;
      return defender.hp * (acc / 100);
    }
    if (move.damageClass === "status" || (!move.power && !move.specialDamage)) return 0;
    const acc = getEffectiveAccuracy(attacker, defender, move);
    if (move.specialDamage === "fixed-level") {
      const mult = await typeMultiplier([move.type], defender.types);
      return mult > 0 ? 50 * (acc / 100) : 0;
    }
    if (move.specialDamage === "fixed-half-hp") {
      const mult = await typeMultiplier([move.type], defender.types);
      return mult > 0 ? (defender.hp / 2) * (acc / 100) : 0;
    }
    let power = move.power;
    if (move.specialDamage === "speed-ratio") {
      const ratio = getEffectiveSpeed(attacker, weather) / Math.max(1, getEffectiveSpeed(defender, weather));
      power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
    } else if (move.specialDamage === "weight-based") {
      power = weightBasedPower(defender.weightKg);
    }
    let atkStat = move.damageClass === "special"
      ? getEffectiveStat(attacker, "special-attack")
      : BODY_PRESS_MOVES.has(move.name) ? getEffectiveStat(attacker, "defense") : getEffectiveStat(attacker, "attack");
    if (move.damageClass === "physical" && attacker.status === "burn") atkStat *= 0.5;
    const defStat = move.damageClass === "special" ? getEffectiveStat(defender, "special-defense") : getEffectiveStat(defender, "defense");
    const levelFactor = Math.floor((2 * 50) / 5 + 2);
    const base = Math.floor((levelFactor * power * atkStat) / defStat / 50) + 2;
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const weatherMult = weatherDamageMultiplier(weather, move.type);
    const terrainMult = terrainPowerMultiplier(weather, move, attacker) * terrainDamageReductionMultiplier(weather, move, defender);
    const mult = await typeMultiplier([move.type], defender.types);
    let expected = base * stab * weatherMult * terrainMult * mult * (acc / 100);
    // Golpes múltiples: la IA debe valorar el total esperado de golpes, no
    // solo uno (si no, infravalora movimientos como Lanzarrocas frente a
    // uno de un único golpe con potencia similar).
    if (move.minHits != null && move.maxHits != null) {
      const avgHits = move.minHits === 2 && move.maxHits === 5
        ? 3.1 // 2×0.35 + 3×0.35 + 4×0.15 + 5×0.15
        : (move.minHits + move.maxHits) / 2;
      expected *= avgHits;
    }
    return expected;
  }, [typeMultiplier]);

  // Versión "pura" (sin lockedMove, sin marcar usedSetupMove, sin ninguna
  // mutación) de "elige el movimiento de mayor daño esperado": se usa para
  // PREDECIR qué movimiento usaría un Pokémon (propio o rival) dentro de la
  // simulación de Difícil/Maestro, sin afectar al combate real. chooseMove
  // (más abajo) no sirve para esto porque muta attacker.usedSetupMove como
  // efecto secundario deliberado de la elección real.
  const bestMoveAgainstPure = useCallback(async (attacker, defender, weather) => {
    const usable = attacker.moves.filter((m) => m.ppLeft == null || m.ppLeft > 0);
    if (usable.length === 0) return null;
    const scores = await Promise.all(usable.map((m) => expectedDamage(attacker, defender, m, weather)));
    let bestIdx = 0;
    for (let k = 1; k < scores.length; k++) if (scores[k] > scores[bestIdx]) bestIdx = k;
    return usable[bestIdx];
  }, [expectedDamage]);

  // Simulación a 2 turnos de Maestro: proyecta (con daño ESPERADO, sin azar
  // de crítico/precisión/golpes múltiples) el resultado de que `attacker`
  // realice `startAction` (atacar con un movimiento, o cambiar de Pokémon)
  // este turno y el siguiente, asumiendo que `defender` responde en ambos
  // turnos con su mejor movimiento según la misma heurística de daño
  // esperado ya usada en Normal/Difícil (no se ramifica a más de una
  // respuesta hipotética del rival, tal y como permite el pedido, para que
  // el coste sea manejable). No se clona ningún objeto de combate real: los
  // PS proyectados se llevan como números sueltos y solo se LEEN datos
  // (stats/tipos/movimientos) de los Pokémon reales, así que el combate en
  // curso nunca se ve afectado por la simulación, acierte o no la
  // predicción.
  //
  // Simplificación documentada: la proyección no modela cambios de stat
  // (Danza Espada...), ailments (parálisis, quemadura...) ni el propio
  // cambio de Pokémon del rival dentro de la ventana de 2 turnos; para
  // Viento Afín concretamente sí se tiene en cuenta su efecto en el orden
  // de turno del turno 2 (ver `usedTailwind` más abajo), ya que es el
  // ejemplo de combo que el propio pedido pide contemplar explícitamente.
  const scoreTwoTurnPlan = useCallback(async ({ startAction, attacker, attackerTeam, defender, weather }) => {
    let aPoke = attacker;
    let aHp = attacker.hp;
    let dHp = defender.hp;
    let usedTailwind = false;

    if (startAction.type === "switch") {
      aPoke = attackerTeam[startAction.targetIdx];
      aHp = aPoke.hp;
      const dMove = await bestMoveAgainstPure(defender, aPoke, weather);
      if (dMove) aHp = Math.max(0, aHp - await expectedDamage(defender, aPoke, dMove, weather));
    } else {
      const move = startAction.move;
      usedTailwind = TAILWIND_MOVES.has(move.name);
      const dMove = await bestMoveAgainstPure(defender, aPoke, weather);
      const aDmg = await expectedDamage(aPoke, defender, move, weather);
      const dDmg = dMove ? await expectedDamage(defender, aPoke, dMove, weather) : 0;
      if (attackerMovesFirst(move, dMove, aPoke, defender, weather)) {
        dHp = Math.max(0, dHp - aDmg);
        if (dHp > 0) aHp = Math.max(0, aHp - dDmg);
      } else {
        aHp = Math.max(0, aHp - dDmg);
        if (aHp > 0) dHp = Math.max(0, dHp - aDmg);
      }
    }

    if (aHp > 0 && dHp > 0) {
      const aMove2 = await bestMoveAgainstPure(aPoke, defender, weather);
      const dMove2 = await bestMoveAgainstPure(defender, aPoke, weather);
      const aDmg2 = aMove2 ? await expectedDamage(aPoke, defender, aMove2, weather) : 0;
      const dDmg2 = dMove2 ? await expectedDamage(defender, aPoke, dMove2, weather) : 0;
      const aFirst2 = usedTailwind ? true : attackerMovesFirst(aMove2, dMove2, aPoke, defender, weather);
      if (aFirst2) {
        dHp = Math.max(0, dHp - aDmg2);
        if (dHp > 0) aHp = Math.max(0, aHp - dDmg2);
      } else {
        aHp = Math.max(0, aHp - dDmg2);
        if (aHp > 0) dHp = Math.max(0, dHp - aDmg2);
      }
    }

    const dHpFracLost = (defender.maxHp - dHp) / defender.maxHp;
    const aHpFracLost = (aPoke.maxHp - aHp) / aPoke.maxHp;
    let score = dHpFracLost - aHpFracLost;
    if (dHp <= 0) score += 2;
    if (aHp <= 0) score -= 2;
    if (startAction.type === "switch") score -= 0.05; // pequeño coste para no cambiar "porque sí" en empates
    return score;
  }, [expectedDamage, bestMoveAgainstPure]);

  // Genera las acciones candidatas (movimientos con PP + cambios a
  // compañeros vivos, estos últimos solo si se pasa `aliveTeammates`) y
  // devuelve la de mejor resultado proyectado a 2 turnos.
  const pickMasterAction = useCallback(async ({ attacker, attackerTeam, usable, aliveTeammates, defender, weather }) => {
    const candidates = [
      ...usable.map((m) => ({ type: "attack", move: m })),
      ...aliveTeammates.map(({ i }) => ({ type: "switch", targetIdx: i })),
    ];
    if (candidates.length === 0) return null;
    const scored = await Promise.all(candidates.map(async (action) => ({
      action,
      score: await scoreTwoTurnPlan({ startAction: action, attacker, attackerTeam, defender, weather }),
    })));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].action;
  }, [scoreTwoTurnPlan]);

  // Cambio voluntario por desventaja de tipo (Difícil/Maestro): mide la
  // desventaja con el multiplicador de TIPO puro (no daño con stats, tal y
  // como lo describe el pedido) entre los tipos de cada Pokémon activo, sin
  // mirar los movimientos concretos elegidos por nadie ese turno (la CPU no
  // "lee" la elección del usuario, solo compara matchups de tipo, igual que
  // haría un entrenador razonable sopesando a quién tiene delante).
  const pickSwitchTarget = useCallback(async ({ attacker, defender, aliveTeammates }) => {
    const defMultVsAttacker = await typeMultiplier(defender.types, attacker.types);
    const atkMultVsDefender = await typeMultiplier(attacker.types, defender.types);
    const severeDisadvantage = defMultVsAttacker >= 2 && atkMultVsDefender < 2;
    if (!severeDisadvantage) return null;

    let best = null, bestScore = -Infinity;
    for (const { p, i } of aliveTeammates) {
      const off = await typeMultiplier(p.types, defender.types);
      const def = await typeMultiplier(defender.types, p.types);
      const score = off - def;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    const currentScore = atkMultVsDefender - defMultVsAttacker;
    return (best != null && bestScore > currentScore) ? best : null;
  }, [typeMultiplier]);

  // Elige el movimiento con mayor daño esperado. Excepción no bloqueante:
  // por debajo del 40% de PS, si el Pokémon tiene un movimiento de estado
  // que sube sus propias stats y no lo ha usado aún este combate, lo
  // prioriza una única vez antes de volver a centrarse en el daño.
  //
  // `difficulty` ("normal" por defecto | "hard" | "master"): en Difícil y
  // Maestro añade predicción de KO, Protección razonada contra un objetivo
  // invulnerable a punto de reaparecer, curación por drenaje por debajo del
  // 30% de PS (el motor no implementa movimientos de recuperación plana
  // como Recover/Roost/Rest — ver comentario de TRAINER_MOVESETS —, así que
  // se usa como proxy un movimiento drenador ya implementado) y Viento Afín
  // cuando el propio Pokémon es más lento que el rival. Estas mejoras
  // valen tanto para el combate interactivo como para los combates
  // CPU-contra-CPU simulados automáticamente (el resto de Difícil —cambios
  // de Pokémon voluntarios— y la simulación a 2 turnos de Maestro con
  // cambios incluidos solo se usan en el combate interactivo vía
  // decideAiTurn, más abajo: ver su comentario para la razón).
  const chooseMove = useCallback(async (attacker, defender, weather, difficulty = "normal") => {
    // Movimiento de furia en curso: no pasa por la IA, se repite a la
    // fuerza el mismo movimiento contra el objetivo activo actual (si aún
    // le queda PP; si no, se trata como cualquier otro caso sin PP).
    if (attacker.lockedMove) {
      const locked = attacker.moves.find((m) => m.name === attacker.lockedMove);
      if (locked && (locked.ppLeft == null || locked.ppLeft > 0)) return locked;
      attacker.lockedMove = null; // salvaguarda si el move ya no está en su kit
    }

    // Sin PP en ningún movimiento: no hay Struggle implementado, así que se
    // avisa a quien llama (resolveTurn/resolveSwitchTurn) devolviendo null
    // para que ese turno se pierda sin más, sin romper la app.
    const usable = attacker.moves.filter((m) => m.ppLeft == null || m.ppLeft > 0);
    if (usable.length === 0) return null;

    const scores = await Promise.all(usable.map((m) => expectedDamage(attacker, defender, m, weather)));

    if (difficulty !== "normal") {
      // Predicción de KO: por encima de cualquier otra consideración, y
      // además un atajo de rendimiento (evita la simulación completa de
      // Maestro cuando la jugada ya es obvia).
      const koIdx = scores.findIndex((s) => s >= defender.hp);
      if (koIdx !== -1) return usable[koIdx];

      if (difficulty === "master") {
        const best = await pickMasterAction({ attacker, attackerTeam: [], usable, aliveTeammates: [], defender, weather });
        if (best) return best.move; // sin candidatos de cambio, siempre "attack" aquí
      } else {
        if (defender.invulnerable) {
          const protectMove = usable.find((m) => PROTECT_MOVES.has(m.name));
          if (protectMove && (attacker.protectChain || 0) < 2) return protectMove;
        }
        if (attacker.hp / attacker.maxHp < 0.3) {
          const drainIdx = usable.findIndex((m) => m.drain > 0);
          if (drainIdx !== -1) return usable[drainIdx];
        }
        const tailwindIdx = usable.findIndex((m) => TAILWIND_MOVES.has(m.name));
        if (tailwindIdx !== -1 && !(weather?.tailwind?.[attacker.trainerId] > 0) && getEffectiveSpeed(attacker, weather) < getEffectiveSpeed(defender, weather)) {
          return usable[tailwindIdx];
        }
      }
    }

    const hpRatio = attacker.hp / attacker.maxHp;
    if (hpRatio < 0.4 && !attacker.usedSetupMove) {
      const setupIdx = usable.findIndex((m) =>
        m.damageClass === "status" && m.selfTargeted && m.statChanges?.some((sc) => sc.change > 0)
      );
      if (setupIdx !== -1) {
        attacker.usedSetupMove = true;
        return usable[setupIdx];
      }
    }

    let bestIdx = 0;
    for (let k = 1; k < scores.length; k++) if (scores[k] > scores[bestIdx]) bestIdx = k;
    return usable[bestIdx];
  }, [expectedDamage, pickMasterAction]);

  // Decide la acción de la CPU en el combate INTERACTIVO (contra el
  // usuario): a diferencia de chooseMove, puede devolver un cambio de
  // Pokémon voluntario, no solo un movimiento. Esto vive aparte de
  // chooseMove porque los combates CPU-contra-CPU (simulateDuel) son un
  // modelo "1 contra 1 hasta debilitarse" sin ningún concepto de banquillo
  // dentro del propio duelo (ver comentario de simulateDuel): generalizar
  // el cambio voluntario también ahí implicaría fusionar ese modelo con el
  // de simulateMatch, un cambio de arquitectura mayor que no encaja en el
  // alcance de este pedido. Por eso el cambio de Pokémon de Difícil/Maestro
  // (y la simulación a 2 turnos de Maestro CON cambios) solo se usa aquí,
  // en el único combate que el usuario juega en persona cada ronda; los
  // otros 6 combates de la ronda siguen usando chooseMove (con sus propias
  // mejoras de Difícil/Maestro salvo el cambio de Pokémon).
  const decideAiTurn = useCallback(async ({ attacker, attackerTeam, attackerIdx, attackerTrainerId, defender, weather, difficulty }) => {
    if (attacker.lockedMove || difficulty === "normal") {
      return { type: "attack", move: await chooseMove(attacker, defender, weather, difficulty) };
    }

    const usable = attacker.moves.filter((m) => m.ppLeft == null || m.ppLeft > 0);
    if (usable.length === 0) return { type: "attack", move: null };

    const scores = await Promise.all(usable.map((m) => expectedDamage(attacker, defender, m, weather)));
    const koIdx = scores.findIndex((s) => s >= defender.hp);
    if (koIdx !== -1) return { type: "attack", move: usable[koIdx] };

    const aliveTeammates = attackerTeam
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => i !== attackerIdx && p.hp > 0);

    if (difficulty === "master") {
      const best = await pickMasterAction({ attacker, attackerTeam, usable, aliveTeammates, defender, weather });
      if (best) return best;
    }

    if (aliveTeammates.length > 0) {
      const target = await pickSwitchTarget({ attacker, defender, aliveTeammates });
      if (target != null) return { type: "switch", targetIdx: target };
    }

    const tailwindIdx = usable.findIndex((m) => TAILWIND_MOVES.has(m.name));
    if (tailwindIdx !== -1 && !(weather?.tailwind?.[attackerTrainerId] > 0) && getEffectiveSpeed(attacker, weather) < getEffectiveSpeed(defender, weather)) {
      return { type: "attack", move: usable[tailwindIdx] };
    }

    if (defender.invulnerable) {
      const protectMove = usable.find((m) => PROTECT_MOVES.has(m.name));
      if (protectMove && (attacker.protectChain || 0) < 2) return { type: "attack", move: protectMove };
    }

    if (attacker.hp / attacker.maxHp < 0.3) {
      const drainIdx = usable.findIndex((m) => m.drain > 0);
      if (drainIdx !== -1) return { type: "attack", move: usable[drainIdx] };
    }

    return { type: "attack", move: await chooseMove(attacker, defender, weather, difficulty) };
  }, [chooseMove, expectedDamage, pickMasterAction, pickSwitchTarget]);

  const executeMove = useCallback(async (attacker, defender, move, weather, extra = {}) => {
    // Golpe Fantasma/Golpe Fantasma-like (dos turnos con invulnerabilidad):
    // el turno de EJECUCIÓN (attacker.invulnerable ya activo desde el turno
    // de carga anterior) no vuelve a gastar PP; el resto de movimientos y el
    // propio turno de carga sí lo hacen con normalidad.
    const isTwoTurnMove = TWO_TURN_MOVES.has(move.name);
    const isTwoTurnRelease = isTwoTurnMove && attacker.invulnerable;

    // El PP se gasta por el mero hecho de seleccionar y ejecutar el
    // movimiento (acierte, falle por precisión o quede bloqueado por
    // Protección); ejecuteMove solo se llama cuando el atacante SÍ pudo
    // actuar (statusPreMoveCheck ya se resolvió antes), así que aquí no
    // hace falta distinguir esos casos.
    if (move.ppLeft != null && !isTwoTurnRelease) move.ppLeft = Math.max(0, move.ppLeft - 1);

    // La recarga se gasta por haber usado el movimiento, acierte o no
    // (equivalente simplificado a los juegos reales).
    const isRecharge = RECHARGE_MOVES.has(move.name);
    const isThrashing = THRASHING_MOVES.has(move.name);
    const isProtectMove = PROTECT_MOVES.has(move.name);

    // La racha de Protección solo cuenta usos consecutivos: en cuanto se
    // usa cualquier otro movimiento se reinicia (tanto si acierta como si
    // el propio ataque queda bloqueado por la protección del rival).
    if (!isProtectMove) attacker.protectChain = 0;

    // Golpe Bajo (Sucker Punch): resolveTurn ya decidió de antemano (antes
    // de que este movimiento se ejecute) si el objetivo tiene un movimiento
    // dañino planeado y si el usuario golpea antes de que el objetivo haya
    // completado su acción este turno; si no se cumple, falla por completo
    // sin tirada de precisión, igual que un fallo normal.
    if (extra.suckerPunchFails) {
      return { hit: false, damage: 0, crit: false, status: false, events: [] };
    }

    // Movimientos de clima (Día Soleado/Danza Lluvia/Tormenta de
    // Arena/Granizo): afectan a todo el campo de batalla, no al rival, así
    // que no los bloquea la Protección. Sustituyen cualquier clima anterior
    // por el nuevo (nunca se acumulan) y duran 5 turnos completos.
    if (WEATHER_MOVES[move.name] && weather) {
      const type = WEATHER_MOVES[move.name];
      weather.type = type;
      weather.turnsLeft = 5;
      weather.justSet = true;
      return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: WEATHER_START_TEXT[type], inline: false }] };
    }

    // Campos de batalla (Eléctrico/Hierba/Niebla/Psíquico): igual que el
    // clima, afectan a todo el campo (ambos entrenadores), no los bloquea la
    // Protección, sustituyen a cualquier campo anterior y duran 5 turnos.
    if (TERRAIN_MOVES[move.name] && weather) {
      const type = TERRAIN_MOVES[move.name];
      weather.terrainType = type;
      weather.terrainTurnsLeft = 5;
      weather.terrainJustSet = true;
      return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: TERRAIN_START_TEXT[type], inline: false }] };
    }

    // Viento Afín: efecto de LADO (por trainerId de quien lo usa, no del
    // Pokémon activo), 4 turnos, se reinicia a 4 si ya estaba activo. No lo
    // bloquea la Protección (no ataca al rival).
    if (TAILWIND_MOVES.has(move.name) && weather) {
      weather.tailwind = weather.tailwind || {};
      weather.tailwind[attacker.trainerId] = 4;
      return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: `¡Un fuerte viento empieza a soplar a favor del equipo de ${attacker.name}!`, inline: false }] };
    }

    // Movimientos de furia (Enfado/Danza Pétalo/Golpes Furia): obligan a
    // repetir el mismo movimiento 2-3 turnos seguidos (sin pasar por la
    // IA, ver chooseMove) y dejan al usuario confuso al terminar. Cuenta
    // igual acierte o falle el golpe.
    function updateThrashLock() {
      if (!isThrashing) return null;
      const continuing = attacker.lockedMove === move.name;
      if (continuing) {
        attacker.lockedTurnsRemaining -= 1;
      } else {
        attacker.lockedMove = move.name;
        attacker.lockedTurnsRemaining = 2 + Math.floor(Math.random() * 2) - 1; // 1 o 2 turnos más tras este
      }
      if (attacker.lockedTurnsRemaining <= 0) {
        attacker.lockedMove = null;
        if (!attacker.confusionTurns) attacker.confusionTurns = 1 + Math.floor(Math.random() * 4);
        return { type: "statusText", text: `¡${attacker.name} quedó confuso a causa del enfado!`, inline: false };
      }
      if (continuing) {
        return { type: "statusText", text: `${attacker.name} sigue enfadado y no puede parar de atacar`, inline: false };
      }
      return null; // primer uso: la línea normal de "usó X" ya es suficiente
    }

    // Golpe Fantasma: primer uso desaparece (invulnerable, sin daño, sin
    // tirada de precisión) y fuerza su propia repetición el turno siguiente
    // reutilizando `lockedMove` (mismo campo que las furias); segundo uso
    // (attacker.invulnerable ya activo) limpia el estado y sigue el flujo
    // normal de abajo (precisión + daño + Protección incluidos).
    if (isTwoTurnMove) {
      if (!isTwoTurnRelease) {
        attacker.invulnerable = true;
        attacker.lockedMove = move.name;
        return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: `¡${attacker.name} desapareció!`, inline: false }] };
      }
      attacker.invulnerable = false;
      attacker.lockedMove = null;
    }

    // Un objetivo invulnerable (en la fase de carga de un movimiento de dos
    // turnos) esquiva por completo cualquier movimiento rival dirigido a él
    // este turno, salvo que sea uno dirigido a uno mismo (no aplica aquí).
    if (!move.selfTargeted && defender.invulnerable) {
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      const events = [{ type: "statusText", text: `¡${defender.name} esquivó el ataque!`, inline: false }];
      if (thrashEvent) events.push(thrashEvent);
      return { hit: false, damage: 0, crit: false, status: false, events };
    }

    // Campo Psíquico: los movimientos con prioridad > 0 dirigidos a un
    // objetivo "en el suelo" fallan automáticamente.
    if (!move.selfTargeted && move.priority > 0 && terrainBlocksPriorityAgainst(weather, defender)) {
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      const events = [{ type: "statusText", text: `¡El Campo Psíquico protege a ${defender.name} de los movimientos con prioridad!`, inline: false }];
      if (thrashEvent) events.push(thrashEvent);
      return { hit: false, damage: 0, crit: false, status: false, events };
    }

    // Protección bloquea el intento ENTERO del rival (ni precisión, ni
    // crítico, ni daño, ni ailment/stat_changes), salvo que el propio
    // movimiento sea también de la familia de protección o vaya dirigido
    // a uno mismo. Se comprueba antes que cualquier otra cosa.
    if (!isProtectMove && !move.selfTargeted && defender.protected) {
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      const events = [{ type: "statusText", text: `¡${defender.name} se protegió del ataque!`, inline: false }];
      if (thrashEvent) events.push(thrashEvent);
      return { hit: true, damage: 0, crit: false, status: true, events };
    }

    if (isProtectMove) {
      // Probabilidad de éxito: 100% en el primer uso o tras fallar/usar
      // otro movimiento, y se divide entre 2 en cada uso consecutivo
      // exitoso (100 → 50 → 25 → 12.5...), sin suelo mínimo.
      const chance = 100 / Math.pow(2, attacker.protectChain || 0);
      const success = Math.random() * 100 < chance;
      if (success) {
        attacker.protected = true;
        attacker.protectChain = (attacker.protectChain || 0) + 1;
        return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: `¡${attacker.name} se protegió a sí mismo!`, inline: false }] };
      }
      attacker.protectChain = 0;
      return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: "¡Pero falló!", inline: false }] };
    }

    // Come Sueños y similares: solo impactan si el objetivo está dormido;
    // si no, fallan por completo (sin comprobar precisión).
    if (SLEEP_ONLY_DRAIN_MOVES.has(move.name) && defender.status !== "sleep") {
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      const events = [{ type: "statusText", text: `¡Pero falló! ${defender.name} no está dormido`, inline: false }];
      if (thrashEvent) events.push(thrashEvent);
      return { hit: true, damage: 0, crit: false, status: true, events };
    }

    // Fulminantes de un solo golpe (Horn Drill/Guillotine/Fissure/Sheer
    // Cold): ignoran por completo la fórmula normal (STAB, tipo, stages,
    // crítico). Solo tiran precisión contra su accuracy base; si aciertan,
    // el objetivo pasa a 0 PS directamente. Sheer Cold además nunca afecta
    // a un objetivo de tipo Hielo, ni con la tirada de precisión de por
    // medio (la protección del rival ya se comprobó más arriba).
    if (move.isOHKO) {
      if (move.name === "sheer-cold" && defender.types.includes("ice")) {
        return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: `¡No afectó a ${defender.name}!`, inline: false }] };
      }
      const ohkoAcc = move.accuracy == null ? 100 : move.accuracy;
      if (Math.random() * 100 >= ohkoAcc) {
        return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: "¡Pero falló!", inline: false }] };
      }
      defender.hp = 0;
      return { hit: true, damage: 0, crit: false, status: true, events: [{ type: "statusText", text: `¡Un golpe fulminante! ¡${defender.name} ha sido debilitado al instante!`, inline: false }] };
    }

    // Golpes múltiples (Lanzarrocas y similares): la precisión se comprueba
    // UNA sola vez para el primer golpe; si acierta, el resto de golpes ya
    // decididos impactan sin nuevas tiradas. Cada golpe recalcula su propio
    // daño (con su propio crítico independiente), y la secuencia se corta
    // si el objetivo se debilita a mitad. Cualquier ailment/stat_changes
    // secundario solo se comprueba tras el ÚLTIMO golpe.
    if (move.minHits != null && move.maxHits != null) {
      const multiAcc = getEffectiveAccuracy(attacker, defender, move);
      if (Math.random() * 100 >= multiAcc) {
        if (isRecharge) attacker.mustRecharge = true;
        const thrashEvent = updateThrashLock();
        return { hit: false, damage: 0, crit: false, status: false, events: thrashEvent ? [thrashEvent] : [] };
      }
      const hitCount = rollMultiHitCount(move.minHits, move.maxHits);
      let totalDamage = 0;
      let anyCrit = false;
      let hitsLanded = 0;
      let lastMult = 1;
      for (let i = 0; i < hitCount; i++) {
        if (defender.hp <= 0) break;
        const { damage: hitDamage, isCrit: hitCrit, mult: hitMult } = await computeDamage(attacker, defender, move, weather);
        lastMult = hitMult;
        defender.hp = Math.max(0, defender.hp - hitDamage);
        totalDamage += hitDamage;
        if (hitCrit) anyCrit = true;
        hitsLanded++;
      }
      const events = applyMoveEffects(attacker, defender, move, lastMult, defender.hp <= 0, weather);
      if (lastMult > 0) applyDrainOrRecoil(attacker, totalDamage, move, events);
      if (defender.hp > 0 && lastMult > 0 && move.flinchChance > 0 && Math.random() * 100 < move.flinchChance) {
        defender.flinched = true;
      }
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      if (thrashEvent) events.push(thrashEvent);
      return { hit: true, damage: totalDamage, crit: anyCrit, status: false, events, hitCount: hitsLanded };
    }

    if (move.damageClass === "status" || (!move.power && !move.specialDamage)) {
      // Los movimientos de estado tiran precisión exactamente igual que los
      // de daño: si accuracy es null (Danza Espada, Agilidad, Tóxico en las
      // generaciones recientes...) nunca fallan, pero si tienen un valor
      // numérico (Hipnosis 60, Onda Trueno 90, Somnífero 75...) sí deben
      // poder fallar, sin aplicar ningún efecto ese turno.
      const statusAcc = getEffectiveAccuracy(attacker, defender, move);
      if (move.accuracy != null && Math.random() * 100 >= statusAcc) {
        if (isRecharge) attacker.mustRecharge = true;
        const thrashEvent = updateThrashLock();
        return { hit: false, damage: 0, crit: false, status: false, events: thrashEvent ? [thrashEvent] : [] };
      }
      // Bostezo: no aplica sueño de inmediato (ver tickYawn, llamado al
      // final de cada turno en resolveTurn/resolveSwitchTurn). Solo marca al
      // objetivo si no tiene ya un efecto de Bostezo pendiente ni otro
      // estado no volátil activo.
      if (YAWN_MOVES.has(move.name)) {
        const events = [];
        if (!defender.status && !defender.yawnTurns) {
          defender.yawnTurns = 2;
          events.push({ type: "statusText", text: `¡${defender.name} empieza a tener sueño!`, inline: false });
        } else {
          events.push({ type: "statusText", text: "¡Pero no tuvo ningún efecto!", inline: false });
        }
        if (isRecharge) attacker.mustRecharge = true;
        const thrashEvent = updateThrashLock();
        if (thrashEvent) events.push(thrashEvent);
        return { hit: true, damage: 0, crit: false, status: true, events };
      }
      const events = applyMoveEffects(attacker, defender, move, 1, false, weather);
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      if (thrashEvent) events.push(thrashEvent);
      return { hit: true, damage: 0, crit: false, status: true, events };
    }
    const acc = getEffectiveAccuracy(attacker, defender, move);
    if (Math.random() * 100 >= acc) {
      if (isRecharge) attacker.mustRecharge = true;
      const thrashEvent = updateThrashLock();
      return { hit: false, damage: 0, crit: false, status: false, events: thrashEvent ? [thrashEvent] : [] };
    }
    const { damage, isCrit, mult } = await computeDamage(attacker, defender, move, weather);
    defender.hp = Math.max(0, defender.hp - damage);
    const events = applyMoveEffects(attacker, defender, move, mult, defender.hp <= 0, weather);
    // Drenado/retroceso (Come Sueños, Giga Drain, Absorber... / Envite
    // Ígneo, Placaje, Golpe Cabeza...): cura o resta al atacante un % del
    // daño infligido según el signo de meta.drain.
    if (mult > 0) applyDrainOrRecoil(attacker, damage, move, events);
    // Amedrentar (flinch): solo se tira si el golpe conectó de verdad
    // (mult>0) y el objetivo sigue en pie; el efecto real (bloquear el
    // turno) se resuelve en statusPreMoveCheck cuando le toque actuar.
    if (defender.hp > 0 && mult > 0 && move.flinchChance > 0 && Math.random() * 100 < move.flinchChance) {
      defender.flinched = true;
    }
    // Movimientos de recarga (Hyper Beam/Giga Impact...): si el golpe fue
    // completamente inmune por tipo (mult === 0), el movimiento "falla" sin
    // ningún efecto y NO exige recarga al turno siguiente (regla real de los
    // juegos); solo se marca recarga cuando el golpe SÍ tuvo algún efecto
    // (impactó, aunque fuera con daño reducido).
    if (isRecharge && mult > 0) attacker.mustRecharge = true;
    const thrashEvent = updateThrashLock();
    if (thrashEvent) events.push(thrashEvent);
    return { hit: true, damage, crit: isCrit, status: false, events };
  }, [computeDamage]);

  // Resuelve un único turno: ambos movimientos ya elegidos, orden por
  // prioridad/velocidad (con parálisis afectando la velocidad efectiva),
  // ejecuta cada ataque y aplica el daño residual de quemadura/veneno al
  // final. Muta pa.hp / pb.hp directamente.
  //
  // El PRIMER mover se resuelve POR COMPLETO (movimiento + todos sus
  // efectos, incluido un cambio de Pokémon resultante) antes de que el
  // SEGUNDO mover actúe: si el primero se autocambia (Cambio de
  // Voltios/U-turn) o fuerza la salida del rival (Cola Dragón), ese cambio
  // se resuelve YA, en mitad del turno, no al final. Bug corregido: antes,
  // un Raichu (rápido) que usaba Cambio de Voltios contra Aggron (lento)
  // seguía recibiendo el golpe de Aggron ese turno, porque el cambio de
  // Raichu no se aplicaba hasta después de que Aggron ya hubiera actuado
  // contra el propio Raichu (el "cambio real" se difería al final de
  // resolveTurn). Ahora, si el primer mover se autocambia, el SEGUNDO mover
  // (si no ha sido también forzado a salir) dirige su ataque contra QUIEN
  // HA ENTRADO, nunca contra el que ya se fue; y si el primer mover fuerza
  // la salida del segundo, el turno del segundo se pierde por completo (no
  // llega a actuar, igual que en los juegos reales: un Pokémon obligado a
  // salir no ataca ese mismo turno).
  //
  // `options.enableSwitchEffects` (por defecto true) controla si Cola
  // Dragón/Golpe Bajo... llegan a forzar/permitir un cambio de Pokémon: el
  // modelo de simulación automática CPU-vs-CPU (simulateDuel) es "1 contra 1
  // hasta debilitarse" y no tiene ningún concepto de banquillo dentro de un
  // mismo duelo (eso ya lo gestiona simulateMatch por fuera, avanzando de
  // Pokémon solo cuando uno se debilita), así que ahí se desactiva; solo el
  // combate interactivo (con acceso al equipo completo) lo activa de
  // verdad, vía `options.resolveMidTurnSwitch`.
  // `options.benchAlive` ({a,b}, true por defecto) le dice a resolveTurn si
  // el bando en cuestión tiene algún otro Pokémon con vida al que cambiar,
  // para no anunciar un cambio forzado que luego no tiene a dónde ir.
  // `options.resolveMidTurnSwitch(side, reason)` (opcional, async): cuando
  // el primer mover provoca un cambio, se llama YA (antes del segundo
  // mover) para decidir el reemplazo — auto para la CPU, o esperando la
  // elección real del usuario si le toca a él. Devuelve `{ poke, idx }` o
  // `null` (sin banquillo/sin decisión posible, cae al aviso diferido de
  // siempre vía `switchSignals`, igual que si no se pasa esta opción).
  const resolveTurn = useCallback(async (pa, pb, moveA, moveB, trainerAId, trainerBId, weather, options = {}) => {
    const enableSwitchEffects = options.enableSwitchEffects !== false;
    const benchAlive = options.benchAlive || { a: true, b: true };
    const resolveMidTurnSwitch = options.resolveMidTurnSwitch || null;
    const turns = [];
    const switchSignals = { a: null, b: null };
    // Qué lado inflige el golpe que deja al RIVAL a 0 PS primero: si más
    // tarde en este mismo turno el retroceso de ese mismo golpe (u otra
    // fuente de daño) deja también al propio atacante a 0, el ganador sigue
    // siendo quien remató primero (ver item 9 del pedido: el combate
    // termina en el instante en que el rival se queda sin Pokémon, antes de
    // que el retroceso pueda "deshacer" esa victoria).
    let decisiveWinnerSide = null;

    // Pokémon activo REAL de cada lado mientras se resuelve este turno:
    // puede cambiar a mitad de función si el primer mover provoca un
    // cambio (ver comentario de arriba). pa/pb (los parámetros) se dejan
    // intactos como referencia a quién empezó el turno.
    let activePa = pa, activePb = pb;

    const prioA = moveA ? (moveA.priority || 0) : -100;
    const prioB = moveB ? (moveB.priority || 0) : -100;
    let aFirst;
    if (prioA !== prioB) aFirst = prioA > prioB;
    else {
      const spA = getEffectiveSpeed(pa, weather), spB = getEffectiveSpeed(pb, weather);
      aFirst = spA !== spB ? spA > spB : Math.random() < 0.5;
    }

    const firstSide = aFirst ? "a" : "b";
    const secondSide = aFirst ? "b" : "a";
    const firstMove = aFirst ? moveA : moveB;
    const secondMove = aFirst ? moveB : moveA;
    const firstTrainer = aFirst ? trainerAId : trainerBId;
    const secondTrainer = aFirst ? trainerBId : trainerAId;
    let skipSecondSlot = false;

    // Ejecuta el movimiento de `attacker` contra `defender` y empuja sus
    // entradas de log; devuelve el `result` de executeMove para que cada
    // slot gestione sus propios efectos de cambio (que difieren entre el
    // primer y el segundo mover, ver más abajo).
    async function runSlot(attacker, defender, move, atkTrainer, suckerPunchFails) {
      const result = await executeMove(attacker, defender, move, weather, { suckerPunchFails });
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
        hitCount: result.hitCount,
        // Campos añadidos únicamente para que el sistema de logros pueda
        // detectar mecánicas concretas (OHKO, golpes múltiples perfectos,
        // Protección exitosa, autodebilitamiento por retroceso) leyendo el
        // log ya generado, sin necesidad de volver a ejecutar ni modificar
        // en nada la resolución del turno (ver analyzeInteractiveBattleMechanics).
        moveSlug: move.name,
        maxHits: move.maxHits ?? null,
        ohkoSuccess: !!move.isOHKO && defender.hp <= 0,
        protectSuccess: PROTECT_MOVES.has(move.name) && attacker.protected === true,
        attackerFainted: attacker.hp <= 0,
      });
      // El debilitamiento del rival se anota justo después del golpe, antes
      // que cualquier evento adicional (bajada de stat propia, drenaje,
      // retroceso...): en este punto, si el rival se debilitó, los únicos
      // extraEvents que quedan son los que afectan al propio atacante (los
      // que iban dirigidos al rival ya se omiten en ese caso), así que el
      // orden natural es "impacta → el rival cae → el atacante asume las
      // consecuencias de haber atacado".
      if (defender.hp <= 0) turns.push({ type: "faint", pokemon: defender.name });
      turns.push(...extraEvents);
      return result;
    }

    // --- Primer mover: se resuelve POR COMPLETO, cambio incluido, antes de
    // que el segundo mover llegue siquiera a decidirse. ---
    {
      const attacker = firstSide === "a" ? activePa : activePb;
      const defender = firstSide === "a" ? activePb : activePa;
      const move = firstMove;

      if (attacker.hp > 0 && defender.hp > 0) {
        if (!statusPreMoveCheck(attacker, turns)) {
          if (attacker.hp <= 0) turns.push({ type: "faint", pokemon: attacker.name });
        } else if (!move) {
          turns.push({ type: "statusText", text: `${attacker.name} no tiene PP para ningún movimiento y pierde el turno` });
        } else {
          const result = await runSlot(attacker, defender, move, firstTrainer, false);
          if (defender.hp <= 0 && decisiveWinnerSide === null) decisiveWinnerSide = firstSide;

          if (enableSwitchEffects && result.hit && result.damage > 0) {
            if (defender.hp > 0 && DRAG_OUT_MOVES.has(move.name) && benchAlive[secondSide]) {
              turns.push({ type: "statusText", text: `¡${defender.name} fue forzado a retirarse!` });
              if (resolveMidTurnSwitch) {
                const replacement = await resolveMidTurnSwitch(secondSide, "forced");
                if (replacement) {
                  resetPokemonOnSwitchOut(defender);
                  if (secondSide === "a") activePa = replacement.poke; else activePb = replacement.poke;
                  turns.push({ type: "statusText", text: `¡Adelante, ${replacement.poke.name}!` });
                  // El Pokémon forzado a salir no llega a actuar este mismo
                  // turno (igual que en los juegos reales): el segundo slot
                  // se salta por completo.
                  skipSecondSlot = true;
                } else {
                  switchSignals[secondSide] = "forced";
                }
              } else {
                switchSignals[secondSide] = "forced";
              }
            }
            if (attacker.hp > 0 && SWITCH_OUT_MOVES.has(move.name) && benchAlive[firstSide]) {
              if (resolveMidTurnSwitch) {
                const replacement = await resolveMidTurnSwitch(firstSide, "self");
                if (replacement) {
                  resetPokemonOnSwitchOut(attacker);
                  if (firstSide === "a") activePa = replacement.poke; else activePb = replacement.poke;
                  turns.push({ type: "statusText", text: `¡Adelante, ${replacement.poke.name}!` });
                } else {
                  switchSignals[firstSide] = "self";
                }
              } else {
                switchSignals[firstSide] = "self";
              }
            }
          }
        }
      } else if (attacker.hp <= 0) {
        turns.push({ type: "faint", pokemon: attacker.name });
      }
    }

    // --- Segundo mover: usa el estado YA actualizado (si el primero se
    // autocambió, su objetivo ahora es quien ha entrado; si el primero lo
    // forzó a salir a él, este slot se salta entero). ---
    if (!skipSecondSlot) {
      const attacker = secondSide === "a" ? activePa : activePb;
      const defender = secondSide === "a" ? activePb : activePa;
      const move = secondMove;

      if (attacker.hp > 0 && defender.hp > 0) {
        if (!statusPreMoveCheck(attacker, turns)) {
          if (attacker.hp <= 0) turns.push({ type: "faint", pokemon: attacker.name });
        } else if (!move) {
          turns.push({ type: "statusText", text: `${attacker.name} no tiene PP para ningún movimiento y pierde el turno` });
        } else {
          // Golpe Bajo del segundo mover SIEMPRE falla: por definición actúa
          // después de que el rival ya haya completado su acción este turno.
          const suckerPunchFails = move.name === "sucker-punch";
          const result = await runSlot(attacker, defender, move, secondTrainer, suckerPunchFails);
          if (defender.hp <= 0 && decisiveWinnerSide === null) decisiveWinnerSide = secondSide;

          if (enableSwitchEffects && result.hit && result.damage > 0) {
            // El cambio del SEGUNDO mover (si lo hay) es el último efecto
            // del turno: no hay un tercer mover al que afecte, así que basta
            // con el aviso diferido de siempre (se resuelve después de
            // devolver, igual que ya hacía todo esto antes de este cambio).
            if (defender.hp > 0 && DRAG_OUT_MOVES.has(move.name) && benchAlive[firstSide]) {
              switchSignals[firstSide] = "forced";
              turns.push({ type: "statusText", text: `¡${defender.name} fue forzado a retirarse!` });
            }
            if (attacker.hp > 0 && SWITCH_OUT_MOVES.has(move.name) && benchAlive[secondSide]) {
              switchSignals[secondSide] = "self";
            }
          }
        }
      } else if (attacker.hp <= 0) {
        turns.push({ type: "faint", pokemon: attacker.name });
      }
    }

    applyResidualStatusDamage(activePa, turns);
    applyResidualStatusDamage(activePb, turns);
    applyWeatherResidualDamage(activePa, weather, turns);
    applyWeatherResidualDamage(activePb, weather, turns);
    applyGrassyTerrainHeal(activePa, weather, turns);
    applyGrassyTerrainHeal(activePb, weather, turns);
    tickYawn(activePa, turns, weather);
    tickYawn(activePb, turns, weather);
    tickWeatherDuration(weather, turns);
    tickTerrainDuration(weather, turns);
    tickTailwindDuration(weather, turns);

    // La exención de "me acabo de dormir" solo vale para un posible chequeo
    // dentro de este mismo turno (si el Pokémon actúa en segundo lugar);
    // si no se consumió aquí, se limpia igualmente para que su próximo
    // turno real sí cuente como el primer turno dormido.
    activePa.justFellAsleep = false;
    activePb.justFellAsleep = false;

    // La Protección solo dura el turno en el que se usó: se limpia aquí
    // para que, al empezar el turno siguiente, ya no bloquee nada (la
    // racha de usos consecutivos sí se conserva, se gestiona aparte).
    activePa.protected = false;
    activePb.protected = false;

    // Amedrentar (flinch) solo vale para un posible chequeo dentro de
    // este mismo turno (si el objetivo aún no había actuado); si no se
    // consumió aquí, se limpia igual para no arrastrarlo al turno siguiente.
    activePa.flinched = false;
    activePb.flinched = false;

    return { turns, switchSignals, decisiveWinnerSide };
  }, [executeMove]);

  // Resuelve un turno en el que el usuario cambia de Pokémon en vez de
  // atacar. El cambio voluntario SIEMPRE resuelve antes que cualquier
  // movimiento normal, sin comparar prioridad ni Velocidad: la única
  // excepción es Persecución, que si la usa el rival este mismo turno
  // golpea PRIMERO (al doble de potencia) contra el Pokémon que se está
  // retirando, y el cambio solo se completa después si sobrevivió. El PS
  // del saliente se conserva para cuando vuelva a entrar; solo se
  // reinician sus stages (el PP de sus movimientos tampoco se restaura).
  const resolveSwitchTurn = useCallback(async (outgoing, incoming, opponent, opponentMove, opponentTrainerId, weather) => {
    const turns = [];
    // Si el ataque libre del rival remata al objetivo (último Pokémon del
    // usuario) y ADEMÁS un posible retroceso deja también al propio rival a
    // 0 PS (su último Pokémon), el rival sigue siendo quien gana: su golpe
    // fue lo que terminó el combate, antes de que el retroceso pudiera
    // "deshacerlo" (ver item 9, misma regla que en resolveTurn).
    let decisiveWinnerIsOpponent = false;

    const attackTarget = async (target, extra = {}) => {
      if (opponent.hp <= 0 || target.hp <= 0) return;
      if (!opponentMove) {
        turns.push({ type: "statusText", text: `${opponent.name} no tiene PP para ningún movimiento y pierde el turno` });
        return;
      }
      if (!statusPreMoveCheck(opponent, turns)) {
        if (opponent.hp <= 0) turns.push({ type: "faint", pokemon: opponent.name });
        return;
      }
      const result = await executeMove(opponent, target, opponentMove, weather, extra);
      let inlineEffect = null;
      const extraEvents = [];
      for (const ev of result.events || []) {
        if (!inlineEffect && ev.inline) inlineEffect = ev.text;
        else extraEvents.push(ev);
      }
      turns.push({
        type: "move",
        pokemon: opponent.name,
        trainerId: opponentTrainerId,
        move: displayMoveName(opponentMove.name),
        hit: result.hit,
        crit: result.crit,
        status: result.status,
        damage: result.damage,
        target: target.name,
        effectText: inlineEffect,
        hitCount: result.hitCount,
        // Ver comentario equivalente en runSlot (resolveTurn): mismos campos
        // añadidos solo para la detección de logros vía log.
        moveSlug: opponentMove.name,
        maxHits: opponentMove.maxHits ?? null,
        ohkoSuccess: !!opponentMove.isOHKO && target.hp <= 0,
        protectSuccess: PROTECT_MOVES.has(opponentMove.name) && opponent.protected === true,
        attackerFainted: opponent.hp <= 0,
      });
      // Mismo orden que en resolveTurn: el debilitamiento del objetivo se
      // anota antes que los efectos adicionales que le queden al que
      // atacó (bajada de stat propia, retroceso...).
      if (target.hp <= 0) {
        turns.push({ type: "faint", pokemon: target.name });
        decisiveWinnerIsOpponent = true;
      }
      turns.push(...extraEvents);
    };

    // Golpe Bajo como ataque libre tras un cambio: el objetivo (el Pokémon
    // que se está cambiando o el recién entrado, según el caso) nunca tiene
    // un movimiento dañino "planeado" este intercambio (su acción fue
    // cambiar, no atacar), así que Golpe Bajo falla siempre aquí.
    const suckerPunchExtra = { suckerPunchFails: !!(opponentMove && opponentMove.name === "sucker-punch") };

    // Persecución contra el Pokémon que se está cambiando: golpea antes de
    // que se complete el cambio, al doble de su potencia normal. Se muta
    // temporalmente move.power (conservando el mismo objeto, para que el
    // PP se descuente sobre el movimiento real) y se restaura justo después.
    const isPursuitOnSwitcher = !!(opponentMove && PURSUIT_MOVES.has(opponentMove.name));

    if (isPursuitOnSwitcher) {
      const originalPower = opponentMove.power;
      opponentMove.power = (originalPower || 0) * 2;
      await attackTarget(outgoing, suckerPunchExtra);
      opponentMove.power = originalPower;
    }

    if (outgoing.hp > 0) {
      turns.push({ type: "statusText", text: `¡Vuelve, ${outgoing.name}!` });
    }
    // El estado no volátil (incluido Tóxico) persiste al cambiar; el resto
    // (stages, Protección/racha, contador de Tóxico, Bostezo pendiente,
    // confusión, furia/carga en curso) se pierde al salir del campo.
    resetPokemonOnSwitchOut(outgoing);
    turns.push({ type: "statusText", text: `¡Adelante, ${incoming.name}!` });

    // Salvo la excepción de Persecución de arriba, el rival actúa siempre
    // DESPUÉS de completarse el cambio, contra el Pokémon recién entrado,
    // sin comparar Velocidad ni prioridad.
    if (!isPursuitOnSwitcher) await attackTarget(incoming, suckerPunchExtra);

    applyResidualStatusDamage(incoming, turns);
    applyResidualStatusDamage(opponent, turns);
    applyWeatherResidualDamage(incoming, weather, turns);
    applyWeatherResidualDamage(opponent, weather, turns);
    applyGrassyTerrainHeal(incoming, weather, turns);
    applyGrassyTerrainHeal(opponent, weather, turns);
    tickYawn(incoming, turns, weather);
    tickYawn(opponent, turns, weather);
    tickWeatherDuration(weather, turns);
    tickTerrainDuration(weather, turns);
    tickTailwindDuration(weather, turns);

    incoming.justFellAsleep = false;
    opponent.justFellAsleep = false;
    incoming.flinched = false;
    opponent.flinched = false;

    return { turns, decisiveWinnerIsOpponent };
  }, [executeMove]);

  // Combate 1 contra 1 por turnos hasta que uno de los dos se quede a 0 PS
  // (IA para ambos lados).
  const simulateDuel = useCallback(async (pa, pb, trainerAId, trainerBId, weather, difficulty = "normal") => {
    const turns = [];
    let guard = 0;
    // switchEffects desactivados aquí a propósito: este modelo es "1 contra
    // 1 hasta debilitarse" (el avance al siguiente Pokémon del equipo lo
    // gestiona simulateMatch por fuera, solo cuando uno de los dos se
    // debilita), sin ningún concepto de banquillo dentro del propio duelo,
    // así que Cola Dragón/Cambio de Voltios siguen haciendo su daño normal
    // aquí pero no llegan a forzar/permitir ningún cambio de Pokémon. Por la
    // misma razón, el cambio de Pokémon voluntario de Difícil/Maestro
    // tampoco se usa aquí (ver comentario de decideAiTurn): `difficulty`
    // solo mejora qué movimiento elige cada lado vía chooseMove.
    let lastDecisiveWinner = null;
    while (pa.hp > 0 && pb.hp > 0 && guard < 100) {
      guard++;
      const [moveA, moveB] = await Promise.all([chooseMove(pa, pb, weather, difficulty), chooseMove(pb, pa, weather, difficulty)]);
      const { turns: stepTurns, decisiveWinnerSide } = await resolveTurn(pa, pb, moveA, moveB, trainerAId, trainerBId, weather, { enableSwitchEffects: false });
      turns.push(...stepTurns);
      if (decisiveWinnerSide) lastDecisiveWinner = decisiveWinnerSide;
    }
    // Caso normal: gana quien se queda con PS. Doble debilitamiento
    // simultáneo (ej. un movimiento con retroceso remata al rival y el
    // propio retroceso también deja a 0 al atacante): gana quien remató
    // primero, no un empate (ver item 9 del pedido — mecánica real de los
    // juegos, el combate termina en el instante en que el rival se queda
    // sin PS, antes de que el retroceso pueda "deshacer" esa victoria).
    const winnerSide = (pa.hp <= 0 && pb.hp <= 0)
      ? (lastDecisiveWinner === "b" ? "b" : "a")
      : (pa.hp > 0 ? "a" : "b");
    return { pokemonAName: pa.name, pokemonBName: pb.name, trainerAId, trainerBId, winnerSide, turns };
  }, [chooseMove, resolveTurn]);

  const preparePokemonForBattle = useCallback(async (trainerId, slug, difficulty = "normal") => {
    const base = await getPokemon(slug);
    const baseMoves = await getMoveset(trainerId, slug, difficulty);
    // Copia por instancia de cada movimiento (con su propio PP) para que
    // gastar PP en este Pokémon no afecte al mismo movimiento cacheado que
    // usan otros Pokémon. El PP no se restaura si el Pokémon es cambiado
    // por otro y vuelve a entrar más tarde en el mismo combate.
    const moves = baseMoves.map((m) => ({ ...m, ppLeft: m.pp ?? 0 }));
    const baseHp = base.stats.hp ?? 70;
    // PS a nivel 50 (IV=31, EV=0): floor((2*base+31)*50/100) + 50 + 10
    const maxHp = Math.floor(((2 * baseHp + 31) * 50) / 100) + 60;
    return {
      ...base, moves, maxHp, hp: maxHp, trainerId,
      status: null, sleepTurns: 0, justFellAsleep: false, confusionTurns: 0, usedSetupMove: false, mustRecharge: false,
      lockedMove: null, lockedTurnsRemaining: 0, protected: false, protectChain: 0,
      flinched: false, toxicCounter: 0, yawnTurns: 0, invulnerable: false,
      statStages: { attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0, accuracy: 0, evasion: 0 },
    };
  }, [getPokemon, getMoveset]);

  const prepareTeam = useCallback(async (trainer, difficulty = "normal") => {
    return Promise.all(trainer.team.map((s) => preparePokemonForBattle(trainer.id, s, difficulty)));
  }, [preparePokemonForBattle]);

  const simulateMatch = useCallback(async (trainerA, trainerB, difficulty = "normal") => {
    const teamA = await prepareTeam(trainerA, difficulty);
    const teamB = await prepareTeam(trainerB, difficulty);
    // Ambos lados son "CPU" desde el punto de vista de este simulador (el
    // combate del propio usuario nunca pasa por aquí, ver InteractiveBattle):
    // los dos equipos empiezan por un Pokémon aleatorio, no siempre el
    // primero de la fila.
    rotateTeamRandomStart(teamA);
    rotateTeamRandomStart(teamB);
    // El clima/campo/viento afín es del combate entero (no de cada duelo
    // 1v1 por separado): persiste a través de los cambios de Pokémon por
    // debilitamiento. `terrain*` y `tailwind` viven en el mismo objeto que
    // el clima para no tener que enhebrar un segundo parámetro por todo el
    // motor (ver comentario de getEffectiveSpeed).
    const weather = { type: null, turnsLeft: 0, justSet: false, terrainType: null, terrainTurnsLeft: 0, terrainJustSet: false, tailwind: {} };
    let i = 0, j = 0;
    const log = [];
    while (i < teamA.length && j < teamB.length) {
      const pa = teamA[i], pb = teamB[j];
      const duel = await simulateDuel(pa, pb, trainerA.id, trainerB.id, weather, difficulty);
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

  return { getPokemon, getType, simulateMatch, preloadAll, prepareTeam, resolveTurn, resolveSwitchTurn, chooseMove, decideAiTurn, typeMultiplier, assignRandomMoveset, primeMoveset, clearPrimedMovesets, getLearnableMovesDetailed };
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

// Clasifica un multiplicador de tipo ya calculado por el motor (el mismo
// que usa computeDamage) en las 5 categorías visibles en el selector.
function effectivenessMeta(mult) {
  if (mult === 0) return { label: "Inmune", color: "#5c6178" };
  if (mult === 0.25 || mult === 0.5) return { label: "Poco eficaz", color: "#e3350d" };
  if (mult === 1) return { label: "Eficaz", color: "#8a8fa3" };
  if (mult === 2) return { label: "Supereficaz", color: "#5fae5f" };
  if (mult === 4) return { label: "¡Hipereficaz!", color: "#2ecc71", strong: true };
  return null;
}

// Fila compacta con los 6 miembros del equipo de un entrenador: el activo
// destacado, los debilitados en gris/opacidad reducida con una marca.
function TeamStatusRow({ team, activeIndex }) {
  return (
    <div className="flex gap-1.5">
      {team.map((p, i) => {
        const fainted = p.hp <= 0;
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            title={`${p.name}${fainted ? " (debilitado)" : isActive ? " (activo)" : ""}`}
            className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
            style={{
              background: "#0e1018",
              border: isActive ? "2px solid #f2b705" : "1px solid #262a3a",
              opacity: fainted ? 0.4 : 1,
              transform: isActive ? "scale(1.15)" : "scale(1)",
            }}
          >
            {p.sprite
              ? <img src={p.sprite} alt={p.name} className="w-6 h-6 object-contain" style={{ filter: fainted ? "grayscale(100%)" : "none" }} />
              : <span className="text-[9px] text-[#5c6178]">{p.name[0]}</span>}
            {fainted && (
              <span className="absolute inset-0 flex items-center justify-center text-[#e3350d] text-[13px] font-bold leading-none">×</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Indicador compacto de TODOS los efectos de campo activos a la vez: clima,
// campo de batalla, y Viento Afín de cada lado (por entrenador). No
// interfiere con el selector de movimientos ni con el log: se muestra justo
// encima de ellos, junto a la cabecera del combate. Fila compacta que crece
// según haga falta (flex-wrap) en vez de apilar cada indicador por separado;
// discreto/ausente si no hay ningún efecto activo, para no ocupar espacio
// innecesario (mismo criterio que ya tenía el indicador de clima original).
function BattleFieldIndicators({ weather, trainerA, trainerB }) {
  const badges = [];
  const pill = (key, icon, label, turnsLeft, color) => (
    <span
      key={key}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: color + "22", border: `1px solid ${color}66`, color }}
    >
      <span>{icon}</span>
      <span>{label} · {turnsLeft} {turnsLeft === 1 ? "turno" : "turnos"}</span>
    </span>
  );

  if (weather?.type) {
    const meta = WEATHER_META[weather.type];
    badges.push(pill("weather", meta.icon, meta.label, weather.turnsLeft, meta.color));
  }
  if (weather?.terrainType) {
    const meta = TERRAIN_META[weather.terrainType];
    badges.push(pill("terrain", meta.icon, meta.label, weather.terrainTurnsLeft, meta.color));
  }
  const tailwindEntries = weather?.tailwind ? Object.entries(weather.tailwind).filter(([, t]) => t > 0) : [];
  for (const [trainerId, turnsLeft] of tailwindEntries) {
    const trainerName = trainerId === trainerA?.id ? trainerA.name : trainerId === trainerB?.id ? trainerB.name : trainerId;
    badges.push(pill(`tailwind-${trainerId}`, "🌀", `Viento Afín (${trainerName})`, turnsLeft, "#5fae5f"));
  }

  if (!badges.length) return <div className="text-[11px] text-[#5c6178]">Campo despejado</div>;
  return <div className="flex flex-wrap justify-center gap-2">{badges}</div>;
}

// Cuadrícula de tarjetas seleccionables de Pokémon del equipo del usuario,
// reutilizada tanto para elegir con quién empezar el combate (los 6, ninguno
// debilitado todavía) como para elegir el reemplazo obligatorio tras un
// debilitamiento (solo los que sigan con vida). `showHp` decide si se
// muestra la barra de PS actuales/máximos (no aplica al elegir el inicial,
// ya que todos están a PS máximos) o solo los PS máximos.
function TeamPicker({ team, onChoose, showHp, disabled, excludeIndex }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {team.map((p, i) => {
        if (showHp && p.hp <= 0) return null;
        if (excludeIndex === i) return null;
        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => onChoose(i)}
            className="rounded-lg p-3 text-left disabled:opacity-40 flex items-center gap-3"
            style={{ background: "#14161f", border: "1px solid #262a3a" }}
          >
            {p.sprite && <img src={p.sprite} alt={p.name} className="w-12 h-12 object-contain" />}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{p.name}</div>
              <div className="text-[11px] text-[#8a8fa3]">
                {showHp ? `${Math.max(0, p.hp)} / ${p.maxHp} PS` : `${p.maxHp} PS`}
              </div>
              <div className="flex gap-1 mt-1">
                {p.types.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          </button>
        );
      })}
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
  if (turn.hitCount) {
    const vezVeces = turn.hitCount === 1 ? "vez" : "veces";
    return `${turn.pokemon} usó ${turn.move} → ¡Golpeó ${turn.hitCount} ${vezVeces}! → ${turn.damage} de daño total a ${turn.target}${turn.crit ? " (¡Golpe crítico!)" : ""}${effectSuffix}`;
  }
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

// Badge de estado no volátil (parálisis/quemadura/veneno/sueño/congelación)
// y de confusión. Desaparece en cuanto el efecto se cura o expira porque
// se lee directamente de poke.status / poke.confusionTurns en cada render.
function StatusBadges({ poke }) {
  const badges = [];
  const statusMeta = poke.status ? STATUS_BADGE_META[poke.status] : null;
  if (statusMeta) {
    badges.push(
      <span key="status" title={statusMeta.title}
        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
        style={{ background: statusMeta.color + "33", color: statusMeta.color, border: `1px solid ${statusMeta.color}66` }}>
        {statusMeta.label}
      </span>
    );
  }
  if (poke.confusionTurns > 0) {
    badges.push(
      <span key="conf" title={CONFUSION_BADGE_META.title}
        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
        style={{ background: CONFUSION_BADGE_META.color + "33", color: CONFUSION_BADGE_META.color, border: `1px solid ${CONFUSION_BADGE_META.color}66` }}>
        {CONFUSION_BADGE_META.label}
      </span>
    );
  }
  if (!badges.length) return null;
  return <div className="flex gap-1 flex-wrap">{badges}</div>;
}

// Indicador de stages de stat (-6..+6): flechas repetidas + signo, solo
// para las stats que estén realmente alteradas (nada si todo está en 0).
function StatStageBadges({ statStages }) {
  if (!statStages) return null;
  const entries = Object.entries(statStages).filter(([, stage]) => stage !== 0);
  if (!entries.length) return null;
  return (
    <div className="flex gap-1 flex-wrap mt-1.5">
      {entries.map(([stat, stage]) => {
        const up = stage > 0;
        const color = up ? "#5fae5f" : "#e3350d";
        const arrows = (up ? "↑" : "↓").repeat(Math.min(3, Math.abs(stage)));
        return (
          <span key={stat} title={`${STAT_ES[stat] || stat} ${up ? "+" : ""}${stage}`}
            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
            style={{ background: color + "1e", color, border: `1px solid ${color}55` }}>
            {STAT_SHORT_ES[stat] || stat} {arrows} {up ? "+" : ""}{stage}
          </span>
        );
      })}
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="text-white font-semibold text-sm truncate">{poke.name}</div>
            <StatusBadges poke={poke} />
          </div>
          <div className="flex gap-1 mt-1">
            {poke.types.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
        </div>
      </div>
      <HpBar hp={poke.hp} maxHp={poke.maxHp} />
      <StatStageBadges statStages={poke.statStages} />
    </div>
  );
}

// Pantalla de combate interactiva: el usuario elige el movimiento de su
// Pokémon activo en cada turno; el rival lo controla la IA (chooseMove).
function InteractiveBattle({ api, trainerA, trainerB, userSide, difficulty, onFinish }) {
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(0);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { winnerId, loserId, remaining }
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [effectiveness, setEffectiveness] = useState({}); // { [moveName]: multiplier }
  // El usuario elige con qué Pokémon empezar cada combate nuevo (se pide de
  // nuevo en cada ronda, ya que InteractiveBattle se desmonta y remonta por
  // completo entre combates). El lado de la IA sigue empezando siempre con
  // el primero de la fila (idxA/idxB ya inician en 0), sin tocar nada ahí.
  const [starterChosen, setStarterChosen] = useState(false);
  // 'a' | 'b' | null: el lado del usuario tiene que elegir un nuevo Pokémon
  // activo aunque el actual siga con vida (Cola Dragón lo forzó a
  // retirarse, o el propio usuario usó Cambio de Voltios/U-turn).
  const [mustSwitchSide, setMustSwitchSide] = useState(null);
  // Elección del usuario A MITAD DE TURNO (no al final): cuando su propio
  // Cambio de Voltios/U-turn conecta, o cuando el rival lo obliga a salir
  // con Cola Dragón siendo más rápido, resolveTurn se detiene a media
  // resolución y espera aquí antes de que el rival (más lento) llegue a
  // actuar — ver `resolveMidTurnSwitch` en handleUserMove. `null` cuando no
  // hay ninguna elección pendiente; si no, { team, excludeIdx }.
  const [midTurnChoice, setMidTurnChoice] = useState(null);
  const midTurnChoiceResolverRef = useRef(null);

  function requestMidTurnUserChoice(team, excludeIdx) {
    return new Promise((resolve) => {
      midTurnChoiceResolverRef.current = resolve;
      setMidTurnChoice({ team, excludeIdx });
    });
  }

  function handleMidTurnChoicePick(idx) {
    const resolve = midTurnChoiceResolverRef.current;
    if (!resolve) return;
    midTurnChoiceResolverRef.current = null;
    setMidTurnChoice(null);
    resolve(idx);
  }

  const logEndRef = useRef(null);
  // El clima/campo/viento afín es del combate entero, no de cada Pokémon:
  // se guarda en un ref mutable (igual que en simulateMatch) para que
  // persista a través de cambios de Pokémon y renders sin formar parte del
  // estado de React.
  const weatherRef = useRef({ type: null, turnsLeft: 0, justSet: false, terrainType: null, terrainTurnsLeft: 0, terrainJustSet: false, tailwind: {} });

  // Acumulado a lo largo de TODO el combate, solo para el sistema de
  // logros (ver analyzeInteractiveBattleMechanics/handleInteractiveFinish
  // en TorneoTab): no forma parte del motor de combate ni afecta a su
  // resolución, es un simple contador de qué pasó turno a turno desde
  // fuera. `turnsTotal`/`weatherActiveTurns`/`terrainActiveTurns` cuentan
  // turnos resueltos (cada llamada a resolveTurn/resolveSwitchTurn) para
  // la mayoría de clima/campo; `usedTailwindSuccess` se marca si el
  // usuario llegó a usar Viento Afín con éxito en algún momento;
  // `sleptRivalNames`/`forcedOutRivalNames` acumulan qué Pokémon rivales
  // (por nombre) el usuario llegó a dormir/forzar a salir en algún punto.
  const mechanicsRef = useRef({
    turnsTotal: 0, weatherActiveTurns: 0, terrainActiveTurns: 0,
    usedTailwindSuccess: false, sleptRivalNames: new Set(), forcedOutRivalNames: new Set(),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ta, tb] = await Promise.all([api.prepareTeam(trainerA, difficulty), api.prepareTeam(trainerB, difficulty)]);
      // El lado de la CPU empieza con un Pokémon aleatorio, no siempre el
      // primero de la fila; el lado del usuario mantiene su equipo tal cual
      // recibido, ya que él mismo elige con quién empezar más abajo.
      if (userSide !== "a") rotateTeamRandomStart(ta);
      if (userSide !== "b") rotateTeamRandomStart(tb);
      if (!cancelled) { setTeamA(ta); setTeamB(tb); }
    })();
    return () => { cancelled = true; };
  }, [api, trainerA, trainerB, userSide, difficulty]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log]);

  const pa = teamA?.[idxA];
  const pb = teamB?.[idxB];
  const userPoke = userSide === "a" ? pa : pb;
  const aiPoke = userSide === "a" ? pb : pa;

  // Efectividad de cada movimiento del usuario contra el rival activo:
  // reutiliza el multiplicador real del motor, recalculado cuando cambia
  // el Pokémon rival (nuevo activo por cambio o por debilitamiento).
  useEffect(() => {
    if (!userPoke || !aiPoke) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        userPoke.moves.map(async (m) => {
          if (m.damageClass === "status") return [m.name, null];
          const mult = await api.typeMultiplier([m.type], aiPoke.types);
          return [m.name, mult];
        })
      );
      if (!cancelled) setEffectiveness(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [api, userPoke, aiPoke]);

  if (!teamA || !teamB) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#9aa0b4]">
        <Loader2 className="animate-spin mb-3" size={26} color="#e3350d" />
        Preparando tu combate...
      </div>
    );
  }

  const userTrainer = userSide === "a" ? trainerA : trainerB;
  const aiTrainer = userSide === "a" ? trainerB : trainerA;
  const userTeam = userSide === "a" ? teamA : teamB;
  const aiTeam = userSide === "a" ? teamB : teamA;

  if (!starterChosen) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl text-white mb-1 flex items-center gap-2"><Swords size={18} color="#e3350d" /> Elige tu Pokémon inicial</h2>
          <p className="text-sm text-[#9aa0b4]">¿Con cuál de tus Pokémon quieres empezar el combate contra {aiTrainer.name}?</p>
        </div>
        <TeamPicker team={userTeam} onChoose={chooseStarter} showHp={false} disabled={false} />
      </div>
    );
  }

  const userIdx = userSide === "a" ? idxA : idxB;
  const aiIdx = userSide === "a" ? idxB : idxA;

  // Busca el siguiente Pokémon con vida a partir de fromIdx (en orden de
  // equipo, con vuelta al principio). -1 si no queda ninguno con vida.
  // Necesario porque, con el cambio voluntario, el Pokémon activo puede
  // "saltar" a un índice cualquiera del equipo: ya no vale asumir que el
  // equipo se consume en orden estrictamente secuencial 0,1,2...5.
  function nextAliveIndex(team, fromIdx) {
    for (let step = 1; step <= team.length; step++) {
      const idx = (fromIdx + step) % team.length;
      if (team[idx].hp > 0) return idx;
    }
    return -1;
  }

  // A partir de los índices "candidatos" (el activo actual de cada lado tras
  // resolver el turno), decide el índice final. El lado de la IA se
  // comporta exactamente igual que antes: si el candidato se debilitó,
  // entra automáticamente el siguiente vivo de la fila. El lado del usuario
  // YA NO avanza solo: si su candidato se debilitó (por el ataque rival o
  // por su propio retroceso), se deja el índice tal cual, apuntando al
  // debilitado, para que la interfaz le pida elegir manualmente con quién
  // sigue (ver el panel de reemplazo obligatorio en el render). Si algún
  // lado se queda sin ningún Pokémon vivo, termina el combate; se comprueba
  // directamente si queda alguien con vida en el equipo, no por posición de
  // índice, para que sea correcto también cuando hay cambios de por medio.
  // `switchSignals` ({a,b}: null|"forced"|"self", opcional) refleja Cola
  // Dragón/Cambio de Voltios de este turno; `decisiveWinnerSide` (opcional)
  // resuelve un posible doble debilitamiento simultáneo (item 9: gana quien
  // remató primero, no el lado B por defecto).
  function finalizeIndices(candidateIdxA, candidateIdxB, switchSignals, decisiveWinnerSide) {
    const aAlive = teamA.some((p) => p.hp > 0);
    const bAlive = teamB.some((p) => p.hp > 0);

    if (!aAlive || !bAlive) {
      const bothWiped = !aAlive && !bAlive;
      const aWiped = bothWiped ? decisiveWinnerSide !== "a" : !aAlive;
      const remaining = aWiped
        ? teamB.filter((p) => p.hp > 0).length
        : teamA.filter((p) => p.hp > 0).length;
      // Al terminar el combate no hay "siguiente" Pokémon en el bando
      // derrotado: se deja el candidato (el que acaba de debilitarse) para
      // poder seguir mostrando su tarjeta a 0 PS.
      setIdxA(candidateIdxA);
      setIdxB(candidateIdxB);
      setResult({
        winnerId: aWiped ? trainerB.id : trainerA.id,
        loserId: aWiped ? trainerA.id : trainerB.id,
        remaining,
      });
      return;
    }

    const pendingChoiceLines = [];
    let nextMustSwitch = null;

    if (teamA[candidateIdxA].hp > 0) {
      // Cola Dragón/Cambio de Voltios sobre un Pokémon que sigue vivo: solo
      // tiene efecto si al equipo le queda alguien más con vida al que
      // cambiar (si no, "no tiene ningún efecto", se queda como estaba).
      const forced = switchSignals?.a && teamA.filter((p) => p.hp > 0).length > 1;
      if (forced && userSide === "a") {
        setIdxA(candidateIdxA);
        nextMustSwitch = "a";
        pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
      } else if (forced) {
        resetPokemonOnSwitchOut(teamA[candidateIdxA]);
        const next = nextAliveIndex(teamA, candidateIdxA);
        setIdxA(next);
        pendingChoiceLines.push({ type: "statusText", text: `¡Adelante, ${teamA[next].name}!` });
      } else {
        setIdxA(candidateIdxA);
      }
    } else if (userSide === "a") {
      setIdxA(candidateIdxA);
      pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
    } else {
      setIdxA(nextAliveIndex(teamA, candidateIdxA));
    }

    if (teamB[candidateIdxB].hp > 0) {
      const forced = switchSignals?.b && teamB.filter((p) => p.hp > 0).length > 1;
      if (forced && userSide === "b") {
        setIdxB(candidateIdxB);
        nextMustSwitch = "b";
        pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
      } else if (forced) {
        resetPokemonOnSwitchOut(teamB[candidateIdxB]);
        const next = nextAliveIndex(teamB, candidateIdxB);
        setIdxB(next);
        pendingChoiceLines.push({ type: "statusText", text: `¡Adelante, ${teamB[next].name}!` });
      } else {
        setIdxB(candidateIdxB);
      }
    } else if (userSide === "b") {
      setIdxB(candidateIdxB);
      pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
    } else {
      setIdxB(nextAliveIndex(teamB, candidateIdxB));
    }

    setMustSwitchSide(nextMustSwitch);
    if (pendingChoiceLines.length) setLog((l) => [...l, ...pendingChoiceLines]);
  }

  // Elección inicial del combate: el usuario decide con quién sale (el lado
  // de la IA sigue empezando siempre con el primero de la fila, sin tocar
  // idxA/idxB de ese lado).
  function chooseStarter(idx) {
    if (userSide === "a") setIdxA(idx); else setIdxB(idx);
    setLog((l) => [...l, { type: "statusText", text: `¡Adelante, ${userTeam[idx].name}!` }]);
    setStarterChosen(true);
  }

  // Reemplazo obligatorio tras un debilitamiento: a diferencia del cambio
  // voluntario, entrar aquí es "gratis" (no hay ninguna resolución de turno
  // ni tirada de IA de por medio, igual que en los juegos reales al mandar
  // un reemplazo tras un KO) y nunca activa la mecánica de Persecución, que
  // solo se aplica a cambios voluntarios con el activo aún con vida.
  function handleForcedSwitch(idx) {
    if (busy || result) return;
    const incoming = userTeam[idx];
    if (!incoming || incoming.hp <= 0) return;
    // Si el activo actual seguía con vida (forzado a retirarse por Cola
    // Dragón, o autocambio tras Cambio de Voltios/U-turn), pierde sus
    // stages/Protección/etc. al salir, igual que en un cambio voluntario.
    // Si estaba debilitado, esto no tiene ningún efecto visible.
    const outgoing = userTeam[userIdx];
    if (outgoing && outgoing.hp > 0) resetPokemonOnSwitchOut(outgoing);
    setLog((l) => [...l, { type: "statusText", text: `¡Adelante, ${incoming.name}!` }]);
    if (userSide === "a") setIdxA(idx); else setIdxB(idx);
    setMustSwitchSide(null);
  }

  // Actualiza mechanicsRef con lo ocurrido en un turno ya resuelto (ver
  // declaración de mechanicsRef): se llama tras cada resolveTurn/
  // resolveSwitchTurn con los `turns` que acaba de devolver y si clima/
  // campo estaban activos ANTES de resolver ese turno (para no contar de
  // más un clima/campo que expira justo al final del propio turno).
  function recordMechanics(turnsChunk, weatherWasActive, terrainWasActive) {
    const m = mechanicsRef.current;
    m.turnsTotal += 1;
    if (weatherWasActive) m.weatherActiveTurns += 1;
    if (terrainWasActive) m.terrainActiveTurns += 1;
    const aiNames = new Set(aiTeam.map((p) => p.name));
    for (const t of turnsChunk) {
      if (t.type === "move" && t.trainerId === userTrainer.id && t.hit && t.moveSlug && TAILWIND_MOVES.has(t.moveSlug)) {
        m.usedTailwindSuccess = true;
      }
      if (t.type === "statusText" && typeof t.text === "string") {
        for (const name of aiNames) {
          if (t.text === `${name} se ha quedado dormido`) m.sleptRivalNames.add(name);
          if (t.text === `¡${name} fue forzado a retirarse!`) m.forcedOutRivalNames.add(name);
        }
      }
    }
  }

  async function handleUserMove(move) {
    if (busy || result) return;
    setBusy(true);
    const weather = weatherRef.current;
    const aiTrainerId = userSide === "a" ? trainerB.id : trainerA.id;

    // La CPU decide su acción (atacar o, en Difícil/Maestro, cambiar de
    // Pokémon voluntariamente) sin conocer el movimiento que el usuario ya
    // eligió (mismo criterio "sin espiar" que el resto de la IA, ver
    // decideAiTurn); el movimiento del usuario solo entra en juego después,
    // al resolver la acción ya decidida.
    const aiDecision = await api.decideAiTurn({
      attacker: aiPoke,
      attackerTeam: aiTeam,
      attackerIdx: aiIdx,
      attackerTrainerId: aiTrainerId,
      defender: userPoke,
      weather,
      difficulty,
    });

    if (aiDecision.type === "switch") {
      // La CPU cambia de Pokémon: se reutiliza resolveSwitchTurn tal cual
      // (la CPU como "outgoing/incoming", y el movimiento que el usuario ya
      // eligió como el ataque libre del rival), exactamente la misma
      // función que ya usa el cambio voluntario del propio usuario más
      // abajo — así Persecución, Golpe Bajo, etc. siguen funcionando igual
      // sin duplicar ninguna lógica.
      const incoming = aiTeam[aiDecision.targetIdx];
      const weatherWasActive = !!weather.type, terrainWasActive = !!weather.terrainType;
      const { turns, decisiveWinnerIsOpponent } = await api.resolveSwitchTurn(aiPoke, incoming, userPoke, move, userTrainer.id, weather);
      recordMechanics(turns, weatherWasActive, terrainWasActive);
      setLog((l) => [...l, ...turns]);
      const decisiveWinnerSide = decisiveWinnerIsOpponent ? userSide : null;
      finalizeIndices(
        userSide === "a" ? idxA : aiDecision.targetIdx,
        userSide === "a" ? aiDecision.targetIdx : idxB,
        null,
        decisiveWinnerSide
      );
      setBusy(false);
      return;
    }

    const aiMove = aiDecision.move;
    const moveA = userSide === "a" ? move : aiMove;
    const moveB = userSide === "a" ? aiMove : move;
    // Cola Dragón/Cambio de Voltios necesitan saber si cada lado tiene
    // realmente algún otro Pokémon con vida al que cambiar (si no, no
    // tienen ningún efecto más allá del daño).
    const benchAlive = {
      a: teamA.filter((p) => p.hp > 0).length > 1,
      b: teamB.filter((p) => p.hp > 0).length > 1,
    };

    // Si el más rápido de los dos se autocambia (Cambio de Voltios/U-turn)
    // o fuerza la salida del rival (Cola Dragón), resolveTurn necesita el
    // reemplazo YA, antes de que el más lento actúe (ver comentario de
    // resolveTurn). Para la CPU se resuelve solo (siguiente con vida en
    // orden fijo); para el usuario, se le pregunta de verdad a mitad de
    // turno con el mismo panel que ya usa el reemplazo tras un
    // debilitamiento. Se llevan idxA/idxB "locales" aparte del estado de
    // React porque setIdxA/setIdxB no se reflejan de forma síncrona dentro
    // de esta misma función.
    let midTurnIdxA = idxA, midTurnIdxB = idxB;
    async function resolveMidTurnSwitch(side) {
      const team = side === "a" ? teamA : teamB;
      const currentIdx = side === "a" ? midTurnIdxA : midTurnIdxB;
      const aliveOthers = team.filter((p, i) => i !== currentIdx && p.hp > 0);
      if (aliveOthers.length === 0) return null;
      const idx = side === userSide
        ? await requestMidTurnUserChoice(team, currentIdx)
        : nextAliveIndex(team, currentIdx);
      if (side === "a") midTurnIdxA = idx; else midTurnIdxB = idx;
      return { poke: team[idx], idx };
    }

    const weatherWasActive = !!weather.type, terrainWasActive = !!weather.terrainType;
    const { turns, switchSignals, decisiveWinnerSide } = await api.resolveTurn(pa, pb, moveA, moveB, trainerA.id, trainerB.id, weather, { benchAlive, resolveMidTurnSwitch });
    recordMechanics(turns, weatherWasActive, terrainWasActive);
    setLog((l) => [...l, ...turns]);
    finalizeIndices(midTurnIdxA, midTurnIdxB, switchSignals, decisiveWinnerSide);
    setBusy(false);
  }

  async function handleUserSwitch(targetIdx) {
    if (busy || result) return;
    if (targetIdx === userIdx || userTeam[targetIdx].hp <= 0) return;
    setBusy(true);
    setShowSwitchMenu(false);

    const outgoing = userTeam[userIdx];
    const incoming = userTeam[targetIdx];
    const opponent = aiTeam[aiIdx];
    const opponentTrainerId = userSide === "a" ? trainerB.id : trainerA.id;
    const weather = weatherRef.current;
    const aiMove = await api.chooseMove(opponent, outgoing, weather, difficulty);
    const weatherWasActive = !!weather.type, terrainWasActive = !!weather.terrainType;
    const { turns, decisiveWinnerIsOpponent } = await api.resolveSwitchTurn(outgoing, incoming, opponent, aiMove, opponentTrainerId, weather);
    recordMechanics(turns, weatherWasActive, terrainWasActive);
    setLog((l) => [...l, ...turns]);

    // El elegido pasa a ser el candidato a activo del usuario; si el rival
    // lo debilita antes de que pueda actuar, finalizeIndices ya se encarga
    // de avanzar al siguiente vivo de la fila (sin elección adicional).
    const opponentSide = userSide === "a" ? "b" : "a";
    finalizeIndices(
      userSide === "a" ? targetIdx : idxA,
      userSide === "a" ? idxB : targetIdx,
      null,
      decisiveWinnerIsOpponent ? opponentSide : null
    );
    setBusy(false);
  }

  const userWon = result && result.winnerId === userTrainer.id;

  // Analiza el log COMPLETO ya acumulado del combate (todos los turnos, de
  // los tres orígenes posibles: ataque normal, cambio forzado a mitad de
  // turno, cambio voluntario) para el sistema de logros. Solo tiene
  // sentido si el usuario ganó (todos los logros de mecánicas de combate
  // son "gana un combate tras..."), así que devuelve null si no.
  function buildBattleMechanicsFlags() {
    if (!userWon) return null;
    const aiNames = aiTeam.map((p) => p.name);
    const m = mechanicsRef.current;

    let ohko = false;
    let perfectMultiHit = false;
    let protectStreak = 0, maxProtectStreak = 0;
    for (const t of log) {
      if (t.type !== "move" || t.trainerId !== userTrainer.id) continue;
      if (t.ohkoSuccess) ohko = true;
      if (t.maxHits != null && t.hitCount === t.maxHits && t.maxHits >= 5) perfectMultiHit = true;
      if (t.protectSuccess) { protectStreak += 1; if (protectStreak > maxProtectStreak) maxProtectStreak = protectStreak; }
      else protectStreak = 0;
    }

    // "Sacrificio Total": el ÚLTIMO movimiento del combate entero fue del
    // usuario, con retroceso que también le debilitó a él, Y remató al
    // último Pokémon rival (si no hubiera sido el último rival, el combate
    // no habría terminado ahí y seguiría habiendo más entradas en el log).
    let simultaneousRecoilKO = false;
    let lastMoveIdx = -1;
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].type === "move") { lastMoveIdx = i; break; }
    }
    if (lastMoveIdx !== -1) {
      const lastMove = log[lastMoveIdx];
      if (lastMove.trainerId === userTrainer.id && lastMove.attackerFainted) {
        const next = log[lastMoveIdx + 1];
        if (next && next.type === "faint" && aiNames.includes(next.pokemon)) simultaneousRecoilKO = true;
      }
    }

    return {
      ohko,
      simultaneousRecoilKO,
      weatherMajority: m.turnsTotal > 0 && m.weatherActiveTurns > m.turnsTotal / 2,
      terrainActive: m.terrainActiveTurns > 0,
      usedTailwind: m.usedTailwindSuccess,
      protectStreak3: maxProtectStreak >= 3,
      sleptAllRivals: aiNames.length > 0 && aiNames.every((n) => m.sleptRivalNames.has(n)),
      perfectMultiHit,
      forcedOutAllRivals: aiNames.length > 0 && aiNames.every((n) => m.forcedOutRivalNames.has(n)),
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <TeamStatusRow team={userTeam} activeIndex={userIdx} />
        <TeamStatusRow team={aiTeam} activeIndex={aiIdx} />
      </div>

      <div className="flex justify-center">
        <BattleFieldIndicators weather={weatherRef.current} trainerA={trainerA} trainerB={trainerB} />
      </div>

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

      {midTurnChoice ? (
        <div className="rounded-lg p-4" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
          <div className="text-sm text-[#e5e7f0] mb-3 text-center">¿A quién quieres enviar a continuación?</div>
          <TeamPicker
            team={midTurnChoice.team}
            onChoose={handleMidTurnChoicePick}
            showHp={true}
            disabled={false}
            excludeIndex={midTurnChoice.excludeIdx}
          />
        </div>
      ) : !result && (userPoke.hp <= 0 || mustSwitchSide === userSide) ? (
        <div className="rounded-lg p-4" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
          <TeamPicker
            team={userTeam}
            onChoose={handleForcedSwitch}
            showHp={true}
            disabled={busy}
            excludeIndex={userPoke.hp > 0 ? userIdx : undefined}
          />
        </div>
      ) : !result && userPoke.lockedMove ? (
        <div className="rounded-lg p-4 text-center" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
          <div className="text-sm text-[#e5e7f0] mb-3">
            {userPoke.name} no puede elegir otro movimiento este turno: seguirá usando <span className="font-semibold text-white">{displayMoveName(userPoke.lockedMove)}</span> a la fuerza.
          </div>
          <button
            disabled={busy}
            onClick={() => handleUserMove(userPoke.moves.find((m) => m.name === userPoke.lockedMove))}
            className="px-5 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
          >
            Continuar atacando
          </button>
        </div>
      ) : !result ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowSwitchMenu(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: !showSwitchMenu ? "#e3350d22" : "#14161f",
                  border: !showSwitchMenu ? "1px solid #e3350d" : "1px solid #262a3a",
                  color: !showSwitchMenu ? "#ff6b4a" : "#8a8fa3",
                }}
              >
                Atacar
              </button>
              <button
                onClick={() => setShowSwitchMenu(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: showSwitchMenu ? "#e3350d22" : "#14161f",
                  border: showSwitchMenu ? "1px solid #e3350d" : "1px solid #262a3a",
                  color: showSwitchMenu ? "#ff6b4a" : "#8a8fa3",
                }}
              >
                Cambiar Pokémon
              </button>
            </div>
          </div>

          {showSwitchMenu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userTeam.map((p, i) => {
                if (i === userIdx) return null;
                const fainted = p.hp <= 0;
                return (
                  <button
                    key={i}
                    disabled={busy || fainted}
                    onClick={() => handleUserSwitch(i)}
                    className="rounded-lg p-3 text-left disabled:opacity-40 flex items-center gap-3"
                    style={{ background: "#14161f", border: "1px solid #262a3a" }}
                  >
                    {p.sprite && <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" style={{ filter: fainted ? "grayscale(100%)" : "none" }} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">
                        {p.name} {fainted && <span className="text-[#e3350d] text-[10px] font-bold">(debilitado)</span>}
                      </div>
                      <div className="text-[11px] text-[#8a8fa3]">{Math.max(0, p.hp)} / {p.maxHp} PS</div>
                      <div className="flex gap-1 mt-1">
                        {p.types.map((t) => <TypeBadge key={t} type={t} />)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : userPoke.moves.every((m) => m.ppLeft != null && m.ppLeft <= 0) ? (
            <div className="rounded-lg p-4 text-center" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
              <div className="text-sm text-[#e5e7f0] mb-3">
                {userPoke.name} se ha quedado sin PP en todos sus movimientos y no puede atacar este turno.
              </div>
              <button
                disabled={busy}
                onClick={() => handleUserMove(null)}
                className="px-5 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
              >
                Perder el turno
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userPoke.moves.map((m, i) => {
                const isStatus = m.damageClass === "status" || (!m.power && !m.specialDamage);
                const categoryLabel = isStatus ? "Estado" : m.damageClass === "special" ? "Especial" : "Físico";
                const powerLabel = isStatus ? "—" : (m.specialDamage ? "Variable" : (m.power ?? "Variable"));
                const effectSummary = moveEffectSummary(m);
                const eff = isStatus ? null : effectivenessMeta(effectiveness[m.name]);
                const noPp = m.ppLeft != null && m.ppLeft <= 0;
                return (
                  <button
                    key={i}
                    disabled={busy || noPp}
                    onClick={() => handleUserMove(m)}
                    className="rounded-lg p-3 text-left disabled:opacity-50"
                    style={{ background: "#14161f", border: "1px solid #262a3a" }}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-white font-semibold text-sm">{displayMoveName(m.name)}</span>
                      <div className="flex items-center gap-1">
                        {eff && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                            style={{ background: eff.color + "26", color: eff.color, border: `1px solid ${eff.color}66`, ...(eff.strong ? { fontWeight: 900 } : {}) }}
                          >
                            {eff.label}
                          </span>
                        )}
                        <TypeBadge type={m.type} />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8a8fa3] mb-1.5">
                      {categoryLabel} · Potencia {powerLabel} · Precisión {m.accuracy ?? "—"} ·{" "}
                      <span style={{ color: noPp ? "#e3350d" : undefined, fontWeight: noPp ? 700 : undefined }}>
                        PP {m.ppLeft ?? "—"}/{m.pp ?? "—"}
                      </span>
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
          )}
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
            onClick={() => onFinish({ ...result, log: [{ pokemonAName: trainerA.name, pokemonBName: trainerB.name, turns: log }], mechanicsFlags: buildBattleMechanicsFlags() })}
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

// Panel con las estadísticas agregadas del historial de torneos y la lista
// completa (más reciente primero). El historial ya se guarda en ese orden,
// así que la racha actual de victorias consecutivas es simplemente contar
// desde el principio del array mientras finalPosition sea 1.
function TournamentHistoryModal({ open, history, onClose }) {
  if (!open) return null;

  const played = history.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative max-w-2xl w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: "linear-gradient(160deg,#1b1e2b,#12141d)", border: "1px solid #2c2f42" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-[#7c8199] hover:text-white">
          <X size={18} />
        </button>
        <h3 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <Trophy size={20} color="#f2b705" /> Historial de torneos
        </h3>

        {played === 0 ? (
          <div className="text-center py-8">
            <Trophy size={32} color="#5c6178" className="mx-auto mb-3" />
            <div className="text-[#c7cbdb] font-medium mb-1">Todavía no has jugado ningún torneo.</div>
            <p className="text-sm text-[#8a8fa3]">¡Juega tu primer torneo para empezar tu historial de estadísticas!</p>
          </div>
        ) : (
          (() => {
            const wins = history.filter((h) => h.finalPosition === 1).length;
            const winPct = Math.round((wins / played) * 100);
            const bestPosition = Math.min(...history.map((h) => h.finalPosition));
            const totalCoins = history.reduce((sum, h) => sum + h.coinsEarned, 0);
            let streak = 0;
            for (const h of history) {
              if (h.finalPosition === 1) streak++;
              else break;
            }
            const modeStats = (m) => {
              const list = history.filter((h) => h.mode === m);
              const w = list.filter((h) => h.finalPosition === 1).length;
              return { played: list.length, wins: w, pct: list.length ? Math.round((w / list.length) * 100) : 0 };
            };
            const modeA = modeStats("A");
            const modeB = modeStats("B");
            const modeC = modeStats("C");

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {[
                    ["Torneos jugados", played, "#c7cbdb"],
                    ["Victorias", `${wins} (${winPct}%)`, "#5fae5f"],
                    ["Mejor posición", `${bestPosition}º`, "#4a90d9"],
                    ["Monedas ganadas", totalCoins, "#f2b705"],
                    ["Racha de victorias", streak, "#e3350d"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
                      <div className="text-[10px] text-[#8a8fa3] mb-0.5">{label}</div>
                      <div className="text-lg font-display" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-3 gap-2 mb-5">
                  <div className="rounded-lg p-3" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
                    <div className="text-xs font-semibold text-[#8a8fa3] mb-1">Modo A · Solo tu entrenador</div>
                    <div className="text-sm text-white">{modeA.played} jugados · {modeA.wins} victorias ({modeA.pct}%)</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
                    <div className="text-xs font-semibold text-[#8a8fa3] mb-1">Modo B · Cualquier entrenador</div>
                    <div className="text-sm text-white">{modeB.played} jugados · {modeB.wins} victorias ({modeB.pct}%)</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
                    <div className="text-xs font-semibold text-[#8a8fa3] mb-1">Modo C · Ruleta Pokémon</div>
                    <div className="text-sm text-white">{modeC.played} jugados · {modeC.wins} victorias ({modeC.pct}%)</div>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#262a3a]">
                  <div className="px-3 py-2 bg-[#181b26] text-[10px] uppercase tracking-wide text-[#8a8fa3] font-semibold grid grid-cols-[1fr_2.2rem_1fr_2.5rem_2.5rem_4rem] gap-1">
                    <span>Fecha</span><span>Modo</span><span>Entrenador</span><span>Pos.</span><span>Ptos</span><span className="text-right">Monedas</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 grid grid-cols-[1fr_2.2rem_1fr_2.5rem_2.5rem_4rem] gap-1 items-center text-xs"
                        style={{ background: i % 2 ? "#14161f" : "#12141c", borderTop: "1px solid #1e2130" }}
                      >
                        <span className="text-[#9aa0b4]">{new Date(h.date).toLocaleDateString()}</span>
                        <span className="text-[#c7cbdb]">{h.mode}</span>
                        <span className="text-white truncate" title={h.trainerName}>{h.trainerName}</span>
                        <span className="text-[#c7cbdb]">{h.finalPosition}º</span>
                        <span className="text-[#c7cbdb]">{h.points}</span>
                        <span className="text-right text-[#f2b705] font-semibold">+{h.coinsEarned}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}

function TorneoTab({ api, coins, setCoins, purchasedTrainerIds, customTrainer, collection, ownedTrainerMovesets, tournamentHistory, onTournamentFinished, onCombatMechanics }) {
  const [phase, setPhase] = useState("setup"); // setup, loading, ready, finished
  const [userTrainerId, setUserTrainerId] = useState("ash");
  // El torneo está diseñado para exactamente 8 participantes fijos (usuario
  // + 7 CPU); el entrenador propio nunca se añade como un 9º, sino que
  // sustituye a Ash (el mismo que el usuario tendría preseleccionado por
  // defecto si no tuviera uno propio) SOLO cuando decide jugar con él. Ver
  // `effectiveTrainers` más abajo: el id "ash" se mantiene igual en todo
  // momento para no tocar la lógica de emparejamientos ni la clasificación,
  // solo cambia qué nombre/equipo resuelve ese id concreto.
  const [playAsCustom, setPlayAsCustom] = useState(false);
  // Modo de torneo: "A" = solo con el entrenador propio (nunca se muestra
  // el selector, va directo con él); "B" = cualquier entrenador desbloqueado
  // EXCEPTO el propio (el comportamiento ya existente antes de este
  // cambio). En ambos modos el entrenador propio nunca puede tocarle a la
  // CPU: en modo A porque ocupa el único slot "ash" que el propio usuario
  // usa (se excluye a sí mismo de los rivales, como ya pasaba); en modo B
  // porque directamente no se ofrece como opción del selector, así que
  // `playAsCustom` nunca llega a activarse y el slot "ash" sigue
  // resolviendo al Ash real de toda la vida.
  const [mode, setMode] = useState("B");
  // Modo C "Ruleta Pokémon": equipo de 6 Pokémon aleatorios (última etapa
  // evolutiva, mismo pool que el gacha) con moveset aleatorio pero
  // aprendible, sorteado UNA vez al iniciar el torneo (ver startTournament)
  // y mantenido igual durante las 5 rondas: [{ slug, moves }] o null si
  // todavía no se ha sorteado ninguno (antes del primer torneo en este
  // modo, o justo después de reset()).
  const [rouletteTeam, setRouletteTeam] = useState(null);
  const [difficulty, setDifficulty] = useState("normal");
  const [pairMode, setPairMode] = useState("random");
  const [standings, setStandings] = useState([]);
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState({});
  const [interactiveMatch, setInteractiveMatch] = useState(null); // { trainerA, trainerB, userSide, idx }
  const [pendingRoundResults, setPendingRoundResults] = useState(null);
  const [tournamentReward, setTournamentReward] = useState(null); // { amount, before, after }
  const [showHistory, setShowHistory] = useState(false);

  function toggleMatch(key) {
    setExpandedMatches((e) => ({ ...e, [key]: !e[key] }));
  }

  // Cambiar de modo obliga a recolocar la elección del usuario: en modo A
  // se fuerza directamente al entrenador propio (mismo truco de "reskin"
  // del slot ash ya usado); al salir de modo A hay que desactivar
  // `playAsCustom` para que el slot "ash" vuelva a representar al Ash real
  // y el selector de modo B muestre correctamente qué tarjeta está elegida.
  function handleModeChange(newMode) {
    setMode(newMode);
    if (newMode === "A" && customTrainer) {
      setUserTrainerId("ash");
      setPlayAsCustom(true);
    } else if (newMode === "B") {
      setPlayAsCustom(false);
    } else if (newMode === "C") {
      // Mismo truco de "reskin" del slot ash que el modo A, pero con su
      // propio reskin de equipo aleatorio (ver effectiveTrainers): no
      // reutiliza playAsCustom, que es específico del entrenador propio.
      setUserTrainerId("ash");
      setPlayAsCustom(false);
    }
  }

  // Lista real de 8 (para el selector de entrenador): siempre la original,
  // nunca reskinada, para poder seguir eligiendo tanto al Ash real como,
  // aparte, "Mi entrenador" si existe uno propio.
  const unlockedTrainers = TRAINERS.filter((t) => isTrainerUnlocked(t, purchasedTrainerIds));
  // Lista efectiva usada para TODA la simulación/emparejamiento/clasificación:
  // idéntica a TRAINERS salvo que, si el usuario ha elegido jugar con su
  // entrenador propio (modo A) o le ha tocado la Ruleta Pokémon (modo C),
  // el slot de Ash pasa a resolver ese nombre/equipo en su lugar (mismo id,
  // misma posición, mismo criterio de emparejamiento en ambos casos).
  const effectiveTrainers = (mode === "C" && rouletteTeam)
    ? TRAINERS.map((t) => t.id === "ash" ? { ...t, name: "Ruleta Pokémon", team: rouletteTeam.map((e) => e.slug), subtitle: "Equipo aleatorio" } : t)
    : (playAsCustom && customTrainer)
      ? TRAINERS.map((t) => t.id === "ash" ? { ...t, name: customTrainer.name, team: customTrainer.team.map((m) => m.slug), subtitle: "Tu entrenador" } : t)
      : TRAINERS;

  async function startTournament() {
    setPhase("loading");
    setError(null);
    try {
      // Limpia cualquier moveset "primed:" de una partida anterior (por
      // ejemplo, el usuario jugó una vez con Lance editando su Dragonite)
      // antes de volver a primar solo lo que corresponda a ESTA partida:
      // sin esto, esa edición se quedaría en caché y contaminaría una
      // partida futura en la que ese mismo entrenador aparezca como CPU
      // normal (ver clearPrimedMovesets).
      api.clearPrimedMovesets();
      await api.preloadAll();
      // El entrenador propio no usa TRAINER_MOVESETS/DEFAULT_MOVES_BY_TYPE: se
      // precarga movesetCache con los movimientos que cada Pokémon ya tiene
      // asignados en la colección de gacha (se busca por slug+shiny, ya que
      // puede haber una entrada normal y otra shiny de la misma especie),
      // bajo el mismo id "ash" que va a usar la simulación, para que combata
      // con SU moveset real y ya actualizado si se editó el equipo o los
      // movimientos de algún Pokémon desde la última vez.
      if (mode === "C") {
        // Ruleta Pokémon: 6 especies DISTINTAS sorteadas del pool completo
        // del gacha (última etapa evolutiva), independientemente de si el
        // usuario las ha conseguido en su colección real — es un equipo
        // temporal solo para esta partida, no se guarda en localStorage ni
        // cuesta nada. Cada una recibe un moveset aleatorio pero aprendible
        // de verdad, reutilizando exactamente la misma lógica ya usada al
        // capturar un Pokémon nuevo en el gacha (assignRandomMoveset), y se
        // precarga bajo "ash" igual que el entrenador propio del modo A.
        const pool = [...GACHA_POOL];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const chosen = pool.slice(0, 6);
        const withMoves = await Promise.all(chosen.map(async (p) => {
          const moves = await api.assignRandomMoveset(p.slug);
          await api.primeMoveset("ash", p.slug, moves);
          return { slug: p.slug, moves };
        }));
        setRouletteTeam(withMoves);
      } else if (playAsCustom && customTrainer) {
        await Promise.all(customTrainer.team.map(({ slug, shiny }) => {
          const entry = findCollectionEntry(collection, slug, shiny);
          return entry ? api.primeMoveset("ash", slug, entry.moves) : Promise.resolve();
        }));
      } else {
        // Modo B: el equipo del propio usuario SIEMPRE usa dificultad
        // Normal, nunca Avanzado (la dificultad de la CPU elegida para esta
        // partida no debe afectar nunca a su propio equipo, sea cual sea).
        // Si ha editado algún movimiento de este entrenador COMPRADO (ver
        // item 5), se usa esa edición; si no, el moveset Normal de base de
        // TRAINER_MOVESETS, igual que si nunca lo hubiera tocado.
        const userTrainerDef = TRAINERS.find((t) => t.id === userTrainerId);
        if (userTrainerDef) {
          await Promise.all(userTrainerDef.team.map((slug) => {
            const key = `${userTrainerId}:${slug}`;
            const names = ownedTrainerMovesets[key] || TRAINER_MOVESETS[key];
            return names ? api.primeMoveset(userTrainerId, slug, names) : Promise.resolve();
          }));
        }
      }
      // El torneo sigue siendo de exactamente 8 participantes (el criterio
      // ya existente de emparejamiento y clasificación asume ese número),
      // pero con más de 8 entrenadores disponibles en total ya no tiene
      // sentido que participen siempre los mismos 8: el elegido por el
      // usuario participa siempre, y los otros 7 se sortean sin repetición
      // entre el resto de entrenadores disponibles (bloqueados incluidos:
      // estar bloqueado solo impide que el USUARIO juegue como ellos, no
      // que existan como rivales de la Liga, igual que ya pasaba con los 4
      // bloqueados originales). `pairMode` sigue controlando únicamente el
      // orden de siembra de esos 8 ya elegidos, no a quién le toca jugar.
      // Los IDs de los 20 entrenadores nunca cambian con ningún reskin (solo
      // cambia qué nombre/equipo resuelve "ash"), así que se leen de
      // TRAINERS directamente en vez de effectiveTrainers: evita depender
      // de que rouletteTeam ya se haya actualizado en el estado de React
      // dentro de esta misma función (setRouletteTeam de arriba es
      // asíncrono de cara al render).
      const allIds = TRAINERS.map((t) => t.id);
      const rivals = allIds.filter((id) => id !== userTrainerId);
      for (let i = rivals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rivals[i], rivals[j]] = [rivals[j], rivals[i]];
      }
      let order = [userTrainerId, ...rivals.slice(0, 7)];
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

    // Logros de mecánicas de combate (42-50): se evalúan tras CADA combate
    // interactivo del usuario, no solo al terminar el torneo entero (ver
    // buildBattleMechanicsFlags en InteractiveBattle, que ya deja este
    // campo listo solo si el usuario ganó ese combate concreto).
    const userResult = results.find((r) => r.a.id === userTrainerId || r.b.id === userTrainerId);
    if (userResult && userResult.mechanicsFlags && onCombatMechanics) {
      onCombatMechanics(userResult.mechanicsFlags);
    }

    if (newRound >= TOURNAMENT_ROUNDS) {
      const final = sortedStandings(updated);
      const userIdx = final.findIndex((s) => s.id === userTrainerId);
      // La recompensa depende solo de la posición final (0-7), no del
      // número de rondas en sí: con 5 rondas en vez de 4 el torneo separa
      // mejor a los 8 participantes, pero la tabla de premios por puesto
      // sigue teniendo el mismo sentido sin cambios.
      const reward = Math.max(50, 400 - userIdx * 50);
      const before = coins;
      setTournamentReward({ amount: reward, before, after: before + reward });
      setCoins((c) => c + reward);
      setPhase("finished");

      const trainer = trainerById(userTrainerId);
      // Campos adicionales SOLO para el sistema de logros (ver
      // src/achievementProgress.js): no afectan en nada a la clasificación
      // ni al emparejamiento, que siguen calculándose exactamente igual
      // que antes más arriba (standings/points/reward).
      const trainerIdentity = mode === "C" ? "roulette" : (playAsCustom ? "custom" : userTrainerId);
      const teamSlugs = (mode === "C" && rouletteTeam) ? rouletteTeam.map((e) => e.slug)
        : (playAsCustom && customTrainer) ? customTrainer.team.map((t) => t.slug)
        : (trainer?.team || []);
      // Rareza/tipos del equipo usado, mirando el pool del gacha (única
      // fuente ya existente de rareza/tipos por especie): si alguna especie
      // del equipo no aparece en el pool (puede pasar con formas de equipos
      // prediseñados que el gacha no incluye), esa comprobación se
      // descarta sin más, sin desbloquear el logro correspondiente.
      const teamMeta = teamSlugs.map((slug) => GACHA_POOL.find((p) => p.slug === slug)).filter(Boolean);
      const teamRarity = (teamMeta.length === 6 && teamMeta.every((p) => p.rarity === teamMeta[0].rarity)) ? teamMeta[0].rarity : null;
      const teamTypeDiversity3Plus = mode === "C" && new Set(teamMeta.flatMap((p) => p.types)).size >= 3;
      const teamTypeSets = teamMeta.map((p) => new Set(p.types));
      const teamSharedType = teamMeta.length === 6 && ALL_TYPES.some((t) => teamTypeSets.every((s) => s.has(t)));
      // "Perfecto": el usuario ganó TODAS las rondas del torneo Y en
      // NINGUNA perdió siquiera un Pokémon (remaining===6 en su propio
      // resultado de cada ronda). `history` (estado de React) todavía no
      // incluye esta última ronda en este punto, así que se reconstruye
      // igual que el setHistory funcional de arriba.
      const allRounds = [...history, { round: newRound, results }];
      let perfectTournament = true;
      let perfectRoundWins = 0;
      for (const r of allRounds) {
        const uR = r.results.find((res) => res.a.id === userTrainerId || res.b.id === userTrainerId);
        const perfect = !!uR && uR.winnerId === userTrainerId && uR.remaining === 6;
        if (perfect) perfectRoundWins += 1;
        else perfectTournament = false;
      }

      onTournamentFinished({
        date: Date.now(),
        mode,
        trainerId: userTrainerId,
        trainerName: trainer?.name ?? userTrainerId,
        finalPosition: userIdx + 1,
        points: final[userIdx]?.points ?? 0,
        coinsEarned: reward,
        difficulty,
        trainerIdentity,
        teamRarity,
        teamTypeDiversity3Plus,
        teamSharedType,
        perfectTournament,
        perfectRoundWins,
      });
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
      const trainerA = effectiveTrainers.find((t) => t.id === pA.id);
      const trainerB = effectiveTrainers.find((t) => t.id === pB.id);
      const res = await api.simulateMatch(trainerA, trainerB, difficulty);
      results[idx] = { a: trainerA, b: trainerB, ...res };
    }));

    if (userPairIdx === -1) {
      finalizeRound(results);
      return;
    }

    const [pA, pB] = pairs[userPairIdx];
    const trainerA = effectiveTrainers.find((t) => t.id === pA.id);
    const trainerB = effectiveTrainers.find((t) => t.id === pB.id);
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
    setTournamentReward(null);
  }

  const trainerById = (id) => effectiveTrainers.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      {phase === "setup" && (
        <div className="space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2">
                <Swords size={22} color="#e3350d" /> Elige tu entrenador
              </h2>
              <p className="text-sm text-[#9aa0b4]">Competirás junto a los otros 7 entrenadores de la Liga en un torneo de {TOURNAMENT_ROUNDS} rondas.</p>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
              style={{ background: "#1c1f2c", color: "#c7cbdb", border: "1px solid #2c2f42" }}
            >
              <Trophy size={14} color="#f2b705" /> Ver historial
            </button>
          </div>

          {/* Modo de torneo */}
          <div>
            <h3 className="font-display text-lg text-white mb-2 flex items-center gap-2">
              <Users size={18} color="#f2b705" /> Modo de torneo
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={() => customTrainer && handleModeChange("A")}
                disabled={!customTrainer}
                className="rounded-xl p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: mode === "A" ? "linear-gradient(160deg, #2ecc7133, #14161f)" : "#14161f",
                  border: mode === "A" ? "1.5px solid #2ecc71" : "1px solid #262a3a",
                }}
              >
                <div className="text-white font-semibold text-sm mb-1">Solo tu entrenador propio</div>
                <div className="text-[11px] text-[#8a8fa3]">
                  {customTrainer
                    ? "Juegas únicamente con tu entrenador propio; no puedes elegir otro en este modo."
                    : "Necesitas crear tu propio entrenador primero, en la pestaña Personajes."}
                </div>
              </button>
              <button
                onClick={() => handleModeChange("B")}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: mode === "B" ? "linear-gradient(160deg, #e3350d33, #14161f)" : "#14161f",
                  border: mode === "B" ? "1.5px solid #e3350d" : "1px solid #262a3a",
                }}
              >
                <div className="text-white font-semibold text-sm mb-1">Cualquier entrenador excepto el tuyo</div>
                <div className="text-[11px] text-[#8a8fa3]">Elige entre tus entrenadores desbloqueados. Tu entrenador propio no aparece como opción en este modo.</div>
              </button>
              <button
                onClick={() => handleModeChange("C")}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: mode === "C" ? "linear-gradient(160deg, #a75fd933, #14161f)" : "#14161f",
                  border: mode === "C" ? "1.5px solid #a75fd9" : "1px solid #262a3a",
                }}
              >
                <div className="text-white font-semibold text-sm mb-1">Ruleta Pokémon</div>
                <div className="text-[11px] text-[#8a8fa3]">Recibes un equipo aleatorio de 6 Pokémon al iniciar el torneo, sorteado del pool completo del gacha.</div>
              </button>
            </div>
          </div>

          {mode === "B" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {unlockedTrainers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setUserTrainerId(t.id); setPlayAsCustom(false); }}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: (userTrainerId === t.id && !playAsCustom) ? `linear-gradient(160deg, ${t.color}33, #14161f)` : "#14161f",
                    border: (userTrainerId === t.id && !playAsCustom) ? `1.5px solid ${t.color}` : "1px solid #262a3a",
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
          ) : mode === "A" ? (
            customTrainer ? (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#2ecc7114", border: "1px solid #2ecc7155" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg shrink-0" style={{ background: "#2ecc7133", color: "#2ecc71" }}>
                  {customTrainer.name[0]}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Jugarás con {customTrainer.name}</div>
                  <div className="text-[11px] text-[#8a8fa3]">Tu entrenador propio</div>
                </div>
              </div>
            ) : null
          ) : (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#a75fd914", border: "1px solid #a75fd955" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: "#a75fd933" }}>
                🎲
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Jugarás con un equipo aleatorio de 6 Pokémon</div>
                <div className="text-[11px] text-[#8a8fa3]">Se sorteará al iniciar el torneo (movesets aprendibles incluidos) y se mantendrá igual durante las {TOURNAMENT_ROUNDS} rondas.</div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-display text-lg text-white mb-2 flex items-center gap-2">
              <Swords size={18} color="#f2b705" /> Dificultad de la CPU
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className="text-left px-4 py-2.5 rounded-lg text-sm font-medium max-w-[15rem]"
                  style={{
                    background: difficulty === key ? "#e3350d22" : "#14161f",
                    border: difficulty === key ? "1px solid #e3350d" : "1px solid #262a3a",
                    color: difficulty === key ? "#ff6b4a" : "#c7cbdb",
                  }}
                >
                  <div className="font-semibold">{meta.label}</div>
                  <div className="text-[10px] text-[#8a8fa3] font-normal leading-snug mt-0.5">{meta.desc}</div>
                </button>
              ))}
            </div>
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
            disabled={mode === "A" && !customTrainer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-display text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
          >
            Iniciar torneo <ChevronRight size={18} />
          </button>
        </div>
      )}

      <TournamentHistoryModal open={showHistory} history={tournamentHistory} onClose={() => setShowHistory(false)} />

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
            difficulty={difficulty}
            onFinish={handleInteractiveFinish}
          />
        </div>
      )}

      {(phase === "ready" || phase === "finished") && !interactiveMatch && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-2xl text-white flex items-center gap-2">
              {phase === "finished" ? <Trophy size={22} color="#f2b705" /> : <Swords size={22} color="#e3350d" />}
              {phase === "finished" ? "Torneo finalizado" : `Ronda ${round} de ${TOURNAMENT_ROUNDS}`}
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

          {phase === "finished" && tournamentReward && (
            <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#f2b70522,#12141c)", border: "1px solid #f2b70544" }}>
              <Coins size={28} color="#f2b705" className="shrink-0" />
              <div>
                <div className="text-sm text-[#e5e7f0] mb-0.5">
                  ¡Has ganado <span className="font-display text-2xl text-[#f2b705]">{tournamentReward.amount}</span> monedas de torneo según tu posición final!
                </div>
                <div className="text-xs text-[#8a8fa3]">
                  Saldo: <span className="text-[#c7cbdb]">{tournamentReward.before}</span> → <span className="font-bold text-white">{tournamentReward.after}</span>
                </div>
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

// Modal de confirmación de compra de entrenador, y su mensaje de éxito
// tras confirmar.
function PurchaseTrainerModal({ trainer, coins, successName, onConfirm, onClose }) {
  if (!trainer && !successName) return null;
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
        {successName ? (
          <>
            <div className="flex justify-center mb-3"><Sparkles size={30} color="#f2b705" /></div>
            <h3 className="font-display text-xl text-white mb-1">¡Has desbloqueado a {successName}!</h3>
            <p className="text-sm text-[#9aa0b4] leading-relaxed">Ya puedes elegirlo como tu entrenador en la tab de Torneo.</p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-3"><Coins size={30} color="#f2b705" /></div>
            <h3 className="font-display text-xl text-white mb-1">Desbloquear a {trainer.name}</h3>
            <p className="text-sm text-[#9aa0b4] leading-relaxed mb-4">
              Esto costará <span className="text-[#f2b705] font-bold">{trainer.price}</span> monedas de torneo.
              Saldo actual: <span className="text-white font-bold">{coins}</span>.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#1c1f2c", color: "#c7cbdb", border: "1px solid #2c2f42" }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
              >
                Confirmar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOM_TRAINER_MIN_POKEMON = 6;

// Modal compartido para crear el entrenador propio (mode="create": pide
// nombre + equipo) y para editar su equipo después de creado (mode="edit":
// solo el equipo, mismo selector). La identidad de cada Pokémon elegible es
// slug+shiny (collectionEntryKey), ya que normal y shiny de una misma
// especie pueden coexistir como entradas distintas de la colección.
function TeamSelectorModal({ open, mode, collection, api, initialSelectedKeys, onConfirm, onClose }) {
  const [name, setName] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [sprites, setSprites] = useState({});

  useEffect(() => {
    if (!open) return;
    setName("");
    if (mode === "edit") {
      setSelectedKeys(initialSelectedKeys || []);
    } else {
      setSelectedKeys(collection.length === CUSTOM_TRAINER_MIN_POKEMON ? collection.map(collectionEntryKey) : []);
    }
  }, [open, mode, collection, initialSelectedKeys]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      for (const c of collection) {
        const p = await api.getPokemon(c.slug);
        if (!cancelled) setSprites((s) => ({ ...s, [c.slug]: p }));
      }
    })();
    return () => { cancelled = true; };
  }, [open, collection, api]);

  if (!open) return null;

  function toggle(key) {
    setSelectedKeys((sel) => {
      if (sel.includes(key)) return sel.filter((k) => k !== key);
      if (sel.length >= CUSTOM_TRAINER_MIN_POKEMON) return sel;
      return [...sel, key];
    });
  }

  const trimmedName = name.trim();
  const canConfirm = mode === "edit"
    ? selectedKeys.length === CUSTOM_TRAINER_MIN_POKEMON
    : trimmedName.length > 0 && trimmedName.length <= 20 && selectedKeys.length === CUSTOM_TRAINER_MIN_POKEMON;

  function handleConfirm() {
    if (!canConfirm) return;
    const team = selectedKeys.map((key) => {
      const entry = collection.find((c) => collectionEntryKey(c) === key);
      return { slug: entry.slug, shiny: !!entry.shiny };
    });
    if (mode === "edit") onConfirm(team);
    else onConfirm(trimmedName, team);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative max-w-lg w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: "linear-gradient(160deg,#1b1e2b,#12141d)", border: "1px solid #2c2f42" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-[#7c8199] hover:text-white">
          <X size={18} />
        </button>
        <h3 className="font-display text-xl text-white mb-1 flex items-center gap-2">
          <Sparkles size={20} color="#e3350d" /> {mode === "edit" ? "Edita el equipo de tu entrenador" : "Crea tu propio entrenador"}
        </h3>
        <p className="text-sm text-[#9aa0b4] mb-4">
          {mode === "edit"
            ? "Elige un nuevo equipo de exactamente 6 Pokémon de tu colección. El nombre de tu entrenador no cambia."
            : "Elige tu nombre y exactamente 6 Pokémon de tu colección. El equipo se podrá editar más adelante."}
        </p>

        {mode === "create" && (
          <>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1.5">Nombre del entrenador</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Ej. Rojo"
              maxLength={20}
              className="w-full mb-4 px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "#0e1018", border: "1px solid #262a3a" }}
            />
          </>
        )}

        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-[#8a8fa3]">Elige 6 Pokémon</label>
          <span className="text-xs font-semibold" style={{ color: selectedKeys.length === CUSTOM_TRAINER_MIN_POKEMON ? "#5fae5f" : "#8a8fa3" }}>
            {selectedKeys.length} / {CUSTOM_TRAINER_MIN_POKEMON}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {collection.map((c) => {
            const key = collectionEntryKey(c);
            const p = sprites[c.slug];
            const sprite = c.shiny ? (p?.shinySprite || p?.sprite) : p?.sprite;
            const isSelected = selectedKeys.includes(key);
            const disabled = !isSelected && selectedKeys.length >= CUSTOM_TRAINER_MIN_POKEMON;
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                disabled={disabled}
                className="rounded-lg p-2 text-left flex items-center gap-2 disabled:opacity-40 relative"
                style={{ background: isSelected ? "#e3350d1e" : "#14161f", border: isSelected ? "1.5px solid #e3350d" : c.shiny ? "1px solid #f2b70566" : "1px solid #262a3a" }}
              >
                {sprite ? <img src={sprite} alt={p?.name} className="w-9 h-9 object-contain shrink-0" /> : <Loader2 className="animate-spin shrink-0" size={14} color="#4c5066" />}
                <div className="min-w-0">
                  <div className="text-white text-xs font-semibold truncate flex items-center gap-1">
                    {p?.name || displayName(c.slug)}
                    {c.shiny && <Star size={10} fill="#f2b705" color="#f2b705" />}
                  </div>
                  <div className="flex gap-0.5 flex-wrap">{(p?.types || []).map((t) => <TypeBadge key={t} type={t} />)}</div>
                </div>
                {isSelected && <Check size={14} color="#5fae5f" className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
        >
          {mode === "edit" ? "Guardar equipo" : "Crear entrenador"}
        </button>
      </div>
    </div>
  );
}

function PersonajesTab({ api, coins, purchasedTrainerIds, onPurchase, collection, customTrainer, onCreateCustomTrainer, onUpdateCustomTrainerTeam, ownedTrainerMovesets, onUpdateOwnedTrainerMoves }) {
  const [sprites, setSprites] = useState({});
  const [confirmTrainer, setConfirmTrainer] = useState(null);
  const [successName, setSuccessName] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // Edición de movimientos de UN Pokémon de un entrenador COMPRADO (las
  // especies son fijas; solo esto se edita): { trainerId, slug } o null.
  const [editingTrainerMon, setEditingTrainerMon] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const t of TRAINERS.filter((t) => isTrainerUnlocked(t, purchasedTrainerIds))) {
        for (const slug of t.team) {
          const p = await api.getPokemon(slug);
          if (!cancelled) setSprites((s) => ({ ...s, [slug]: p }));
        }
      }
      if (customTrainer) {
        for (const { slug } of customTrainer.team) {
          const p = await api.getPokemon(slug);
          if (!cancelled) setSprites((s) => ({ ...s, [slug]: p }));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasedTrainerIds, customTrainer]);

  function handleCreateTrainer(name, team) {
    onCreateCustomTrainer(name, team);
    setShowCreateModal(false);
  }

  function handleUpdateTeam(team) {
    onUpdateCustomTrainerTeam(team);
    setShowEditModal(false);
  }

  function handleConfirmPurchase() {
    if (!confirmTrainer) return;
    onPurchase(confirmTrainer.id, confirmTrainer.price);
    setSuccessName(confirmTrainer.name);
    setConfirmTrainer(null);
  }

  function closeModal() {
    setConfirmTrainer(null);
    setSuccessName(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Users size={22} color="#e3350d" /> Entrenadores</h2>
        <p className="text-sm text-[#9aa0b4]">Empiezas con 4 entrenadores desbloqueados. El resto forman parte de la Liga como rivales; desbloquéalos con monedas de torneo para poder jugar con ellos.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TRAINERS.map((t) => {
          const unlocked = isTrainerUnlocked(t, purchasedTrainerIds);
          const canAfford = coins >= (t.price ?? 0);
          return (
            <div key={t.id} className="rounded-xl p-4 relative overflow-hidden" style={{ background: "#14161f", border: "1px solid #262a3a", opacity: unlocked ? 1 : 0.6 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg" style={{ background: t.color + "33", color: t.color }}>{t.name[0]}</div>
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">{t.name} {!unlocked && <Lock size={13} color="#8a8fa3" />}</div>
                  <div className="text-[11px] text-[#8a8fa3]">{t.subtitle}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {t.team.map((slug, i) => {
                  const p = sprites[slug];
                  // Editable solo si es un entrenador COMPRADO (t.locked
                  // true en su definición original) y ya desbloqueado: los
                  // 4 entrenadores gratis de inicio no tienen esta opción,
                  // igual que pide el pedido ("junto a cada entrenador ya
                  // comprado").
                  const editable = unlocked && t.locked;
                  return (
                    <button
                      key={`${slug}-${i}`}
                      type="button"
                      onClick={() => editable && setEditingTrainerMon({ trainerId: t.id, slug })}
                      disabled={!editable}
                      className="w-12 h-12 rounded-lg flex items-center justify-center relative disabled:cursor-default"
                      style={{ background: "#0e1018", border: editable ? "1px solid #3a3f57" : "1px solid #22263a" }}
                      title={editable ? `${displayName(slug)} · editar movimientos` : displayName(slug)}
                    >
                      {!unlocked ? <Lock size={14} color="#4c5066" /> : p?.sprite ? <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" /> : <Loader2 className="animate-spin" size={14} color="#4c5066" />}
                    </button>
                  );
                })}
              </div>
              {unlocked && t.locked && (
                <p className="text-[10px] text-[#6b7086] mb-2">Toca un Pokémon para editar sus movimientos.</p>
              )}
              {!unlocked && (
                <button
                  onClick={() => setConfirmTrainer(t)}
                  disabled={!canAfford}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold disabled:cursor-not-allowed"
                  style={{
                    background: canAfford ? "#f2b70522" : "#1c1f2c",
                    color: canAfford ? "#f2b705" : "#6b7086",
                    border: canAfford ? "1px solid #f2b70555" : "1px solid #262a3a",
                  }}
                >
                  {canAfford ? `Desbloquear · ${t.price} monedas` : `Te faltan ${t.price - coins} monedas`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {customTrainer ? (
        <div className="w-full rounded-xl p-4" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg" style={{ background: "#2ecc7133", color: "#2ecc71" }}>{customTrainer.name[0]}</div>
              <div>
                <div className="text-white font-semibold flex items-center gap-2">
                  {customTrainer.name}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#2ecc7133", color: "#2ecc71" }}>TU ENTRENADOR</span>
                </div>
                <div className="text-[11px] text-[#8a8fa3]">Creado a partir de tu colección de gacha</div>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              disabled={collection.length < CUSTOM_TRAINER_MIN_POKEMON}
              className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#1c1f2c", color: "#c7cbdb", border: "1px solid #2c2f42" }}
            >
              Editar equipo
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customTrainer.team.map(({ slug, shiny }, i) => {
              const p = sprites[slug];
              const sprite = shiny ? (p?.shinySprite || p?.sprite) : p?.sprite;
              return (
                <div key={`${slug}-${i}`} className="relative w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "#0e1018", border: shiny ? "1px solid #f2b70588" : "1px solid #22263a" }} title={displayName(slug) + (shiny ? " (shiny)" : "")}>
                  {sprite ? <img src={sprite} alt={p.name} className="w-10 h-10 object-contain" /> : <Loader2 className="animate-spin" size={14} color="#4c5066" />}
                  {shiny && <Star size={10} fill="#f2b705" color="#f2b705" className="absolute top-0.5 right-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => collection.length >= CUSTOM_TRAINER_MIN_POKEMON && setShowCreateModal(true)}
          disabled={collection.length < CUSTOM_TRAINER_MIN_POKEMON}
          className="w-full rounded-xl p-5 text-left disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#14161f", border: "1px dashed #3a3f57" }}
        >
          <Sparkles size={20} color="#e3350d" className="mb-2" />
          <div className="text-white font-semibold">Crea tu propio entrenador</div>
          <div className="text-xs text-[#8a8fa3] mt-1">
            {collection.length >= CUSTOM_TRAINER_MIN_POKEMON
              ? "Diseña tu personaje y arma tu propio equipo Pokémon."
              : `Necesitas ${CUSTOM_TRAINER_MIN_POKEMON} Pokémon del gacha · te faltan ${CUSTOM_TRAINER_MIN_POKEMON - collection.length}`}
          </div>
        </button>
      )}

      <TeamSelectorModal
        open={showCreateModal}
        mode="create"
        collection={collection}
        api={api}
        onConfirm={handleCreateTrainer}
        onClose={() => setShowCreateModal(false)}
      />

      {customTrainer && (
        <TeamSelectorModal
          open={showEditModal}
          mode="edit"
          collection={collection}
          api={api}
          initialSelectedKeys={customTrainer.team.map(collectionEntryKey)}
          onConfirm={handleUpdateTeam}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <PurchaseTrainerModal
        trainer={confirmTrainer}
        coins={coins}
        successName={successName}
        onConfirm={handleConfirmPurchase}
        onClose={closeModal}
      />

      {/* Edición de movimientos de un Pokémon de un entrenador comprado: la
          especie es fija, reutiliza el mismo editor (filtros de tipo/
          categoría/nombre incluidos) que ya usa la colección del gacha. Se
          guarda aparte, en ownedTrainerMovesets, nunca en
          TRAINER_MOVESETS/TRAINER_MOVESETS_ADVANCED (que la CPU sigue
          usando sin tocar). */}
      {editingTrainerMon && (
        <MoveEditModal
          open={!!editingTrainerMon}
          entry={{
            slug: editingTrainerMon.slug,
            moves: ownedTrainerMovesets[`${editingTrainerMon.trainerId}:${editingTrainerMon.slug}`]
              || TRAINER_MOVESETS[`${editingTrainerMon.trainerId}:${editingTrainerMon.slug}`]
              || [],
          }}
          api={api}
          onConfirm={(moves) => {
            onUpdateOwnedTrainerMoves(editingTrainerMon.trainerId, editingTrainerMon.slug, moves);
            setEditingTrainerMon(null);
          }}
          onClose={() => setEditingTrainerMon(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: GATCHA
--------------------------------------------------------------- */

// Tarjeta de resultado de una tirada de gacha: nuevo Pokémon (con posible
// celebración shiny) o repetido (con el reembolso obtenido). Si alguna
// rareza se descartó por no tener candidatos en este pool, lo avisa también.
function GachaResultModal({ result, onClose }) {
  if (!result) return null;
  const meta = RARITY_META[result.rarity];
  const isNewShiny = !result.repeat && result.shiny;
  const isShinyRepeat = result.repeat && result.shiny;
  const celebrate = isNewShiny || isShinyRepeat;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-w-sm w-[90%] rounded-2xl p-6 text-center"
        style={{
          background: celebrate ? "linear-gradient(160deg,#3a3312,#12141d)" : "linear-gradient(160deg,#1b1e2b,#12141d)",
          border: celebrate ? "1px solid #f2b705" : "1px solid #2c2f42",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-[#7c8199] hover:text-white">
          <X size={18} />
        </button>

        {result.emptyRarities.length > 0 && (
          <div className="mb-3 text-[11px] text-[#f2b705] bg-[#f2b70518] border border-[#f2b70544] rounded-lg p-2">
            {result.emptyRarities.map((r) => RARITY_META[r].label).join(", ")}: sin Pokémon disponibles en este gacha, se ha vuelto a sortear.
          </div>
        )}

        {result.sprite && (
          <img
            src={result.sprite}
            alt={result.name}
            className="w-28 h-28 object-contain mx-auto mb-2"
            style={celebrate ? { filter: "drop-shadow(0 0 10px #f2b705aa)" } : undefined}
          />
        )}

        {isNewShiny ? (
          <h3 className="font-display text-xl mb-1" style={{ color: "#f2b705" }}>¡✨ Has conseguido un {result.name} SHINY! ✨</h3>
        ) : isShinyRepeat ? (
          <h3 className="font-display text-xl mb-1" style={{ color: "#f2b705" }}>✨ ¡Repetido SHINY de {result.name}!</h3>
        ) : result.repeat ? (
          <h3 className="font-display text-xl text-white mb-1">Ya tenías a {result.name}</h3>
        ) : (
          <h3 className="font-display text-xl text-white mb-1">¡Has conseguido a {result.name}!</h3>
        )}

        <div className="flex justify-center mb-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: meta.color + "26", color: meta.color, border: `1px solid ${meta.color}66` }}>
            {meta.label}
          </span>
        </div>

        {isShinyRepeat ? (
          <p className="text-sm leading-relaxed" style={{ color: "#f2b705" }}>
            Recibes <span className="font-bold">{result.refund}</span> monedas (x4 por ser repetido shiny).
          </p>
        ) : result.repeat ? (
          <p className="text-sm text-[#9aa0b4] leading-relaxed">
            Como repetido, se te reembolsan <span className="text-[#f2b705] font-bold">{result.refund}</span> monedas de torneo.
          </p>
        ) : (
          <p className="text-sm text-[#9aa0b4] leading-relaxed">Se ha añadido a tu colección en la tab Pokémon, con 4 movimientos aprendibles.</p>
        )}
      </div>
    </div>
  );
}

// Panel de una rareza dentro del desglose de un gacha concreto: probabilidad
// fija y cuántos Pokémon de esa rareza quedan por descubrir en ESTE pool
// (general o de un tipo), recalculado cada vez que cambia la colección.
// Criterio: "por descubrir" cuenta ESPECIES distintas del pool, sin
// importar shiny — el shiny es un plus sobre una especie ya del pool, no
// una entrada nueva de él, así que tener solo la versión shiny de una
// especie ya la cuenta como "descubierta" a efectos de este contador.
function RarityProgressCard({ rarity, pool, collection }) {
  const meta = RARITY_META[rarity];
  const candidates = pool.filter((p) => p.rarity === rarity);
  const owned = candidates.filter((p) => collection.some((c) => c.slug === p.slug)).length;
  const complete = candidates.length > 0 && owned >= candidates.length;
  return (
    <div className="rounded-lg p-2.5 text-center" style={{ background: meta.color + "1a", border: `1px solid ${meta.color}44` }}>
      <div className="text-[11px] font-semibold" style={{ color: meta.color }}>{meta.label}</div>
      <div className="text-lg font-display text-white">{meta.chance}%</div>
      <div className="text-[10px] text-[#8a8fa3] mt-0.5">
        {candidates.length === 0 ? "Sin candidatos" : complete ? "¡Completado!" : `${owned} de ${candidates.length} por descubrir`}
      </div>
    </div>
  );
}

function GatchaTab({ api, coins, setCoins, collection, setCollection, onGachaPull }) {
  const [selectedType, setSelectedType] = useState(null); // null = gacha general
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pool = selectedType ? GACHA_POOL.filter((p) => p.types.includes(selectedType)) : GACHA_POOL;
  const cost = selectedType ? TYPE_GACHA_COST : GENERAL_GACHA_COST;
  const refundTable = selectedType ? TYPE_GACHA_REFUND : GENERAL_GACHA_REFUND;

  async function handleDraw() {
    if (drawing || coins < cost) return;
    setError(null);
    setDrawing(true);
    try {
      const roll = rollGachaPokemon(pool);
      if (!roll) {
        setError("Este gacha no tiene ningún Pokémon disponible.");
        setDrawing(false);
        return;
      }
      const { chosen, rarity, emptyRarities } = roll;
      setCoins((c) => c - cost);

      // Primero se decide la especie (rareza+pool, ya resuelto arriba), y
      // DESPUÉS si esta tirada concreta es shiny; el resultado es "nuevo"
      // si el usuario no tiene todavía exactamente esa combinación
      // slug+shiny en su colección (tener la versión normal no hace que la
      // shiny de esa misma especie cuente como repetida, y viceversa).
      const shiny = Math.random() < SHINY_CHANCE;
      const alreadyOwned = collection.some((c) => c.slug === chosen.slug && c.shiny === shiny);
      const pokeData = await api.getPokemon(chosen.slug);
      const sprite = shiny ? (pokeData.shinySprite || pokeData.sprite) : pokeData.sprite;

      if (alreadyOwned) {
        const baseRefund = refundTable[rarity];
        // Repetido shiny de verdad (misma especie Y mismo shiny que una
        // entrada ya existente): reembolso x4 sobre el de esa rareza.
        const refund = shiny ? baseRefund * 4 : baseRefund;
        setCoins((c) => c + refund);
        setResult({ slug: chosen.slug, name: pokeData.name, sprite, rarity, repeat: true, refund, shiny, emptyRarities });
        onGachaPull?.({ isNew: false, shiny });
      } else {
        const moves = await api.assignRandomMoveset(chosen.slug);
        setCollection((c) => [...c, { slug: chosen.slug, moves, obtainedAt: Date.now(), shiny }]);
        setResult({ slug: chosen.slug, name: pokeData.name, sprite, rarity, repeat: false, shiny, emptyRarities });
        onGachaPull?.({ isNew: true, shiny });
      }
    } catch (e) {
      setError("No se pudo completar la tirada. Comprueba tu conexión e inténtalo de nuevo.");
      setCoins((c) => c + cost); // deshace el coste si la tirada no llegó a resolverse
    }
    setDrawing(false);
  }

  const canAfford = coins >= cost;
  const visibleTypes = showAllTypes ? ALL_TYPES : ALL_TYPES.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Store size={22} color="#e3350d" /> Gatcha</h2>
        <p className="text-sm text-[#9aa0b4]">Gasta tus monedas de torneo en gachas de Pokémon.</p>
      </div>

      <div className="rounded-xl p-5" style={{ background: "#14161f", border: "1px solid #262a3a" }}>
        <h3 className="font-display text-lg text-white mb-1">Gacha Pokémon</h3>
        <p className="text-xs text-[#8a8fa3] mb-4">Un único gacha general con todos los Pokémon del pool, o gachas específicos por tipo elemental (más caros, pero con más probabilidad de tocar lo que buscas). Si sale un Pokémon repetido, se reembolsan monedas según su rareza.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType(null)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: !selectedType ? "linear-gradient(135deg,#e3350d,#b8250a)" : "#1c1f2c",
              color: !selectedType ? "#fff" : "#c7cbdb",
              border: !selectedType ? "none" : "1px solid #2c2f42",
            }}
          >
            General
          </button>
          {visibleTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: selectedType === t ? TYPE_COLORS[t] + "44" : TYPE_COLORS[t] + "22",
                color: TYPE_COLORS[t],
                border: selectedType === t ? `1.5px solid ${TYPE_COLORS[t]}` : `1px solid ${TYPE_COLORS[t]}55`,
              }}
            >
              {TYPE_ES[t]}
            </button>
          ))}
          {!showAllTypes && (
            <button onClick={() => setShowAllTypes(true)} className="px-3 py-2 rounded-lg text-xs font-semibold text-[#8a8fa3]" style={{ background: "#1c1f2c", border: "1px solid #2c2f42" }}>
              +{ALL_TYPES.length - visibleTypes.length} tipos más
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {RARITY_ORDER.map((r) => (
            <RarityProgressCard key={r} rarity={r} pool={pool} collection={collection} />
          ))}
        </div>

        {error && <div className="text-sm text-[#ff8a8a] bg-[#e3350d1a] border border-[#e3350d44] rounded-lg p-3 mb-3">{error}</div>}

        <button
          onClick={handleDraw}
          disabled={drawing || !canAfford}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
        >
          {drawing ? <Loader2 className="animate-spin" size={16} /> : <Coins size={16} />}
          {drawing
            ? "Tirando..."
            : canAfford
              ? `Tirar ${selectedType ? `gacha de ${TYPE_ES[selectedType]}` : "gacha general"} · ${cost} monedas`
              : `Te faltan ${cost - coins} monedas`}
        </button>
      </div>

      <GachaResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: POKÉMON
--------------------------------------------------------------- */

// Selector de los 4 movimientos de un Pokémon de la colección, entre TODOS
// los que puede aprender de verdad (level-up/huevo/tutor/MT), no solo los
// que ya tiene ni el pool aleatorio inicial. Reutiliza el mismo formato de
// descripción (tipo/categoría/potencia/precisión/PP) del selector de
// movimientos de combate, con buscador porque la lista puede ser larga.
const MOVE_CATEGORY_OPTIONS = [
  { value: "physical", label: "Físico" },
  { value: "special", label: "Especial" },
  { value: "status", label: "Estado" },
];

// Categoría visible de un movimiento ya resuelto (mismo criterio que ya usa
// el resto de la app: de estado si su clase lo es o si no tiene ninguna
// potencia real, ni fija ni variable).
function moveCategoryOf(m) {
  return m.damageClass === "status" || (!m.power && !m.specialDamage) ? "status" : m.damageClass;
}

function MoveEditModal({ open, entry, api, onConfirm, onClose }) {
  const [allMoves, setAllMoves] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!open || !entry) return;
    setSelected(entry.moves);
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setAllMoves(null);
    let cancelled = false;
    (async () => {
      const moves = await api.getLearnableMovesDetailed(entry.slug);
      if (!cancelled) setAllMoves(moves);
    })();
    return () => { cancelled = true; };
  }, [open, entry, api]);

  if (!open || !entry) return null;

  function toggle(name) {
    setSelected((sel) => {
      if (sel.includes(name)) return sel.filter((n) => n !== name);
      if (sel.length >= 4) return sel;
      return [...sel, name];
    });
  }

  // Solo se ofrecen en los selectores los tipos/categorías que de verdad
  // aparecen entre los movimientos aprendibles de este Pokémon en concreto
  // (no los 18 tipos/3 categorías siempre), para no mostrar opciones vacías.
  const availableTypes = ALL_TYPES.filter((t) => (allMoves || []).some((m) => m.type === t));
  const availableCategories = MOVE_CATEGORY_OPTIONS.filter((c) => (allMoves || []).some((m) => moveCategoryOf(m) === c.value));

  const hasActiveFilters = search !== "" || typeFilter !== "all" || categoryFilter !== "all";
  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  const filtered = (allMoves || []).filter((m) => {
    if (search && !displayMoveName(m.name).toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (categoryFilter !== "all" && moveCategoryOf(m) !== categoryFilter) return false;
    return true;
  });
  const canConfirm = selected.length === 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative max-w-lg w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto flex flex-col"
        style={{ background: "linear-gradient(160deg,#1b1e2b,#12141d)", border: "1px solid #2c2f42" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-[#7c8199] hover:text-white">
          <X size={18} />
        </button>
        <h3 className="font-display text-xl text-white mb-1">Editar movimientos</h3>
        <p className="text-sm text-[#9aa0b4] mb-3">Elige exactamente 4 movimientos que {displayName(entry.slug)} pueda aprender de verdad.</p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar movimiento..."
          className="w-full mb-2 px-3 py-2 rounded-lg text-sm text-white outline-none shrink-0"
          style={{ background: "#0e1018", border: "1px solid #262a3a" }}
        />

        <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#0e1018", border: "1px solid #262a3a" }}
          >
            <option value="all">Todos los tipos</option>
            {availableTypes.map((t) => <option key={t} value={t}>{TYPE_ES[t] || t}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#0e1018", border: "1px solid #262a3a" }}
          >
            <option value="all">Todas las categorías</option>
            {availableCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-semibold" style={{ color: "#ff6b4a" }}>
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-xs font-semibold text-[#8a8fa3]">{filtered.length} movimientos disponibles</span>
          <span className="text-xs font-semibold" style={{ color: selected.length === 4 ? "#5fae5f" : "#8a8fa3" }}>{selected.length} / 4</span>
        </div>

        {!allMoves ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin" size={22} color="#e3350d" /></div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto mb-4" style={{ maxHeight: "40vh" }}>
            {filtered.map((m) => {
              const isSelected = selected.includes(m.name);
              const isStatus = m.damageClass === "status" || (!m.power && !m.specialDamage);
              const categoryLabel = isStatus ? "Estado" : m.damageClass === "special" ? "Especial" : "Físico";
              const powerLabel = isStatus ? "—" : (m.power ?? "Variable");
              const disabled = !isSelected && selected.length >= 4;
              return (
                <button
                  key={m.name}
                  onClick={() => toggle(m.name)}
                  disabled={disabled}
                  className="w-full rounded-lg p-2.5 text-left flex items-center justify-between gap-2 disabled:opacity-40"
                  style={{ background: isSelected ? "#e3350d1e" : "#14161f", border: isSelected ? "1.5px solid #e3350d" : "1px solid #262a3a" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-xs font-semibold">{displayMoveName(m.name)}</span>
                      <TypeBadge type={m.type} />
                    </div>
                    <div className="text-[10px] text-[#8a8fa3]">
                      {categoryLabel} · Potencia {powerLabel} · Precisión {m.accuracy ?? "—"} · PP {m.pp ?? "—"}
                    </div>
                  </div>
                  {isSelected && <Check size={14} color="#5fae5f" className="shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="text-sm text-[#5c6178] text-center py-4">No se han encontrado movimientos con estos filtros.</div>}
          </div>
        )}

        <button
          onClick={() => canConfirm && onConfirm(selected)}
          disabled={!canConfirm}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}
        >
          Guardar movimientos
        </button>
      </div>
    </div>
  );
}

function PokemonCard({ entry, api, onUpdateMoves }) {
  const [poke, setPoke] = useState(null);
  const [showEditMoves, setShowEditMoves] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await api.getPokemon(entry.slug);
      if (!cancelled) setPoke(p);
    })();
    return () => { cancelled = true; };
  }, [api, entry.slug]);

  const rarityInfo = GACHA_POOL.find((g) => g.slug === entry.slug);
  const rarityMeta = rarityInfo ? RARITY_META[rarityInfo.rarity] : null;
  const sprite = entry.shiny ? (poke?.shinySprite || poke?.sprite) : poke?.sprite;

  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "#14161f",
        border: entry.shiny ? "1.5px solid #f2b705" : "1px solid #262a3a",
        boxShadow: entry.shiny ? "0 0 14px #f2b70533" : undefined,
      }}
    >
      {entry.shiny && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold" style={{ color: "#f2b705" }}>
          <Star size={12} fill="#f2b705" /> SHINY
        </div>
      )}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#0e1018", border: "1px solid #22263a" }}>
          {sprite ? <img src={sprite} alt={poke?.name} className="w-12 h-12 object-contain" /> : <Loader2 className="animate-spin" size={16} color="#4c5066" />}
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm truncate">{poke?.name || displayName(entry.slug)}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {(poke?.types || rarityInfo?.types || []).map((t) => <TypeBadge key={t} type={t} />)}
          </div>
        </div>
      </div>
      {rarityMeta && (
        <div className="mb-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: rarityMeta.color + "26", color: rarityMeta.color, border: `1px solid ${rarityMeta.color}66` }}>
            {rarityMeta.label}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-1 mb-2">
        {entry.moves.map((m) => (
          <span key={m} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1c1f2c", color: "#9aa0b4", border: "1px solid #262a3a" }}>
            {displayMoveName(m)}
          </span>
        ))}
      </div>
      <button
        onClick={() => setShowEditMoves(true)}
        className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
        style={{ background: "#1c1f2c", color: "#c7cbdb", border: "1px solid #2c2f42" }}
      >
        Editar movimientos
      </button>

      <MoveEditModal
        open={showEditMoves}
        entry={entry}
        api={api}
        onConfirm={(moves) => { onUpdateMoves(entry, moves); setShowEditMoves(false); }}
        onClose={() => setShowEditMoves(false)}
      />
    </div>
  );
}

function PokemonTab({ api, collection, setCollection, onGoToGatcha }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [shinyOnly, setShinyOnly] = useState(false);

  function handleUpdateMoves(entry, moves) {
    setCollection((c) => c.map((e) => (e.slug === entry.slug && !!e.shiny === !!entry.shiny) ? { ...e, moves } : e));
  }

  // Tipo(s)/rareza de cada entrada vienen de GACHA_POOL (mismo lookup
  // síncrono que ya usa PokemonCard como fallback mientras poke aún no ha
  // cargado): no hace falta esperar al fetch async de cada tarjeta para
  // poder filtrar. Una entrada normal y su versión shiny comparten especie,
  // así que comparten tipo/rareza automáticamente por venir del mismo slug.
  const infoBySlug = (slug) => GACHA_POOL.find((g) => g.slug === slug);

  // Solo se ofrecen en los selectores los tipos/rarezas que de verdad están
  // presentes en la colección actual del usuario (no los 18 tipos/6 rarezas
  // siempre), para no mostrar opciones vacías. Un Pokémon con dos tipos
  // cuenta para ambos.
  const presentTypes = new Set(collection.flatMap((e) => infoBySlug(e.slug)?.types || []));
  const availableTypes = ALL_TYPES.filter((t) => presentTypes.has(t));
  const presentRarities = new Set(collection.map((e) => infoBySlug(e.slug)?.rarity).filter(Boolean));
  const availableRarities = RARITY_ORDER.filter((r) => presentRarities.has(r));

  const hasActiveFilters = search !== "" || typeFilter !== "all" || rarityFilter !== "all" || shinyOnly;
  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setRarityFilter("all");
    setShinyOnly(false);
  }

  const filteredCollection = collection.filter((entry) => {
    if (search && !displayName(entry.slug).toLowerCase().includes(search.toLowerCase())) return false;
    const info = infoBySlug(entry.slug);
    if (typeFilter !== "all" && !(info?.types || []).includes(typeFilter)) return false;
    if (rarityFilter !== "all" && info?.rarity !== rarityFilter) return false;
    if (shinyOnly && !entry.shiny) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Boxes size={22} color="#e3350d" /> Pokémon</h2>
        <p className="text-sm text-[#9aa0b4]">Tu colección de Pokémon conseguidos en el gacha ({collection.length}).</p>
      </div>

      {collection.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
          <Boxes size={32} color="#5c6178" className="mx-auto mb-3" />
          <div className="text-[#c7cbdb] font-medium mb-1">Todavía no tienes ningún Pokémon.</div>
          <p className="text-sm text-[#8a8fa3] mb-4">Prueba el gacha para empezar tu colección.</p>
          <button onClick={onGoToGatcha} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#e3350d,#b8250a)" }}>
            Ir al Gatcha
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar Pokémon..."
              className="px-3 py-2 rounded-lg text-sm text-white outline-none flex-1 min-w-[10rem]"
              style={{ background: "#14161f", border: "1px solid #262a3a" }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg text-xs text-white outline-none"
              style={{ background: "#14161f", border: "1px solid #262a3a" }}
            >
              <option value="all">Todos los tipos</option>
              {availableTypes.map((t) => <option key={t} value={t}>{TYPE_ES[t] || t}</option>)}
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg text-xs text-white outline-none"
              style={{ background: "#14161f", border: "1px solid #262a3a" }}
            >
              <option value="all">Todas las rarezas</option>
              {availableRarities.map((r) => <option key={r} value={r}>{RARITY_META[r].label}</option>)}
            </select>
            <button
              onClick={() => setShinyOnly((s) => !s)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: shinyOnly ? "#f2b70522" : "#14161f",
                border: shinyOnly ? "1px solid #f2b705" : "1px solid #262a3a",
                color: shinyOnly ? "#f2b705" : "#8a8fa3",
              }}
            >
              <Star size={12} fill={shinyOnly ? "#f2b705" : "none"} /> Solo shiny
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-semibold" style={{ color: "#ff6b4a" }}>
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredCollection.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
              <div className="text-[#c7cbdb] font-medium">No se han encontrado Pokémon con estos filtros.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredCollection.map((entry, i) => (
                <PokemonCard key={`${entry.slug}-${entry.shiny ? "shiny" : "normal"}-${i}`} entry={entry} api={api} onUpdateMoves={handleUpdateMoves} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: LOGROS
--------------------------------------------------------------- */

// Tarjeta de UN logro dentro de la tab Logros: icono/título/descripción,
// recompensa (siempre visible, "cobrada" si ya está desbloqueado o como
// incentivo si no), estado visual (destacado+fecha si desbloqueado,
// candado si no) y, si el logro es acumulable, una barra de progreso.
function AchievementCard({ achievement, unlocked, unlockedAt, counter }) {
  const Icon = achievement.icon;
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: unlocked ? "linear-gradient(160deg,#3a3312,#14161f)" : "#14161f",
        border: unlocked ? "1px solid #f2b70566" : "1px solid #262a3a",
        opacity: unlocked ? 1 : 0.85,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: unlocked ? "#f2b70522" : "#1c1f2c" }}>
          {unlocked ? <Icon size={18} color="#f2b705" /> : <Lock size={16} color="#5c6178" />}
        </div>
        {unlocked && <Check size={16} color="#5fae5f" />}
      </div>
      <div className={"text-sm font-semibold mb-0.5 " + (unlocked ? "text-white" : "text-[#c7cbdb]")}>{achievement.title}</div>
      <div className="text-[11px] text-[#8a8fa3] mb-2 leading-snug">{achievement.description}</div>
      {counter && !unlocked && (
        <div className="mb-2">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1c1f2c" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (counter.current / counter.target) * 100)}%`, background: "#e3350d" }} />
          </div>
          <div className="text-[10px] text-[#6b7086] mt-1">{counter.current}/{counter.target}</div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold" style={{ color: unlocked ? "#f2b705" : "#8a8fa3" }}>
          {unlocked ? `+${achievement.reward} monedas cobradas` : `Recompensa: ${achievement.reward} monedas`}
        </span>
        {unlocked && unlockedAt && (
          <span className="text-[10px] text-[#5c6178] shrink-0">{new Date(unlockedAt).toLocaleDateString("es-ES")}</span>
        )}
      </div>
    </div>
  );
}

function LogrosTab({ progress, derived }) {
  const unlockedIds = progress.unlockedAchievementIds;
  const totalCoinsFromAchievements = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).reduce((sum, a) => sum + a.reward, 0);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Award size={22} color="#e3350d" /> Logros</h2>
          <p className="text-sm text-[#9aa0b4]">Completa retos en la Liga para desbloquear insignias especiales y monedas extra.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#1c1f2c", border: "1px solid #2c2f42", color: "#c7cbdb" }}>
            {unlockedIds.length}/{ACHIEVEMENTS.length} logros desbloqueados
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#f2b70518", border: "1px solid #f2b70544" }}>
            <Coins size={14} color="#f2b705" />
            <span className="text-xs font-display text-[#f2b705]">+{totalCoinsFromAchievements} monedas por logros</span>
          </div>
        </div>
      </div>

      {ACHIEVEMENT_CATEGORIES.map((cat) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === cat.id);
        return (
          <div key={cat.id}>
            <h3 className="text-xs font-display text-[#8a8fa3] mb-2 uppercase tracking-wide">{cat.label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  unlocked={unlockedIds.includes(a.id)}
                  unlockedAt={progress.unlockedAt[a.id]}
                  counter={getProgressCounter(a.id, progress, derived)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Notificación breve de logro recién desbloqueado: se apila en la esquina
// (varias a la vez si se desbloquea más de uno de golpe) y se retira sola
// tras unos segundos, o al pulsarla. Mismo estilo dorado de celebración
// que ya usa GachaResultModal para un Pokémon shiny.
function AchievementToast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.key]);
  const Icon = toast.icon;
  return (
    <div
      onClick={onDismiss}
      className="rounded-xl p-3.5 flex items-center gap-3 cursor-pointer shadow-lg"
      style={{ background: "linear-gradient(135deg,#3a3312,#1b1e2b)", border: "1px solid #f2b705" }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f2b70522" }}>
        <Icon size={20} color="#f2b705" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold" style={{ color: "#f2b705" }}>🏆 ¡Logro desbloqueado!</div>
        <div className="text-sm text-white font-semibold truncate">{toast.title}</div>
        <div className="text-[11px] text-[#c7cbdb]">+{toast.reward} monedas</div>
      </div>
    </div>
  );
}

function AchievementToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[92%] max-w-sm">
      {toasts.map((t) => (
        <AchievementToast key={t.key} toast={t} onDismiss={() => onDismiss(t.key)} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   APP
--------------------------------------------------------------- */

export default function App() {
  const api = useApiCache();
  const [tab, setTab] = useState("torneo");
  const [coins, setCoins] = useState(loadStoredCoins);
  const [purchasedTrainerIds, setPurchasedTrainerIds] = useState(loadStoredPurchasedTrainers);
  const [collection, setCollection] = useState(loadStoredCollection);
  const [customTrainer, setCustomTrainer] = useState(() => loadStoredCustomTrainer(loadStoredCollection()));
  const [ownedTrainerMovesets, setOwnedTrainerMovesets] = useState(loadStoredOwnedTrainerMovesets);
  const [tournamentHistory, setTournamentHistory] = useState(loadStoredTournamentHistory);
  // Progreso del sistema de logros: si ya existe guardado, se usa tal
  // cual; si esta es la PRIMERA vez que se activa el sistema sobre una
  // partida ya en curso (no existe todavía la clave en localStorage), se
  // reconstruye retroactivamente a partir de todo lo que ya hay
  // persistido (ver reconstructProgress) y lo que ya se cumpla con ese
  // progreso reconstruido queda desbloqueado EN SILENCIO — sin toast ni
  // monedas, es una carga inicial, no un evento en vivo. Se relee
  // localStorage de forma independiente (mismo patrón que
  // `loadStoredCustomTrainer(loadStoredCollection())` más abajo) porque
  // este useState se ejecuta antes de que el resto de useState de arriba
  // "compartan" su valor ya cargado.
  const [achievementProgress, setAchievementProgress] = useState(() => {
    const stored = loadStoredAchievementProgress();
    if (stored) return stored;
    return reconstructProgress({
      tournamentHistory: loadStoredTournamentHistory(),
      collection: loadStoredCollection(),
      purchasedTrainerIds: loadStoredPurchasedTrainers(),
      customTrainer: loadStoredCustomTrainer(loadStoredCollection()),
      coins: loadStoredCoins(),
    });
  });
  const [achievementToasts, setAchievementToasts] = useState([]);

  useEffect(() => {
    try { localStorage.setItem(COINS_STORAGE_KEY, String(coins)); } catch (e) { /* localStorage no disponible */ }
  }, [coins]);

  useEffect(() => {
    try { localStorage.setItem(UNLOCKED_TRAINERS_STORAGE_KEY, JSON.stringify(purchasedTrainerIds)); } catch (e) { /* localStorage no disponible */ }
  }, [purchasedTrainerIds]);

  useEffect(() => {
    try { localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection)); } catch (e) { /* localStorage no disponible */ }
  }, [collection]);

  useEffect(() => {
    try {
      if (customTrainer) localStorage.setItem(CUSTOM_TRAINER_STORAGE_KEY, JSON.stringify(customTrainer));
    } catch (e) { /* localStorage no disponible */ }
  }, [customTrainer]);

  useEffect(() => {
    try { localStorage.setItem(OWNED_TRAINER_MOVESETS_STORAGE_KEY, JSON.stringify(ownedTrainerMovesets)); } catch (e) { /* localStorage no disponible */ }
  }, [ownedTrainerMovesets]);

  useEffect(() => {
    try { localStorage.setItem(TOURNAMENT_HISTORY_STORAGE_KEY, JSON.stringify(tournamentHistory)); } catch (e) { /* localStorage no disponible */ }
  }, [tournamentHistory]);

  useEffect(() => {
    try { localStorage.setItem(ACHIEVEMENT_PROGRESS_STORAGE_KEY, JSON.stringify(achievementProgress)); } catch (e) { /* localStorage no disponible */ }
  }, [achievementProgress]);

  // Contexto derivado en vivo (colección/entrenadores comprados/entrenador
  // propio) para las condiciones de logros que no hace falta duplicar como
  // contador aparte en achievementProgress (ver buildDerivedContext).
  const achievementDerived = buildDerivedContext({ collection, purchasedTrainerIds, customTrainer, gachaPool: GACHA_POOL });

  // Reevalúa los 50 logros cada vez que cambia el progreso o cualquiera de
  // los datos de los que dependen las condiciones derivadas en vivo
  // (colección, entrenadores comprados, entrenador propio): si algo se
  // acaba de cumplir que todavía no estaba en unlockedAchievementIds, se
  // otorgan sus monedas y se encola su notificación toast. Converge solo:
  // el propio setAchievementProgress de aquí añade esos ids a
  // unlockedAchievementIds, así que la siguiente pasada de este mismo
  // efecto ya no encuentra nada nuevo que desbloquear.
  useEffect(() => {
    const { progress: nextProgress, newlyUnlocked } = evaluateAchievements(achievementProgress, achievementDerived);
    if (newlyUnlocked.length === 0) return;
    setAchievementProgress(nextProgress);
    setCoins((c) => c + newlyUnlocked.reduce((sum, a) => sum + a.reward, 0));
    setAchievementToasts((prev) => [
      ...prev,
      ...newlyUnlocked.map((a) => ({ key: `${a.id}-${Date.now()}-${Math.random()}`, title: a.title, reward: a.reward, icon: a.icon })),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievementProgress, collection, purchasedTrainerIds, customTrainer]);

  function dismissAchievementToast(key) {
    setAchievementToasts((prev) => prev.filter((t) => t.key !== key));
  }

  // Se añade al terminar cada torneo (fase "finished"); se guarda con el más
  // reciente primero y se recorta a las últimas TOURNAMENT_HISTORY_LIMIT
  // entradas para no acumular datos indefinidamente. También alimenta el
  // progreso de logros (torneos jugados/ganados, rachas, modo, dificultad,
  // rareza/tipos del equipo...), a partir de los mismos campos que ya trae
  // `entry` desde TorneoTab (ver finalizeRound).
  function addTournamentHistoryEntry(entry) {
    setTournamentHistory((h) => [entry, ...h].slice(0, TOURNAMENT_HISTORY_LIMIT));
    setAchievementProgress((p) => applyTournamentResult(p, entry));
  }

  // Al hacer una tirada de gacha (ver GatchaTab): alimenta los contadores
  // de tiradas totales/repetidos seguidos/shinies del progreso de logros.
  function recordGachaPull({ isNew, shiny }) {
    setAchievementProgress((p) => applyGachaPull(p, { isNew, shiny }));
  }

  // Al terminar cada combate interactivo del usuario dentro de un torneo
  // (ver TorneoTab.finalizeRound / InteractiveBattle.buildBattleMechanicsFlags):
  // alimenta los flags de mecánicas de combate del progreso de logros.
  function recordCombatMechanics(flags) {
    setAchievementProgress((p) => applyCombatMechanics(p, flags));
  }

  function purchaseTrainer(trainerId, price) {
    setCoins((c) => c - price);
    setPurchasedTrainerIds((ids) => (ids.includes(trainerId) ? ids : [...ids, trainerId]));
    // Se inicializa la copia editable del usuario con el moveset Normal ya
    // existente (nunca el Avanzado, que es solo para la CPU): así, aunque
    // el usuario no edite nada nunca, jugar con este entrenador ya usa
    // dificultad Normal para su equipo sin importar la dificultad de la
    // CPU elegida para esa partida (ver TorneoTab.startTournament).
    const trainer = TRAINERS.find((t) => t.id === trainerId);
    if (trainer) {
      setOwnedTrainerMovesets((prev) => {
        const next = { ...prev };
        for (const slug of trainer.team) {
          const key = `${trainerId}:${slug}`;
          if (!next[key] && TRAINER_MOVESETS[key]) next[key] = TRAINER_MOVESETS[key];
        }
        return next;
      });
    }
  }

  // Edición de un único Pokémon del equipo de un entrenador COMPRADO (las
  // especies son fijas, solo se edita qué movimientos usa): reutiliza el
  // mismo editor (MoveEditModal) que ya usa el entrenador propio, pero
  // guardando bajo `${trainerId}:${slug}` en vez de dentro de `collection`.
  function updateOwnedTrainerMoves(trainerId, slug, moves) {
    setOwnedTrainerMovesets((prev) => ({ ...prev, [`${trainerId}:${slug}`]: moves }));
  }

  // Solo puede haber un entrenador propio en total: si ya existe, esta
  // función no debería poder llamarse de nuevo (la tarjeta de creación deja
  // de ofrecer el formulario en cuanto customTrainer no es null). `team` es
  // un array de 6 { slug, shiny }.
  function createCustomTrainer(name, team) {
    if (customTrainer) return;
    setCustomTrainer({ name, team });
  }

  // Edición del equipo del entrenador propio ya creado: el nombre no
  // cambia, solo el array de 6 { slug, shiny }. El próximo torneo que se
  // inicie con este entrenador ya usa el equipo nuevo (startTournament
  // vuelve a precargar movesetCache con primeMoveset en ese momento).
  function updateCustomTrainerTeam(team) {
    setCustomTrainer((prev) => (prev ? { ...prev, team } : prev));
  }

  const tabs = [
    { id: "torneo", label: "Torneo", icon: Swords },
    { id: "personajes", label: "Personajes", icon: Users },
    { id: "pokemon", label: "Pokémon", icon: Boxes },
    { id: "tienda", label: "Gatcha", icon: Store },
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
        {tab === "torneo" && (
          <TorneoTab
            api={api}
            coins={coins}
            setCoins={setCoins}
            purchasedTrainerIds={purchasedTrainerIds}
            customTrainer={customTrainer}
            collection={collection}
            ownedTrainerMovesets={ownedTrainerMovesets}
            tournamentHistory={tournamentHistory}
            onTournamentFinished={addTournamentHistoryEntry}
            onCombatMechanics={recordCombatMechanics}
          />
        )}
        {tab === "personajes" && (
          <PersonajesTab
            api={api}
            coins={coins}
            purchasedTrainerIds={purchasedTrainerIds}
            onPurchase={purchaseTrainer}
            collection={collection}
            customTrainer={customTrainer}
            onCreateCustomTrainer={createCustomTrainer}
            onUpdateCustomTrainerTeam={updateCustomTrainerTeam}
            ownedTrainerMovesets={ownedTrainerMovesets}
            onUpdateOwnedTrainerMoves={updateOwnedTrainerMoves}
          />
        )}
        {tab === "pokemon" && (
          <PokemonTab api={api} collection={collection} setCollection={setCollection} onGoToGatcha={() => setTab("tienda")} />
        )}
        {tab === "tienda" && (
          <GatchaTab api={api} coins={coins} setCoins={setCoins} collection={collection} setCollection={setCollection} onGachaPull={recordGachaPull} />
        )}
        {tab === "logros" && <LogrosTab progress={achievementProgress} derived={achievementDerived} />}
      </main>

      <AchievementToastStack toasts={achievementToasts} onDismiss={dismissAchievementToast} />
    </div>
  );
}
