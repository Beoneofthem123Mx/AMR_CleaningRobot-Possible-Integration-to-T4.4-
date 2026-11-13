# Human Tsunami

A crowd-management desktop game for Steam (Windows and Linux), inspired by the concept trailer by
@bonkbureau ("making trailers for games i wish existed").

You are in charge of safety at a massive event. Before the gates open you draw fences and decide
which entrances to open. Then thousands of people pour in, cram together in front of the stage and,
when it's over, all leave at once. Meanwhile animals, cars and assorted objects wander through the
crowd. If someone takes too much pressure for too long, they go down and the **PANCAKED** counter (a flattened toy person with X eyes)
goes up.

## How to run it

You need [Node.js](https://nodejs.org/) 20 or newer.

```sh
npm install
npm start            # opens the game in a window
npm run dist:win     # packages dist/win-unpacked/Human Tsunami.exe
npm run dist:linux   # packages dist/linux-unpacked/human-tsunami
```

Everything works offline: three.js and the fonts ship inside `game/`. To publish on Steam, follow
[STEAM.md](STEAM.md).

## How to play

- **Fence**: drag across the venue to draw a fence. You have a dollar budget per venue and five
  materials to spend it on (pick them in the row above the toolbar, or press **1** again to cycle):

  | Fence | Cost | What it does |
  |-------|------|--------------|
  | **Barrier** | $10/m | Stops people and small animals. Cars, trucks and elephants knock it flat. |
  | **Concrete** | $20/m | Stops absolutely everything, but it's hard: people squeezed against it get hurt faster. |
  | **Velvet rope** | $4/m | Cheap. Snaps if the crowd leans on it. Animals and vehicles go right through. |
  | **Cones** | $2.5/m | People walk around them, until they're squeezed, then they step over. Nothing else cares. |
  | **Foam wall** | $16/m | Soft padding that soaks up pressure: nobody gets crushed against it. Vehicles bounce off. |

  Fences that break during a show come back when you return to planning.

  Fences don't have to be straight. Pick a **shape** next to the materials (or press **F**):
  **Straight**, **Freehand** (drag any curve), **Ring** (drag from the center; the opening faces
  where you let go), **Funnel**, **Zigzag queue** (switchbacks that slow people down) and **Pen**
  (a box with a door). Prefabs are erased as one piece.

  Short barriers a few meters in front of a gate work as wave breakers: the crowd flows around
  them instead of pushing straight into the bottleneck.
- **Props** (key **5**, press again to cycle): spend the same budget on
  - **Water station** ($60): people within 3 m calm down.
  - **First aid tent** ($120): within 6 m, squeezes hurt half as much and people heal faster.
    Put them where the pressure view turns red.
  - **Big screen** ($150, one per venue): about a quarter of the crowd watches it instead of
    crushing toward the stage.
- **Gates**: tap the barrier at the bottom to open or close entrances.
- **Security** (key **3**, press again to switch): **Guards** calm the people around them and stop
  animals and vehicles. **Stewards** ($40 each, from the fence budget, up to 10) hold a SLOW sign:
  everyone within 3 m walks at half speed. Put them just before a bottleneck to meter the crowd.
- **Erase**: tap a fence or a guard to remove it.
- **Venue**: choose where to play (there are 20).
- **Pressure**: paints the crowd from blue to red depending on how hard they're being squeezed.
- **1× / 2× / 4×**: simulation speed.
- **Camera**: automatic (zooms in and tilts during the big moments), near or far.
  Or take over: the **mouse wheel** zooms toward the cursor, **right-drag** or **WASD / arrow keys**
  pan, **Q / E** zoom. Press **C** to hand the camera back.
  **X** switches to the **street camera**: a slow orbit at eye level inside the crowd (wheel or
  W/S to move closer, A/D to turn).
- **Sound** or the **M** key: turns music and effects on or off.
- **F11** or **Alt+Enter**: fullscreen.

The orange trails in planning mode show where people will walk. During the show there are big
moments: the crowd surges toward the stage, the camera moves in and people light up in pressure
colors. Finishing with zero trampled earns three stars, and stars unlock new venues.

## How it works

- Each person is an agent with a 24 cm radius following a flow field (Dijkstra over a 50 cm grid)
  toward the front of the stage or toward the exit.
- Shoving between people and against fences adds up to pressure. Above the threshold, damage
  builds up and the person falls.
- Sound is generated on the fly with Web Audio: different music per venue, a crowd murmur that
  rises with the pressure and an effect for every event.
- It's drawn in 3D with [three.js](https://threejs.org/) (r149, MIT license in `game/vendor/three.LICENSE`):
  the ground is a texture with the venue's markings, and on top sit the stages, fences, gates,
  animals and cars as 3D models with shadows.
- The audience are wobbly toy people (pear-shaped bodies, big heads, dot eyes, noodle arms, chunky
  shoes) drawn with instanced meshes, with builds, gaits, hair, hats, signs, balloons and flags.
  They lean into the walk, squash and stretch as they bounce, get thinner and taller when squeezed,
  and show it on their faces: wide eyes and an O mouth under pressure, a grin when the drop hits,
  X eyes when trampled. Falls are rag-doll tumbles with a bounce, dizzy stars and a comic impact mark.
- Lighting and effects: HDR bloom, tilt-shift focus, contact shading, a split-tone grade, a golden
  hour during day shows, an overcast look with a wet floor in the rain, a sky dome with clouds or
  stars for the street camera, living water on pools and seas, lasers at night venues and phone
  flashlights during blackouts.
- Two-body comedy physics (`game/js/twobody.js`): on top of each agent (the pelvis, which keeps the
  navigation and ground friction of the crowd sim) sits a heavier torso joined by an elastic
  point-to-point constraint, with a soft, under-damped upright torque, so people sway, overshoot and
  whip around when they start, stop or get shoved. A hard bump (by relative speed) starts a 1.5 s
  stumble: the joint goes soft, the torso gets a random sideways shove and part of the impact passes
  to the people in front (domino). Level of detail by distance to the camera: near agents get full
  two-body physics, mid ones a kinematic torso, far ones none; one central loop updates them in
  batches with an agent and time budget per step, so big crowds never freeze the browser.
- Shows last 45 seconds once the crowd is in.
- Each venue dresses its crowd: pirates, sailors and swimmers on the cruise, luchadores at the arena,
  astronauts at the launch, hazmat suits at the nuclear plant, zombies and ghosts at the zombie walk, and
  so on, plus random weirdos anywhere (a hot dog, a banana, a knight, a wizard). About 1 in 8 people
  are "springy": when something hits them they fly ten metres up, spinning and screaming, and crash
  down on their neighbours. Nine fall styles: backflop, faceplant, spinning top, launched, pancake,
  pinball, helicopter, dead bug and cartwheel.
- The audience shouts: each venue has its own lines ("REFEREE, GLASSES!", "IS IT SUPPOSED TO GLOW?"),
  and squeezed people complain instead.
- If the hardware is struggling, the game automatically drops crowd shadows and lowers the
  resolution.
- On landscape monitors the view is rotated so the stage sits on the left.
- The desktop app is [Electron](https://www.electronjs.org/) (`desktop/`). The Steam integration
  (achievements and overlay) uses [steamworks.js](https://github.com/ceifa/steamworks.js); without
  Steam running, the game works the same, just without achievements.

## Structure

- `game/`: the game. `game/js/scenes/` has one file per venue; `movers.js` the events;
  `render.js` the 3D; `audio.js` the sound.
- `desktop/`: the Electron app and the Steam bridge.
- `steam/`: SteamPipe scripts, screenshots (`steam/screenshots/`) and store art (`steam/art/`).
- `build/icon.png`: icon electron-builder uses for the executable.
- `STEAM.md`: guide to publishing on Steam.

## Venues

| Venue | Unlocks at | What happens |
|-------|------------|--------------|
| **The Plaza** | — | Free concert. Cars drive through, plus an ice-cream truck, loose dogs and beach balls, food carts, a pickpocket chased by the police, and fans popping into the cafés around the square to come back with shopping bags. |
| **The Circus** | — | Under the big top: the lion escapes, elephants parade, the clown car and unicycles; a unicorn leaving rainbows, a sneezing dragon, a griffin that snatches fans, bellhop monkeys, clowns balancing on giant balls, jugglers who miss the trick and fall from the trapeze, and the human cannonball firing volleys into the audience. |
| **The Stadium** | 2 ★ | Cup final, Deportivo Chancla vs Real Burrito: a real match (keepers, passes, shots, saves, scoreboard) behind the barrier of the fan zone. Every goal makes the whole stadium jump and shove; the two fan gangs come down from the stands to brawl; flares, the mascot and the wave. |
| **Black Friday** | 3 ★ | Mall sale: flash deals that send the crowd stampeding, runaway shopping carts, a grandma with elbows and a wet floor. Shoppers duck into the stores and come out buried in bags with a tower of boxes on their heads (slower and wobblier every trip). |
| **The Cruise** | 4 ★ | Deck party: the swell tilts the ship, seagulls, an inflatable flamingo and the captain's horn. Pirates: a pirate ship pulls alongside, fires cannonballs into the crowd and sends a boarding party. |
| **Wedding of the Year** | 5 ★ | Influencer wedding: the bouquet toss sparks stampedes, the cake rolls away, the drone crashes, mariachis and the mother-in-law. |
| **The Racetrack** | 6 ★ | Grand Prix: races right along the fence, runaway horses, the track tractor and dogs. |
| **The Golden Throne** | 7 ★ | The world's most luxurious restroom opens: it clogs, golden rolls go rolling, the mayor takes selfies and it smells like vanilla. |
| **The City** | 9 ★ | Night festival between buildings: fireworks, a parade float, taxis and mounted police. |
| **The Duck Rally** | 10 ★ | A duck's closing campaign rally: absurd promises, free sandwiches, trucks full of supporters, costumed mascots and egg-throwing. |
| **The Giant Taco** | 12 ★ | World-record taco: salsa makes the floor slippery, a taquero hands out free tacos and chiles explode. |
| **Close Encounter** | 14 ★ | A UFO in the cornfield: a beam that abducts people, cows (one of them floating), men in black and an alien who wants selfies. |
| **The Star Arrives** | 16 ★ | Arrivals hall: the pop idol walks out and the fans give chase; loose suitcases, luggage carts and the security dog. |
| **The Arena** | 18 ★ | Lucha libre grand finale: suicide dives into the crowd, chair shots, flying masks, the villain coming down to brawl and doña Chona, 84, who wants to climb into the ring. |
| **Launch Day** | 20 ★ | A billionaire's rocket launch "for the vibes": countdowns that never finish, a booster landing next to the crowd, robot dogs, a hoodie cannon, a driverless taxi and free NFTs in cardboard boxes. |
| **Free Zoo Day** | 22 ★ | The baby panda's debut: penguin parades, a giraffe strolling through the crowd, a gorilla that steals a phone, Kevin the runaway alpaca, a banana truck and a hippo that yawns at the wrong moment. |
| **The Cheese Chase** | 24 ★ | Downhill cheese rolling: wheels bouncing through the crowd, tumbling contestants, a runaway goat, a tractor with a car-sized cheese and a blue cheese so smelly everyone flees. |
| **Zombie Walk** | 26 ★ | Night-time zombie parade by a haunted mansion: shambling hordes, a hearse, a giant inflatable pumpkin, fog machines, bats, a werewolf and a vampire who turns out to be the mayor. |
| **Free Ice Cream Beach** | 28 ★ | A brand gives away ice cream on the beach: a shark fin (it's just Gary), a sunscreen spill, seagulls stealing cones, an inflatable whale, a slow-motion lifeguard and a jet ski that drives onto the sand. |
| **Grand Opening** | 30 ★ | Opening day at a bootleg theme park: a knock-off mascot giving hugs, a dinosaur parade, a coaster car that leaves the track, a runaway teacup, free churros and fireworks that go sideways. |
| **Meltdown Open Day** | 32 ★ | A nuclear plant opens its doors. The glowing uranium core sits in the middle of the way and every person standing near it heats it up (CORE TEMP meter). At 100% it goes off: everyone nearby flies, the closest go down and the rest glow green. Rolling barrels, Glowie the mascot, a hazmat inspector, a surprise drill and a burst steam pipe. |
| **Battle Reenactment Day** | 36 ★ | An old training field with trenches, sandbags, a bunker, barbed wire and a vintage tank. Three marked minefields and a few stray mines (faintly visible while you plan) go off when stepped on. A tank, a biplane promising free soup by the bunker, a cannon salute, a mine-sniffing dog and marching reenactors. |
| **Factory Open Day** | 38 ★ | A rubber-duck factory: two conveyor belts drag anyone who steps on them sideways, three hot ovens push people away, robot arms swing and presses thump (the camera feels it). A runaway robot arm, a box avalanche, an oven blast, shift change and the red button. |
| **The Procession** | 40 ★ | The float with the Saviour statue is carried slowly around the square on a sawdust carpet and two thirds of the crowd follow it everywhere; when they block it, it stops and the bearers shove. Brass band, incense, petals from the balconies, candle wax and rain. |
| **The Protest March** | 42 ★ | Thousands march down an avenue of balconies to City Hall for longer naps and three-day weekends; signs everywhere, chants that ripple through the crowd, sit-ins that suddenly block the street, a giant banner and a drum line. Very polite riot police, water balloons, a news drone and a counter-protest in favour of Mondays. |
| **Rush Hour Metro** | 44 ★ | A platform with two tracks: a train comes in, the crowd squeezes into its doors until it is full (boarding counts as getting home), it leaves and the next one arrives on the OTHER track, so everybody runs across. Buskers, rats, delays and giant backpacks. |
| **The Market** | 46 ★ | Twelve stalls in three rows; people hop from stall to stall and come out with bags while the vendors yell "DEAL!" and "SPECIAL PRICE!". Flash deals, a fruit avalanche, loose chickens and a hand truck down the aisle. |
| **Secret Lab Open House** | 48 ★ | A laser grid that switches on and off, a zero-g room, containment breaches, portals, aliens floating in tubes, a teleporter that beams whoever stands on it somewhere random, scientists throwing chemicals (shrink, grow, glow, fly), an escaped alien, a slime blob, a laser sweep, a cloning accident, a lockdown that drops blast doors across the hall with one gap in the middle, and a three-metre chicken. |
| **The Bus Terminal** | 50 ★ | Five bays; buses (AIRPORT, BEACH, GRANDMA'S HOUSE...) pull into random bays, take whoever reaches their door and leave, so the crowd keeps running to whichever doors are open. Departures board, a drivers' strike, double-deckers, runaway luggage carts, a lost dog and last-second platform changes (a boarding bus moves bays and the crowd sprints after it). Glass canopy, bay screens in the route colour, a station clock. |

Fences and guards also work against the chaos: animals and vehicles that bump into them turn
around.

## Surprises every match

- **Today's twist**: when the gates open, a roulette picks a surprise: free wifi in one corner, an
  influencer going live, a downpour, reggaeton night, moon gravity, rush hour, a slow-motion
  audience, a rain of flip-flops, hungry pigeons, blackouts, Children's Day, mandatory uniform
  (everyone in the same T-shirt) or that one uncle at the party.
- **Megaphone**: during the show, each click calms the people in that area (three uses per show).
- **Total Chaos mode** (in the menu): any event from any venue can happen anywhere, and two of
  today's twists are combined.
- **The newspaper**: at the end, the front page of *The Daily Gossip* recounts what happened with
  satirical headlines and a photo taken during the show.
- The first person to go down triggers a slow-motion replay.
- **Street life**: balloon sellers, hot-dog carts, a photographer, a mime and a live-streamer wander
  through every venue. The crowd brings balloons, party hats, sun hats, kids on their shoulders and,
  when it rains, a sea of umbrellas. When the music drops, a few lucky people go crowd surfing.
- **Director's camera**: in automatic mode, the camera peeks at each event for a few seconds (the
  elephant, the UFO, the taxi that didn't know the street was closed).

## Strategy layer

- **Crowd control**: an empty or half-hearted plan never earns stars. The free guards count for
  little; barriers, gadgets and wide gates are what make a crowd "managed". The Crowd Control meter
  (bottom left while planning) goes from UNMANAGED to SOLID; below SOLID the crowd shoves harder.
- **Live decisions** (bar during the show): open an emergency gate, drop a barrier between two
  clicks, send a steward or guard running to a new spot, throw free pizza to pull the crowd away from
  a hotspot, use the megaphone. Then the chaos powers, separated, for fun.
- **What went wrong?** (button in the report): a pressure heat map of the whole show, purple dots
  where people were stuck, X marks where they fell, and the three worst hotspots, each with a cause
  (jammed gate, crush at the front, a squeeze made by your own barrier, a corner trap, an open-floor
  surge) and a tip, a timeline of when people went down (show or evacuation) and an exit-flow
  chart that flags an overloaded or unused gate, and a replay slider that plays the crowd back on the
  floor every two seconds (blue: people, orange to red: pressure). It stays faintly on the floor while you re-plan.
- **Daily challenge** (title screen): a venue and a twist picked by the date, your best result of the
  day, +100 tickets the first time you get three stars.
- **World Tour** (title screen): five random unlocked venues in a row, each with a random twist,
  one pancake allowance for the whole tour and no retries. After every show you pick one of three
  perks (sponsor money, extra guards, spare batteries, an emergency kit, lavender mist, bolt
  cutters, insurance, spare fence panels). Zero stars or going over the allowance ends the tour.
- **Steam Workshop**: in the Steam build, publish a custom venue to the Workshop with one click and
  play the venues you subscribed to (setup in STEAM.md).
- **Level editor** (title screen → Editor): drag stages, walls, buildings, kiosks, tents and
  pools, click poles, toggle gates, set the crowd, budget, day or night and the events, test it, save
  it, and share it as a code (`HT1:...`, plain JSON inside, the same payload a Workshop item would
  carry). Custom venues don't award stars or tickets.
- **Secret achievements**: ten of them, with a popup and a Secrets screen that only shows hints.
- **Shop**: upgrades, crowd gear, gadgets you unlock with tickets and place as props, today's deals,
  and the "definitely not a black market" that takes abducted people as payment.

## Upgrade shop, moving entrances and direction

- **No plan, no stars**: a show started without a single fence, guard or prop always scores zero stars,
  and an unmanaged crowd (little or nothing placed) shoves harder and goes down sooner. With an empty
  plan every venue loses between a quarter and over half of its crowd.

- Every show pays **tickets**: 10 for showing up, more for everyone who got home, 20 per star and 30 per
  new medal (sandbox pays nothing). Spend them in the **Upgrade shop** in the main menu: bigger budget,
  megaphone batteries and reach, steward training, extra security, charming guards, softer foam and
  better first aid and a chaos kit, three levels each.
- **Crowd gear** (shop tab): hard hats, bubble wrap suits, roller skates, propeller hats, 3D glasses, hero
  capes, cargo shorts and rubber duck rings. Wear up to three; about one in five people shows up in
  each, and every piece has a bonus and a drawback (bubble wrap takes less damage but anything that
  hits it goes into orbit; skates leave fast but wipe out; propellers lift people out of the crush but
  sometimes for no reason).
- **Today's deals** (shop tab): three random offers a day: a mystery box (a random piece of gear or a pile
  of tickets), gear at 40% off, extra meteors or cows for the next show, spare batteries, a lucky hat.
- **Chaos powers** during the show: next to the megaphone, a bar with a meteor, a giant bowling ball,
  a cartoon anvil, a cow from the sky and banana peels, with limited charges per show. What they
  flatten counts as pancaked: they are for fun, not for stars.
- **Gate sizes**: with the gates tool, pick narrow, normal or wide ($60) and click a gate to open or
  resize it. Wide gates let people in and out much faster; narrow ones slow everything down.
- **Moving entrances**: every visit to a venue shuffles the seven gates into a new, uneven layout (only
  spots that really work are used) and opens the venue's usual number of them at random. Turn it off
  in Options to get fixed gates and a plan saved per venue.
- **Direction**: the top view turns around between visits, so the stage can sit on either side and the
  crowd flows either way.

## Modes, medals and saves

- **Medals**: every venue has five optional challenges: *On a budget* (at most 5 trampled spending
  $200 or less), *Hands off* (zero trampled without guards or the megaphone), *Chaos survivor*
  (under 1% trampled in Total Chaos) *Catastrophe* (500 or more trampled) and *Architect* (at most 5 trampled without opening
  a single extra gate: fences and stewards only).
- **Sandbox** (title screen): every venue open, no budget, up to 16 guards, all gates, crowd size
  ×0.5 / ×1 / ×1.5, an unlimited megaphone and one button per disaster during the show. Nothing
  is saved or earned.
- **Your plan is saved** for each venue. **Ctrl+Z** undoes, **Delete** clears the plan.
- **Career stats** on the title screen: shows, total trampled, your worst day.
- **Options**: music and effects volume, fancy effects on/off, erase progress.
- Ghosts with halos float up from the trampled, and the body count has milestones.
- **The crowd**: clay-figure people with different builds, hair, clothes and ways of walking
  (bouncy, strutting, waddling, shuffling). Some carry signs, flags, balloons or umbrellas.
- **Sound**: recorded crowd, animal, impact and interface sounds (all CC0, listed in
  `game/audio/CREDITS.md`).
- **Voices** (CC0): people yelp when trampled and gasp when squeezed, an announcer calls the
  gates, the first medic, time over and the verdict, and animals and monsters get their own voices
  (penguins, gorillas, zombies, aliens, bats, a werewolf, a snoring mayor).
- **Music**: 17 recorded CC0 tracks (`game/music/CREDITS.md`): every venue has its own song, a calm
  one plays while you plan, the music opens up at each drop and goes muffled during the evacuation.
  If the files are missing, the game falls back to its synthesized music.

## Looks

Daytime venues get a different light on every visit (morning, noon, afternoon, sunset or
overcast), and the skyline around the venue matches it: downtown towers and cranes around the
march, the metro and the bus terminal, a factory district with chimneys, silos and saw-tooth roofs
around the factory and the reactor, hangars and a control tower around the airport and the launch
pad. The live controls bar during the show is one slim row.

## Keyboard shortcuts

**1–5** tools · **Space** opens the gates · **H** pressure · **C** camera · **V** speed ·
**M** sound · **G** glow and focus effects (turn off on slow PCs) · **Esc** or **P** pause · **F11** fullscreen ·
**X** street camera · **O** photo mode (hides the HUD and freezes the show; the camera stays free) · **Ctrl+Z** undo
