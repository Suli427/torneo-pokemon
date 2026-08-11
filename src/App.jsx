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
    team: ["pikachu", "dragonite", "sirfetchd", "gengar", "lucario", "goodra"] },
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

const NAME_OVERRIDES = { sirfetchd: "Sirfetch'd", "mr-rime": "Mr. Rime", "gourgeist-average": "Gourgeist", "aegislash-shield": "Aegislash" };
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
function applyMoveEffects(attacker, defender, move, mult = 1, defenderFainted = false) {
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
          target.confusionTurns = 1 + Math.floor(Math.random() * 4);
          events.push({ type: "statusText", text: `${target.name} ha quedado confundido`, inline: false });
        }
      } else if (AILMENT_APPLY_TEXT[move.ailmentName] && !target.status) {
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
const FIXED_POWER_OVERRIDES = { bide: 100, "low-kick": 60, "grass-knot": 60 };
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
    const hasDamage = moves.some((m) => m.damageClass !== "status" && (m.power || m.specialDamage || m.isOHKO));
    if (!hasDamage) {
      moves[moves.length - 1] = await getMove("tackle");
    }
    movesetCache.current[cacheKey] = moves;
    return moves;
  }, [getPokemon, getMove]);

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
    let power = move.power;
    if (move.specialDamage === "speed-ratio") {
      const ratio = getEffectiveSpeed(attacker) / Math.max(1, getEffectiveSpeed(defender));
      power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40;
    }

    // El crítico se decide antes de leer los stages: ignora bajadas propias
    // de Ataque/Ataque Especial (nunca peor que stage 0) y subidas de
    // Defensa/Defensa Especial del rival (nunca mejor que stage 0), pero
    // conserva subidas propias y bajadas del rival tal cual. Sin crítico,
    // los stages se usan reales sin ningún clamp especial.
    const isCrit = Math.random() < 1 / 24;
    const atkStageClamp = isCrit ? (s) => Math.max(0, s) : undefined;
    const defStageClamp = isCrit ? (s) => Math.min(0, s) : undefined;

    let atkStat = move.damageClass === "special"
      ? getEffectiveStat(attacker, "special-attack", atkStageClamp)
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
    const mult = await typeMultiplier([move.type], defender.types);
    const critMult = isCrit ? 1.5 : 1;
    const rand = 0.85 + Math.random() * 0.15;
    let damage = Math.floor(base * stab * weatherMult * mult * critMult * rand);
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
    const weatherMult = weatherDamageMultiplier(weather, move.type);
    const mult = await typeMultiplier([move.type], defender.types);
    let expected = base * stab * weatherMult * mult * (acc / 100);
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

  // Elige el movimiento con mayor daño esperado. Excepción no bloqueante:
  // por debajo del 40% de PS, si el Pokémon tiene un movimiento de estado
  // que sube sus propias stats y no lo ha usado aún este combate, lo
  // prioriza una única vez antes de volver a centrarse en el daño.
  const chooseMove = useCallback(async (attacker, defender, weather) => {
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

    const scores = await Promise.all(usable.map((m) => expectedDamage(attacker, defender, m, weather)));
    let bestIdx = 0;
    for (let k = 1; k < scores.length; k++) if (scores[k] > scores[bestIdx]) bestIdx = k;
    return usable[bestIdx];
  }, [expectedDamage]);

  const executeMove = useCallback(async (attacker, defender, move, weather) => {
    // El PP se gasta por el mero hecho de seleccionar y ejecutar el
    // movimiento (acierte, falle por precisión o quede bloqueado por
    // Protección); ejecuteMove solo se llama cuando el atacante SÍ pudo
    // actuar (statusPreMoveCheck ya se resolvió antes), así que aquí no
    // hace falta distinguir esos casos.
    if (move.ppLeft != null) move.ppLeft = Math.max(0, move.ppLeft - 1);

    // La recarga se gasta por haber usado el movimiento, acierte o no
    // (equivalente simplificado a los juegos reales).
    const isRecharge = RECHARGE_MOVES.has(move.name);
    const isThrashing = THRASHING_MOVES.has(move.name);
    const isProtectMove = PROTECT_MOVES.has(move.name);

    // La racha de Protección solo cuenta usos consecutivos: en cuanto se
    // usa cualquier otro movimiento se reinicia (tanto si acierta como si
    // el propio ataque queda bloqueado por la protección del rival).
    if (!isProtectMove) attacker.protectChain = 0;

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
      const events = applyMoveEffects(attacker, defender, move, lastMult, defender.hp <= 0);
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
      const events = applyMoveEffects(attacker, defender, move);
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
    const events = applyMoveEffects(attacker, defender, move, mult, defender.hp <= 0);
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
    if (isRecharge) attacker.mustRecharge = true;
    const thrashEvent = updateThrashLock();
    if (thrashEvent) events.push(thrashEvent);
    return { hit: true, damage, crit: isCrit, status: false, events };
  }, [computeDamage]);

  // Resuelve un único turno: ambos movimientos ya elegidos, orden por
  // prioridad/velocidad (con parálisis afectando la velocidad efectiva),
  // ejecuta cada ataque y aplica el daño residual de quemadura/veneno al
  // final. Muta pa.hp / pb.hp directamente.
  const resolveTurn = useCallback(async (pa, pb, moveA, moveB, trainerAId, trainerBId, weather) => {
    const turns = [];
    const prioA = moveA ? (moveA.priority || 0) : -100;
    const prioB = moveB ? (moveB.priority || 0) : -100;
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

      // Sin PP en ningún movimiento (chooseMove ya lo filtró y devolvió
      // null): el turno se pierde sin más, sin implementar Forcejeo.
      if (!move) {
        turns.push({ type: "statusText", text: `${attacker.name} no tiene PP para ningún movimiento y pierde el turno` });
        continue;
      }

      const result = await executeMove(attacker, defender, move, weather);
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
      });
      // El debilitamiento del rival se anota justo después del golpe, antes
      // que cualquier evento adicional (bajada de stat propia, drenaje,
      // retroceso...): en este punto, si el rival se debilitó, los únicos
      // extraEvents que quedan son los que afectan al propio atacante (los
      // que iban dirigidos al rival ya se omiten en ese caso), así que el
      // orden natural es "impacta → el rival cae → el atacante asume las
      // consecuencias de haber atacado".
      if (defender.hp <= 0) {
        turns.push({ type: "faint", pokemon: defender.name });
      }
      turns.push(...extraEvents);
    }

    applyResidualStatusDamage(pa, turns);
    applyResidualStatusDamage(pb, turns);
    applyWeatherResidualDamage(pa, weather, turns);
    applyWeatherResidualDamage(pb, weather, turns);
    tickWeatherDuration(weather, turns);

    // La exención de "me acabo de dormir" solo vale para un posible chequeo
    // dentro de este mismo turno (si el Pokémon actúa en segundo lugar);
    // si no se consumió aquí, se limpia igualmente para que su próximo
    // turno real sí cuente como el primer turno dormido.
    pa.justFellAsleep = false;
    pb.justFellAsleep = false;

    // La Protección solo dura el turno en el que se usó: se limpia aquí
    // para que, al empezar el turno siguiente, ya no bloquee nada (la
    // racha de usos consecutivos sí se conserva, se gestiona aparte).
    pa.protected = false;
    pb.protected = false;

    // Amedrentar (flinch) solo vale para un posible chequeo dentro de
    // este mismo turno (si el objetivo aún no había actuado); si no se
    // consumió aquí, se limpia igual para no arrastrarlo al turno siguiente.
    pa.flinched = false;
    pb.flinched = false;

    return turns;
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

    const attackTarget = async (target) => {
      if (opponent.hp <= 0 || target.hp <= 0) return;
      if (!opponentMove) {
        turns.push({ type: "statusText", text: `${opponent.name} no tiene PP para ningún movimiento y pierde el turno` });
        return;
      }
      if (!statusPreMoveCheck(opponent, turns)) {
        if (opponent.hp <= 0) turns.push({ type: "faint", pokemon: opponent.name });
        return;
      }
      const result = await executeMove(opponent, target, opponentMove, weather);
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
      });
      // Mismo orden que en resolveTurn: el debilitamiento del objetivo se
      // anota antes que los efectos adicionales que le queden al que
      // atacó (bajada de stat propia, retroceso...).
      if (target.hp <= 0) turns.push({ type: "faint", pokemon: target.name });
      turns.push(...extraEvents);
    };

    // Persecución contra el Pokémon que se está cambiando: golpea antes de
    // que se complete el cambio, al doble de su potencia normal. Se muta
    // temporalmente move.power (conservando el mismo objeto, para que el
    // PP se descuente sobre el movimiento real) y se restaura justo después.
    const isPursuitOnSwitcher = !!(opponentMove && PURSUIT_MOVES.has(opponentMove.name));

    if (isPursuitOnSwitcher) {
      const originalPower = opponentMove.power;
      opponentMove.power = (originalPower || 0) * 2;
      await attackTarget(outgoing);
      opponentMove.power = originalPower;
    }

    if (outgoing.hp > 0) {
      turns.push({ type: "statusText", text: `¡Vuelve, ${outgoing.name}!` });
    }
    outgoing.statStages = { attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0, accuracy: 0, evasion: 0 };
    outgoing.protected = false;
    outgoing.protectChain = 0;
    // El estado no volátil (incluido Tóxico) persiste al cambiar, pero el
    // contador de daño creciente de Tóxico sí se reinicia: si vuelve a
    // entrar más tarde, el siguiente tic vuelve a ser 1/16, no continúa
    // donde se quedó.
    outgoing.toxicCounter = 0;
    turns.push({ type: "statusText", text: `¡Adelante, ${incoming.name}!` });

    // Salvo la excepción de Persecución de arriba, el rival actúa siempre
    // DESPUÉS de completarse el cambio, contra el Pokémon recién entrado,
    // sin comparar Velocidad ni prioridad.
    if (!isPursuitOnSwitcher) await attackTarget(incoming);

    applyResidualStatusDamage(incoming, turns);
    applyResidualStatusDamage(opponent, turns);
    applyWeatherResidualDamage(incoming, weather, turns);
    applyWeatherResidualDamage(opponent, weather, turns);
    tickWeatherDuration(weather, turns);

    incoming.justFellAsleep = false;
    opponent.justFellAsleep = false;
    incoming.flinched = false;
    opponent.flinched = false;

    return turns;
  }, [executeMove]);

  // Combate 1 contra 1 por turnos hasta que uno de los dos se quede a 0 PS
  // (IA para ambos lados).
  const simulateDuel = useCallback(async (pa, pb, trainerAId, trainerBId, weather) => {
    const turns = [];
    let guard = 0;
    while (pa.hp > 0 && pb.hp > 0 && guard < 100) {
      guard++;
      const [moveA, moveB] = await Promise.all([chooseMove(pa, pb, weather), chooseMove(pb, pa, weather)]);
      turns.push(...(await resolveTurn(pa, pb, moveA, moveB, trainerAId, trainerBId, weather)));
    }
    const winnerSide = pa.hp > 0 ? "a" : "b";
    return { pokemonAName: pa.name, pokemonBName: pb.name, trainerAId, trainerBId, winnerSide, turns };
  }, [chooseMove, resolveTurn]);

  const preparePokemonForBattle = useCallback(async (trainerId, slug) => {
    const base = await getPokemon(slug);
    const baseMoves = await getMoveset(trainerId, slug);
    // Copia por instancia de cada movimiento (con su propio PP) para que
    // gastar PP en este Pokémon no afecte al mismo movimiento cacheado que
    // usan otros Pokémon. El PP no se restaura si el Pokémon es cambiado
    // por otro y vuelve a entrar más tarde en el mismo combate.
    const moves = baseMoves.map((m) => ({ ...m, ppLeft: m.pp ?? 0 }));
    const baseHp = base.stats.hp ?? 70;
    // PS a nivel 50 (IV=31, EV=0): floor((2*base+31)*50/100) + 50 + 10
    const maxHp = Math.floor(((2 * baseHp + 31) * 50) / 100) + 60;
    return {
      ...base, moves, maxHp, hp: maxHp,
      status: null, sleepTurns: 0, justFellAsleep: false, confusionTurns: 0, usedSetupMove: false, mustRecharge: false,
      lockedMove: null, lockedTurnsRemaining: 0, protected: false, protectChain: 0,
      flinched: false, toxicCounter: 0,
      statStages: { attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0, accuracy: 0, evasion: 0 },
    };
  }, [getPokemon, getMoveset]);

  const prepareTeam = useCallback(async (trainer) => {
    return Promise.all(trainer.team.map((s) => preparePokemonForBattle(trainer.id, s)));
  }, [preparePokemonForBattle]);

  const simulateMatch = useCallback(async (trainerA, trainerB) => {
    const teamA = await prepareTeam(trainerA);
    const teamB = await prepareTeam(trainerB);
    // El clima es del combate entero (no de cada duelo 1v1 por separado):
    // persiste a través de los cambios de Pokémon por debilitamiento.
    const weather = { type: null, turnsLeft: 0, justSet: false };
    let i = 0, j = 0;
    const log = [];
    while (i < teamA.length && j < teamB.length) {
      const pa = teamA[i], pb = teamB[j];
      const duel = await simulateDuel(pa, pb, trainerA.id, trainerB.id, weather);
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

  return { getPokemon, getType, simulateMatch, preloadAll, prepareTeam, resolveTurn, resolveSwitchTurn, chooseMove, typeMultiplier };
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

// Indicador del clima de combate activo (icono + turnos restantes). No
// interfiere con el selector de movimientos ni con el log: se muestra justo
// encima de ellos, junto a la cabecera del combate. Discreto/ausente si no
// hay clima activo, para no ocupar espacio innecesario.
function WeatherIndicator({ weather }) {
  if (!weather || !weather.type) {
    return <div className="text-[11px] text-[#5c6178]">Clima despejado</div>;
  }
  const meta = WEATHER_META[weather.type];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: meta.color + "22", border: `1px solid ${meta.color}66`, color: meta.color }}
    >
      <span>{meta.icon}</span>
      <span>{meta.label} · {weather.turnsLeft} {weather.turnsLeft === 1 ? "turno" : "turnos"}</span>
    </div>
  );
}

