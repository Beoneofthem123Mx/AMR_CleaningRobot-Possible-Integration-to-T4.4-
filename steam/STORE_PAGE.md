# Escaparate de Steam: Human Tsunami

Todo lo que hay que subir y pegar en Steamworks para publicar la página de **Próximamente**
(Coming Soon) y empezar a juntar listas de deseados. Los pasos de Steamworks cambian con el tiempo;
confirma cada uno en <https://partner.steamgames.com/doc/store>.

> Lo único que no se puede hacer desde este repositorio es entrar a tu cuenta de Steamworks:
> crear la app, subir los archivos y pulsar "Publicar" lo haces tú. Aquí está todo el material listo.

## 1. Lista de pasos

1. Crea la app en Steamworks y paga la tarifa de Steam Direct (ver `STEAM.es.md`, sección 2).
2. En **Store Page Admin → Basic Info**: nombre `Human Tsunami`, desarrollador, editor, géneros y
   etiquetas (sección 5), idiomas (sección 6), fecha de lanzamiento "Coming soon" o una fecha
   aproximada.
3. En **Description**: pega la descripción corta y la larga (secciones 3 y 4).
4. En **Graphical Assets**: sube las cápsulas, el logo y el héroe de biblioteca (sección 2).
5. En **Trailers**: sube `steam/trailer/human_tsunami_trailer.mp4`.
6. En **Screenshots**: sube al menos 5 de `steam/screenshots/` (el orden recomendado está abajo).
7. Llena la **encuesta de contenido** (sección 7) y los **requisitos del sistema** (sección 8).
8. Pulsa **Mark as ready for review**. Valve revisa la página (suelen ser unos días hábiles).
9. Cuando la aprueben, pulsa **Publish** con visibilidad "Coming Soon". Desde ese momento la gente
   puede añadir el juego a su lista de deseados.
10. Steam exige que la página lleve un tiempo publicada como "Coming Soon" antes de poder vender
    (revisa el plazo vigente en la documentación). Usa ese tiempo para compartir el tráiler.

## 2. Qué archivo va en cada casilla

| Casilla en Steamworks | Tamaño | Archivo |
|---|---|---|
| Header Capsule | 920×430 | `steam/art/out/header_capsule.png` |
| Small Capsule | 462×174 | `steam/art/out/small_capsule.png` |
| Main Capsule | 1232×706 | `steam/art/out/main_capsule.png` |
| Vertical Capsule | 748×896 | `steam/art/out/vertical_capsule.png` |
| Page Background (opcional) | 1438×810 | `steam/art/out/page_background.png` |
| Library Capsule | 600×900 | `steam/art/out/library_capsule.png` |
| Library Hero | 3840×1240 | `steam/art/out/library_hero.png` |
| Library Logo (fondo transparente) | 1280×720 | `steam/art/out/library_logo.png` |
| Community / Client Icon | 512 y 256 px | `steam/art/out/icon_512.png`, `icon_256.png` |
| Tráiler | 1920×1080 | `steam/trailer/human_tsunami_trailer.mp4` |
| Capturas | 1920×1080 | `steam/screenshots/*.png` |

Steamworks rechaza una imagen si el tamaño no coincide exactamente con el que pide ese día. Si
cambió alguno, ajusta el tamaño en `steam/art/render.cjs` y vuelve a ejecutar
`node steam/art/render.cjs`.

**Orden recomendado de capturas** (las primeras cuatro son las que más se ven):

1. `18_street_city.png` (la ciudad de noche a ras de suelo, dentro de la multitud)
2. `02_circus.png` (multitud de colores y elefantes)
3. `20_cruise_street.png` (cubierta del crucero con el mar al fondo)
4. `19_plaza_street.png` (concierto en la plaza a ras de suelo)
5. `21_city_rooftops.png`, `03_arena.png`, `15_grand_opening.png`, `17_crowd_closeup.png` y las demás

## 3. Descripción corta (máximo 300 caracteres)

**English (principal):**

> Plan the fences, the gates and the guards. Then open the doors and watch thousands of people,
> a lion, a runaway cheese and a billionaire's rocket ruin everything. A crowd-safety simulator
> for events that go horribly wrong. 20 venues. Cheaper than a coffee.

