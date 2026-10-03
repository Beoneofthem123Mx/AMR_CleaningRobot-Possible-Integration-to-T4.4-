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

- **Valla**: arrastra sobre el recinto para trazar una valla.
- **Puertas**: toca la reja de abajo para abrir o cerrar entradas.
- **Seguridad**: pon guardias. Calman a la gente a su alrededor y detienen animales y vehículos.
- **Borrar**: toca una valla o un guardia para quitarlo.
- **Escenario**: elige dónde jugar.
- **Presión**: pinta a la multitud de azul a rojo según cuánto la aprietan.
- **1× / 2× / 4×**: velocidad de la simulación.
- **Cámara**: automática (se acerca e inclina en los momentos fuertes), cerca o lejos.
- **Sonido** o tecla **M**: activa o silencia la música y los efectos.
- **F11** o **Alt+Enter**: pantalla completa.

Las estelas naranjas del modo de planeación muestran por dónde caminará la gente. Durante el show
hay momentos fuertes: la multitud empuja hacia el escenario, la cámara se acerca y la gente se
pinta con colores de presión. Terminar con cero pisoteados da tres estrellas, y las estrellas
abren escenarios nuevos.

## Cómo funciona

- Cada persona es un agente con radio de 24 cm que sigue un campo de flujo (Dijkstra sobre una
  rejilla de 50 cm) hacia el frente del escenario o hacia la salida.
- Los empujones entre personas y contra las vallas suman presión. Por encima del umbral se
  acumula daño y la persona cae.
- El sonido se genera en el momento con Web Audio: música distinta por escenario, murmullo de la
  multitud que sube con la presión y un efecto para cada evento.
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

- `game/`: el juego. `game/js/scenes/` tiene un archivo por escenario; `movers.js` los eventos;
  `render.js` el 3D; `audio.js` el sonido.
- `desktop/`: la app de Electron y el puente con Steam.
- `steam/`: scripts de SteamPipe para subir las builds.
- `STEAM.md`: guía para publicar en Steam.

## Escenarios

| Escenario | Se abre con | Qué pasa |
|-----------|-------------|----------|
| **La Plaza** | — | Concierto gratis. Cruzan coches, un camión de helados, perros sueltos y pelotas de playa. |
| **El Circo** | — | Bajo la carpa: se escapa el león, desfilan elefantes, el coche de los payasos, monociclos y la bala humana. |
| **El Estadio** | 2 ★ | De noche, concierto en la cancha: bengalas, la mascota, el balón gigante, la ola y el carrito médico. |
| **El Crucero** | 4 ★ | Fiesta en la cubierta con alberca: el oleaje inclina el barco, gaviotas, un flamenco inflable y la bocina del capitán. |
| **El Hipódromo** | 6 ★ | Gran Premio: carreras junto a la valla, caballos desbocados, el tractor de la pista y perros. |
| **La Ciudad** | 9 ★ | Festival nocturno entre edificios: fuegos artificiales, desfile con carroza, taxis y policía montada. |

Las vallas y los guardias también sirven contra el caos: los animales y vehículos que chocan con
ellos se dan la vuelta.


