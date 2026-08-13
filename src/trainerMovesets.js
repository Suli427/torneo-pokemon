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

/* ---------------------------------------------------------------
   MOVESETS AVANZADOS (SOLO CPU, DIFICULTAD DIFÍCIL/MAESTRO)
   Misma clave `${trainerId}:${slug}` que TRAINER_MOVESETS. Usados
   ÚNICAMENTE por la CPU cuando la dificultad del torneo es Difícil o
   Maestro (App.jsx, getMoveset) — nunca por el equipo que controla el
   propio usuario, sea cual sea su origen (entrenador propio, Ruleta
   Pokémon, o un entrenador comprado con el que el usuario juegue: ver
   item 5, ownedTrainerMovesets). Si algún Pokémon no tiene entrada aquí,
   getMoveset cae a su set de TRAINER_MOVESETS con normalidad.

   A diferencia de TRAINER_MOVESETS (cada Pokémon optimizado por sí solo),
   aquí el criterio es de EQUIPO: cobertura de tipos combinada entre los 6
   para no compartir la misma debilidad sin que el resto la tape, y un rol
   de utilidad (Viento Afín/campo de batalla) en el Pokémon del equipo que
   mejor encaja para dárselo a los más lentos/al resto de tipos afines,
   cuando el equipo se beneficia claramente de ello. Mismas restricciones
   de mecánica que TRAINER_MOVESETS (ver su cabecera): nada de curación
   plana, hazards, pantallas, Substitute, Leech Seed, Roar/Whirlwind,
   Taunt/Encore/Disable, Trick Room ni movimientos de auto-KO.
--------------------------------------------------------------- */

