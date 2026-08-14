// Historial de actualizaciones mostrado en "Novedades". Cada `date` es la
// fecha/hora REAL del commit de git que introdujo ese cambio (obtenida con
// `git log --all --format="%H|%ad|%s" --date=iso` y emparejada a mano por
// palabras clave del propio mensaje de commit, revisando el historial
// completo antes de asignar nada — ver la respuesta que acompaña a este
// cambio para el detalle de la correspondencia y cuántas entradas se
// encontraron). Si no se encontró una coincidencia clara, `date` es `null`
// a propósito: la interfaz muestra "Fecha no disponible" en ese caso en
// vez de una fecha inventada.
export const CHANGELOG = [
  {
    id: 1,
    title: "Motor de combate por turnos",
    summary: "Combates reales turno a turno usando datos de PokeAPI, con PP, precisión y una fórmula de daño fiel a los juegos.",
    detail: "Sustituye el sistema de combate simplificado original (comparación de un solo número por Pokémon) por un sistema completo por turnos con movimientos reales, PP, precisión, velocidad y críticos.",
    // TODO: fecha no encontrada en git log — no hay ningún commit cuyo
    // mensaje mencione explícitamente la introducción de este sistema; el
    // commit inicial ("Liga de Campeones - torneo Pokémon") no tiene
    // palabras clave que lo distingan del resto del contenido inicial del
    // proyecto, así que se deja sin fecha en vez de asumir que es ese.
    date: null,
  },
  {
    id: 2,
    title: "Movesets del anime y estados",
    summary: "Cada Pokémon usa los movimientos que realmente tuvo en la serie, y los estados (parálisis, quemadura, veneno...) ya hacen efecto.",
    detail: "Se creó un moveset propio por combinación entrenador+Pokémon basado en apariciones reales del anime, y se implementó la funcionalidad completa de los efectos de estado, que antes solo consumían el turno sin hacer nada.",
    date: "2026-08-10T14:13:52+02:00",
  },
  {
    id: 3,
    title: "Descripciones de movimientos",
    summary: "El selector de movimientos ahora explica qué hace cada uno antes de elegirlo.",
    detail: "Se añadieron descripciones en español, tipo, categoría, poder, precisión y PP visibles en el selector de combate.",
    date: "2026-08-10T14:13:52+02:00",
  },
  {
    id: 4,
    title: "Corrección de tipo y objetivos de movimientos",
    summary: "Aegislash tenía el tipo mal asignado, y los movimientos de subida de stats afectaban al rival en vez de a quien los usaba.",
    detail: "Se corrigió la resolución del tipo real de Aegislash desde la API, y se arregló el sistema para que los cambios de estadísticas respeten el campo `target` real de cada movimiento (subidas propias vs bajadas al rival), incluyendo que no afecten a Pokémon inmunes por tipo.",
    date: "2026-08-10T15:34:17+02:00",
  },
  {
    id: 5,
    title: "Turno de recarga",
    summary: "Movimientos como Hiperrayo ya obligan a descansar un turno después de usarlos.",
    detail: "Se implementó la mecánica de recarga obligatoria tras movimientos de la familia Hiperrayo/Giga Impacto.",
    date: "2026-08-10T15:43:47+02:00",
  },
  {
    id: 6,
    title: "Indicadores visuales en combate",
    summary: "Ahora se ven las subidas y bajadas de estadísticas, los estados alterados, y cuántas monedas ganas exactamente al final del torneo.",
    detail: "Se añadieron indicadores con flechas/colores para stat stages y badges para estados (parálisis, quemadura...), y se sustituyó el mensaje genérico de \"ganaste monedas\" por la cifra exacta ganada.",
    date: "2026-08-10T15:58:59+02:00",
  },
  {
    id: 7,
    title: "Movimientos de furia y confusión",
    summary: "Enfado y similares bloquean varios turnos seguidos, y dejan confuso al Pokémon al terminar.",
    detail: "Se implementó el bloqueo de turnos de movimientos tipo Enfado/Danza Pétalo/Golpes Furia, con confusión automática al finalizar el bloqueo.",
    date: "2026-08-10T16:09:12+02:00",
  },
  {
    id: 8,
    title: "Límite de estadísticas -6/+6",
    summary: "Las subidas y bajadas de stats ya no pueden superar los límites reales de los juegos.",
    detail: "Se aplicó el tope de -6 a +6 en los stages de cualquier estadística modificable en combate.",
    date: "2026-08-10T18:12:20+02:00",
  },
  {
    id: 9,
    title: "Corrección del estado Dormido",
    summary: "Un Pokémon dormido ya no se despierta antes de tiempo por un error de conteo de turnos.",
    detail: "Se corrigió el desfase en el contador de turnos de sueño que hacía que el Pokémon pudiera actuar cuando no debía.",
    date: "2026-08-10T18:28:31+02:00",
  },
  {
    id: 10,
    title: "Golpes críticos justos",
    summary: "Los críticos ya ignoran correctamente solo las penalizaciones propias, no todas las estadísticas.",
    detail: "Los golpes críticos ahora ignoran bajadas de Ataque propio y subidas de Defensa rival, sin anular el resto de stages.",
    date: "2026-08-10T18:16:52+02:00",
  },
  {
    id: 11,
    title: "Cambiar de Pokémon en combate y ver efectividad",
    summary: "Ya puedes cambiar de Pokémon a mitad de combate, ver qué Pokémon quedan vivos de cada lado, y saber si un movimiento es supereficaz antes de usarlo.",
    detail: "Se añadió la opción de cambio voluntario de Pokémon durante el combate, un visor del estado del equipo completo de ambos lados, y etiquetas de efectividad de tipo (Inmune/Poco eficaz/Eficaz/Supereficaz/Hipereficaz) en el selector de movimientos.",
    date: "2026-08-10T21:32:39+02:00",
  },
  {
    id: 12,
    title: "Protección y Come Sueños",
    summary: "Protección ya falla más si se usa varias veces seguidas, y Come Sueños cura correctamente al usuario.",
    detail: "Se implementó la probabilidad decreciente de éxito de Protección en usos consecutivos, y la curación del 50% del daño en Come Sueños solo contra objetivos dormidos.",
    date: "2026-08-10T22:28:00+02:00",
  },
  {
    id: 13,
    title: "Movimientos fulminantes, golpes múltiples y Tóxico",
    summary: "Perforsión y similares ya pueden noquear de un golpe, Lanzarrocas golpea el número real de veces, y Tóxico envenena gravemente de verdad.",
    detail: "Se implementaron los movimientos OHKO con su precisión real, el retroceso (flinch), la distribución real de golpes múltiples (35/35/15/15%), y el veneno grave con daño creciente por turno en vez del veneno normal.",
    date: "2026-08-10T23:20:03+02:00",
  },
  {
    id: 14,
    title: "STAB, clima, PP visible y orden de turno",
    summary: "Se verificó el bonus de mismo tipo, se implementó el clima con sus efectos, el PP se gasta de verdad, y los cambios de Pokémon respetan el orden correcto frente a Persecución.",
    detail: "Se confirmó el cálculo de STAB, se añadió clima (Sol/Lluvia/Tormenta de Arena/Granizo) con indicador visual, PP real por movimiento, y se corrigió el orden de resolución de cambios voluntarios frente al movimiento Persecución.",
    date: "2026-08-10T23:40:54+02:00",
  },
  {
    id: 15,
    title: "Compra de entrenadores",
    summary: "Ya puedes desbloquear entrenadores con monedas de torneo, y el progreso se guarda entre sesiones.",
    detail: "Se implementó el flujo de compra de los entrenadores bloqueados con precios fijos, y se añadió persistencia en el navegador para que las monedas y compras no se pierdan al recargar la página.",
    date: "2026-08-10T22:46:48+02:00",
  },
  {
    id: 16,
    title: "Rediseño de Personajes y Tienda",
    summary: "Se simplificó la sección de Personajes y la Tienda pasó a llamarse Gatcha.",
    detail: "Se eliminó la compra directa de personajes y el gacha de entrenadores de la tienda, dejando la compra de personajes solo en Personajes, y renombrando la tienda a Gatcha.",
    date: "2026-08-10T23:50:18+02:00",
  },
  {
    id: 17,
    title: "Sistema de Gacha completo",
    summary: "Nuevo sistema de tiradas con 6 rarezas, Pokémon shiny, y una colección donde ver todo lo conseguido.",
    detail: "Se implementó el gacha general y por tipo con 481 Pokémon de última etapa evolutiva, 6 rarezas con sus probabilidades reales, reembolso por repetidos, probabilidad de shiny, y la nueva tab Pokémon con la colección del usuario.",
    date: "2026-08-11T11:04:28+02:00",
  },
  {
    id: 18,
    title: "Shiny independiente y entrenador editable",
    summary: "Los shiny ya cuentan como Pokémon distintos en la colección, y puedes editar el equipo de tu entrenador propio.",
    detail: "Los shiny pasaron a ser entradas independientes de la colección con reembolso x4 en repetidos, se hizo editable el equipo del entrenador propio, y se añadió la edición de movimientos de cualquier Pokémon de la colección.",
    date: "2026-08-11T11:36:28+02:00",
  },
  {
    id: 19,
    title: "12 entrenadores nuevos",
    summary: "Se amplió el roster con Lance, Plubio, Mirto, Alain, Sabino, Benito, Trip, Cameron, Rojo, Helio, N y Acromo, con movesets competitivos.",
    detail: "Se añadieron 12 entrenadores nuevos con sus equipos y precios, se sustituyeron todos los movesets del roster por sets competitivos, y se cambió Pikachu por Raichu en los equipos donde aparecía.",
    date: "2026-08-11T11:54:11+02:00",
  },
  {
    id: 20,
    title: "Modos de torneo e historial",
    summary: "Nuevos modos de torneo (con o sin tu entrenador propio), 5 rondas en vez de 4, y un historial con tus estadísticas.",
    detail: "Se implementaron los modos A y B de torneo, se amplió a 5 rondas, y se añadió un historial de partidas con estadísticas agregadas por modo.",
    date: "2026-08-11T23:18:30+02:00",
  },
  {
    id: 21,
    title: "Filtros en la colección",
    summary: "Ya puedes buscar tus Pokémon y movimientos por nombre, tipo, categoría o rareza.",
    detail: "Se añadieron filtros combinables en la tab Pokémon y en el selector de edición de movimientos.",
    date: "2026-08-12T23:40:06+02:00",
  },
  {
    id: 22,
    title: "Dificultades de IA y Ruleta Pokémon",
    summary: "La CPU ya tiene tres niveles de dificultad, y hay un nuevo modo de torneo con equipo completamente aleatorio.",
    detail: "Se implementaron los niveles Normal, Difícil (cambios razonados) y Maestro (simulación a 2 turnos), y el modo Ruleta Pokémon con equipo aleatorio para el usuario.",
    date: "2026-08-13T10:51:34+02:00",
  },
  {
    id: 23,
    title: "Movesets por dificultad y correcciones varias",
    summary: "La CPU en Difícil/Maestro usa equipos más optimizados, y se corrigieron varios bugs de combate (Dracoflecha, Voltiocambio, Smeargle).",
    detail: "Se separaron los movesets de la CPU según dificultad con sinergia de equipo, se permitió editar el moveset de cualquier entrenador comprado sin afectar a la CPU, y se corrigieron Dracoflecha, el orden de turno con Voltiocambio, y el movepool de Smeargle.",
    date: "2026-08-13T11:52:35+02:00",
  },
  {
    id: 24,
    title: "Corrección de Hierba Lazo",
    summary: "Ahora su daño depende realmente del peso del objetivo.",
    detail: "Se corrigió el cálculo de potencia de Hierba Lazo, que antes usaba un valor fijo casi nulo en vez de escalar con el peso real del rival.",
    date: "2026-08-12T23:30:35+02:00",
  },
  {
    id: 25,
    title: "Sistema de 50 logros",
    summary: "Nueva sección de Logros con 50 retos y recompensas de monedas por cumplirlos.",
    detail: "Se implementaron 50 logros agrupados por categoría, con seguimiento de progreso, reconstrucción retroactiva para partidas ya en curso, y recompensas escaladas en monedas.",
    date: "2026-08-13T12:14:34+02:00",
  },
  {
    id: 26,
    title: "Corrección de bugs de combate reportados",
    summary: "Mensaje de debilitamiento duplicado, Voltiocambio, Fake Out y Liofilización, todos corregidos.",
    detail: "Se corrigió que el mensaje de debilitamiento apareciera dos veces, un bug de Voltiocambio con cambios del rival, la restricción de primer turno en Fake Out/Impresión Primeriza, y la efectividad especial de Liofilización contra tipo Agua.",
    date: "2026-08-13T22:09:09+02:00",
  },
  {
    id: 27,
    title: "Emparejamientos sin revancha y Ruleta Pokémon mejorada",
    summary: "El torneo evita repetir rivales entre rondas, y en Ruleta Pokémon los rivales también tienen equipo aleatorio.",
    detail: "Se implementó la lógica para minimizar revanchas en el emparejamiento del torneo, y se amplió Ruleta Pokémon para que los 7 rivales también reciban equipos aleatorios con movesets competitivos, en vez de sus equipos fijos.",
    date: "2026-08-13T22:57:27+02:00",
  },
  {
    id: 28,
    title: "Nombres oficiales en español",
    summary: "Se corrigieron los nombres de varios entrenadores a su localización oficial.",
    detail: "Wallace pasó a llamarse Plubio, Alder a Mirto, Red a Rojo, Cyrus a Helio y Colress a Acromo, y los rivales de Ruleta Pokémon ahora usan nombres de entrenadores reales del roster.",
    date: "2026-08-13T23:23:19+02:00",
  },
  {
    id: 29,
    title: "PokéArena",
    summary: "La app tiene nuevo nombre, descripción e icono.",
    detail: "Se renombró la app de \"Liga de Campeones\" a \"PokéArena\", se actualizó el texto de cabecera, y se creó un favicon propio con el diseño de la Pokéball ya usada en la interfaz.",
    date: "2026-08-14T12:41:51+02:00",
  },
  {
    id: 30,
    title: "Congelación, movimientos de dos turnos y curación",
    summary: "Se corrigieron las inmunidades de tipo a estados, Ataque Celestial ya tarda dos turnos, y los movimientos de curación por fin funcionan.",
    detail: "Se implementaron las inmunidades de tipo a sus propios estados (Fuego no se quema, Eléctrico no se paraliza, Hielo no se congela), la mecánica completa de congelación, movimientos de carga vulnerables como Ataque Celestial, la dependencia de Rodillo de Acero de un campo activo, y los movimientos de curación/drenaje (Descanso, Recuperación, Gigadrenado).",
    date: "2026-08-14T12:23:47+02:00",
  },
];

// Orden mostrado en la interfaz: de más reciente a más antigua por fecha
// real; las entradas sin fecha encontrada (`date: null`) se colocan al
// FINAL, por debajo de todas las fechadas, ya que no hay forma fiable de
// saber dónde encajarían cronológicamente sin inventar un dato.
export function getSortedChangelog() {
  return [...CHANGELOG].sort((a, b) => {
    if (a.date == null && b.date == null) return 0;
    if (a.date == null) return 1;
    if (b.date == null) return -1;
    return new Date(b.date) - new Date(a.date);
  });
}
