// Lógica de la tab Diario: recompensa diaria con racha de 7 días, y el
// minijuego Pokédle. Todo lo de aquí es puro (sin React, sin fetch salvo
// donde se documenta) para poder probarlo/razonarlo con facilidad; App.jsx
// solo lo usa como estado + persistencia.

export const DAILY_REWARDS_STORAGE_KEY = "liga-pokemon:daily-rewards";

// Recompensa diaria y Pokédle comparten el mismo reset: las 10:00 hora de
// España (Europe/Madrid), calculado con Intl.DateTimeFormat para respetar
// el cambio de horario de verano/invierno en vez de un offset fijo que se
// desajustaría dos veces al año.
const RESET_HOUR_MADRID = 10;

function getMadridParts(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  // Con hour12:false, algunos motores devuelven "24" para la medianoche en
  // vez de "00" — se normaliza aquí para que la comparación `hour <
  // RESET_HOUR_MADRID` de abajo no trate la medianoche como si ya hubiera
  // pasado el reset de las 10:00.
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour };
}

// Clave del "día actual" a efectos de Pokédle/recompensa diaria: antes de
// las 10:00 en Madrid todavía cuenta como el día anterior. Se calcula
// restando un día en UTC (solo para el cálculo del calendario, no afecta a
// la hora real) sobre la fecha ya obtenida en la zona de Madrid.
export function getDailyResetDayKey(date = new Date()) {
  const { year, month, day, hour } = getMadridParts(date);
  if (hour < RESET_HOUR_MADRID) {
    const rolledBack = new Date(Date.UTC(year, month - 1, day));
    rolledBack.setUTCDate(rolledBack.getUTCDate() - 1);
    const y = rolledBack.getUTCFullYear();
    const m = String(rolledBack.getUTCMonth() + 1).padStart(2, "0");
    const d = String(rolledBack.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Hash simple y determinista de una cadena (djb2-like), usado solo para
// elegir el índice del Pokémon del día a partir de la fecha — no hace
// falta ninguna propiedad criptográfica, solo que sea estable y bien
// repartido entre fechas consecutivas.
export function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 31) + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPokemonOfTheDay(dayKey, pool) {
  const idx = hashStringToInt(dayKey) % pool.length;
  return pool[idx];
}

export function buildDefaultDailyRewardsState() {
  return {
    dailyClaim: { lastClaimedDayKey: null, streak: 0 },
    pokedle: { dayKey: null, guesses: [], status: "playing", winAttempt: null },
  };
}

export function loadDailyRewardsState() {
  try {
    const raw = localStorage.getItem(DAILY_REWARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...buildDefaultDailyRewardsState(),
          ...parsed,
          dailyClaim: { ...buildDefaultDailyRewardsState().dailyClaim, ...(parsed.dailyClaim || {}) },
          pokedle: { ...buildDefaultDailyRewardsState().pokedle, ...(parsed.pokedle || {}) },
        };
      }
    }
  } catch (e) { /* localStorage no disponible */ }
  return buildDefaultDailyRewardsState();
}

// Monedas de la recompensa diaria para el día N (1-indexado) de la racha
// que se está reclamando AHORA MISMO: 50 monedas los días 1-6, 500 en el
// día 7 (en vez de sumarse a las 50, las sustituye).
export function computeDailyClaimReward(streakDayNumber) {
  return streakDayNumber >= 7 ? 500 : 50;
}

// Día de racha (1-7) al que correspondería HOY: si ya se reclamó hoy, es
// simplemente la racha ya guardada (que ya incluye el reclamo de hoy); si
// no, es una previsualización de a qué día correspondería reclamar ahora
// mismo, sin mutar nada — usado tanto por claimDailyReward como por la UI
// para mostrar "Racha: X/7" antes de reclamar.
export function getStreakDayNumberForToday(dailyClaim, todayKey) {
  const claim = dailyClaim || { lastClaimedDayKey: null, streak: 0 };
  if (claim.lastClaimedDayKey === todayKey) return claim.streak;
  const wasConsecutive = claim.lastClaimedDayKey === previousDayKey(todayKey);
  const priorStreak = wasConsecutive ? claim.streak : 0;
  // Si el reclamo anterior ya completó el día 7 (streak llegó a 7), el
  // siguiente reclamo consecutivo empieza de nuevo en el día 1, no en el 8.
  return priorStreak >= 7 ? 1 : priorStreak + 1;
}