export const TRAINER_MOVESETS_ADVANCED = {
  // --- Cintia: núcleo ofensivo variado; Milotic sigue de "phazer" (Cola
  // Dragón) para desgastar detrás de Roserade (dormir) y Spiritomb (quemar),
  // dejando que Garchomp/Lucario/Togekiss rematen ya debilitados/con setup. ---
  "cintia:garchomp": ["earthquake", "dragon-claw", "stone-edge", "swords-dance"],
  "cintia:spiritomb": ["shadow-ball", "dark-pulse", "sucker-punch", "will-o-wisp"],
  "cintia:lucario": ["close-combat", "extreme-speed", "swords-dance", "crunch"],
  "cintia:milotic": ["scald", "ice-beam", "dragon-tail", "toxic"],
  "cintia:roserade": ["sludge-bomb", "giga-drain", "sleep-powder", "shadow-ball"],
  "cintia:togekiss": ["air-slash", "dazzling-gleam", "aura-sphere", "nasty-plot"],

  // --- Máximo: núcleo Acero/Roca defensivo; Skarmory (Defensa Férrea +
  // Placaje de Cuerpo) es la pared que aguanta mientras Metagross/Aggron
  // rematan con Puñetazo Bala/Cabezazo Zen de prioridad. ---
  "maximo:metagross": ["meteor-mash", "earthquake", "bullet-punch", "zen-headbutt"],
  "maximo:skarmory": ["brave-bird", "iron-head", "body-press", "iron-defense"],
  "maximo:aggron": ["head-smash", "iron-head", "earthquake", "autotomize"],
  "maximo:cradily": ["giga-drain", "earthquake", "ancient-power", "toxic"],
  "maximo:armaldo": ["x-scissor", "stone-edge", "earthquake", "swords-dance"],
  "maximo:claydol": ["earth-power", "psychic", "ice-beam", "cosmic-power"],

  // --- Dianta: Gardevoir pone Campo de Niebla (protege a todo el equipo de
  // estados y confusión, y debilita a la mitad los golpes Dragón que Goodra/
  // Tyrantrum reciben con frecuencia) mientras el resto ataca con libertad. ---
  "dianta:gardevoir": ["moonblast", "psychic", "misty-terrain", "dazzling-gleam"],
  "dianta:hawlucha": ["swords-dance", "close-combat", "flying-press", "poison-jab"],
  "dianta:tyrantrum": ["head-smash", "dragon-claw", "earthquake", "dragon-dance"],
  "dianta:goodra": ["draco-meteor", "sludge-bomb", "fire-blast", "thunderbolt"],
  "dianta:aurorus": ["freeze-dry", "ancient-power", "thunderbolt", "earth-power"],
  "dianta:gourgeist-average": ["shadow-ball", "seed-bomb", "will-o-wisp", "toxic"],

  // --- Lionel: equipo de intercambios rápidos (Cambio de Voltios/U-turn en
  // tres miembros) que va metiendo daño y trayendo al mejor matchup sin
  // arriesgar el turno; Aegislash cierra con Espada Sagrada tras el Rey Escudo. ---
  "lionel:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "lionel:dragapult": ["dragon-darts", "phantom-force", "u-turn", "sucker-punch"],
  "lionel:aegislash-shield": ["iron-head", "shadow-ball", "kings-shield", "sacred-sword"],
  "lionel:rillaboom": ["wood-hammer", "u-turn", "superpower", "earthquake"],
  "lionel:cinderace": ["pyro-ball", "u-turn", "sucker-punch", "gunk-shot"],
  "lionel:mr-rime": ["icy-wind", "psychic", "nasty-plot", "fire-punch"],

  // --- Paul: Ninjask (Danza Espada + Viento Afín en vez de Chirrido) duplica
  // su propia Velocidad para el resto del equipo durante 4 turnos, dejando
  // que Torterra/Ursaring/Electivire (más lentos) golpeen primero también. ---
  "paul:electivire": ["thunder-punch", "fire-punch", "ice-punch", "earthquake"],
  "paul:torterra": ["frenzy-plant", "earthquake", "stone-edge", "superpower"],
  "paul:ninjask": ["swords-dance", "x-scissor", "aerial-ace", "tailwind"],
  "paul:ursaring": ["facade", "close-combat", "hammer-arm", "swords-dance"],
  "paul:ariados": ["megahorn", "poison-jab", "sucker-punch", "crunch"],
  "paul:ambipom": ["double-hit", "u-turn", "low-kick", "fake-out"],

  // --- Gary: equipo balanceado clásico; Scizor (Puñetazo Bala) da control
  // de prioridad al único punto lento del equipo, Electivire limpia con
  // Trueno tras el desgaste de Umbreon/Nidoking. ---
  "gary:blastoise": ["hydro-pump", "ice-beam", "flash-cannon", "dark-pulse"],
  "gary:umbreon": ["dark-pulse", "foul-play", "toxic", "confuse-ray"],
  "gary:arcanine": ["flare-blitz", "extreme-speed", "wild-charge", "crunch"],
  "gary:nidoking": ["earthquake", "poison-jab", "ice-beam", "thunderbolt"],
  "gary:scizor": ["bullet-punch", "x-scissor", "superpower", "pursuit"],
  "gary:electivire": ["thunder", "ice-punch", "fire-punch", "protect"],

  // --- Iris: equipo pesado en Dragón/Roca (débil a Hielo por todas partes);
  // Emolga (Viento Afín en vez de Acrobacia) es quien de verdad arregla eso,
  // dando velocidad a Gigalith/Druddigon/Dragonair antes de que el rival
  // pueda aprovechar esa debilidad compartida. ---
  "iris:dragonite": ["outrage", "extreme-speed", "earthquake", "fire-punch"],
  "iris:excadrill": ["drill-run", "iron-head", "swords-dance", "rock-slide"],
  "iris:emolga": ["thunderbolt", "volt-switch", "tailwind", "acrobatics"],
  "iris:dragonair": ["dragon-rush", "aqua-tail", "ice-beam", "thunder-wave"],
  "iris:gigalith": ["stone-edge", "earthquake", "superpower", "sandstorm"],
  "iris:druddigon": ["dragon-claw", "earthquake", "sucker-punch", "gunk-shot"],

  // --- Ash: Raichu (Cambio de Voltios) trae al mejor matchup entre
  // Dragonite/Lucario/Gengar según lo que salga enfrente; Sirfetch'd y
  // Goodra cubren los huecos de Lucha/Dragón que el resto deja abiertos. ---
  "ash:raichu": ["thunderbolt", "iron-tail", "volt-switch", "grass-knot"],
  "ash:dragonite": ["dragon-claw", "extreme-speed", "earthquake", "fire-punch"],
  "ash:sirfetchd": ["close-combat", "leaf-blade", "brave-bird", "swords-dance"],
  "ash:gengar": ["shadow-ball", "sludge-bomb", "thunderbolt", "focus-blast"],
  "ash:lucario": ["close-combat", "extreme-speed", "ice-punch", "crunch"],
  "ash:goodra": ["draco-meteor", "sludge-bomb", "fire-blast", "thunderbolt"],

  // --- Lance: equipo Dragón/Volador/Agua muy ofensivo pero con debilidades
  // compartidas (Hielo, Roca, Eléctrico) difíciles de tapar sin hazards;
  // Kingdra pone Danza Lluvia para que su propio Hidrobomba y el Agua de
  // Gyarados peguen más fuerte mientras dura. ---
  "lance:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"],
  "lance:dragonite": ["outrage", "extreme-speed", "earthquake", "fire-punch"],
  "lance:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "lance:aerodactyl": ["stone-edge", "aerial-ace", "crunch", "ice-fang"],
  "lance:kingdra": ["hydro-pump", "dragon-pulse", "ice-beam", "rain-dance"],

  // --- Wallace: equipo de lluvia real — Ludicolo YA pone Danza Lluvia, y
  // ahora Milotic/Starmie también se benefician de su Agua potenciado x1.5
  // mientras dura, con Whiscash (inmune a Electrizar por Tierra) tapando el
  // hueco eléctrico que el resto del equipo comparte. ---
  "wallace:milotic": ["scald", "ice-beam", "dragon-tail", "toxic"],
  "wallace:ludicolo": ["giga-drain", "scald", "ice-beam", "rain-dance"],
  "wallace:whiscash": ["earthquake", "scald", "ice-beam", "toxic"],
  "wallace:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"],
  "wallace:wailord": ["hydro-pump", "ice-beam", "double-edge", "toxic"],
  "wallace:starmie": ["hydro-pump", "psychic", "ice-beam", "thunderbolt"],

  // --- Alder: Volcarona (Danza Plumas) es el sweeper principal; el resto
  // del equipo (Bouffalant/Druddigon/Escavalier) pega fuerte para desgastar
  // antes de que Volcarona/Accelgor rematen con velocidad. ---
  "alder:volcarona": ["quiver-dance", "fire-blast", "bug-buzz", "hurricane"],
  "alder:bouffalant": ["facade", "earthquake", "swords-dance", "superpower"],
  "alder:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"],
  "alder:druddigon": ["dragon-claw", "earthquake", "sucker-punch", "gunk-shot"],
  "alder:escavalier": ["megahorn", "iron-head", "swords-dance", "drill-run"],
  "alder:accelgor": ["bug-buzz", "focus-blast", "sludge-bomb", "acid-spray"],

  // --- Alain: núcleo Siniestro/Acero/Roca muy físico (Bisharp/Weavile/
  // Tyranitar); Metagross con Puñetazo Bala da la prioridad que al resto le
  // falta, y Charizard cubre el hueco Lucha que ese núcleo comparte. ---
  "alain:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "alain:bisharp": ["iron-head", "sucker-punch", "swords-dance", "knock-off"],
  "alain:unfezant": ["facade", "air-slash", "superpower", "steel-wing"],
  "alain:weavile": ["ice-punch", "knock-off", "swords-dance", "pursuit"],
  "alain:metagross": ["meteor-mash", "earthquake", "bullet-punch", "zen-headbutt"],
  "alain:tyranitar": ["stone-edge", "crunch", "earthquake", "dragon-dance"],

  // --- Sabino: Sceptile pone Campo de Hierba (potencia su propio Planta
  // x1.3 y cura 1/16 cada turno a todo el equipo con los pies en el suelo),
  // sustento extra muy útil para Slaking, que no tiene forma de recuperar
  // PS por sí mismo. ---
  "sabino:sceptile": ["leaf-storm", "dragon-pulse", "focus-blast", "grassy-terrain"],
  "sabino:slaking": ["giga-impact", "earthquake", "facade", "double-edge"],
  "sabino:aegislash-shield": ["iron-head", "shadow-ball", "kings-shield", "sacred-sword"],
  "sabino:salamence": ["dragon-claw", "earthquake", "fire-fang", "dragon-dance"],
  "sabino:clawitzer": ["hydro-pump", "dark-pulse", "aura-sphere", "ice-beam"],
  "sabino:beedrill": ["poison-jab", "x-scissor", "brick-break", "swords-dance"],

  // --- Benito: Roserade YA pone Campo de Hierba, que cura 1/16 cada turno a
  // todo el equipo (Empoleon/Heracross/Rapidash/Staraptor/Floatzel incluidos,
  // ninguno tiene recuperación propia) y debilita el Terremoto que el equipo
  // comparte como debilidad frecuente. ---
  "benito:empoleon": ["hydro-pump", "flash-cannon", "ice-beam", "grass-knot"],
  "benito:roserade": ["sludge-bomb", "giga-drain", "sleep-powder", "grassy-terrain"],
  "benito:heracross": ["close-combat", "megahorn", "stone-edge", "swords-dance"],
  "benito:rapidash": ["flare-blitz", "wild-charge", "zen-headbutt", "iron-tail"],
  "benito:staraptor": ["brave-bird", "close-combat", "u-turn", "facade"],
  "benito:floatzel": ["waterfall", "aqua-jet", "crunch", "ice-punch"],

  // --- Trip: Conkeldurr (Golpe Drenaje) es el único con sustento propio;
  // Serperior/Darmanitan pegan fuerte primero para que Jellicent/Vanilluxe
  // rematen con su propio STAB sin resistencias de por medio. ---
  "trip:serperior": ["leaf-storm", "dragon-pulse", "glare", "giga-drain"],
  "trip:conkeldurr": ["drain-punch", "mach-punch", "ice-punch", "knock-off"],
  "trip:jellicent-male": ["scald", "shadow-ball", "will-o-wisp", "toxic"],
  "trip:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"],
  "trip:darmanitan-standard": ["flare-blitz", "superpower", "rock-slide", "u-turn"],
  "trip:boldore": ["rock-slide", "earthquake", "toxic", "sandstorm"],

  // --- Cameron: Magnezone YA pone Campo Eléctrico, que potencia su propio
  // Rayo x1.3 y protege a todo el equipo con los pies en el suelo de
  // quedarse dormido (Lucario/Hydreigon/Samurott/Flygon), un problema real
  // contra equipos con Hipnosis/Somnífero/Bostezo. ---
  "cameron:lucario": ["close-combat", "extreme-speed", "ice-punch", "crunch"],
  "cameron:hydreigon": ["dark-pulse", "draco-meteor", "flamethrower", "earth-power"],
  "cameron:samurott": ["hydro-pump", "megahorn", "ice-beam", "aqua-jet"],
  "cameron:swanna": ["hurricane", "scald", "ice-beam", "facade"],
  "cameron:flygon": ["earthquake", "dragon-claw", "fire-blast", "u-turn"],
  "cameron:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "electric-terrain"],

  // --- Red: Espeon pone Campo Psíquico en vez de Poder Oculto — potencia su
  // propio Psíquico x1.3 y, más importante, bloquea la prioridad rival
  // contra el resto del equipo con los pies en el suelo mientras Snorlax
  // (con Malicioso de setup) y Venusaur se preparan sin miedo a un
  // Puñetazo Bala/Mach Punch que los remate antes de tiempo. ---
  "red:raichu": ["thunderbolt", "iron-tail", "volt-switch", "grass-knot"],
  "red:charizard": ["flare-blitz", "air-slash", "dragon-claw", "earthquake"],
  "red:snorlax": ["body-slam", "earthquake", "crunch", "curse"],
  "red:espeon": ["psychic", "shadow-ball", "dazzling-gleam", "psychic-terrain"],
  "red:venusaur": ["giga-drain", "sludge-bomb", "earthquake", "sleep-powder"],
  "red:blastoise": ["hydro-pump", "ice-beam", "flash-cannon", "dark-pulse"],

  // --- Cyrus: Magnezone (Campo Eléctrico) repite la misma sinergia que en
  // el equipo de Cameron (protege de sueño a Weavile/Crobat/Gyarados/
  // Honchkrow/Houndoom, todos sin recuperación propia). ---
  "cyrus:weavile": ["ice-punch", "knock-off", "swords-dance", "pursuit"],
  "cyrus:crobat": ["brave-bird", "cross-poison", "u-turn", "toxic"],
  "cyrus:gyarados": ["dragon-dance", "waterfall", "crunch", "ice-fang"],
  "cyrus:honchkrow": ["brave-bird", "sucker-punch", "superpower", "heat-wave"],
  "cyrus:houndoom": ["dark-pulse", "flamethrower", "sludge-bomb", "nasty-plot"],
  "cyrus:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "electric-terrain"],

  // --- N: Carracosta (Concha Filo) se auto-prepara para barrer; Zoroark
  // limpia con Maquinación; sin forma de dar velocidad al resto, así que
  // Archeops/Darmanitan siguen apoyándose en Cambio de Voltios propio para
  // salir del paso ante un mal matchup. ---
  "n:zoroark": ["dark-pulse", "flamethrower", "sludge-bomb", "nasty-plot"],
  "n:carracosta": ["shell-smash", "waterfall", "stone-edge", "earthquake"],
  "n:klinklang": ["gear-grind", "flash-cannon", "zen-headbutt", "thunder-wave"],
  "n:vanilluxe": ["blizzard", "flash-cannon", "signal-beam", "ice-beam"],
  "n:archeops": ["stone-edge", "earthquake", "u-turn", "acrobatics"],
  "n:darmanitan-standard": ["flare-blitz", "superpower", "rock-slide", "u-turn"],

  // --- Giovanni: Rhyperior (inmune por completo a Tormenta de Arena, y su
  // Roca recibe el x1.5 de Defensa Especial que da el clima) pone Tormenta
  // de Arena en vez de Puño Hielo, chip constante contra cualquiera que no
  // sea Roca/Tierra/Acero mientras Nidoking/Nidoqueen/Persian rematan. ---
  "giovanni:nidoking": ["earthquake", "poison-jab", "ice-beam", "thunderbolt"],
  "giovanni:nidoqueen": ["earthquake", "poison-jab", "ice-beam", "fire-blast"],
  "giovanni:rhyperior": ["earthquake", "stone-edge", "megahorn", "sandstorm"],
  "giovanni:persian": ["facade", "u-turn", "night-slash", "super-fang"],
  "giovanni:kangaskhan": ["double-edge", "earthquake", "crunch", "sucker-punch"],
  "giovanni:crobat": ["brave-bird", "cross-poison", "u-turn", "toxic"],

  // --- Colress: Beheeyem YA pone Campo Psíquico — potencia su propio
  // Psíquico x1.3 y bloquea la prioridad rival contra Klinklang/Magnezone/
  // Metang mientras ganan sus propios stages/setup. ---
  "colress:klinklang": ["gear-grind", "flash-cannon", "zen-headbutt", "thunder-wave"],
  "colress:escavalier": ["megahorn", "iron-head", "swords-dance", "drill-run"],
  "colress:beheeyem": ["psychic", "thunderbolt", "calm-mind", "psychic-terrain"],
  "colress:magnezone": ["thunderbolt", "flash-cannon", "volt-switch", "electric-terrain"],
  "colress:metang": ["psychic", "zen-headbutt", "iron-head", "earthquake"],
  "colress:porygon-z": ["tri-attack", "thunderbolt", "ice-beam", "nasty-plot"],
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
