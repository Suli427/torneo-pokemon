// Lógica de la tab Casino: por ahora solo la Ruleta de la Fortuna, con
// espacio para añadir más juegos más adelante (ver el pedido: Tragaperras y
// Cartas Rasca en un futuro). Todo lo de aquí es puro (sin React), mismo
// criterio que src/dailyRewards.js — App.jsx solo lo usa como estado +
// persistencia.

export const CASINO_STORAGE_KEY = "liga-pokemon:casino";

// Coste de un giro de pago; el giro gratis diario (ver
// canClaimFreeRouletteSpin, reutiliza el mismo "día actual" que el
// Pokédle/recompensa diaria — reset a las 10:00 hora de Madrid, ver
// getDailyResetDayKey en dailyRewards.js) no cuesta nada, y no hay límite de
// cuántos giros de pago se pueden hacer al día.
export const ROULETTE_SPIN_COST = 150;

// Cuántos resultados recientes se guardan para mostrar en la propia pantalla
// (puramente decorativo, no afecta a ningún sorteo futuro).
export const ROULETTE_HISTORY_LIMIT = 10;

// Las 8 casillas de la ruleta, en el orden en que se dibujan alrededor del
// disco (sentido horario desde arriba). El tamaño visual de cada casilla es
// SIEMPRE el mismo (360/8 = 45° cada una): las probabilidades de premio
// (`chance`, deben sumar 100) son independientes del tamaño del sector, ni
// se corresponden con él — igual que una ruleta de casino real, donde el
// premio no depende de qué tan "grande" se ve la casilla. El color de cada
// una reutiliza la misma paleta ya asociada a rareza/monedas en el resto de
// la app (ver RARITY_META y el dorado #f2b705 ya usado para el JACKPOT del
// gacha shiny/legendario), para mantener coherencia visual.
export const ROULETTE_SECTORS = [
  { id: "nothing", label: "Nada", shortLabel: "Nada", type: "nothing", amount: 0, chance: 20, color: "#5a5f72" },
  { id: "coins-20", label: "20 monedas", shortLabel: "20", type: "coins", amount: 20, chance: 20, color: "#5fae5f" },
  { id: "coins-50", label: "50 monedas", shortLabel: "50", type: "coins", amount: 50, chance: 20, color: "#4a90d9" },
  { id: "coins-100", label: "100 monedas", shortLabel: "100", type: "coins", amount: 100, chance: 15, color: "#a75fd9" },
  { id: "coins-200", label: "200 monedas", shortLabel: "200", type: "coins", amount: 200, chance: 12, color: "#e3701e" },
  { id: "gacha-pull", label: "Tirada gratis del gacha", shortLabel: "Gacha gratis", type: "gacha-pull", amount: 1, chance: 8, color: "#e3350d" },
  { id: "coins-500", label: "500 monedas", shortLabel: "500", type: "coins", amount: 500, chance: 4, color: "#2ecc71" },
  { id: "jackpot", label: "¡JACKPOT!", shortLabel: "JACKPOT", type: "jackpot", amount: 1000, chance: 1, color: "#f2b705" },
];

// Comprobación de que las probabilidades declaradas suman exactamente 100 —
// falla ruidosamente en desarrollo (import time) en vez de dar premios mal
// repartidos en silencio si alguien las toca más adelante sin fijarse.
const TOTAL_CHANCE = ROULETTE_SECTORS.reduce((sum, s) => sum + s.chance, 0);
if (TOTAL_CHANCE !== 100) {
  throw new Error(`Las probabilidades de ROULETTE_SECTORS deben sumar 100 (suman ${TOTAL_CHANCE})`);
}

// Sortea UN índice de ROULETTE_SECTORS según sus probabilidades declaradas.
// Se llama una única vez por giro, ANTES de animar nada: el resultado ya
// está decidido de antemano y la animación de la ruleta solo gira hasta
// llegar visualmente a ese sector (ver RouletteWheel en App.jsx), nunca al
// revés.
export function rollRoulette() {
  const roll = Math.random() * 100;
  let acc = 0;
  for (let i = 0; i < ROULETTE_SECTORS.length; i++) {
    acc += ROULETTE_SECTORS[i].chance;
    if (roll < acc) return i;
  }
  return ROULETTE_SECTORS.length - 1; // salvaguarda por redondeo de coma flotante
}

export function buildDefaultCasinoState() {
  return {
    roulette: { lastFreeSpinDayKey: null, history: [] },
    // Créditos de tirada gratis del gacha GENERAL (ver GatchaTab): se
    // acumulan aquí en vez de en dailyRewardsState porque no están atados a
    // ningún "día actual", se pueden guardar y gastar cuando se quiera.
    freeGachaPulls: 0,
  };
}

export function loadCasinoState() {
  try {
    const raw = localStorage.getItem(CASINO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const defaults = buildDefaultCasinoState();
        return {
          ...defaults,
          ...parsed,
          roulette: { ...defaults.roulette, ...(parsed.roulette || {}) },
        };
      }
    }
  } catch (e) { /* localStorage no disponible */ }
  return buildDefaultCasinoState();
}

// El giro gratis diario está disponible si todavía no se ha usado hoy (mismo
// "día actual" que Pokédle/recompensa diaria, ver getDailyResetDayKey).
export function canClaimFreeRouletteSpin(rouletteState, todayKey) {
  return (rouletteState?.lastFreeSpinDayKey ?? null) !== todayKey;
}
