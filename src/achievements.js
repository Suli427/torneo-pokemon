import {
  Trophy, Flame, Crown, Sword, Users, UserPlus, Medal, Dna, Repeat, Shuffle,
  Layers, Target, ShieldCheck, Gem, Sparkles, Star, Coins, PiggyBank,
  CloudRain, Wind, Moon, Zap, Boxes, Compass, Skull, Swords, ShieldHalf, Dices,
  Building2, ArrowLeftRight, HeartCrack, CalendarCheck, CalendarRange, Landmark,
} from "lucide-react";

// Las 12 categorías en las que se agrupa visualmente la tab Logros, en el
// mismo orden en el que se definen los 60 logros más abajo.
export const ACHIEVEMENT_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "modos", label: "Modos de Torneo" },
  { id: "dificultad", label: "Dificultad" },
  { id: "personajes", label: "Personajes" },
  { id: "rareza", label: "Rareza del Equipo" },
  { id: "gacha", label: "Gacha" },
  { id: "coleccion", label: "Colección Pokémon" },
  { id: "monedas", label: "Monedas" },
  { id: "mecanicas", label: "Mecánicas de Combate" },
  { id: "torre", label: "Torre Batalla" },
  { id: "draft", label: "Draft" },
  { id: "semanal", label: "Torneo Semanal" },
];

