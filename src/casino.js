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

/* ---------------------------------------------------------------
   TRAGAPERRAS (Slot Machine)
--------------------------------------------------------------- */

export const SLOT_MIN_BET = 10;
export const SLOT_MAX_BET = 1000;

// Multiplicador de pareja (2 de los 3 carretes iguales, el tercero distinto):
// más alto si la pareja es de Pokéball (símbolo especial) que si es de
// cualquiera de los 5 elementales — ambos dentro del rango x1.5-x2 pedido.
export const SLOT_PAIR_MULTIPLIER_POKEBALL = 2;
export const SLOT_PAIR_MULTIPLIER_ELEMENTAL = 1.5;

// Los 3 carretes son INDEPENDIENTES entre sí y comparten exactamente la
// misma distribución de probabilidad por símbolo (mismo criterio que las
// casillas de la ruleta: la probabilidad de cada símbolo es un dato de
// diseño, no algo "visual"). `chance` de cada símbolo es su probabilidad de
// aparecer en UN carrete (deben sumar 1 exactamente), y `multiplier3` es el
// multiplicador sobre la apuesta cuando ese símbolo sale en los 3 carretes a
// la vez. El color de los 5 símbolos elementales reutiliza TYPE_COLORS (la
// misma paleta de tipos ya usada en toda la app); Pokéball usa el icono ya
// existente (ver PokeballIcon en App.jsx) en vez de un color de tipo.
//
// CÁLCULO DEL MARGEN DE LA CASA (~10% pedido, es decir E[multiplicador]≈0.90):
// con probabilidad de Pokéball q=0.10 por carrete y probabilidad e=0.18 para
// cada uno de los 5 elementales (5*0.18 + 0.10 = 1, suman exactamente 1),
// el valor esperado del multiplicador de una tirada es:
//   E = 20*q³                                    (3 Pokéballs)
//     + Σ(multiplier3_i * e³) para los 5 elementales = e³*(10+9+8+7+6) = e³*40
//     + 3*q²*(1-q) * SLOT_PAIR_MULTIPLIER_POKEBALL   (pareja de Pokéball)
//     + 5 * [3*e²*(1-e)] * SLOT_PAIR_MULTIPLIER_ELEMENTAL  (pareja elemental, cualquiera de los 5 tipos)
// Sustituyendo: 20*0.001 + 40*0.005832 + 2*(3*0.01*0.9) + 1.5*(5*3*0.0324*0.82)
//             = 0.02 + 0.23328 + 0.054 + 0.59778 = 0.90506
// → E[multiplicador] ≈ 0.905, margen de la casa ≈ 9.49% (muy cerca del 10%
// pedido). Ver resolveSlotResult para la fórmula de "3 iguales"/"pareja"
// tal cual se resuelve en cada tirada real.
export const SLOT_SYMBOLS = [
  { id: "fire", type: "elemental", typeKey: "fire", label: "Fuego", chance: 0.18, multiplier3: 10 },
  { id: "water", type: "elemental", typeKey: "water", label: "Agua", chance: 0.18, multiplier3: 9 },
  { id: "grass", type: "elemental", typeKey: "grass", label: "Planta", chance: 0.18, multiplier3: 8 },
  { id: "electric", type: "elemental", typeKey: "electric", label: "Eléctrico", chance: 0.18, multiplier3: 7 },
  { id: "normal", type: "elemental", typeKey: "normal", label: "Normal", chance: 0.18, multiplier3: 6 },
  { id: "pokeball", type: "pokeball", typeKey: null, label: "Pokéball", chance: 0.10, multiplier3: 20 },
];

// Orden fijo de los símbolos dentro de la "tira" de cada carrete (ver
// SlotReel en App.jsx): puramente visual, no afecta a rollSlotReel (que ya
// sortea por `chance`, no por posición en este array).
export const SLOT_SYMBOL_ORDER = SLOT_SYMBOLS.map((s) => s.id);

const SLOT_TOTAL_CHANCE = SLOT_SYMBOLS.reduce((sum, s) => sum + s.chance, 0);
if (Math.abs(SLOT_TOTAL_CHANCE - 1) > 1e-9) {
  throw new Error(`Las probabilidades de SLOT_SYMBOLS deben sumar 1 (suman ${SLOT_TOTAL_CHANCE})`);
}

// Sortea UN símbolo para UN carrete, según las probabilidades declaradas en
// SLOT_SYMBOLS.
export function rollSlotReel() {
  const roll = Math.random();
  let acc = 0;
  for (const s of SLOT_SYMBOLS) {
    acc += s.chance;
    if (roll < acc) return s.id;
  }
  return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1].id; // salvaguarda por redondeo de coma flotante
}

// Sortea los 3 carretes de UNA tirada. Se llama una única vez, ANTES de
// animar nada — mismo criterio que rollRoulette: el resultado ya está
// decidido de antemano, la animación de los carretes solo gira hasta llegar
// visualmente a estos 3 símbolos exactos.
export function spinSlotMachine() {
  return [rollSlotReel(), rollSlotReel(), rollSlotReel()];
}

// Resuelve el premio de una tirada ya sorteada (ver spinSlotMachine): "3
// iguales" (jackpot si son Pokéball, "triple" elemental si no), "pareja" (2
// de los 3 carretes iguales, el tercero distinto — solo puede haber COMO
// MUCHO una pareja entre 3 símbolos si no son los 3 iguales, por simple
// transitividad de la igualdad) o "sin premio". `multiplier` ya es el
// multiplicador final sobre la apuesta (0 si no hay premio).
export function resolveSlotResult(reels) {
  const [a, b, c] = reels;
  if (a === b && b === c) {
    const symbol = SLOT_SYMBOLS.find((s) => s.id === a);
    return { kind: symbol.type === "pokeball" ? "jackpot" : "triple", multiplier: symbol.multiplier3, matchedSymbol: a };
  }
  const pairs = [[a, b], [a, c], [b, c]];
  for (const [x, y] of pairs) {
    if (x === y) {
      const symbol = SLOT_SYMBOLS.find((s) => s.id === x);
      const multiplier = symbol.type === "pokeball" ? SLOT_PAIR_MULTIPLIER_POKEBALL : SLOT_PAIR_MULTIPLIER_ELEMENTAL;
      return { kind: "pair", multiplier, matchedSymbol: x };
    }
  }
  return { kind: "none", multiplier: 0, matchedSymbol: null };
}
