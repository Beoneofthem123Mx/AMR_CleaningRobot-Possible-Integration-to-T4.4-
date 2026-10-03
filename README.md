# Human Tsunami

A crowd-management desktop game for Steam (Windows and Linux), inspired by the concept trailer by
@bonkbureau ("making trailers for games i wish existed").

You are in charge of safety at a massive event. Before the gates open you draw fences and decide
which entrances to open. Then thousands of people pour in, cram together in front of the stage and,
when it's over, all leave at once. Meanwhile animals, cars and assorted objects wander through the
crowd. If someone takes too much pressure for too long, they go down and the **TRAMPLED** counter
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

- **Fence**: drag across the venue to draw a fence.
- **Gates**: tap the barrier at the bottom to open or close entrances.
- **Security**: place guards. They calm the people around them and stop animals and vehicles.
- **Erase**: tap a fence or a guard to remove it.
- **Venue**: choose where to play (there are 20).
- **Pressure**: paints the crowd from blue to red depending on how hard they're being squeezed.
- **1× / 2× / 4×**: simulation speed.
- **Camera**: automatic (zooms in and tilts during the big moments), near or far.
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
- The audience uses five character models (classic, cap, long hair, backpack and partygoer with a
  glow stick) drawn with instanced meshes. Every person swings their arms and legs as they walk,
  jumps and raises their arms during the show, flails when squeezed and lies flat on the ground if
  trampled.
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
| **The Plaza** | — | Free concert. Cars drive through, plus an ice-cream truck, loose dogs and beach balls. |
| **The Circus** | — | Under the big top: the lion escapes, elephants parade, the clown car, unicycles and the human cannonball. |
| **The Stadium** | 2 ★ | Night concert on the pitch: flares, the mascot, the giant ball, the wave and the medical cart. |
| **Black Friday** | 3 ★ | Mall sale: flash deals that send the crowd stampeding, runaway shopping carts, a grandma with elbows and a wet floor. |
| **The Cruise** | 4 ★ | Deck party: the swell tilts the ship, seagulls, an inflatable flamingo and the captain's horn. |
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

## Keyboard shortcuts

**1–4** tools · **Space** opens the gates · **H** pressure · **C** camera · **V** speed ·
**M** sound · **G** glow and focus effects (turn off on slow PCs) · **Esc** or **P** pause · **F11** fullscreen
