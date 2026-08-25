import { ACHIEVEMENTS } from "./achievements";
import { WEEKLY_THEMES } from "./weeklyTournaments";

// Progreso persistido bajo esta clave (mismo patrón try/catch que el resto
// de datos guardados en App.jsx). Solo vive aquí lo que NO es derivable de
// otro estado ya persistido (colección, entrenadores comprados, entrenador
// propio): esos se leen en vivo en `buildDerivedContext` cada vez que se
// evalúan los logros, en vez de duplicarlos como contadores aparte.
export const ACHIEVEMENT_PROGRESS_STORAGE_KEY = "liga-pokemon:achievement-progress";

export function buildDefaultProgress() {
  return {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    bestFinalPosition: null,
    winsByMode: { A: 0, B: 0, C: 0 },
    winsByDifficulty: { normal: 0, hard: 0, master: 0 },
    winsWithFullTeamRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, "pseudo-legendary": 0, legendary: 0 },
    winsWithTypeDiversity3Plus: 0,
    winsWithSharedTypeTeam: 0,
    distinctTrainerIdentitiesWonWith: [],
    wonWithRealAsh: false,
    perfectCombatWins: 0,
    perfectTournaments: 0,
    gachaPullsTotal: 0,
    gachaPullsWithoutNewInARow: 0,
    shinyCount: 0,
    totalCoinsEarnedHistorically: 0,
    hasWonWithOHKO: false,
    hasWonWithSimultaneousRecoilKO: false,
    hasWonWithWeatherMajority: false,
    hasWonWithTerrainActive: false,
    hasWonWithTailwind: false,
    hasUsedProtectSuccess3InARow: false,
    hasWonPuttingAllRivalsAsleep: false,
    hasWonWithPerfectMultiHit: false,
    hasWonForcingAllRivalsToSwitch: false,
    // Torre Batalla (logros 51-54): la mejor ronda ganada EN VIVO, ronda a
    // ronda (ver applyBattleTowerRoundCleared) — a propósito distinta del
    // récord personal `battleTowerBest` que ya vive aparte en App.jsx (ese
    // solo se actualiza al terminar la partida entera, ver
    // addBattleTowerResult); aquí hace falta saberlo AL MOMENTO de superar
    // cada ronda, para poder desbloquear el logro sin esperar a que el
    // usuario decida terminar una partida que podría alargarse mucho.
    battleTowerBestRound: 0,
    battleTowerWinAgainstTopRarityTeam: false,
    // Draft (logros 55-57): mejor racha de victorias SEGUIDAS dentro de UNA
    // misma partida (nunca se resetea entre partidas, solo guarda el máximo
    // histórico — ver applyDraftSwap), total de intercambios acumulados
    // entre todas las partidas, y si alguna partida terminó con 3+ Pokémon
    // originales perdidos (ver applyTournamentResult, entry.mode==="draft").
    draftBestConsecutiveWinsInOneRun: 0,
    draftTotalTradesAccumulated: 0,
    draftHasLostThreeOrMoreOriginalPokemonInOneRun: false,
    // Torneo Semanal (logros 58-60): total de victorias RECOMPENSADAS
    // históricamente (una semana ya completada que se vuelve a jugar no
    // cuenta una segunda vez, ver applyTournamentResult) y el conjunto de
    // ids de temática (ver WEEKLY_THEMES) ganados al menos una vez.
    weeklyTournamentWinsCount: 0,
    weeklyTournamentThemesWon: [],
    unlockedAchievementIds: [],
    unlockedAt: {},
  };
}

export function loadStoredAchievementProgress() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_PROGRESS_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return { ...buildDefaultProgress(), ...obj };
    }
  } catch (e) { /* localStorage no disponible */ }
  return null;
}

/* ---------------------------------------------------------------
   RECONSTRUCCIÓN RETROACTIVA (solo la primera vez que se activa el
   sistema sobre una partida ya en curso, ver App.jsx)
--------------------------------------------------------------- */

