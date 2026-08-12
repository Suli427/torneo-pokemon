/* ---------------------------------------------------------------
   MOVESETS COMPETITIVOS POR ENTRENADOR
   Clave: `${trainerId}:${slug}` -> 4 movimientos (nombre exacto de PokeAPI).

   A diferencia de la versión anterior (basada en lo que cada Pokémon usó en
   pantalla en el anime), estos sets se eligen con criterio competitivo real
   (estilo Smogon/VGC): buena cobertura de tipos, un STAB fuerte, y
   movimientos de utilidad reconocidos en el set estándar de cada Pokémon
   (setup, control de estado, prioridad...) en vez de lo más vistoso.

   Se evitan a propósito los movimientos cuyo único efecto real (en los
   juegos) no está implementado en este motor de combate simplificado, para
   que ningún hueco del set quede "muerto": curación plana (Recover, Roost,
   Rest, Synthesis...), hazards (Stealth Rock, Spikes...), pantallas
   (Reflect, Light Screen), Substitute, Leech Seed, movimientos que fuerzan
   cambio (Roar, Whirlwind), Taunt/Encore/Disable, Trick Room, y los
   movimientos de auto-KO (Explosion/Self-Destruct/Final Gambit/Memento,
   cuyo "el usuario se debilita" no está modelado, lo que los volvería
   golpes gratuitos sin coste). En su lugar se priorizan movimientos que sí
   tienen mecánica real aquí: ataques STAB/cobertura, ailments
   (parálisis/quemadura/veneno grave/sueño/confusión), cambios de stat
   (setup y debilitamiento), Protección, los 4 movimientos de clima,
   fulminantes, golpes múltiples, retroceso/recoil y drenaje.

   Las entradas marcadas con "// TODO: revisar" son la mejor estimación
   razonada cuando no hay plena certeza sobre si ese movimiento concreto
   forma parte del learnset actual de la especie, o cuando el equipo de un
   entrenador nuevo incluye un Pokémon no confirmado y elegido por criterio
   propio; se pueden corregir a mano sin tocar el resto.
--------------------------------------------------------------- */

