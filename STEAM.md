# How to publish Human Tsunami on Steam

*(Spanish version: `STEAM.es.md`.)*

This guide goes from the code to the store page. Steamworks steps change over time, so confirm
each one in the official documentation: <https://partner.steamgames.com/doc/home>

## 1. Run the game on your computer

You need [Node.js](https://nodejs.org/) 20 or newer.

```sh
npm install
npm start
```

The game window opens. With Steam running and `steam_appid.txt` set to `480` (Spacewar, Valve's
test app), the Steam overlay (Shift+Tab) and achievement calls work too.

Shortcuts: **F11** or **Alt+Enter** toggle fullscreen.

## 2. Create the app in Steamworks

1. Create a developer account at <https://partner.steamgames.com/>. It asks for tax and banking
   details.
2. Pay the Steam Direct fee to get an App ID. Valve publishes the amount and refund conditions in
   its documentation.
3. Write down the **App ID** and the **Depot IDs** Steamworks gives you (one for Windows, one for
   Linux).

## 3. Put your App ID in the game

- In `desktop/main.js`, change `STEAM_APP_ID = 480` to your App ID.
- In `steam_appid.txt`, put your App ID (only used when testing with `npm start`; it is not
  shipped in the packaged game).
- In `steam/app_build.vdf` and `steam/depot_*.vdf`, replace `YOUR_APP_ID`, `YOUR_DEPOT_WINDOWS`
  and `YOUR_DEPOT_LINUX`.

## 4. Create the achievements in Steamworks

The game already unlocks them. Create them under *Stats & Achievements* with these exact API names:

| API name             | Suggested name           | How it is earned                                         |
|----------------------|--------------------------|----------------------------------------------------------|
| `FIRST_SHOW`         | Opening Night            | Finish any event                                         |
| `PERFECT_PLAZA`      | Not a Scratch            | The Plaza with zero trampled and nobody stuck            |
| `PERFECT_CIRCO`      | Greatest Show on Earth   | The Circus with zero trampled and nobody stuck           |
| `LION_TAMER`         | Lion Tamer               | A lion hits one of your fences and turns around          |
| `TRAGEDY`            | That Did Not Go Well     | 500 or more trampled in a single event                   |
| `PERFECT_ESTADIO`    | Clean Sheet              | The Stadium with zero trampled and nobody stuck          |
| `PERFECT_CRUCERO`    | Smooth Sailing           | The Cruise with zero trampled and nobody stuck           |
| `PERFECT_HIPODROMO`  | Photo Finish             | The Racetrack with zero trampled and nobody stuck        |
| `PERFECT_CIUDAD`     | City That Never Tramples | The City with zero trampled and nobody stuck             |
| `GUARDIAN`           | Halt!                    | A guard stops an animal or a vehicle                     |
| `ALL_SCENES`         | World Tour               | Earn at least one star in every venue                    |
| `ALL_STARS`          | Flawless Security        | Three stars in every venue                               |
| `PERFECT_VIERNES`    | Doorbuster Survivor      | Black Friday with zero trampled and nobody stuck         |
| `PERFECT_BODA`       | Happily Ever After       | Wedding of the Year with zero trampled and nobody stuck  |
| `PERFECT_TRONO`      | Spotless                 | The Golden Throne with zero trampled and nobody stuck    |
| `PERFECT_MITIN`      | Clean Campaign           | The Duck Rally with zero trampled and nobody stuck       |
| `PERFECT_TACO`       | World Record, No Injuries| The Giant Taco with zero trampled and nobody stuck       |
| `PERFECT_OVNI`       | Peaceful Contact         | Close Encounter with zero trampled and nobody stuck      |
| `PERFECT_AEROPUERTO` | Soft Landing             | The Star Arrives with zero trampled and nobody stuck     |
| `PERFECT_ARENA`      | Two Out of Three Falls   | The Arena with zero trampled and nobody stuck            |
| `SPACE_TOURISM`      | Space Tourism            | 100 abducted in a single show                            |
| `LOUD_AND_SAFE`      | Loud but Safe            | Three stars using all three megaphones                   |
| `MOD_COLLECTOR`      | Seen It All              | Finish shows under six different "today's twists"        |

Each achievement needs a 64×64 icon (achieved and unachieved versions).

## 5. Package

```sh
npm run dist:win     # dist/win-unpacked/Human Tsunami.exe
npm run dist:linux   # dist/linux-unpacked/human-tsunami
npm run dist:mac     # only on a Mac
```

Packaging copies `steam_api64.dll` (Windows) and `libsteam_api.so` (Linux) next to the executable.
The Windows executable gets no custom icon when packaged from Linux; for that, package on Windows
and set an icon in `package.json` (`build.win.icon`).

## 6. Upload with SteamPipe

1. Download the Steamworks SDK from Steamworks and use `tools/ContentBuilder/builder/steamcmd`.
2. From this repository's `steam/` folder:

   ```sh
   steamcmd +login YOUR_USER +run_app_build "$(pwd)/app_build.vdf" +quit
   ```

3. In Steamworks, under *Installation > General*, create the launch options:
   - Windows: `Human Tsunami.exe`
   - Linux: `human-tsunami`, with arguments `--no-sandbox` (Electron cannot use its sandbox inside
     the Steam runtime on Linux).
4. Publish the build to the `default` branch and test it from your Steam library.

## 7. Store page and price

- Steam asks for capsules in several sizes, at least 5 screenshots and, ideally, a trailer.
  Ready-to-upload material:
  - `steam/screenshots/`: 1920×1080 screenshots of different venues.
  - `steam/art/out/`: header capsule (920×430), small (462×174), main (1232×706), vertical
    (748×896), library capsule (600×900), library hero (3840×1240), library logo with transparent
    background (1280×720), page background, and 512 and 256 px icons.
  - To regenerate them: `node steam/art/render.cjs` (uses Playwright with Chromium). The design is
    in `steam/art/capsule.html` and the backgrounds in `steam/art/bg/`.
  - The library hero is upscaled from a 1824 px wide capture, so it is a bit soft. For more
    sharpness, take a 4K capture and replace `steam/art/bg/circo.jpg`.
  - `steam/trailer/human_tsunami_trailer.mp4`: a trailer recorded from the real game, with the game's
    own music and sound effects. To regenerate it:
    `xvfb-run -a -s "-screen 0 1920x1080x24" node steam/trailer/trailer.cjs`.
  - Check the current sizes in Steamworks before uploading: Valve changes them from time to time.
- Fill in the content survey. The game shows crush deaths with no blood or explicit violence;
  answer it honestly.
- Pick the price under *Pricing* from Steam's price tiers. The plan is an impulse-buy price of
  about €1–2 (for example the €1.99 / $1.99 tier). Things to keep in mind:
  - Check the current minimum price for each region in *Pricing* before announcing the price;
    Steam suggests regional prices automatically and you can adjust them.
  - Valve keeps a revenue share (30% by default), and prices in the EU and many other regions
    include VAT, so at €1.99 you receive well under €1.40 per copy. Plan your expectations on volume.
  - Very cheap games sell on the trailer and the first screenshot: put the trailer first on the page
    and use the crowd-heavy screenshots (circus, city fireworks, arena) at the top.
  - A launch discount (e.g. −20% in launch week) and joining Steam seasonal sales help a lot at this
    price; bundles with your future games too.
- Valve reviews the store page and the build before launch, and requires the page to be visible as
  "Coming Soon" for a while before you can sell. Plan the date with that in mind.

## 8. Before selling: where the idea came from

The concept comes from a TikTok video by @bonkbureau ("making trailers for games i wish
existed"). Game ideas are not copyrightable, and the code, models and art in this repository are
original. Still, do not use their name, video or footage on the store page, and consider reaching
out to them before launch.

## Included licenses

- three.js (MIT): `game/vendor/three.LICENSE`
- Rubik font (SIL Open Font License): `game/fonts/OFL.txt`
- Electron (MIT) and steamworks.js (MIT) are installed with `npm install`. Valve's Steamworks SDK
  is governed by its own Steamworks agreement.