// Reconstruye desde el historial de torneos (tournamentHistory, ya
// persistido) todo lo que sea calculable a partir de él: torneos jugados,
// ganados, mejor posición, rachas (recorriendo en orden CRONOLÓGICO, no el
// orden "más reciente primero" en que se guarda el historial), y victorias
// por modo/dificultad/entrenador si esas entradas ya las llevan (las
// entradas ANTERIORES a este cambio no las llevan, así que esos contadores
// concretos solo reflejan entradas ya enriquecidas; ver limitación
// documentada en la respuesta de este cambio: el historial está además
// limitado a las últimas 20 entradas, así que un usuario con más de 20
// torneos previos no recupera el detalle de los más antiguos).
function reconstructFromTournamentHistory(progress, tournamentHistory) {
  const chronological = [...tournamentHistory].reverse(); // más antiguo primero
  let streak = 0;
  for (const entry of chronological) {
    progress.tournamentsPlayed += 1;
    if (progress.bestFinalPosition == null || entry.finalPosition < progress.bestFinalPosition) {
      progress.bestFinalPosition = entry.finalPosition;
    }
    if (entry.finalPosition === 1) {
      progress.tournamentsWon += 1;
      streak += 1;
      if (streak > progress.bestWinStreak) progress.bestWinStreak = streak;
      if (entry.mode && progress.winsByMode[entry.mode] != null) progress.winsByMode[entry.mode] += 1;
      if (entry.difficulty && progress.winsByDifficulty[entry.difficulty] != null) progress.winsByDifficulty[entry.difficulty] += 1;
      if (entry.trainerIdentity) {
        if (!progress.distinctTrainerIdentitiesWonWith.includes(entry.trainerIdentity)) {
          progress.distinctTrainerIdentitiesWonWith.push(entry.trainerIdentity);
        }
        if (entry.trainerIdentity === "ash") progress.wonWithRealAsh = true;
      }
      if (entry.perfectTournament) progress.perfectTournaments += 1;
      if (typeof entry.perfectRoundWins === "number") progress.perfectCombatWins += entry.perfectRoundWins;
      if (entry.teamRarity && progress.winsWithFullTeamRarity[entry.teamRarity] != null) {
        progress.winsWithFullTeamRarity[entry.teamRarity] += 1;
      }
      if (entry.teamTypeDiversity3Plus) progress.winsWithTypeDiversity3Plus += 1;
      if (entry.teamSharedType) progress.winsWithSharedTypeTeam += 1;
    } else {
      streak = 0;
    }
    if (typeof entry.coinsEarned === "number") progress.totalCoinsEarnedHistorically += entry.coinsEarned;
  }
  progress.currentWinStreak = streak;
  return progress;
}

// El historial no guarda un total histórico de monedas ganadas aparte del
// `coinsEarned` de cada entrada (y está limitado a 20 entradas): si el
// usuario ya tenía más de 20 torneos jugados, ese total reconstruido se
// queda corto. Para no infravalorar el progreso de un usuario veterano
// más de lo necesario, si el saldo ACTUAL de monedas ya es mayor que lo
// reconstruido a partir del historial, se usa el saldo actual como
// aproximación de partida (nunca puede ser un total exacto, ya que el
// saldo también baja al comprar cosas — se documenta como aproximación).
function applyCoinsFallback(progress, currentCoins) {
  if (currentCoins > progress.totalCoinsEarnedHistorically) {
    progress.totalCoinsEarnedHistorically = currentCoins;
  }
  return progress;
}

// Especies distintas -> tipos distintos representados, y shinies, se leen
// en vivo de la colección normalmente (ver buildDerivedContext), pero el
// contador de shinies "totales" (incluyendo repetidos) de progress sí hace
// falta reconstruirlo aquí una vez, ya que de ahí en adelante se acumula
// evento a evento y no se puede recalcular solo mirando la colección
// (esta no guarda cuántas tiradas repetidas shiny hubo).
function reconstructShinyCount(progress, collection) {
  progress.shinyCount = collection.filter((c) => c.shiny).length;
  return progress;
}