// Cuadrícula de tarjetas seleccionables de Pokémon del equipo del usuario,
// reutilizada tanto para elegir con quién empezar el combate (los 6, ninguno
// debilitado todavía) como para elegir el reemplazo obligatorio tras un
// debilitamiento (solo los que sigan con vida). `showHp` decide si se
// muestra la barra de PS actuales/máximos (no aplica al elegir el inicial,
// ya que todos están a PS máximos) o solo los PS máximos.
function TeamPicker({ team, onChoose, showHp, disabled }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {team.map((p, i) => {
        if (showHp && p.hp <= 0) return null;
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
function InteractiveBattle({ api, trainerA, trainerB, userSide, onFinish }) {
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
  const logEndRef = useRef(null);
  // El clima es del combate entero, no de cada Pokémon: se guarda en un ref
  // mutable (igual que en simulateMatch) para que persista a través de
  // cambios de Pokémon y renders sin formar parte del estado de React.
  const weatherRef = useRef({ type: null, turnsLeft: 0, justSet: false });

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
  function finalizeIndices(candidateIdxA, candidateIdxB) {
    const aAlive = teamA.some((p) => p.hp > 0);
    const bAlive = teamB.some((p) => p.hp > 0);

    if (!aAlive || !bAlive) {
      const aWiped = !aAlive;
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

    if (teamA[candidateIdxA].hp > 0) {
      setIdxA(candidateIdxA);
    } else if (userSide === "a") {
      setIdxA(candidateIdxA);
      pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
    } else {
      setIdxA(nextAliveIndex(teamA, candidateIdxA));
    }

    if (teamB[candidateIdxB].hp > 0) {
      setIdxB(candidateIdxB);
    } else if (userSide === "b") {
      setIdxB(candidateIdxB);
      pendingChoiceLines.push({ type: "statusText", text: "¿A quién quieres enviar a continuación?" });
    } else {
      setIdxB(nextAliveIndex(teamB, candidateIdxB));
    }

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
    setLog((l) => [...l, { type: "statusText", text: `¡Adelante, ${incoming.name}!` }]);
    if (userSide === "a") setIdxA(idx); else setIdxB(idx);
  }

  async function handleUserMove(move) {
    if (busy || result) return;
    setBusy(true);
    const weather = weatherRef.current;
    const aiMove = await api.chooseMove(aiPoke, userPoke, weather);
    const moveA = userSide === "a" ? move : aiMove;
    const moveB = userSide === "a" ? aiMove : move;
    const turns = await api.resolveTurn(pa, pb, moveA, moveB, trainerA.id, trainerB.id, weather);
    setLog((l) => [...l, ...turns]);
    finalizeIndices(idxA, idxB);
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
    const aiMove = await api.chooseMove(opponent, outgoing, weather);
    const turns = await api.resolveSwitchTurn(outgoing, incoming, opponent, aiMove, opponentTrainerId, weather);
    setLog((l) => [...l, ...turns]);

    // El elegido pasa a ser el candidato a activo del usuario; si el rival
    // lo debilita antes de que pueda actuar, finalizeIndices ya se encarga
    // de avanzar al siguiente vivo de la fila (sin elección adicional).
    finalizeIndices(userSide === "a" ? targetIdx : idxA, userSide === "a" ? idxB : targetIdx);
    setBusy(false);
  }

  const userWon = result && result.winnerId === userTrainer.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <TeamStatusRow team={userTeam} activeIndex={userIdx} />
        <TeamStatusRow team={aiTeam} activeIndex={aiIdx} />
      </div>

      <div className="flex justify-center">
        <WeatherIndicator weather={weatherRef.current} />
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

      {!result && userPoke.hp <= 0 ? (
        <div className="rounded-lg p-4" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
          <TeamPicker team={userTeam} onChoose={handleForcedSwitch} showHp={true} disabled={busy} />
        </div>
      ) : !result && userPoke.lockedMove ? (
        <div className="rounded-lg p-4 text-center" style={{ background: "#14161f", border: "1px solid #e3350d55" }}>
          <div className="text-sm text-[#e5e7f0] mb-3">
            {userPoke.name} está en furia y no puede elegir otro movimiento: seguirá usando <span className="font-semibold text-white">{displayMoveName(userPoke.lockedMove)}</span> a la fuerza.
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
                const powerLabel = isStatus ? "—" : (m.power ?? "Variable");
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

function TorneoTab({ api, coins, setCoins, purchasedTrainerIds }) {
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
  const [tournamentReward, setTournamentReward] = useState(null); // { amount, before, after }

  function toggleMatch(key) {
    setExpandedMatches((e) => ({ ...e, [key]: !e[key] }));
  }

  const unlockedTrainers = TRAINERS.filter((t) => isTrainerUnlocked(t, purchasedTrainerIds));

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
      const before = coins;
      setTournamentReward({ amount: reward, before, after: before + reward });
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
    setTournamentReward(null);
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
// tras confirmar. Reutiliza la misma estructura visual que ComingSoonModal.
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

function PersonajesTab({ api, onSoon, coins, purchasedTrainerIds, onPurchase }) {
  const [sprites, setSprites] = useState({});
  const [confirmTrainer, setConfirmTrainer] = useState(null);
  const [successName, setSuccessName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const t of TRAINERS.filter((t) => isTrainerUnlocked(t, purchasedTrainerIds))) {
        for (const slug of t.team) {
          const p = await api.getPokemon(slug);
          if (!cancelled) setSprites((s) => ({ ...s, [slug]: p }));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasedTrainerIds]);

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
                {t.team.map((slug) => {
                  const p = sprites[slug];
                  return (
                    <div key={slug} className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "#0e1018", border: "1px solid #22263a" }} title={displayName(slug)}>
                      {!unlocked ? <Lock size={14} color="#4c5066" /> : p?.sprite ? <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" /> : <Loader2 className="animate-spin" size={14} color="#4c5066" />}
                    </div>
                  );
                })}
              </div>
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

      <button onClick={() => onSoon("Crea tu propio entrenador")} className="w-full rounded-xl p-5 text-left" style={{ background: "#14161f", border: "1px dashed #3a3f57" }}>
        <Sparkles size={20} color="#e3350d" className="mb-2" />
        <div className="text-white font-semibold">Crea tu propio entrenador</div>
        <div className="text-xs text-[#8a8fa3] mt-1">Diseña tu personaje y arma tu propio equipo Pokémon.</div>
      </button>

      <PurchaseTrainerModal
        trainer={confirmTrainer}
        coins={coins}
        successName={successName}
        onConfirm={handleConfirmPurchase}
        onClose={closeModal}
      />
    </div>
  );
}

/* ---------------------------------------------------------------
   TAB: GATCHA
--------------------------------------------------------------- */

function GatchaTab({ onSoon }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-1 flex items-center gap-2"><Store size={22} color="#e3350d" /> Gatcha</h2>
        <p className="text-sm text-[#9aa0b4]">Gasta tus monedas de torneo en gachas de Pokémon.</p>
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
  const [coins, setCoins] = useState(loadStoredCoins);
  const [purchasedTrainerIds, setPurchasedTrainerIds] = useState(loadStoredPurchasedTrainers);
  const [soon, setSoon] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(COINS_STORAGE_KEY, String(coins)); } catch (e) { /* localStorage no disponible */ }
  }, [coins]);

  useEffect(() => {
    try { localStorage.setItem(UNLOCKED_TRAINERS_STORAGE_KEY, JSON.stringify(purchasedTrainerIds)); } catch (e) { /* localStorage no disponible */ }
  }, [purchasedTrainerIds]);

  function purchaseTrainer(trainerId, price) {
    setCoins((c) => c - price);
    setPurchasedTrainerIds((ids) => (ids.includes(trainerId) ? ids : [...ids, trainerId]));
  }

  const tabs = [
    { id: "torneo", label: "Torneo", icon: Swords },
    { id: "personajes", label: "Personajes", icon: Users },
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
        {tab === "torneo" && <TorneoTab api={api} coins={coins} setCoins={setCoins} purchasedTrainerIds={purchasedTrainerIds} />}
        {tab === "personajes" && (
          <PersonajesTab
            api={api}
            onSoon={setSoon}
            coins={coins}
            purchasedTrainerIds={purchasedTrainerIds}
            onPurchase={purchaseTrainer}
          />
        )}
        {tab === "tienda" && <GatchaTab onSoon={setSoon} />}
        {tab === "logros" && <LogrosTab onSoon={setSoon} />}
      </main>

      <ComingSoonModal open={!!soon} title={soon} onClose={() => setSoon(null)} />
    </div>
  );
}
