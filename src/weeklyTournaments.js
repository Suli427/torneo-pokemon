// Lógica del Torneo Semanal: temática determinista por semana (mismo patrón
// de fecha/hora que src/dailyRewards.js, extendido a cadencia semanal en vez
// de diaria), y su propio estado persistido (últimas temáticas para no
// repetir, y qué semanas ya se han completado). Todo aquí es puro (sin
// React); App.jsx solo lo usa como estado + persistencia, igual que
// dailyRewards.js.

import { hashStringToInt } from "./dailyRewards";
import { GACHA_POOL } from "./gachaPool";

export const WEEKLY_TOURNAMENT_STORAGE_KEY = "liga-pokemon:weekly-tournament";
export const WEEKLY_TOURNAMENT_REWARD = 1000;
export const WEEKLY_TEAM_SIZE = 6;

// Mismo reset a las 10:00 hora de España (Europe/Madrid) que el Pokédle y la
// recompensa diaria, pero de cadencia SEMANAL: la semana activa empieza el
// LUNES a las 10:00 y dura hasta el lunes siguiente a la misma hora.
const RESET_HOUR_MADRID = 10;

function getMadridParts(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, weekday: "short",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  // Ver mismo comentario en dailyRewards.js: algunos motores devuelven "24"
  // para la medianoche en vez de "00".
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour, weekday: parts.weekday };
}

