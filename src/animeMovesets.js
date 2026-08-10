/* ---------------------------------------------------------------
   MOVESETS BASADOS EN EL ANIME
   Clave: `${trainerId}:${slug}` -> 4 movimientos (nombre exacto de PokeAPI).
   Las entradas marcadas con "// TODO: revisar" son la mejor estimación
   razonable (coherente con tipo/rol del Pokémon) cuando no hay certeza
   absoluta sobre el set exacto usado en el anime; se pueden corregir a
   mano sin tocar el resto.
--------------------------------------------------------------- */

export const ANIME_MOVESETS = {
  // --- Ash ---
  "ash:pikachu": ["thunderbolt", "iron-tail", "quick-attack", "electro-ball"],
  "ash:dragonite": ["draco-meteor", "hyper-beam", "dragon-rush", "hurricane"], // TODO: revisar
  "ash:sirfetchd": ["meteor-assault", "brutal-swing", "leaf-blade", "first-impression"], // TODO: revisar
  "ash:gengar": ["shadow-ball", "hypnosis", "dream-eater", "night-shade"], // TODO: revisar
  "ash:lucario": ["aura-sphere", "close-combat", "extreme-speed", "metal-sound"],
  "ash:goodra": ["dragon-pulse", "muddy-water", "aqua-tail", "bide"], // TODO: revisar

  // --- Cintia (Cynthia) ---
  "cintia:garchomp": ["draco-meteor", "dragon-rush", "flamethrower", "giga-impact"], // TODO: revisar
  "cintia:spiritomb": ["dark-pulse", "shadow-ball", "psychic", "ominous-wind"], // TODO: revisar
  "cintia:lucario": ["aura-sphere", "dragon-pulse", "dark-pulse", "extreme-speed"], // TODO: revisar
  "cintia:milotic": ["ice-beam", "surf", "recover", "twister"], // TODO: revisar
  "cintia:roserade": ["energy-ball", "sludge-bomb", "petal-blizzard", "sunny-day"], // TODO: revisar
  "cintia:togekiss": ["air-slash", "extreme-speed", "dazzling-gleam", "aura-sphere"], // TODO: revisar

  // --- Máximo (Steven) ---
  "maximo:metagross": ["meteor-mash", "hyper-beam", "psychic", "iron-head"], // TODO: revisar
  "maximo:skarmory": ["steel-wing", "sky-attack", "drill-peck", "aerial-ace"], // TODO: revisar
  "maximo:aggron": ["iron-tail", "take-down", "dragon-claw", "stone-edge"], // TODO: revisar
  "maximo:cradily": ["ancient-power", "giga-drain", "brine", "stockpile"], // TODO: revisar
  "maximo:armaldo": ["x-scissor", "rock-blast", "iron-defense", "rock-slide"], // TODO: revisar
  "maximo:claydol": ["psychic", "earth-power", "ancient-power", "cosmic-power"], // TODO: revisar

  // --- Dianta (Diantha) ---
  "dianta:gardevoir": ["moonblast", "psychic", "shadow-ball", "dazzling-gleam"],
  "dianta:hawlucha": ["flying-press", "high-jump-kick", "x-scissor", "swords-dance"], // TODO: revisar
  "dianta:tyrantrum": ["head-smash", "dragon-claw", "earthquake", "rock-slide"], // TODO: revisar
  "dianta:goodra": ["dragon-pulse", "sludge-bomb", "muddy-water", "dragon-tail"], // TODO: revisar
  "dianta:aurorus": ["freeze-dry", "ancient-power", "ice-beam", "thunder"], // TODO: revisar
  "dianta:gourgeist-average": ["shadow-ball", "seed-bomb", "foul-play", "leech-seed"], // TODO: revisar

  // --- Lionel (Leon) ---
  "lionel:charizard": ["flare-blitz", "dragon-claw", "air-slash", "fire-blast"], // TODO: revisar
  "lionel:dragapult": ["dragon-darts", "phantom-force", "dragon-claw", "u-turn"], // TODO: revisar
  "lionel:aegislash-shield": ["kings-shield", "shadow-ball", "iron-head", "sacred-sword"], // TODO: revisar
  "lionel:rillaboom": ["drum-beating", "wood-hammer", "superpower", "u-turn"], // TODO: revisar
  "lionel:cinderace": ["pyro-ball", "court-change", "sucker-punch", "double-kick"], // TODO: revisar
  "lionel:mr-rime": ["icy-wind", "psychic", "teeter-dance", "nasty-plot"], // TODO: revisar

  // --- Paul ---
  "paul:electivire": ["thunder-punch", "fire-punch", "ice-punch", "giga-impact"],
  "paul:torterra": ["leaf-storm", "earthquake", "crunch", "frenzy-plant"], // TODO: revisar
  "paul:ninjask": ["x-scissor", "aerial-ace", "screech", "swords-dance"], // TODO: revisar
  "paul:ursaring": ["hammer-arm", "focus-punch", "slash", "crush-claw"], // TODO: revisar
  "paul:ariados": ["cross-poison", "sucker-punch", "string-shot", "poison-jab"], // TODO: revisar
  "paul:ambipom": ["double-hit", "focus-punch", "swift", "aerial-ace"], // TODO: revisar

  // --- Gary ---
  "gary:blastoise": ["hydro-pump", "skull-bash", "rapid-spin", "ice-beam"], // TODO: revisar
  "gary:umbreon": ["feint-attack", "shadow-ball", "screech", "toxic"], // TODO: revisar
  "gary:arcanine": ["flamethrower", "extreme-speed", "take-down", "fire-blast"], // TODO: revisar
  "gary:nidoking": ["horn-drill", "earthquake", "thrash", "poison-jab"], // TODO: revisar
  "gary:scizor": ["x-scissor", "steel-wing", "iron-head", "pursuit"], // TODO: revisar
  "gary:electivire": ["thunder", "low-kick", "fire-punch", "protect"], // TODO: revisar

  // --- Iris ---
  "iris:dragonite": ["hyper-beam", "dragon-rush", "outrage", "hurricane"], // TODO: revisar
  "iris:excadrill": ["drill-run", "iron-head", "earthquake", "swords-dance"], // TODO: revisar
  "iris:emolga": ["discharge", "volt-switch", "attract", "double-team"], // TODO: revisar
  "iris:dragonair": ["dragon-rush", "aqua-tail", "ice-beam", "wrap"], // TODO: revisar
  "iris:gigalith": ["stone-edge", "earthquake", "superpower", "sandstorm"], // TODO: revisar
  "iris:druddigon": ["dragon-claw", "night-slash", "dragon-tail", "rock-slide"], // TODO: revisar
};

// Fallback genérico por tipo elemental, usado solo si en el futuro se añade
// un Pokémon sin entrada en ANIME_MOVESETS.
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
