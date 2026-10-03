# Marea Humana

Juego de navegador de gestión de multitudes, inspirado en el tráiler conceptual de @bonkbureau
("making trailers for games i wish existed").

Eres responsable de la seguridad de un concierto gratis en la plaza. Antes de abrir las puertas
trazas vallas y decides qué entradas abrir. Luego 3200 personas entran, se aprietan frente al
escenario y, al terminar el show, salen todas a la vez. Si alguien soporta demasiada presión
durante un rato, cae y el contador **PISOTEADOS** sube.

## Cómo jugar

Abre `index.html` en cualquier navegador moderno. No necesita servidor ni instalación.

- **Valla**: arrastra sobre la plaza para trazar una valla (60 m en total).
- **Puertas**: toca la reja de abajo para abrir o cerrar entradas (máximo 5).
- **Borrar**: toca una valla para quitarla.
- **Presión**: pinta a la multitud de azul a rojo según cuánto la aprietan.
- **1× / 2× / 4×**: velocidad de la simulación.

Las estelas naranjas del modo de planeación muestran por dónde caminará la gente. Durante el show
hay "drops" musicales: la multitud empuja hacia el escenario, la cámara se acerca y la gente se
pinta con colores de presión.
Terminar con cero pisoteados da tres estrellas.

## Cómo funciona

- Cada persona es un agente con radio de 24 cm que sigue un campo de flujo (Dijkstra sobre una
  rejilla de 50 cm) hacia el frente del escenario o hacia la salida.
- Los empujones entre personas y contra las vallas suman presión. Por encima del umbral se
  acumula daño y la persona cae.
- Todo es un solo archivo HTML con canvas 2D, sin dependencias.

## Escenarios

- [x] Plaza con escenario, pasarela y foso
- [ ] Estadio
- [ ] Toda la ciudad