// Punto de entrada de la reconstrucción retroactiva: se llama SOLO la
// primera vez que no existe todavía la clave de progreso en localStorage
// (ver loadOrInitAchievementProgress en App.jsx). Los logros de mecánicas
// de combate (42-50) y de equipo 100% de una rareza (22-27) NO se
// reconstruyen: el historial actual no guarda detalle turno a turno de
// combates pasados ni la composición de rareza exacta de cada torneo ya
// jugado antes de este cambio, así que se dejan sin desbloquear a
// propósito en vez de aproximarlos. Los 10 nuevos de Torre Batalla/Draft/
// Torneo Semanal (51-60) tampoco se reconstruyen por el mismo motivo: ni
// el historial de torneos ni ningún otro dato ya persistido guarda ronda a
// ronda de la Torre Batalla, intercambios del Draft, o qué temáticas
// semanales se ganaron en el pasado.
export function reconstructProgress({ tournamentHistory, collection, purchasedTrainerIds, customTrainer, coins }) {
  let progress = buildDefaultProgress();
  progress = reconstructFromTournamentHistory(progress, tournamentHistory);
  progress = reconstructShinyCount(progress, collection);
  progress = applyCoinsFallback(progress, coins);
  const derived = buildDerivedContext({ collection, purchasedTrainerIds, customTrainer });
  // Desbloqueo silencioso: se marca como ya conseguido cualquier logro que
  // ya se cumpla con este progreso reconstruido, pero SIN pasar por
  // evaluateAchievements (que devolvería recompensa/notificación) — aquí
  // se añade directamente a unlockedAchievementIds con fecha "desconocida"
  // (null), sin tocar coins.
  for (const achievement of ACHIEVEMENTS) {
    if (isAchievementUnlocked(achievement.id, progress, derived)) {
      progress.unlockedAchievementIds.push(achievement.id);
      progress.unlockedAt[achievement.id] = null;
    }
  }
  return progress;
}

/* ---------------------------------------------------------------
   CONTEXTO DERIVADO EN VIVO (no se persiste aparte: se recalcula de la
   colección/entrenadores comprados/entrenador propio ya persistidos,
   reutilizando esos datos en vez de duplicarlos en progress)
--------------------------------------------------------------- */

export function buildDerivedContext({ collection, purchasedTrainerIds, customTrainer, gachaPool }) {
  const distinctSpeciesSlugs = new Set(collection.map((c) => c.slug));
  const distinctShinySlugs = new Set(collection.filter((c) => c.shiny).map((c) => c.slug));
  let typesOwnedCount = 0;
  let generalGachaCompletionPct = 0;
  let anyTypeGachaFullyCompleted = false;
  if (gachaPool && gachaPool.length > 0) {
    const ownedTypes = new Set();
    for (const slug of distinctSpeciesSlugs) {
      const entry = gachaPool.find((p) => p.slug === slug);
      if (entry) entry.types.forEach((t) => ownedTypes.add(t));
    }
    typesOwnedCount = ownedTypes.size;
    generalGachaCompletionPct = (distinctSpeciesSlugs.size / gachaPool.length) * 100;
    const allTypes = new Set(gachaPool.flatMap((p) => p.types));
    for (const type of allTypes) {
      const candidates = gachaPool.filter((p) => p.types.includes(type));
      const owned = candidates.filter((p) => distinctSpeciesSlugs.has(p.slug)).length;
      if (candidates.length > 0 && owned >= candidates.length) { anyTypeGachaFullyCompleted = true; break; }
    }
  }
  return {
    distinctSpeciesCount: distinctSpeciesSlugs.size,
    distinctShinyCount: distinctShinySlugs.size,
    typesOwnedCount,
    generalGachaCompletionPct,
    anyTypeGachaFullyCompleted,
    purchasedTrainerCount: purchasedTrainerIds.length,
    hasCustomTrainer: !!customTrainer,
  };
}

/* ---------------------------------------------------------------
   CONDICIONES DE LOS 50 LOGROS
--------------------------------------------------------------- */

