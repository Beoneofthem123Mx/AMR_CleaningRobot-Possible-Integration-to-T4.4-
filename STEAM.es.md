# Cómo publicar Human Tsunami en Steam

*(Versión en español de `STEAM.md`. El juego ahora está completamente en inglés.)*

Esta guía va desde el código hasta la página de la tienda. Los pasos de Steamworks cambian con el
tiempo, así que confirma cada uno en la documentación oficial:
<https://partner.steamgames.com/doc/home>

## 1. Probar el juego en tu computadora

Necesitas [Node.js](https://nodejs.org/) 20 o más reciente.

```sh
npm install
npm start
```

Se abre la ventana del juego. Con Steam abierto y `steam_appid.txt` en `480` (Spacewar, la app de
prueba de Valve) también funcionan la superposición de Steam (Mayús+Tab) y la llamada de logros.

Atajos: **F11** o **Alt+Enter** cambian a pantalla completa.

## 2. Crear la app en Steamworks

1. Crea una cuenta en <https://partner.steamgames.com/> como desarrollador. Pide datos fiscales y
   bancarios.
2. Paga la tarifa de Steam Direct para tener un App ID. Valve publica el monto y las condiciones
   de reembolso en su documentación.
3. Anota el **App ID** y los **Depot ID** que te asigna Steamworks (uno para Windows y otro para
   Linux).

## 3. Poner tu App ID en el juego

- En `desktop/main.js`, cambia `STEAM_APP_ID = 480` por tu App ID.
- En `steam_appid.txt`, pon tu App ID (solo se usa al probar con `npm start`; no se incluye en el
  juego empaquetado).
- En `steam/app_build.vdf` y `steam/depot_*.vdf`, reemplaza `YOUR_APP_ID`, `YOUR_DEPOT_WINDOWS` y
  `YOUR_DEPOT_LINUX`.

## 4. Crear los logros en Steamworks

El juego ya los activa. Créalos en *Stats & Achievements* con estos nombres de API exactos:

| Nombre de API   | Nombre sugerido          | Cuándo se gana                                       |
|-----------------|--------------------------|------------------------------------------------------|
| `FIRST_SHOW`    | Primer evento            | Terminar cualquier evento                            |
| `PERFECT_PLAZA` | Plaza sin heridos        | Terminar la plaza con cero pisoteados y nadie atrapado |
| `PERFECT_CIRCO` | Circo sin heridos        | Terminar el circo con cero pisoteados y nadie atrapado |
| `LION_TAMER`    | Domador de leones        | Que el león choque con una valla y se dé la vuelta   |
| `TRAGEDY`       | Esto no salió bien       | 500 o más pisoteados en un solo evento               |
| `PERFECT_ESTADIO`   | Estadio sin heridos  | Terminar el estadio con cero pisoteados y nadie atrapado |
| `PERFECT_CRUCERO`   | Crucero sin heridos  | Terminar el crucero con cero pisoteados y nadie atrapado |
| `PERFECT_HIPODROMO` | Hipódromo sin heridos | Terminar el hipódromo con cero pisoteados y nadie atrapado |
| `PERFECT_CIUDAD`    | Ciudad sin heridos   | Terminar la ciudad con cero pisoteados y nadie atrapado |
| `GUARDIAN`      | Alto ahí                 | Que un guardia detenga a un animal o un vehículo     |
| `ALL_SCENES`    | Gira completa            | Ganar al menos una estrella en todos los escenarios  |
| `ALL_STARS`     | Seguridad perfecta       | Tres estrellas en todos los escenarios               |
| `PERFECT_VIERNES`    | Rebajas sin heridos       | Viernes Negro con cero pisoteados y nadie atrapado |
| `PERFECT_BODA`       | Boda en paz               | La Boda del Año con cero pisoteados y nadie atrapado |
| `PERFECT_TRONO`      | Baño impecable            | El Trono de Oro con cero pisoteados y nadie atrapado |
| `PERFECT_MITIN`      | Campaña limpia            | El Mitin del Pato con cero pisoteados y nadie atrapado |
| `PERFECT_TACO`       | Récord sin heridos        | El Taco Gigante con cero pisoteados y nadie atrapado |
| `PERFECT_OVNI`       | Contacto pacífico         | Encuentro Cercano con cero pisoteados y nadie atrapado |
| `PERFECT_AEROPUERTO` | Aterrizaje suave          | Llega la Estrella con cero pisoteados y nadie atrapado |
| `PERFECT_ARENA`      | Dos de tres caídas        | La Arena con cero pisoteados y nadie atrapado          |
| `PERFECT_ROCKET`     | Todo en orden             | Launch Day con cero pisoteados y nadie atrapado         |
| `PERFECT_ZOO`        | Nadie fue devorado        | Free Zoo Day con cero pisoteados y nadie atrapado       |
| `PERFECT_CHEESE`     | Queso sin heridos         | The Cheese Chase con cero pisoteados y nadie atrapado   |
| `PERFECT_ZOMBIE`     | Ningún cerebro perdido    | Zombie Walk con cero pisoteados y nadie atrapado        |
| `SPACE_TOURISM`      | Turismo espacial          | 100 abducidos en un solo show |
| `LOUD_AND_SAFE`      | A gritos pero a salvo     | Tres estrellas usando los tres megáfonos |
| `MOD_COLLECTOR`      | Ya lo vi todo             | Terminar shows con seis condiciones del día distintas |

Necesitas un icono de 64×64 por logro (versión ganado y no ganado).

## 5. Empaquetar

```sh
npm run dist:win     # dist/win-unpacked/Human Tsunami.exe
npm run dist:linux   # dist/linux-unpacked/human-tsunami
npm run dist:mac     # solo en una Mac
```

El empaquetado copia `steam_api64.dll` (Windows) y `libsteam_api.so` (Linux) junto al ejecutable.
El ejecutable de Windows no lleva icono propio cuando se empaqueta desde Linux; para eso,
empaqueta en Windows y agrega un icono en `package.json` (`build.win.icon`).

## 6. Subir con SteamPipe

1. Descarga el Steamworks SDK desde Steamworks y usa `tools/ContentBuilder/builder/steamcmd`.
2. Desde la carpeta `steam/` de este repositorio:

   ```sh
   steamcmd +login TU_USUARIO +run_app_build "$(pwd)/app_build.vdf" +quit
   ```

3. En Steamworks, en *Installation > General*, crea las opciones de inicio:
   - Windows: `Human Tsunami.exe`
   - Linux: `human-tsunami`, con argumentos `--no-sandbox` (Electron no puede usar su sandbox dentro
     del runtime de Steam en Linux).
4. Publica la build en la rama `default` y pruébala desde tu biblioteca de Steam.

## 7. Página de la tienda y precio

- Steam pide cápsulas en varios tamaños, al menos 5 capturas de pantalla y, de preferencia, un
  tráiler. Ya hay material listo para subir:
  - `steam/screenshots/`: capturas a 1920×1080 de distintos escenarios.
  - `steam/art/out/`: cápsula de encabezado (920×430), pequeña (462×174), principal (1232×706),
    vertical (748×896), de biblioteca (600×900), héroe de biblioteca (3840×1240), logo de
    biblioteca con fondo transparente (1280×720), fondo de página e íconos de 512 y 256 px.
  - Para regenerarlas: `node steam/art/render.cjs` (usa Playwright con Chromium). El diseño está
    en `steam/art/capsule.html` y los fondos en `steam/art/bg/`.
  - El héroe de biblioteca se amplía desde una captura de 1824 px de ancho, así que se ve algo
    suave. Si quieres más nitidez, toma una captura a 4K y reemplaza `steam/art/bg/circo.jpg`.
  - Revisa en Steamworks los tamaños vigentes antes de subir: Valve los cambia de vez en cuando.
  - `steam/trailer/human_tsunami_trailer.mp4`: tráiler grabado del juego real, con música y efectos
    del propio juego. Para regenerarlo: `xvfb-run -a -s "-screen 0 1920x1080x24" node steam/trailer/trailer.cjs`.
- Llena el cuestionario de contenido. El juego muestra muertes por aplastamiento sin sangre ni
  violencia explícita; respóndelo con honestidad.
- El precio se elige en *Pricing* entre los niveles que ofrece Steam. La idea es un precio de compra
  impulsiva de 1 a 2 € (por ejemplo, el nivel de 1,99 € / 1,99 $). Ten en cuenta:
  - Revisa en *Pricing* el precio mínimo vigente de cada región antes de anunciarlo; Steam sugiere
    precios regionales automáticamente y puedes ajustarlos.
  - Valve se queda con una parte (30 % por defecto) y en la UE y muchas regiones el precio incluye
    IVA, así que a 1,99 € recibes bastante menos de 1,40 € por copia. Cuenta con vender volumen.
  - Los juegos muy baratos se venden por el tráiler y la primera captura: pon el tráiler primero y
    las capturas con más gente (circo, fuegos en la ciudad, la arena) arriba.
  - Un descuento de lanzamiento (por ejemplo −20 % la primera semana) y entrar a las rebajas de
    temporada de Steam ayudan mucho a este precio; también los paquetes con tus próximos juegos.
- Valve revisa la página y la build antes del lanzamiento, y exige que la página esté visible como
  "Próximamente" un tiempo antes de vender. Considera ese plazo al planear la fecha.

## 8. Antes de vender: el origen de la idea

El concepto viene de un video de @bonkbureau en TikTok ("making trailers for games i wish
existed"). Las ideas de juego no tienen derechos de autor, y el código, los modelos y el arte de
este repositorio son propios. Aun así, no uses su nombre, su video ni capturas suyas en la tienda,
y considera escribirle antes de lanzar.

## Licencias incluidas

- three.js (MIT): `game/vendor/three.LICENSE`
- Fuente Rubik (SIL Open Font License): `game/fonts/OFL.txt`
- Electron (MIT) y steamworks.js (MIT) se instalan con `npm install`. El Steamworks SDK de Valve
  se rige por su propio acuerdo de Steamworks.
