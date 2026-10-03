// Marea Humana · pantalla de título, elección de escenario y el periódico del día siguiente
const pick = arr => arr[(Math.random() * arr.length) | 0];
const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

// ---------- miniaturas de cada escenario (se dibujan una vez con su propio suelo) ----------
const THUMBS = {};
function sceneThumb(key) {
  if (THUMBS[key]) return THUMBS[key];
  const save = { obs, scene, gates, fences, guards };
  try {
    scene = SCENES[key]; gates = scene.gates.slice(); fences = []; guards = []; obs = [];
    seg(0, 0, 0, SH, .2, "edge"); seg(WW, 0, WW, SH, .2, "edge"); seg(0, 0, WW, 0, .2, "edge");
    scene.build();
    const big = buildStatic(), c = document.createElement("canvas");
    c.width = 108; c.height = 60; const g = c.getContext("2d");
    // el recinto se gira para que la miniatura quede horizontal, como en PC
    g.translate(108, 0); g.rotate(Math.PI / 2);
    g.drawImage(big, 0, 0, big.width, WH * TEXS, 0, 0, 60, 108);
    THUMBS[key] = c.toDataURL("image/jpeg", .8);
  } catch (e) { THUMBS[key] = ""; }
  ({ obs, scene, gates, fences, guards } = save);
  return THUMBS[key];
}

// ---------- pantalla de título y elección de escenario ----------
function chooser() {
  if (phase === "show" || phase === "evac") return;
  const best = loadBest(), total = totalStars(), max = Object.keys(SCENES).length * 3;
  showCard(`<div class="title">
      <h1 class="logo">MAREA<br>HUMANA</h1>
      <p class="tag">Simulador de seguridad para eventos que salen mal</p>
    </div>
    <p>Tú pones las vallas, las puertas y los guardias. Luego entra la gente y pasa de todo. Durante el show, <b>haz clic</b> para usar el megáfono. Si alguien aguanta demasiada presión, cae y lo pisotean.</p>
    <div class="row chaosrow"><button id="chaos" class="${chaosMode ? "go" : ""}">Modo caos total: ${chaosMode ? "sí" : "no"}</button><small>Eventos de todos los escenarios en cualquier lugar y dos condiciones del día a la vez.</small></div>
    <p class="keys">Atajos: <b>1–4</b> herramientas · <b>Espacio</b> abre puertas · <b>H</b> presión · <b>C</b> cámara · <b>V</b> velocidad · <b>M</b> sonido · <b>Esc</b> pausa</p>
    <p class="starline">Llevas <b>${total} de ${max}</b> estrellas. Las estrellas abren escenarios nuevos.</p>
    <div class="scenes">${Object.entries(SCENES).map(([key, sc]) => {
      const b = best[key], open = isUnlocked(key);
      return `<button class="scene" data-scene="${key}" ${open ? "" : "disabled"}>
        <img src="${sceneThumb(key)}" alt="">
        <span class="txt"><b>${sc.name}${b !== undefined ? ` <em class="best">${"★".repeat(b)}${"☆".repeat(3 - b)}</em>` : ""}</b>
        <span>${sc.tag} · ${sc.crowd.toLocaleString("es")} personas</span>
        ${open ? `<small>${sc.intro}</small>` : `<span class="lock">Se abre con ${sc.unlock} estrellas</span>`}</span></button>`; }).join("")}</div>
    ${window.steam ? '<div class="row"><button id="fs">Pantalla completa (F11)</button><button id="quit">Salir del juego</button></div>' : ""}`, "menu");
  const b = $("#card .scene:not(:disabled)"); if (b) b.focus();
}

// ---------- el periódico del día siguiente ----------
const PLACE = { plaza: "LA PLAZA", circo: "EL CIRCO", estadio: "EL ESTADIO", crucero: "EL CRUCERO", hipodromo: "EL HIPÓDROMO", ciudad: "LA CIUDAD",
  viernes: "EL CENTRO COMERCIAL", boda: "LA BODA DEL AÑO", trono: "EL BAÑO DE ORO", mitin: "EL MITIN DEL PATO", taco: "EL FESTIVAL DEL TACO", ovni: "EL MAIZAL DE DON CHUY", aeropuerto: "EL AEROPUERTO" };