const CONDITIONS = {
  1: (p) => p.tournamentsWon >= 1,
  2: (p) => p.bestWinStreak >= 3,
  3: (p) => p.bestWinStreak >= 5,
  4: (p) => p.tournamentsWon >= 10,
  5: (p) => p.perfectCombatWins >= 1,
  6: (p) => p.perfectTournaments >= 1,
  7: (p) => p.tournamentsPlayed >= 100,
  8: (p) => p.bestWinStreak >= 10,
  9: (p) => p.winsByMode.A >= 1,
  10: (p) => p.winsByMode.B >= 1,
  11: (p) => p.winsByMode.C >= 1,
  12: (p) => p.winsWithTypeDiversity3Plus >= 1,
  13: (p) => p.winsWithSharedTypeTeam >= 1,
  14: (p) => p.winsByDifficulty.hard >= 1,
  15: (p) => p.winsByDifficulty.master >= 1,
  16: (p) => p.winsByDifficulty.master >= 5,
  17: (p, d) => d.purchasedTrainerCount >= 4,
  18: (p, d) => d.purchasedTrainerCount >= 16,
  19: (p) => p.distinctTrainerIdentitiesWonWith.length >= 5,
  20: (p) => p.wonWithRealAsh === true,
  21: (p, d) => d.hasCustomTrainer === true,
  22: (p) => p.winsWithFullTeamRarity.common >= 1,
  23: (p) => p.winsWithFullTeamRarity.uncommon >= 1,
  24: (p) => p.winsWithFullTeamRarity.rare >= 1,
  25: (p) => p.winsWithFullTeamRarity.epic >= 1,
  26: (p) => p.winsWithFullTeamRarity["pseudo-legendary"] >= 1,
  27: (p) => p.winsWithFullTeamRarity.legendary >= 1,
  28: (p) => p.gachaPullsTotal >= 1,
  29: (p) => p.gachaPullsTotal >= 50,
  30: (p) => p.gachaPullsTotal >= 200,
  31: (p, d) => d.distinctShinyCount >= 1,
  32: (p, d) => d.distinctShinyCount >= 5,
  33: (p, d) => d.anyTypeGachaFullyCompleted === true,
  34: (p) => p.gachaPullsWithoutNewInARow >= 10,
  35: (p, d) => d.generalGachaCompletionPct >= 100,
  36: (p, d) => d.distinctSpeciesCount >= 6,
  37: (p, d) => d.distinctSpeciesCount >= 50,
  38: (p, d) => d.distinctSpeciesCount >= 150,
  39: (p, d) => d.typesOwnedCount >= 18,
  40: (p) => p.totalCoinsEarnedHistorically >= 5000,
  41: (p) => p.totalCoinsEarnedHistorically >= 20000,
  42: (p) => p.hasWonWithOHKO === true,
  43: (p) => p.hasWonWithSimultaneousRecoilKO === true,
  44: (p) => p.hasWonWithWeatherMajority === true,
  45: (p) => p.hasWonWithTerrainActive === true,
  46: (p) => p.hasWonWithTailwind === true,
  47: (p) => p.hasUsedProtectSuccess3InARow === true,
  48: (p) => p.hasWonPuttingAllRivalsAsleep === true,
  49: (p) => p.hasWonWithPerfectMultiHit === true,
  50: (p) => p.hasWonForcingAllRivalsToSwitch === true,
  51: (p) => p.battleTowerBestRound >= 5,
  52: (p) => p.battleTowerBestRound >= 15,
  53: (p) => p.battleTowerBestRound >= 30,
  54: (p) => p.battleTowerWinAgainstTopRarityTeam === true,
  55: (p) => p.draftBestConsecutiveWinsInOneRun >= 5,
  56: (p) => p.draftTotalTradesAccumulated >= 20,
  57: (p) => p.draftHasLostThreeOrMoreOriginalPokemonInOneRun === true,
  58: (p) => p.weeklyTournamentWinsCount >= 1,
  59: (p) => p.weeklyTournamentWinsCount >= 4,
  60: (p) => WEEKLY_THEMES.every((theme) => p.weeklyTournamentThemesWon.includes(theme.id)),
};