**Español:**

> Coloca las vallas, las puertas y los guardias. Luego abre y mira cómo miles de personas, un
> león, un queso fugitivo y el cohete de un millonario lo arruinan todo. Un simulador de seguridad
> para eventos que salen terriblemente mal. 20 escenarios. Más barato que un café.

## 4. Descripción larga ("About This Game")

**English (principal):**

```
YOU ARE IN CHARGE OF SAFETY. WE ARE SO SORRY.

Human Tsunami is a top-down crowd management toy with real crowd physics and a body counter
that says TRAMPLED. You plan the venue. Then thousands of tiny people pour in, the music drops,
and everything that can cross a crowd does.

[h2]Plan it[/h2]
[list]
[*]Draw five kinds of fence: steel barriers, concrete, velvet rope, traffic cones and foam walls.
Each one behaves differently when a crowd, a car or an elephant leans on it.
[*]Open and close gates, place security guards, water stations, first aid tents and a big screen.
[*]Watch the flow preview and the pressure heatmap. Red is where the newspapers will be tomorrow.
[*]The plan warns you: glowing red spots where people will pile up and a label on every exit.
[/list]

[h2]Floppy little people[/h2]
Every attendee is a wobbly toy with dot eyes. They lean, bounce and squash, panic with an O mouth
when squeezed, and go down like rag dolls with X eyes and dizzy stars. Then a tiny ghost floats up.

[h2]Then watch it go wrong[/h2]
[list]
[*]20 venues: a plaza concert, a circus, a stadium, Black Friday at the mall, a cruise ship, the
wedding of the year, a racetrack, the grand opening of a golden toilet, a city festival, a
political rally for a duck, a giant taco, a UFO landing, an airport, lucha libre, a billionaire's
rocket launch, free zoo day, a downhill cheese chase, a zombie walk, a free ice cream beach and a
bootleg theme park.
[*]More than 100 events: lions, penguin parades, robot dogs, mariachis, a booster landing next to
the crowd, a gorilla that steals a phone, mothers-in-law.
[*]13 random twists drawn before every show: free wifi in one corner, a downpour, moon gravity,
Children's Day, the party uncle.
[*]A megaphone with exactly three uses.
[/list]

[h2]Read about it in the morning[/h2]
Every show ends with the front page of The Daily Gossip: a headline, a photo taken during the
show and a quote from someone who saw everything and learned nothing.

[h2]More ways to play[/h2]
[list]
[*]Stars unlock venues. Four optional medals per venue, including one for causing a catastrophe.
[*]Total Chaos mode: any event from any venue, anywhere, with two twists at once.
[*]Sandbox mode: no budget, bigger crowds and a button for every disaster.
[*]Free camera, slow-motion replays, ghosts with halos.
[/list]

Nobody real was trampled in the making of this game.
```

**Español:**

```
ESTÁS A CARGO DE LA SEGURIDAD. LO SENTIMOS MUCHO.

Human Tsunami es un juguete de gestión de multitudes visto desde arriba, con física de multitudes
real y un contador que dice PISOTEADOS. Tú planeas el recinto. Luego entran miles de personitas,
suena la música y todo lo que puede cruzar una multitud, la cruza.

[h2]Planéalo[/h2]
[list]
[*]Dibuja cinco tipos de valla: barreras de acero, concreto, cuerda de terciopelo, conos y muros
de espuma. Cada una se comporta distinto cuando se le recarga una multitud, un coche o un elefante.
[*]Abre y cierra puertas, coloca guardias, estaciones de agua, tiendas de primeros auxilios y una
pantalla gigante.
[*]Mira la vista previa del flujo y el mapa de presión. En rojo está la noticia de mañana.
[/list]

[h2]Y luego mira cómo sale mal[/h2]
[list]
[*]20 escenarios: un concierto en la plaza, un circo, un estadio, el Viernes Negro, un crucero, la
boda del año, un hipódromo, la inauguración de un baño de oro, un festival en la ciudad, el mitin
de un pato, un taco gigante, el aterrizaje de un ovni, un aeropuerto, lucha libre, el cohete de un
millonario, el día gratis del zoológico, una carrera de quesos cuesta abajo, una marcha zombi, una
playa con helado gratis y un parque de diversiones pirata.
[*]Más de 100 eventos: leones, desfiles de pingüinos, perros robot, mariachis, un propulsor que
aterriza junto al público, un gorila que roba un celular, suegras.
[*]13 sorpresas al azar antes de cada show: wifi gratis en una esquina, aguacero, gravedad lunar,
Día del Niño, el tío de la fiesta.
[*]Un megáfono con exactamente tres usos.
[/list]

[h2]Léelo en el periódico de mañana[/h2]
Cada show termina con la portada de The Daily Gossip: un titular, una foto tomada durante el show
y la declaración de alguien que lo vio todo y no aprendió nada.

[h2]Más formas de jugar[/h2]
[list]
[*]Las estrellas abren escenarios. Cuatro medallas opcionales por escenario, incluida una por
provocar una catástrofe.
[*]Modo Caos Total: cualquier evento de cualquier escenario, en cualquier lugar, con dos sorpresas.
[*]Modo Sandbox: sin presupuesto, multitudes más grandes y un botón para cada desastre.
[*]Cámara libre, repeticiones en cámara lenta, fantasmas con aureola.
[/list]

Ninguna persona real fue pisoteada durante la creación de este juego.
```

