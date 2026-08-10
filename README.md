# Liga de Campeones — Torneo Pokémon

App web de torneo de combates Pokémon con entrenadores del anime (Ash, Gary, Paul, Máximo y rivales bloqueados), datos en vivo de [PokeAPI](https://pokeapi.co/), tienda y logros (secciones "próximamente").

Hecho con **React + Vite + Tailwind CSS**.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Desplegar en Vercel

### Opción A — Desde GitHub (recomendada)

1. Sube esta carpeta a un repositorio nuevo en GitHub:
   ```bash
   git init
   git add .
   git commit -m "Liga de Campeones - torneo Pokémon"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/pokemon-liga.git
   git push -u origin main
   ```
2. Ve a [vercel.com](https://vercel.com) → **Add New... → Project**.
3. Importa el repositorio. Vercel detecta automáticamente que es un proyecto **Vite**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Pulsa **Deploy**. En ~1 minuto tendrás una URL pública (`https://tu-proyecto.vercel.app`).

### Opción B — Con Vercel CLI (sin GitHub)

```bash
npm install -g vercel
cd pokemon-liga
vercel        # sigue las preguntas (crea el proyecto)
vercel --prod # despliegue definitivo
```

## Notas

- La app llama directamente a `https://pokeapi.co` desde el navegador del usuario (no hace falta backend ni API key).
- Al pulsar "Iniciar torneo" se precargan los datos (stats, tipos) de los ~40 Pokémon usados por los 8 entrenadores; puede tardar unos segundos la primera vez.
- Las secciones marcadas como "Próximamente" (comprar personajes, crear tu propio equipo, gacha, logros) son placeholders intencionados, tal y como se pidió.
- No hay backend ni base de datos: las monedas de torneo y el progreso se reinician al recargar la página (no se usa `localStorage` en la versión artifact original; si quieres persistencia entre sesiones, es fácil añadir `localStorage` ahora que la app corre fuera de Claude).