export function isAchievementUnlocked(id, progress, derived) {
  const fn = CONDITIONS[id];
  return fn ? !!fn(progress, derived) : false;
}

// Progreso "numérico" para la barra/texto de progreso de los logros
// acumulables (los que no son un evento binario puntual). Devuelve
// { current, target } o null si el logro es binario (desbloqueado/no).
export function getProgressCounter(id, progress, derived) {
  switch (id) {
    case 2: return { current: Math.min(progress.bestWinStreak, 3), target: 3 };
    case 3: return { current: Math.min(progress.bestWinStreak, 5), target: 5 };
    case 4: return { current: Math.min(progress.tournamentsWon, 10), target: 10 };
    case 7: return { current: Math.min(progress.tournamentsPlayed, 100), target: 100 };
    case 8: return { current: Math.min(progress.bestWinStreak, 10), target: 10 };
    case 16: return { current: Math.min(progress.winsByDifficulty.master, 5), target: 5 };
    case 17: return { current: Math.min(derived.purchasedTrainerCount, 4), target: 4 };
    case 18: return { current: Math.min(derived.purchasedTrainerCount, 16), target: 16 };
    case 19: return { current: Math.min(progress.distinctTrainerIdentitiesWonWith.length, 5), target: 5 };
    case 29: return { current: Math.min(progress.gachaPullsTotal, 50), target: 50 };
    case 30: return { current: Math.min(progress.gachaPullsTotal, 200), target: 200 };
    case 32: return { current: Math.min(derived.distinctShinyCount, 5), target: 5 };
    case 34: return { current: Math.min(progress.gachaPullsWithoutNewInARow, 10), target: 10 };
    case 36: return { current: Math.min(derived.distinctSpeciesCount, 6), target: 6 };
    case 37: return { current: Math.min(derived.distinctSpeciesCount, 50), target: 50 };
    case 38: return { current: Math.min(derived.distinctSpeciesCount, 150), target: 150 };
    case 39: return { current: Math.min(derived.typesOwnedCount, 18), target: 18 };
    case 40: return { current: Math.min(progress.totalCoinsEarnedHistorically, 5000), target: 5000 };
    case 41: return { current: Math.min(progress.totalCoinsEarnedHistorically, 20000), target: 20000 };
    case 51: return { current: Math.min(progress.battleTowerBestRound, 5), target: 5 };
    case 52: return { current: Math.min(progress.battleTowerBestRound, 15), target: 15 };
    case 53: return { current: Math.min(progress.battleTowerBestRound, 30), target: 30 };
    case 55: return { current: Math.min(progress.draftBestConsecutiveWinsInOneRun, 5), target: 5 };
    case 56: return { current: Math.min(progress.draftTotalTradesAccumulated, 20), target: 20 };
    case 59: return { current: Math.min(progress.weeklyTournamentWinsCount, 4), target: 4 };
    case 60: return { current: Math.min(progress.weeklyTournamentThemesWon.length, WEEKLY_THEMES.length), target: WEEKLY_THEMES.length };
    default: return null;
  }
}

// Evalúa los 50 logros contra el progreso + contexto derivado actuales.
// Devuelve { progress: <nuevo progreso, con los recién desbloqueados ya
// añadidos>, newlyUnlocked: [achievement, ...] }. NO otorga las monedas
// (eso lo hace App.jsx con el resultado, para poder encolar también la
// notificación toast en el mismo sitio donde ya tiene acceso a setCoins).
export function evaluateAchievements(progress, derived) {
  const newlyUnlocked = [];
  const unlockedAt = { ...progress.unlockedAt };
  const unlockedIds = [...progress.unlockedAchievementIds];
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;
    if (isAchievementUnlocked(achievement.id, progress, derived)) {
      unlockedIds.push(achievement.id);
      unlockedAt[achievement.id] = Date.now();
      newlyUnlocked.push(achievement);
    }
  }
  if (newlyUnlocked.length === 0) return { progress, newlyUnlocked };
  return { progress: { ...progress, unlockedAchievementIds: unlockedIds, unlockedAt }, newlyUnlocked };
}

