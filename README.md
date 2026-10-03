# Marea Humana

Juego de escritorio de gestión de multitudes para Steam (Windows y Linux), inspirado en el tráiler
conceptual de @bonkbureau ("making trailers for games i wish existed").

Eres responsable de la seguridad de un evento masivo. Antes de abrir las puertas trazas vallas y
decides qué entradas abrir. Luego miles de personas entran, se aprietan frente al escenario y, al
terminar, salen todas a la vez. Mientras tanto pasan animales, coches y objetos entre la gente. Si
alguien soporta demasiada presión durante un rato, cae y el contador **PISOTEADOS** sube.

## Cómo ejecutarlo

Necesitas [Node.js](https://nodejs.org/) 20 o más reciente.

```sh
npm install
npm start            # abre el juego en una ventana
npm run dist:win     # empaqueta dist/win-unpacked/Marea Humana.exe
npm run dist:linux   # empaqueta dist/linux-unpacked/marea-humana
```

Todo funciona sin internet: three.js y las fuentes van dentro de `game/`. Para publicarlo en
Steam, sigue [STEAM.md](STEAM.md).

## Cómo jugar

- **Valla**: arrastra sobre la plaza para trazar una valla (60 m en total).
- **Puertas**: toca la reja de abajo para abrir o cerrar entradas (máximo 5).
- **Borrar**: toca una valla para quitarla.
- **Escenario**: cambia entre la plaza y el circo.
- **Presión**: pinta a la multitud de azul a rojo según cuánto la aprietan.
- **1× / 2× / 4×**: velocidad de la simulación.
- **Cámara**: automática (se acerca e inclina en los momentos fuertes), cerca o lejos.
- **F11** o **Alt+Enter**: pantalla completa.

Las estelas naranjas del modo de planeación muestran por dónde caminará la gente. Durante el show
hay "drops" musicales: la multitud empuja hacia el escenario, la cámara se acerca y la gente se
pinta con colores de presión.
Terminar con cero pisoteados da tres estrellas.

## Cómo funciona

- Cada persona es un agente con radio de 24 cm que sigue un campo de flujo (Dijkstra sobre una
  rejilla de 50 cm) hacia el frente del escenario o hacia la salida.
- Los empujones entre personas y contra las vallas suman presión. Por encima del umbral se
  acumula daño y la persona cae.
- Se dibuja en 3D con [three.js](https://threejs.org/) (r149, licencia MIT en `game/vendor/three.LICENSE`):
  el suelo es una textura con los dibujos del escenario y encima van los escenarios, vallas, puertas,
  animales y coches como modelos 3D con sombras.
- El público usa cinco modelos de personaje (clásico, con gorra, con melena, con mochila y fiestero
  con barra luminosa) dibujados con mallas instanciadas. Cada persona camina moviendo brazos y
  piernas, salta y levanta los brazos en el show, agita los brazos cuando la aprietan y queda tendida
  en el suelo si la pisotean.
- Si el equipo va lento, el juego quita sombras de la gente y baja la resolución automáticamente.
- En monitores horizontales la vista se gira: el escenario queda a la izquierda.
- La app de escritorio es [Electron](https://www.electronjs.org/) (`desktop/`). La integración con
  Steam (logros y superposición) usa [steamworks.js](https://github.com/ceifa/steamworks.js); sin
  Steam abierto, el juego corre igual pero sin logros.

## Estructura

- `game/`: el juego (HTML, three.js, fuentes).
- `desktop/`: la app de Electron y el puente con Steam.
- `steam/`: scripts de SteamPipe para subir las builds.
- `STEAM.md`: guía para publicar en Steam.

## Escenarios

- **La Plaza**: concierto gratis con 3200 personas. Cruzan coches, un camión de helados, perros
  sueltos y pelotas gigantes de playa.
- **El Circo**: función de gala bajo la carpa con 2800 personas. Se escapa el león, desfilan
  elefantes, el coche de los payasos da vueltas, ruedan pelotas de circo, pasan payasos en
  monociclo y la bala humana aterriza entre el público.

Las vallas también sirven contra el caos: los animales y coches que chocan con una valla se dan
la vuelta.

Pendientes: estadio y toda la ciudad.