// "Mon"->0 ... "Sun"->6: días transcurridos desde el lunes de esa semana.
const WEEKDAY_OFFSET = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Clave de la "semana activa" (formato AAAA-MM-DD, la fecha del lunes de esa
// semana en Madrid): antes de las 10:00 del lunes todavía cuenta como la
// semana anterior, igual que el Pokédle trata "antes de las 10:00" como el
// día de ayer.
export function getActiveWeekKey(date = new Date()) {
  const { year, month, day, hour, weekday } = getMadridParts(date);
  const daysSinceMonday = WEEKDAY_OFFSET[weekday] ?? 0;
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  if (daysSinceMonday === 0 && hour < RESET_HOUR_MADRID) {
    // Todavía es lunes pero antes de las 10:00: la semana activa es la
    // anterior, así que se retrocede una semana más.
    monday.setUTCDate(monday.getUTCDate() - 7);
  }
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Instante real (Date) del próximo reset semanal (el lunes 10:00 siguiente a
// la semana activa de `date`), usado solo para la cuenta atrás de la
// interfaz. Madrid alterna entre UTC+1 (invierno) y UTC+2 (verano); en vez
// de calcular el cambio de horario a mano, se prueban ambos offsets y se usa
// el que de verdad resuelve a las 10:00 del lunes esperado en Madrid — una
// forma sencilla y fiable de no tener que implementar las reglas exactas del
// cambio de hora europeo.
export function getNextWeeklyResetDate(date = new Date()) {
  const weekKey = getActiveWeekKey(date);
  const [y, m, d] = weekKey.split("-").map(Number);
  const targetUTCDate = new Date(Date.UTC(y, m - 1, d + 7));
  const expectedDay = targetUTCDate.getUTCDate();
  const expectedMonth = targetUTCDate.getUTCMonth() + 1;
  for (const offsetHours of [2, 1]) {
    const candidate = new Date(targetUTCDate.getTime() + (RESET_HOUR_MADRID - offsetHours) * 3600 * 1000);
    const parts = getMadridParts(candidate);
    if (parts.hour === RESET_HOUR_MADRID && parts.day === expectedDay && parts.month === expectedMonth) {
      return candidate;
    }
  }
  // No debería llegar aquí (uno de los dos offsets siempre cuadra), pero se
  // deja un valor razonable en vez de lanzar un error.
  return new Date(targetUTCDate.getTime() + (RESET_HOUR_MADRID - 2) * 3600 * 1000);
}

// Las 10 temáticas semanales fijas. `matches` recibe { types, rarity } de
// una especie del GACHA_POOL (ver speciesMatchesTheme) y decide si cuenta
// para esta temática: para las de tipo, basta con que el Pokémon TENGA ese
// tipo entre sus 1-2 tipos (no hace falta ser monotipo) — es la lectura más
// natural de "equipo 100% tipo X" (el equipo entero encaja con esa
// temática), no que cada Pokémon deba carecer de un segundo tipo.
export const WEEKLY_THEMES = [
  { id: "fire", title: "Furia de Fuego", description: "Un equipo formado íntegramente por Pokémon de tipo Fuego.", matches: (info) => info.types.includes("fire") },
  { id: "electric", title: "Corriente Eléctrica", description: "Un equipo formado íntegramente por Pokémon de tipo Eléctrico.", matches: (info) => info.types.includes("electric") },
  { id: "water", title: "Marea Alta", description: "Un equipo formado íntegramente por Pokémon de tipo Agua.", matches: (info) => info.types.includes("water") },
  { id: "grass", title: "Bosque Sagrado", description: "Un equipo formado íntegramente por Pokémon de tipo Planta.", matches: (info) => info.types.includes("grass") },
  { id: "dragon", title: "Furia Draconiana", description: "Un equipo formado íntegramente por Pokémon de tipo Dragón.", matches: (info) => info.types.includes("dragon") },
  { id: "dark", title: "Sombras", description: "Un equipo formado íntegramente por Pokémon de tipo Siniestro.", matches: (info) => info.types.includes("dark") },
  { id: "fairy", title: "Encanto", description: "Un equipo formado íntegramente por Pokémon de tipo Hada.", matches: (info) => info.types.includes("fairy") },
  { id: "flying", title: "Alto Vuelo", description: "Un equipo formado íntegramente por Pokémon de tipo Volador.", matches: (info) => info.types.includes("flying") },
  { id: "steel", title: "Muralla de Acero", description: "Un equipo formado íntegramente por Pokémon de tipo Acero.", matches: (info) => info.types.includes("steel") },
  { id: "common", title: "Desde Cero", description: "Un equipo formado íntegramente por Pokémon de rareza Común.", matches: (info) => info.rarity === "common" },
];

// ¿La especie de este slug cumple la temática? Busca en GACHA_POOL (única
// fuente ya existente de tipo/rareza por especie); si el slug no está en el
// pool (no debería pasar para nada obtenido por gacha), no cuenta.
export function speciesMatchesTheme(theme, slug) {
  const info = GACHA_POOL.find((p) => p.slug === slug);
  if (!info) return false;
  return theme.matches({ types: info.types, rarity: info.rarity });
}

// Temática determinista de una semana: hash de su weekKey módulo el número
// de temáticas. Si coincide con la temática de la semana INMEDIATAMENTE
// ANTERIOR ya registrada (ver recordActiveWeekTheme/`recentWeeks`), se
// desplaza a la siguiente de la lista (con vuelta al principio) para no
// repetir dos semanas seguidas. `recentWeeks` son entradas
// `{ weekKey, themeId }` más recientes primero; se ignora cualquier entrada
// con el mismo weekKey que la semana que se está calculando (autocomparación
// sin sentido).
export function selectWeeklyTheme(weekKey, recentWeeks) {
  const baseIndex = hashStringToInt(weekKey) % WEEKLY_THEMES.length;
  const lastDifferentWeek = (recentWeeks || []).find((w) => w.weekKey !== weekKey);
  const index = (lastDifferentWeek && WEEKLY_THEMES[baseIndex].id === lastDifferentWeek.themeId)
    ? (baseIndex + 1) % WEEKLY_THEMES.length
    : baseIndex;
  return WEEKLY_THEMES[index];
}

export function buildDefaultWeeklyTournamentState() {
  return { recentWeeks: [], completedWeekKeys: [] };
}

// Mismo patrón try/catch que el resto de estado persistido de la app.
export function loadWeeklyTournamentState() {
  try {
    const raw = localStorage.getItem(WEEKLY_TOURNAMENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          recentWeeks: Array.isArray(parsed.recentWeeks) ? parsed.recentWeeks.slice(0, 3) : [],
          completedWeekKeys: Array.isArray(parsed.completedWeekKeys) ? parsed.completedWeekKeys : [],
        };
      }
    }
  } catch (e) { /* localStorage no disponible */ }
  return buildDefaultWeeklyTournamentState();
}

// Anota la temática YA resuelta de la semana activa (si todavía no estaba
// anotada), para que selectWeeklyTheme pueda evitar repetirla la semana
// siguiente. Se queda solo con las últimas 3 semanas. Devuelve el MISMO
// objeto de estado (misma referencia) si esa semana ya estaba anotada, para
// que un useEffect que llame a esto en cada render no dispare un re-render
// de más.
export function recordActiveWeekTheme(state, weekKey, themeId) {
  if (state.recentWeeks.some((w) => w.weekKey === weekKey)) return state;
  const recentWeeks = [{ weekKey, themeId }, ...state.recentWeeks].slice(0, 3);
  return { ...state, recentWeeks };
}

export function isWeeklyTournamentCompleted(state, weekKey) {
  return state.completedWeekKeys.includes(weekKey);
}

// Se queda con las últimas 12 semanas completadas (~3 meses): de sobra para
// la regla real (solo importa la semana ACTIVA), simplemente evita que el
// array crezca sin límite indefinidamente en una partida muy larga.
export function markWeeklyTournamentCompleted(state, weekKey) {
  if (state.completedWeekKeys.includes(weekKey)) return state;
  return { ...state, completedWeekKeys: [...state.completedWeekKeys, weekKey].slice(-12) };
}