/* ---------------------------------------------------------------
   ACTUALIZADORES DE CONTADORES (eventos en vivo, llamados desde App.jsx)
--------------------------------------------------------------- */

// Al terminar un torneo. `entry` es el mismo objeto que ya se guarda en
// tournamentHistory, con estos campos adicionales (ver TorneoTab):
// difficulty, trainerIdentity, teamRarity (rareza si el equipo era 100%
// de una sola, si no null), teamTypeDiversity3Plus, teamSharedType,
// perfectTournament, perfectRoundWins.
export function applyTournamentResult(progress, entry) {
  const next = {
    ...progress,
    winsByMode: { ...progress.winsByMode },
    winsByDifficulty: { ...progress.winsByDifficulty },
    winsWithFullTeamRarity: { ...progress.winsWithFullTeamRarity },
    distinctTrainerIdentitiesWonWith: [...progress.distinctTrainerIdentitiesWonWith],
  };
  next.tournamentsPlayed += 1;
  if (next.bestFinalPosition == null || entry.finalPosition < next.bestFinalPosition) {
    next.bestFinalPosition = entry.finalPosition;
  }
  if (typeof entry.coinsEarned === "number") {
    next.totalCoinsEarnedHistorically += entry.coinsEarned;
  }
  if (entry.finalPosition === 1) {
    next.tournamentsWon += 1;
    next.currentWinStreak += 1;
    if (next.currentWinStreak > next.bestWinStreak) next.bestWinStreak = next.currentWinStreak;
    if (entry.mode && next.winsByMode[entry.mode] != null) next.winsByMode[entry.mode] += 1;
    if (entry.difficulty && next.winsByDifficulty[entry.difficulty] != null) next.winsByDifficulty[entry.difficulty] += 1;
    if (entry.trainerIdentity) {
      if (!next.distinctTrainerIdentitiesWonWith.includes(entry.trainerIdentity)) {
        next.distinctTrainerIdentitiesWonWith.push(entry.trainerIdentity);
      }
      if (entry.trainerIdentity === "ash") next.wonWithRealAsh = true;
    }
    if (entry.teamRarity && next.winsWithFullTeamRarity[entry.teamRarity] != null) {
      next.winsWithFullTeamRarity[entry.teamRarity] += 1;
    }
    if (entry.teamTypeDiversity3Plus) next.winsWithTypeDiversity3Plus += 1;
    if (entry.teamSharedType) next.winsWithSharedTypeTeam += 1;
    if (entry.perfectTournament) next.perfectTournaments += 1;
    if (typeof entry.perfectRoundWins === "number") next.perfectCombatWins += entry.perfectRoundWins;
    // Torneo Semanal (logros 58-60): solo cuenta como victoria "de verdad"
    // si de verdad pagó recompensa (coinsEarned > 0) — repetir una semana
    // ya completada sigue dejando ganar (finalPosition sigue siendo 1),
    // pero con reward=0 (ver TorneoTab/finalizeRound), así que no debe
    // sumar una segunda vez la misma semana ni "desbloquear" temáticas que
    // ya estaban ganadas de antes solo por repetir la partida.
    if (entry.mode === "weekly" && entry.coinsEarned > 0) {
      next.weeklyTournamentWinsCount += 1;
      if (entry.weeklyThemeId && !next.weeklyTournamentThemesWon.includes(entry.weeklyThemeId)) {
        next.weeklyTournamentThemesWon = [...next.weeklyTournamentThemesWon, entry.weeklyThemeId];
      }
    }
  } else {
    next.currentWinStreak = 0;
  }
  // Draft (logros 55/57): finalPosition siempre es null en las entradas de
  // Draft (no hay "puesto" en una liga infinita), así que este bloque va
  // fuera del if/else de arriba — `entry.draftRoundsWon`/
  // `entry.draftLostOriginalCount` ya vienen en la entrada que construye
  // DraftMode.applyAndReturn. La mejor racha de la partida ya es, sin más,
  // el `roundsWon` con el que terminó (dentro de UNA partida de Draft nunca
  // hay una ronda perdida "en medio": la primera derrota siempre termina la
  // partida entera), así que tomar el máximo aquí al terminar cada partida
  // es exactamente equivalente a llevar la cuenta ronda a ronda.
  if (entry.mode === "draft") {
    if (typeof entry.draftRoundsWon === "number" && entry.draftRoundsWon > next.draftBestConsecutiveWinsInOneRun) {
      next.draftBestConsecutiveWinsInOneRun = entry.draftRoundsWon;
    }
    if ((entry.draftLostOriginalCount || 0) >= 3) {
      next.draftHasLostThreeOrMoreOriginalPokemonInOneRun = true;
    }
  }
  return next;
}

