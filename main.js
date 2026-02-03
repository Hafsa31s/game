const SAVE_KEY = "brainrot_save_v2";

/* ---------- DEFAULT STATE ---------- */
const defaultState = {
  coins: 0,
  cpc: 1,
  cps: 0,
  achievements: [],
  upgrades: {
    cursor: { name: "Cursor 🖱", base: 10, level: 0, amount: 1 },
    grandma: { name: "Grandma 👵", base: 100, level: 0, amount: 5 }
  }
};

let state = structuredClone(defaultState);

/* ---------- ELEMENTS ---------- */
const el = {
  coins: document.getElementById("coins"),
  cpc: document.getElementById("cpc"),
  cps: document.getElementById("cps"),
  upgrades: document.getElementById("upgradesList"),
  click: document.getElementById("clickBtn"),
  ach: document.getElementById("achievements"),
  music: document.getElementById("bgMusic"),
  musicBtn: document.getElementById("musicBtn"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn")
};

/* ---------- LOADING ---------- */
setTimeout(() => {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}, 1200);

/* ---------- HELPERS ---------- */
function cost(up) {
  return Math.floor(up.base * Math.pow(1.15, up.level));
}

function compute() {
  state.cps = 0;
  Object.values(state.upgrades).forEach(up => {
    state.cps += up.level * up.amount;
  });
}

/* ---------- RENDER ---------- */
function render() {
  state.coins = Math.max(0, state.coins); // safety

  el.coins.textContent = Math.floor(state.coins);
  el.cpc.textContent = state.cpc;
  el.cps.textContent = state.cps;

  el.upgrades.innerHTML = "";

  Object.entries(state.upgrades).forEach(([id, up]) => {
    const c = cost(up);
    const canBuy = Math.floor(state.coins) >= c;

    const div = document.createElement("div");
    div.className = "upgrade";
    div.innerHTML = `
      <div>${up.name} (Lvl ${up.level})</div>
      <button data-id="${id}" ${!canBuy ? "disabled" : ""}>
        Buy (${c})
      </button>
    `;
    el.upgrades.appendChild(div);
  });

  el.ach.innerHTML = state.achievements.map(a => `<li>${a}</li>`).join("");
}

/* ---------- BUY (SAFE) ---------- */
function buyUpgrade(id) {
  const up = state.upgrades[id];
  if (!up) return;

  const c = cost(up);
  if (Math.floor(state.coins) < c) return;

  state.coins = Math.floor(state.coins) - c;
  up.level++;
  compute();
  checkAchievements();
  render();
}

/* ---------- EVENTS ---------- */
el.click.addEventListener("click", () => {
  state.coins += state.cpc;
  render();
});

el.upgrades.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    buyUpgrade(e.target.dataset.id);
  }
});

/* ---------- ACHIEVEMENTS ---------- */
function unlock(name) {
  if (!state.achievements.includes(name)) {
    state.achievements.push(name);
  }
}

function checkAchievements() {
  if (state.coins >= 100) unlock("Touch Grass 🌱");
  if (state.coins >= 1000) unlock("Certified Brainrot 🧠");
}

/* ---------- MUSIC ---------- */
el.musicBtn.addEventListener("click", () => {
  el.music.paused ? el.music.play() : el.music.pause();
});

/* ---------- SAVE / LOAD ---------- */
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state = structuredClone(defaultState);
    Object.assign(