El juego está en inglés. Si subes la descripción en español, marca el español solo en "idioma de
la página de la tienda", no en "interfaz".

## 5. Géneros y etiquetas sugeridos

- **Géneros:** Simulation, Casual, Indie, Strategy.
- **Etiquetas (elige hasta 20, las primeras pesan más):** Simulation, Funny, Comedy, Physics,
  Sandbox, Management, Strategy, Casual, Top-Down, Dark Humor, Satire, Singleplayer, Indie,
  Building, Crowd Management, Colorful, 3D, Replay Value, Family Friendly (solo si la encuesta de
  contenido lo permite), Memes.

## 6. Idiomas

- Interfaz: English.
- Audio y subtítulos: no aplica (el juego no tiene voces).

## 7. Encuesta de contenido (respóndela tú, con honestidad)

Datos que te sirven para contestar:

- Hay muertes por aplastamiento de personas representadas como muñecos de colores, sin sangre ni
  heridas visibles. Los caídos quedan tirados en el suelo y sube un fantasmita con aureola.
- No hay contenido sexual, drogas, lenguaje fuerte ni apuestas con dinero real.
- Hay sátira de política ficticia (un candidato que es un pato), de un millonario ficticio y de
  marcas inventadas. No aparecen personas ni marcas reales.
- Las tragedias por aglomeraciones existen en la vida real. Es probable que parte del público lo
  considere de mal gusto; el tono del juego es de humor absurdo y conviene que la descripción lo
  deje claro, como ya lo hace.

## 8. Requisitos del sistema sugeridos

No se han medido en una tarjeta de video real; son una estimación que conviene comprobar en tu PC
antes de publicarlos.

| | Mínimo | Recomendado |
|---|---|---|
| SO | Windows 10 de 64 bits / Ubuntu 20.04 | Windows 10 u 11 de 64 bits |
| Procesador | Dos núcleos a 2.5 GHz | Cuatro núcleos a 3 GHz |
| Memoria | 4 GB | 8 GB |
| Gráficos | Integrados con WebGL 2 (Intel UHD 620 o similar) | Tarjeta dedicada (GTX 1050 o similar) |
| Almacenamiento | 400 MB | 400 MB |

Si el juego va lento, se pueden apagar los efectos con la tecla **G** o en Options.

## 9. Consejos para juntar listas de deseados

- Sube el tráiler también a TikTok, YouTube Shorts y Reels con el enlace a la página de Steam. El
  juego nació de un TikTok y ahí está su público.
- Los primeros 5 segundos del tráiler ya muestran el contador subiendo; no los cambies.
- Publica GIFs cortos de un solo desastre (el queso, el gorila, el propulsor) en Reddit
  (r/indiegames, r/IndieDev) y en X.
- Apúntate al próximo **Steam Next Fest** con una demo (por ejemplo, 3 escenarios): es la mayor
  fuente de listas de deseados para juegos pequeños.
- Antes de vender, lee la sección 8 de `STEAM.es.md` sobre el origen de la idea.