export const TRAINER_MOVESETS = {
  // --- Ash --- (Pikachu sustituido por Raichu, ver App.jsx TRAINERS)
  "ash:raichu": ["thunderbolt", "iron-tail", "volt-switch", "grass-knot"], // TODO: revisar
  "ash:dragonite": ["dragon-claw", "extreme-speed", "earthquake", "fire-punch"],
  "ash:sirfetchd": ["close-combat", "leaf-blade", "brave-bird", "swords-dance"], // TODO: revisar
  "ash:gengar": ["shadow-ball", "sludge-bomb", "thunderbolt", "focus-blast"], // TODO: revisar
  "ash:lucario": ["close-combat", "extreme-speed", "ice-punch", "crunch"],
  "ash:goodra": ["draco-meteor", "sludge-bomb", "fire-blast", "thunderbolt"],

  // --- Cintia (Cynthia) ---
  "cintia:garchomp": ["earthquake", "dragon-claw", "stone-edge", "swords-dance"],
  "cintia:spiritomb": ["shadow-ball", "dark-pulse", "sucker-punch", "will-o-wisp"],
  "cintia:lucario": ["close-combat", "extreme-speed", "ice-punch", "crunch"],
  "cintia:milotic": ["scald", "ice-beam", "toxic", "dragon-tail"],
  "cintia:roserade": ["sludge-bomb", "giga-drain", "sleep-powder", "shadow-ball"],
  "cintia:togekiss": ["air-slash", "dazzling-gleam", "aura-sphere", "nasty-plot"],

  // --- Máximo (Steven) ---
  "maximo:metagross": ["meteor-mash", "earthquake", "ice-punch", "zen-headbutt"], // TODO: revisar
  // Placaje de Cuerpo sustituye a Tóxico: sinergiza con Defensa Férrea (sube
  // la misma stat que usa como arma ofensiva). Añadido para probar la nueva
  // mecánica de Placaje de Cuerpo (usa la Defensa del atacante, no su
  // Ataque); se deja permanente.
  "maximo:skarmory": ["brave-bird", "iron-head", "body-press", "iron-defense"],
  "maximo:aggron": ["head-smash", "iron-head", "earthquake", "autotomize"], // TODO: revisar
  "maximo:cradily": ["giga-drain", "earthquake", "ancient-power", "toxic"],
  "maximo:armaldo": ["x-scissor", "stone-edge", "earthquake", "swords-dance"],
  "maximo:claydol": ["earth-power", "psychic", "ice-beam", "cosmic-power"],

  // --- Dianta (Diantha) ---
  // Shadow Ball sustituido por Campo de Niebla para probar la nueva
  // mecánica de campos de batalla (Gardevoir es Hada/Psíquico, temática
  // razonable aunque no sea su learnset real de los juegos principales;
  // TODO: revisar si se ajusta al learnset real). Se deja permanente.
  "dianta:gardevoir": ["moonblast", "psychic", "misty-terrain", "dazzling-gleam"],
  "dianta:hawlucha": ["swords-dance", "close-combat", "flying-press", "poison-jab"],
  "dianta:tyrantrum": ["head-smash", "dragon-claw", "earthquake", "dragon-dance"],
  "dianta:goodra": ["draco-meteor", "sludge-bomb", "fire-blast", "thunderbolt"],
  "dianta:aurorus": ["freeze-dry", "ancient-power", "thunderbolt", "earth-power"], // TODO: revisar
  "dianta:gourgeist-average": ["shadow-ball", "seed-bomb", "will-o-wisp", "toxic"],

  // --- Lionel (Leon) ---
  "lionel:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "lionel:dragapult": ["dragon-darts", "phantom-force", "u-turn", "sucker-punch"], // TODO: revisar
  "lionel:aegislash-shield": ["iron-head", "shadow-ball", "kings-shield", "sacred-sword"],
  "lionel:rillaboom": ["wood-hammer", "u-turn", "superpower", "earthquake"],
  "lionel:cinderace": ["pyro-ball", "u-turn", "sucker-punch", "gunk-shot"], // TODO: revisar
  "lionel:mr-rime": ["icy-wind", "psychic", "nasty-plot", "fire-punch"], // TODO: revisar

  // --- Paul ---
  "paul:electivire": ["thunder-punch", "fire-punch", "ice-punch", "earthquake"],
  "paul:torterra": ["frenzy-plant", "earthquake", "stone-edge", "superpower"], // TODO: revisar
  "paul:ninjask": ["swords-dance", "x-scissor", "aerial-ace", "screech"],
  "paul:ursaring": ["facade", "close-combat", "hammer-arm", "swords-dance"], // TODO: revisar
  "paul:ariados": ["megahorn", "poison-jab", "sucker-punch", "crunch"], // TODO: revisar
  "paul:ambipom": ["double-hit", "u-turn", "low-kick", "fake-out"], // TODO: revisar

  // --- Gary ---
  "gary:blastoise": ["hydro-pump", "ice-beam", "flash-cannon", "dark-pulse"], // TODO: revisar
  // Tóxico sustituido por Bostezo para probar el sueño retardado de Bostezo
  // (Umbreon es un muro de estado clásico, buen encaje temático; se
  // conserva Rayo Confuso para poder seguir probando la confusión aplicada
  // directamente por un movimiento). Se deja permanente.
  "gary:umbreon": ["dark-pulse", "foul-play", "yawn", "confuse-ray"],
  "gary:arcanine": ["flare-blitz", "extreme-speed", "wild-charge", "crunch"],
  "gary:nidoking": ["earthquake", "poison-jab", "ice-beam", "thunderbolt"],
  "gary:scizor": ["bullet-punch", "x-scissor", "superpower", "pursuit"],
  "gary:electivire": ["thunder", "ice-punch", "fire-punch", "protect"],

  // --- Iris ---
  "iris:dragonite": ["outrage", "extreme-speed", "earthquake", "fire-punch"],
  "iris:excadrill": ["drill-run", "iron-head", "swords-dance", "rock-slide"],
  // U-turn sustituido por Viento Afín (Emolga es un setter de Viento Afín
  // habitual en los juegos reales; se conserva Cambio de Voltios para poder
  // seguir probando el autocambio tras golpear). Se deja permanente.
  "iris:emolga": ["thunderbolt", "acrobatics", "volt-switch", "tailwind"], // TODO: revisar
  "iris:dragonair": ["dragon-rush", "aqua-tail", "ice-beam", "thunder-wave"], // TODO: revisar
  "iris:gigalith": ["stone-edge", "earthquake", "superpower", "sandstorm"],
  "iris:druddigon": ["dragon-claw", "earthquake", "sucker-punch", "gunk-shot"], // TODO: revisar

  // --- Lance ---
  "lance:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"], // TODO: revisar
  "lance:dragonite": ["outrage", "extreme-speed", "earthquake", "fire-punch"],
  "lance:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "lance:aerodactyl": ["stone-edge", "aerial-ace", "crunch", "ice-fang"], // TODO: revisar
  "lance:kingdra": ["hydro-pump", "dragon-pulse", "ice-beam", "rain-dance"], // TODO: revisar

  // --- Wallace ---
  "wallace:milotic": ["scald", "ice-beam", "toxic", "dragon-tail"],
  "wallace:ludicolo": ["giga-drain", "scald", "ice-beam", "rain-dance"],
  "wallace:whiscash": ["earthquake", "scald", "ice-beam", "toxic"], // TODO: revisar
  "wallace:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"], // TODO: revisar
  "wallace:wailord": ["hydro-pump", "ice-beam", "double-edge", "toxic"], // TODO: revisar
  "wallace:starmie": ["hydro-pump", "psychic", "ice-beam", "thunderbolt"],

  // --- Alder ---
  "alder:volcarona": ["quiver-dance", "fire-blast", "bug-buzz", "hurricane"], // TODO: revisar
  "alder:bouffalant": ["facade", "earthquake", "swords-dance", "superpower"], // TODO: revisar
  "alder:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"], // TODO: revisar
  "alder:druddigon": ["dragon-claw", "earthquake", "sucker-punch", "gunk-shot"], // TODO: revisar
  "alder:escavalier": ["megahorn", "iron-head", "swords-dance", "drill-run"], // TODO: revisar
  "alder:accelgor": ["bug-buzz", "focus-blast", "sludge-bomb", "acid-spray"], // TODO: revisar

  // --- Alain ---
  "alain:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "alain:bisharp": ["iron-head", "sucker-punch", "swords-dance", "knock-off"], // TODO: revisar
  "alain:unfezant": ["facade", "air-slash", "superpower", "steel-wing"], // TODO: revisar
  "alain:weavile": ["ice-punch", "knock-off", "swords-dance", "pursuit"],
  "alain:metagross": ["meteor-mash", "earthquake", "ice-punch", "zen-headbutt"], // TODO: revisar
  // 6º Pokémon no confirmado en el anime: Tyranitar, elegido por encajar
  // temáticamente con un rival intenso de mega evolución (pseudolegendario
  // siniestro/roca con buena presencia física, coherente con el resto del
  // equipo). TODO: revisar equipo.
  "alain:tyranitar": ["stone-edge", "crunch", "earthquake", "dragon-dance"], // TODO: revisar equipo

  // --- Sabino (Sawyer) ---
  "sabino:sceptile": ["leaf-storm", "dragon-pulse", "focus-blast", "giga-drain"], // TODO: revisar
  "sabino:slaking": ["giga-impact", "earthquake", "facade", "double-edge"],
  "sabino:aegislash-shield": ["iron-head", "shadow-ball", "kings-shield", "sacred-sword"],
  "sabino:salamence": ["dragon-claw", "earthquake", "fire-fang", "dragon-dance"], // TODO: revisar
  "sabino:clawitzer": ["hydro-pump", "dark-pulse", "aura-sphere", "ice-beam"], // TODO: revisar
  "sabino:beedrill": ["poison-jab", "x-scissor", "brick-break", "swords-dance"], // TODO: revisar

  // --- Benito (Barry) ---
  "benito:empoleon": ["hydro-pump", "flash-cannon", "ice-beam", "grass-knot"],
  // Shadow Ball sustituido por Campo de Hierba para probar la nueva
  // mecánica de campos de batalla (Roserade es tipo Planta, sinergiza con
  // el propio Giga Drain). Se deja permanente.
  "benito:roserade": ["sludge-bomb", "giga-drain", "sleep-powder", "grassy-terrain"],
  "benito:heracross": ["close-combat", "megahorn", "stone-edge", "swords-dance"],
  "benito:rapidash": ["flare-blitz", "wild-charge", "zen-headbutt", "iron-tail"], // TODO: revisar
  "benito:staraptor": ["brave-bird", "close-combat", "u-turn", "facade"], // TODO: revisar
  "benito:floatzel": ["waterfall", "aqua-jet", "crunch", "ice-punch"], // TODO: revisar

  // --- Trip ---
  "trip:serperior": ["leaf-storm", "dragon-pulse", "glare", "giga-drain"], // TODO: revisar
  "trip:conkeldurr": ["drain-punch", "mach-punch", "ice-punch", "knock-off"], // TODO: revisar
  "trip:jellicent-male": ["scald", "shadow-ball", "will-o-wisp", "toxic"],
  "trip:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"], // TODO: revisar
  "trip:darmanitan-standard": ["flare-blitz", "superpower", "rock-slide", "u-turn"], // TODO: revisar
  "trip:boldore": ["rock-slide", "earthquake", "toxic", "sandstorm"], // TODO: revisar

  // --- Cameron ---
  "cameron:lucario": ["close-combat", "extreme-speed", "ice-punch", "crunch"],
  "cameron:hydreigon": ["dark-pulse", "draco-meteor", "flamethrower", "earth-power"],
  "cameron:samurott": ["hydro-pump", "megahorn", "ice-beam", "aqua-jet"], // TODO: revisar
  "cameron:swanna": ["hurricane", "scald", "ice-beam", "facade"], // TODO: revisar
  // 5º y 6º Pokémon no confirmados en el anime, elegidos para cubrir huecos
  // de tipo del resto del equipo (fuego/tierra/dragón con Flygon, acero/
  // eléctrico con Magnezone). TODO: revisar equipo.
  "cameron:flygon": ["earthquake", "dragon-claw", "fire-blast", "u-turn"], // TODO: revisar equipo
  // Chirrido sustituido por Campo Eléctrico para probar la nueva mecánica de
  // campos de batalla (Magnezone es tipo Eléctrico, buen encaje temático;
  // se conserva Cambio de Voltios en el resto de Magnezone del roster). Se
  // deja permanente.
  "cameron:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "electric-terrain"], // TODO: revisar equipo

  // --- Red ---
  "red:raichu": ["thunderbolt", "iron-tail", "volt-switch", "grass-knot"], // TODO: revisar
  "red:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "red:snorlax": ["body-slam", "earthquake", "crunch", "curse"],
  "red:espeon": ["psychic", "shadow-ball", "dazzling-gleam", "calm-mind"],
  "red:venusaur": ["giga-drain", "sludge-bomb", "earthquake", "sleep-powder"],
  "red:blastoise": ["hydro-pump", "ice-beam", "flash-cannon", "dark-pulse"], // TODO: revisar

  // --- Cyrus ---
  "cyrus:weavile": ["ice-punch", "knock-off", "swords-dance", "pursuit"],
  "cyrus:crobat": ["brave-bird", "cross-poison", "u-turn", "toxic"], // TODO: revisar
  "cyrus:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"], // TODO: revisar
  "cyrus:honchkrow": ["brave-bird", "sucker-punch", "superpower", "heat-wave"], // TODO: revisar
  "cyrus:houndoom": ["dark-pulse", "flamethrower", "sludge-bomb", "nasty-plot"],
  // 6º Pokémon sin legendarios, elegido por encajar con el perfil "frío y
  // calculador" de Cyrus (tipo Acero, buena cobertura eléctrica/física).
  // TODO: revisar equipo.
  "cyrus:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "screech"], // TODO: revisar equipo

  // --- N ---
  "n:zoroark": ["dark-pulse", "flamethrower", "sludge-bomb", "nasty-plot"],
  "n:carracosta": ["shell-smash", "waterfall", "stone-edge", "earthquake"],
  "n:klinklang": ["gear-grind", "flash-cannon", "zen-headbutt", "thunder-wave"], // TODO: revisar
  "n:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"], // TODO: revisar
  "n:archeops": ["stone-edge", "earthquake", "u-turn", "acrobatics"], // TODO: revisar
  // 6º Pokémon sin legendarios (nada de Zekrom), elegido para dar cobertura
  // de Fuego que le faltaba al resto del equipo. TODO: revisar equipo.
  "n:darmanitan-standard": ["flare-blitz", "superpower", "rock-slide", "u-turn"], // TODO: revisar equipo

  // --- Giovanni ---
  "giovanni:nidoking": ["earthquake", "poison-jab", "ice-beam", "thunderbolt"],
  "giovanni:nidoqueen": ["earthquake", "poison-jab", "ice-beam", "fire-blast"], // TODO: revisar
  "giovanni:rhyperior": ["earthquake", "stone-edge", "megahorn", "ice-punch"], // TODO: revisar
  // Chirrido sustituido por Supercolmillo para probar el daño fijo (mitad
  // de los PS actuales del objetivo). Se deja permanente.
  "giovanni:persian": ["facade", "u-turn", "night-slash", "super-fang"], // TODO: revisar
  "giovanni:kangaskhan": ["double-edge", "earthquake", "crunch", "sucker-punch"], // TODO: revisar
  // 6º Pokémon elegido por encajar con el perfil "jefe de Team Rocket":
  // rápido, tipo Veneno/Volador para complementar la pared física
  // tierra/veneno del resto del equipo. TODO: revisar equipo.
  "giovanni:crobat": ["brave-bird", "cross-poison", "u-turn", "toxic"], // TODO: revisar equipo

  // --- Colress ---
  "colress:klinklang": ["gear-grind", "flash-cannon", "zen-headbutt", "thunder-wave"], // TODO: revisar
  "colress:escavalier": ["megahorn", "iron-head", "swords-dance", "drill-run"], // TODO: revisar
  // Bola Sombra sustituida por Campo Psíquico para probar la nueva mecánica
  // de campos de batalla (Beheeyem es tipo Psíquico, buen encaje temático).
  // Se deja permanente.
  "colress:beheeyem": ["psychic", "thunderbolt", "calm-mind", "psychic-terrain"], // TODO: revisar
  "colress:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "screech"], // TODO: revisar
  "colress:metang": ["psychic", "zen-headbutt", "iron-head", "earthquake"], // TODO: revisar
  // 6º Pokémon elegido por encajar con el perfil de científico creador de
  // Pokémon artificiales/robóticos (Porygon-Z). TODO: revisar equipo.
  "colress:porygon-z": ["tri-attack", "thunderbolt", "ice-beam", "nasty-plot"], // TODO: revisar equipo
};