// Al completar cada ronda ganada de la Torre Batalla (ver BattleTowerMode/
// handleBattleFinish): `roundNum` es la ronda que se acaba de superar,
// `isTopRarityTeam` si el equipo rival de esa ronda era 100% Pseudolegendario
// o Legendario. Se llama en vivo, ronda a ronda, para que el logro se
// desbloquee en el momento (no hace falta esperar a que el usuario termine
// la partida, que en la Torre Batalla puede alargarse indefinidamente).
export function applyBattleTowerRoundCleared(progress, { roundNum, isTopRarityTeam }) {
  return {
    ...progress,
    battleTowerBestRound: Math.max(progress.battleTowerBestRound, roundNum),
    battleTowerWinAgainstTopRarityTeam: progress.battleTowerWinAgainstTopRarityTeam || !!isTopRarityTeam,
  };
}

// Al completar cada intercambio del Draft (ver DraftMode/performSwap):
// `roundsWonSoFar` es el número de rondas ganadas en ESTA partida hasta
// ahora mismo (justo después de la ronda que dio pie a este intercambio).
export function applyDraftSwap(progress, { roundsWonSoFar }) {
  return {
    ...progress,
    draftTotalTradesAccumulated: progress.draftTotalTradesAccumulated + 1,
    draftBestConsecutiveWinsInOneRun: Math.max(progress.draftBestConsecutiveWinsInOneRun, roundsWonSoFar || 0),
  };
}

// Al hacer una tirada de gacha (nueva especie o repetida, shiny o no).
export function applyGachaPull(progress, { isNew, shiny }) {
  return {
    ...progress,
    gachaPullsTotal: progress.gachaPullsTotal + 1,
    gachaPullsWithoutNewInARow: isNew ? 0 : progress.gachaPullsWithoutNewInARow + 1,
    shinyCount: shiny ? progress.shinyCount + 1 : progress.shinyCount,
  };
}

// Al terminar un combate interactivo (un match completo dentro de un
// torneo, ver InteractiveBattle.onFinish en App.jsx): solo tiene efecto si
// lo gana el usuario. `flags` viene ya calculado por
// analyzeInteractiveBattleMechanics (ver más abajo).
export function applyCombatMechanics(progress, flags) {
  if (!flags) return progress;
  const next = { ...progress };
  if (flags.ohko) next.hasWonWithOHKO = true;
  if (flags.simultaneousRecoilKO) next.hasWonWithSimultaneousRecoilKO = true;
  if (flags.weatherMajority) next.hasWonWithWeatherMajority = true;
  if (flags.terrainActive) next.hasWonWithTerrainActive = true;
  if (flags.usedTailwind) next.hasWonWithTailwind = true;
  if (flags.protectStreak3) next.hasUsedProtectSuccess3InARow = true;
  if (flags.sleptAllRivals) next.hasWonPuttingAllRivalsAsleep = true;
  if (flags.perfectMultiHit) next.hasWonWithPerfectMultiHit = true;
  if (flags.forcedOutAllRivals) next.hasWonForcingAllRivalsToSwitch = true;
  return next;
}