// 60 logros. `reward` son monedas de torneo otorgadas UNA sola vez, al
// desbloquearse (ver src/achievementProgress.js para la lógica de
// desbloqueo/recompensa). Escalados por dificultad de consecución: 30-60
// triviales, 80-150 progreso moderado, 200-400 exigentes, 100-150 fijas
// para mecánicas de combate concretas (ver desglose completo en la
// respuesta que acompaña a este cambio).
export const ACHIEVEMENTS = [
  // ---- GENERAL ----
  { id: 1, category: "general", title: "Primera Victoria", description: "Gana tu primer torneo de la Liga.", icon: Trophy, reward: 50 },
  { id: 2, category: "general", title: "Racha de 3", description: "Encadena 3 victorias de torneo seguidas.", icon: Flame, reward: 90 },
  { id: 3, category: "general", title: "Racha de 5", description: "Encadena 5 victorias de torneo seguidas.", icon: Flame, reward: 140 },
  { id: 4, category: "general", title: "Campeón de Liga", description: "Queda 1º en 10 torneos.", icon: Crown, reward: 300 },
  { id: 5, category: "general", title: "Equipo Perfecto", description: "Gana un combate sin perder ningún Pokémon.", icon: ShieldCheck, reward: 100 },
  { id: 6, category: "general", title: "Sin ni un Rasguño", description: "Gana un torneo entero sin perder ningún Pokémon en ningún combate.", icon: ShieldHalf, reward: 250 },
  { id: 7, category: "general", title: "Veterano", description: "Juega 100 torneos.", icon: Medal, reward: 350 },
  { id: 8, category: "general", title: "Racha Imparable", description: "Encadena 10 victorias de torneo seguidas.", icon: Zap, reward: 400 },

  // ---- MODOS DE TORNEO ----
  { id: 9, category: "modos", title: "A tu Manera", description: "Gana un torneo jugando con tu propio entrenador (Modo A).", icon: UserPlus, reward: 90 },
  { id: 10, category: "modos", title: "Cualquiera Vale", description: "Gana un torneo jugando con cualquier entrenador de la Liga (Modo B).", icon: Users, reward: 60 },
  { id: 11, category: "modos", title: "Suerte del Novato", description: "Gana un torneo en Ruleta Pokémon (Modo C).", icon: Shuffle, reward: 130 },
  { id: 12, category: "modos", title: "Improvisador", description: "Gana un torneo en Ruleta Pokémon con un equipo de al menos 3 tipos distintos entre sí.", icon: Dna, reward: 150 },
  { id: 13, category: "modos", title: "Un Solo Elemento", description: "Gana un torneo con un equipo donde los 6 Pokémon comparten al menos un tipo en común.", icon: Layers, reward: 150 },

  // ---- DIFICULTAD ----
  { id: 14, category: "dificultad", title: "Reto Aceptado", description: "Gana un torneo en dificultad Difícil.", icon: Target, reward: 120 },
  { id: 15, category: "dificultad", title: "Contra Todo Pronóstico", description: "Gana un torneo en dificultad Maestro.", icon: Target, reward: 220 },
  { id: 16, category: "dificultad", title: "El Mejor de Todos", description: "Gana 5 torneos en dificultad Maestro.", icon: Crown, reward: 380 },

  // ---- PERSONAJES ----
  { id: 17, category: "personajes", title: "Coleccionista de Entrenadores", description: "Desbloquea 4 entrenadores comprables.", icon: Users, reward: 100 },
  { id: 18, category: "personajes", title: "Roster Completo", description: "Desbloquea los 16 entrenadores comprables.", icon: Boxes, reward: 380 },
  { id: 19, category: "personajes", title: "Todos los Caminos", description: "Gana al menos un torneo con 5 entrenadores distintos.", icon: Compass, reward: 160 },
  { id: 20, category: "personajes", title: "El Camino de Ash", description: "Gana un torneo jugando con Ash.", icon: Sword, reward: 50 },
  { id: 21, category: "personajes", title: "Tu Propia Leyenda", description: "Crea tu entrenador propio.", icon: UserPlus, reward: 40 },

  // ---- RAREZA DEL EQUIPO ----
  { id: 22, category: "rareza", title: "Humildes Orígenes", description: "Gana un torneo con un equipo 100% de rareza Común.", icon: Gem, reward: 90 },
  { id: 23, category: "rareza", title: "Paso Adelante", description: "Gana un torneo con un equipo 100% de rareza Poco Común.", icon: Gem, reward: 100 },
  { id: 24, category: "rareza", title: "Calidad sobre Cantidad", description: "Gana un torneo con un equipo 100% de rareza Raro.", icon: Gem, reward: 120 },
  { id: 25, category: "rareza", title: "Elite Absoluta", description: "Gana un torneo con un equipo 100% de rareza Épico.", icon: Gem, reward: 150 },
  { id: 26, category: "rareza", title: "Casi Leyendas", description: "Gana un torneo con un equipo 100% Pseudolegendario.", icon: Sparkles, reward: 180 },
  { id: 27, category: "rareza", title: "Panteón Legendario", description: "Gana un torneo con un equipo 100% Legendario.", icon: Crown, reward: 220 },

  // ---- GACHA ----
  { id: 28, category: "gacha", title: "Primera Tirada", description: "Haz tu primera tirada de gacha.", icon: Star, reward: 30 },
  { id: 29, category: "gacha", title: "Tirador Compulsivo", description: "Haz 50 tiradas de gacha en total.", icon: Repeat, reward: 100 },
  { id: 30, category: "gacha", title: "Gran Inversor", description: "Haz 200 tiradas de gacha en total.", icon: Repeat, reward: 250 },
  { id: 31, category: "gacha", title: "Brillo Inesperado", description: "Consigue tu primer Pokémon shiny.", icon: Sparkles, reward: 60 },
  { id: 32, category: "gacha", title: "Coleccionista de Brillantes", description: "Consigue 5 Pokémon shiny distintos.", icon: Sparkles, reward: 300 },
  { id: 33, category: "gacha", title: "Especialista", description: "Completa el pool de un gacha de tipo concreto al 100%.", icon: Target, reward: 280 },
  { id: 34, category: "gacha", title: "Sin Suerte", description: "Saca 10 repetidos seguidos sin ningún Pokémon nuevo.", icon: Dices, reward: 80 },
  { id: 35, category: "gacha", title: "Todo un Maestro", description: "Completa el pool del gacha general al 100%.", icon: Trophy, reward: 400 },

  // ---- COLECCIÓN POKÉMON ----
  { id: 36, category: "coleccion", title: "Equipo Completo", description: "Reúne 6 Pokémon distintos en tu colección.", icon: Boxes, reward: 50 },
  { id: 37, category: "coleccion", title: "Coleccionista Serio", description: "Reúne 50 Pokémon distintos en tu colección.", icon: Boxes, reward: 130 },
  { id: 38, category: "coleccion", title: "Pokédex Viviente", description: "Reúne 150 Pokémon distintos en tu colección.", icon: Boxes, reward: 350 },
  { id: 39, category: "coleccion", title: "Domador de Tipos", description: "Consigue al menos un Pokémon de cada uno de los 18 tipos.", icon: Dna, reward: 220 },

  // ---- MONEDAS ----
  { id: 40, category: "monedas", title: "Ahorrador", description: "Gana 5.000 monedas de torneo históricamente en total.", icon: PiggyBank, reward: 120 },
  { id: 41, category: "monedas", title: "Millonario Pokémon", description: "Gana 20.000 monedas de torneo históricamente en total.", icon: Coins, reward: 300 },

  // ---- MECÁNICAS DE COMBATE ----
  { id: 42, category: "mecanicas", title: "Golpe de Suerte", description: "Gana un combate usando con éxito un movimiento fulminante.", icon: Skull, reward: 120 },
  { id: 43, category: "mecanicas", title: "Sacrificio Total", description: "Gana un combate rematando al último rival con un movimiento de retroceso que también debilita a tu propio Pokémon.", icon: Skull, reward: 150 },
  { id: 44, category: "mecanicas", title: "Maestro del Clima", description: "Gana un combate con clima activo durante más de la mitad de los turnos.", icon: CloudRain, reward: 110 },
  { id: 45, category: "mecanicas", title: "Bajo mis Términos", description: "Gana un combate con un campo de batalla activo.", icon: Zap, reward: 110 },
  { id: 46, category: "mecanicas", title: "Viento a Favor", description: "Gana un combate tras usar Viento Afín.", icon: Wind, reward: 100 },
  { id: 47, category: "mecanicas", title: "Escudo Perfecto", description: "Usa Protección con éxito 3 veces seguidas en el mismo combate.", icon: ShieldCheck, reward: 120 },
  { id: 48, category: "mecanicas", title: "Duerme Bien", description: "Gana un combate tras dormir a cada uno de los Pokémon rivales.", icon: Moon, reward: 150 },
  { id: 49, category: "mecanicas", title: "Cadena Perfecta", description: "Gana un combate tras conectar los 5 golpes posibles de un movimiento de golpes múltiples en un mismo uso.", icon: Swords, reward: 130 },
  { id: 50, category: "mecanicas", title: "Forzado a Salir", description: "Gana un combate tras forzar el cambio de cada uno de los Pokémon rivales.", icon: Wind, reward: 150 },

  // ---- TORRE BATALLA ----
  { id: 51, category: "torre", title: "Primer Ascenso", description: "Supera la ronda 5 de la Torre Batalla.", icon: Building2, reward: 100 },
  { id: 52, category: "torre", title: "Al Límite", description: "Alcanza la ronda 15 de la Torre Batalla, donde la IA rival ya combate en dificultad Maestro.", icon: Building2, reward: 250 },
  { id: 53, category: "torre", title: "Sin Techo", description: "Alcanza la ronda 30 de la Torre Batalla.", icon: Landmark, reward: 400 },
  { id: 54, category: "torre", title: "Contra Titanes", description: "Gana una ronda de la Torre Batalla contra un equipo rival formado íntegramente por Pokémon Pseudolegendarios o Legendarios.", icon: Crown, reward: 150 },

  // ---- DRAFT ----
  { id: 55, category: "draft", title: "Coleccionista de Guerra", description: "Encadena 5 victorias seguidas dentro de una misma partida de Draft.", icon: Flame, reward: 120 },
  { id: 56, category: "draft", title: "Trueque Constante", description: "Completa 20 intercambios de Pokémon en el modo Draft, sumando todas tus partidas.", icon: ArrowLeftRight, reward: 200 },
  { id: 57, category: "draft", title: "Todo Tiene un Precio", description: "Termina una partida de Draft habiendo perdido de forma permanente al menos 3 Pokémon que eran originalmente tuyos.", icon: HeartCrack, reward: 100 },

  // ---- TORNEO SEMANAL ----
  { id: 58, category: "semanal", title: "Especialista Semanal", description: "Gana tu primer torneo semanal con reglas especiales.", icon: CalendarCheck, reward: 60 },
  { id: 59, category: "semanal", title: "Constancia de Hierro", description: "Gana el torneo semanal en 4 semanas distintas.", icon: CalendarRange, reward: 300 },
  { id: 60, category: "semanal", title: "Maestro de Todas las Semanas", description: "Gana al menos una vez cada una de las 10 temáticas del torneo semanal.", icon: Trophy, reward: 400 },
];

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}

export const ACHIEVEMENTS_TOTAL_REWARD = ACHIEVEMENTS.reduce((sum, a) => sum + a.reward, 0);