const HEADLINES = {
  perfect: [
    "MILAGRO EN {P}: {N} ENTRAN, {N} SALEN Y TODOS SE QUEJAN DEL BAÑO",
    "NADIE SALE HERIDO EN {P}; EXPERTOS PIDEN QUE NO SE REPITA PORQUE ARRUINA LAS ESTADÍSTICAS",
    "JEFE DE SEGURIDAD LOGRA LO IMPOSIBLE Y AHORA PIDE AUMENTO; SE LO NIEGAN",
    "EVENTO SIN INCIDENTES ABURRE A LA PRENSA: «NO HAY NOTA», LAMENTAN",
  ],
  some: [
    "SALDO «BLANCO» EN {P}, SEGÚN EL ORGANIZADOR, QUE NO VIO NADA",
    "{D} PISOTEADOS EN {P}; AUTORIDADES PROMETEN «MÁS VALLAS QUE NUNCA»",
    "«PUDO SER PEOR», DICE EL ORGANIZADOR, Y TIENE RAZÓN",
  ],
  bad: [
    "CAOS EN {P}: {D} PISOTEADOS Y EL ORGANIZADOR HUYE EN BICICLETA",
    "«FUE UN ÉXITO TOTAL», ASEGURA EL RESPONSABLE DESDE LO ALTO DE UN ÁRBOL",
    "{D} PISOTEADOS; EL JEFE DE SEGURIDAD CULPA A «LA FÍSICA»",
    "{P} AMANECE LLENA DE TENIS SIN DUEÑO",
  ],
};
const EVENT_LINES = {
  lion: "Un león recorrió el público y se tomó fotos con varios asistentes.",
  elephants: "Tres elefantes desfilaron sin boleto.",
  cannon: "Un hombre bala aterrizó en la fila de las palomitas; dice que sí le dieron.",
  clowncar: "El coche de los payasos dio vueltas sin placas.",
  car: "Un conductor entró a la plaza «porque así decía el GPS».",
  dogs: "Varios perros se unieron al evento y fueron los únicos que bailaron bien.",
  ola: "La ola dio tres vueltas al estadio y una al estacionamiento.",
  flares: "Hubo bengalas; el humo todavía no se va.",
  oleaje: "El barco se inclinó y medio público terminó en la alberca.",
  gaviotas: "Las gaviotas se llevaron 300 tortas.",
  desbocado: "Un caballo desbocado cruzó el público y ganó una apuesta.",
  fuegos: "Los fuegos artificiales asustaron a tres edificios.",
  carroza: "La carroza del desfile se estacionó en doble fila.",
  chancla: "Llovieron chanclas; las mamás no dieron explicaciones.",
  palomas: "Las palomas se quedaron con todas las palomitas.",
};
const QUOTES = [
  "«Teníamos todo bajo control», declaró el jefe de seguridad desde un árbol.",
  "«Las vallas eran decorativas», aclaró el organizador.",
  "«Yo solo vine por el wifi», dijo un testigo.",
  "«Al próximo evento vengo en casco», prometió una asistente.",
  "«No vi nada, estaba grabando para mis historias», reconoció un joven.",
  "«Esto en mis tiempos no pasaba», dijo una señora que vio todo.",
  "«Lo volvería a organizar», insistió el responsable, ya sin zapatos.",
];
function showReport(stars, stuck) {
  const p = PLACE[sceneKey] || scene.name.toUpperCase(), v = { P: p, N: CROWD.toLocaleString("es"), D: dead.toLocaleString("es") };
  const head = fill(pick(stars === 3 ? HEADLINES.perfect : stars ? HEADLINES.some : HEADLINES.bad), v);
  const lines = [...eventLog].map(k => (scene.lines && scene.lines[k]) || EVENT_LINES[k]).filter(Boolean).sort(() => Math.random() - .5).slice(0, 2);
  if (MOD && MOD.id !== "normal") lines.unshift(`Condición del día: ${MOD.name.toLowerCase()}. Nadie la anunció.`);
  if (abducted) lines.unshift(`${abducted} asistentes fueron abducidos. Sus familias esperan que les vaya mejor allá arriba.`);
  const date = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
  showCard(`<div class="paper">
      <div class="mast"><span>EL CHISMÓGRAFO</span><small>${date} · Edición especial · $5</small></div>
      <h2 class="head">${head}</h2>
      ${G3.photo ? `<figure><img src="${G3.photo}" alt="Foto del evento"><figcaption>${scene.name}, ayer. Foto: un asistente que no soltó el celular.</figcaption></figure>` : ""}
      <div class="cols">
        <div class="story"><p>${lines.join(" ")}</p><p class="quote">${pick(scene.quotes || QUOTES)}</p></div>
        <div class="box">
          <div class="stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "" : "off"}">★</span>`).join("")}</div>
          <div class="stats">
            <span>Público</span><span>${CROWD.toLocaleString("es")}</span>
            <span>Salieron sanos</span><span>${evacuated.toLocaleString("es")}</span>
            <span>Pisoteados</span><span style="color:var(--danger)">${dead.toLocaleString("es")}</span>
            ${abducted ? `<span>Abducidos</span><span>${abducted}</span>` : ""}
            <span>Atrapados</span><span>${stuck}</span>
            <span>Evacuación</span><span>${Math.round(evacT)} s</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row"><button class="go" id="retry">Ajustar el plan</button><button id="pick">Cambiar escenario</button></div>`, "report");
}