// Fallback genérico por tipo elemental, usado solo si en el futuro se añade
// un Pokémon sin entrada en TRAINER_MOVESETS. Se mantiene sin cambios: ya
// eran movimientos de cobertura/STAB razonables, coherentes con el mismo
// criterio competitivo aplicado arriba.
export const DEFAULT_MOVES_BY_TYPE = {
  normal: ["hyper-beam", "body-slam", "tackle"],
  fire: ["flamethrower", "fire-blast", "ember"],
  water: ["surf", "hydro-pump", "water-gun"],
  electric: ["thunderbolt", "thunder", "spark"],
  grass: ["energy-ball", "solar-beam", "vine-whip"],
  ice: ["ice-beam", "blizzard", "icy-wind"],
  fighting: ["close-combat", "brick-break", "low-kick"],
  poison: ["sludge-bomb", "poison-jab", "acid"],
  ground: ["earthquake", "earth-power", "dig"],
  flying: ["air-slash", "hurricane", "wing-attack"],
  psychic: ["psychic", "psybeam", "confusion"],
  bug: ["x-scissor", "bug-buzz", "struggle-bug"],
  rock: ["rock-slide", "stone-edge", "rock-throw"],
  ghost: ["shadow-ball", "shadow-claw", "lick"],
  dragon: ["dragon-claw", "dragon-pulse", "twister"],
  dark: ["dark-pulse", "crunch", "bite"],
  steel: ["iron-head", "flash-cannon", "metal-claw"],
  fairy: ["dazzling-gleam", "moonblast", "fairy-wind"],
};