// Resuelve un intento de reclamar la recompensa diaria. Devuelve
// `{ claimed: false }` si ya se reclamó hoy (no hay nada que hacer), o
// `{ claimed: true, reward, streakDayNumber, nextState }` si se reclama
// con éxito. La racha se reinicia a 0/1 si se saltó algún día (el día de
// ayer, en dayKeys, no es exactamente "hoy - 1 reclamo"), y vuelve a
// empezar en el día 1 justo después de completar el día 7.
export function claimDailyReward(state, todayKey) {
  const claim = state.dailyClaim || { lastClaimedDayKey: null, streak: 0 };
  if (claim.lastClaimedDayKey === todayKey) {
    return { claimed: false };
  }
  const streakDayNumber = getStreakDayNumberForToday(claim, todayKey);
  const reward = computeDailyClaimReward(streakDayNumber);
  return {
    claimed: true,
    reward,
    streakDayNumber,
    nextState: { ...state, dailyClaim: { lastClaimedDayKey: todayKey, streak: streakDayNumber } },
  };
}

// Día anterior (en dayKeys, formato AAAA-MM-DD) al dado, en UTC puro — solo
// se usa para comparar cadenas de fecha entre sí, no para mostrar ninguna
// hora real, así que no hace falta tener en cuenta la zona horaria aquí.
function previousDayKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export const POKEDLE_MAX_ATTEMPTS = 6;

// Recompensa del Pokédle según en qué intento (1-indexado) se acierta.
export function computePokedleReward(attemptNumber) {
  if (attemptNumber <= 2) return 300;
  if (attemptNumber <= 4) return 150;
  return 100;
}

// Tolerancia para las pistas de altura/peso: estos valores son fijos por
// especie (vienen siempre iguales de la API), así que en la práctica solo
// hace falta protegerse de imprecisión de coma flotante al convertir de
// decímetros/hectogramos — no una tolerancia "generosa" pensada para que
// valores realmente distintos cuenten como iguales.
const MEASUREMENT_TOLERANCE = 0.05;

function scoreDirectional(guessValue, targetValue, tolerance = 0) {
  if (guessValue == null || targetValue == null) return "unknown";
  if (Math.abs(guessValue - targetValue) <= tolerance) return "green";
  return guessValue < targetValue ? "up" : "down";
}

// Pista de tipo en una posición (0 = tipo1, 1 = tipo2): verde si coincide
// exactamente en esa posición, amarillo si el tipo elegido existe en el
// objetivo pero en la OTRA posición, negro si no aparece en absoluto. La
// ausencia de segundo tipo se trata como su propio valor "ninguno" (no
// coincide con ningún tipo real), así que un monotipo comparado con un
// bitipo en la posición 2 da negro, y dos monotipos entre sí dan verde.
function scoreTypeSlot(guessTypes, targetTypes, slotIndex) {
  const guessVal = guessTypes[slotIndex] ?? null;
  const targetVal = targetTypes[slotIndex] ?? null;
  if (guessVal === targetVal) return "green";
  if (guessVal != null && targetTypes.includes(guessVal)) return "yellow";
  return "black";
}

// Compara un Pokémon "perfil" (guess) contra el objetivo del día y
// devuelve la fila de pistas de los 6 atributos. Ambos perfiles deben
// tener la forma { slug, types: [t1, t2|null], generation, bst,
// heightM, weightKg }. La pista de "bst" (stats totales) sustituye a la
// que antes comparaba rareza: mismo criterio direccional (verde si
// coincide exacto, arriba/abajo si el objetivo es mayor/menor).
export function scorePokedleGuess(guess, target) {
  return {
    type1: scoreTypeSlot(guess.types, target.types, 0),
    type2: scoreTypeSlot(guess.types, target.types, 1),
    generation: scoreDirectional(guess.generation, target.generation),
    bst: scoreDirectional(guess.bst, target.bst),
    height: scoreDirectional(guess.heightM, target.heightM, MEASUREMENT_TOLERANCE),
    weight: scoreDirectional(guess.weightKg, target.weightKg, MEASUREMENT_TOLERANCE),
  };
}
