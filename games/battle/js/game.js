// ============================================================================
// メインゲームループ・UI制御・バトル計算・Canvas描画
// ============================================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let renderScale = 1;
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const sc = Math.max(1, Math.min(2.5, (rect.width / VIEW_WIDTH) * dpr));
  const w = Math.round(VIEW_WIDTH * sc);
  const h = Math.round(VIEW_HEIGHT * sc);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  renderScale = w / VIEW_WIDTH;
}

const battleHud = document.getElementById("battleHud");
const p1Hud = document.getElementById("p1Hud");
const p2Hud = document.getElementById("p2Hud");
const stageHud = document.getElementById("stageHud");

const stageScreen = document.getElementById("stageScreen");
const stageGrid = document.getElementById("stageGrid");
const toCharSelectBtn = document.getElementById("toCharSelectBtn");

const charScreen = document.getElementById("charScreen");
const selectedStageBanner = document.getElementById("selectedStageBanner");
const backToStageBtn = document.getElementById("backToStageBtn");
const startBattleBtn = document.getElementById("startBattleBtn");

const p1Grid = document.getElementById("p1Grid");
const p2Grid = document.getElementById("p2Grid");
const p1GearGrid = document.getElementById("p1GearGrid");
const p2GearGrid = document.getElementById("p2GearGrid");
const p1GearInfo = document.getElementById("p1GearInfo");
const p2GearInfo = document.getElementById("p2GearInfo");
const p1Preview = document.getElementById("p1Preview");
const p2Preview = document.getElementById("p2Preview");
const p1AbilityName = document.getElementById("p1AbilityName");
const p1AbilityDesc = document.getElementById("p1AbilityDesc");
const p1SpecialDesc = document.getElementById("p1SpecialDesc");
const p2AbilityName = document.getElementById("p2AbilityName");
const p2AbilityDesc = document.getElementById("p2AbilityDesc");
const p2SpecialDesc = document.getElementById("p2SpecialDesc");

const p1Stats = document.getElementById("p1Stats");
const p2Stats = document.getElementById("p2Stats");
const p1Random = document.getElementById("p1Random");
const p2Random = document.getElementById("p2Random");
const resultSub = document.getElementById("resultSub");
const pauseOverlay = document.getElementById("pauseOverlay");
const soundBtn = document.getElementById("soundBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const pauseRestartBtn = document.getElementById("pauseRestartBtn");
const pauseMenuBtn = document.getElementById("pauseMenuBtn");
const resultOverlay = document.getElementById("resultOverlay");
const resultTitle = document.getElementById("resultTitle");
const rematchBtn = document.getElementById("rematchBtn");
const toCharBtn = document.getElementById("toCharBtn");
const toStageBtn = document.getElementById("toStageBtn");

// アシスト設定UI
const p1AutoFireEl = document.getElementById("p1AutoFire");
const p1AutoAimEl = document.getElementById("p1AutoAim");
const p1FullAutoEl = document.getElementById("p1FullAutoAttack");
const p2AutoFireEl = document.getElementById("p2AutoFire");
const p2AutoAimEl = document.getElementById("p2AutoAim");
const p2FullAutoEl = document.getElementById("p2FullAutoAttack");
const pauseP1AutoFireEl = document.getElementById("pauseP1AutoFire");
const pauseP1AutoAimEl = document.getElementById("pauseP1AutoAim");
const pauseP1FullAutoEl = document.getElementById("pauseP1FullAutoAttack");
const pauseP2AutoFireEl = document.getElementById("pauseP2AutoFire");
const pauseP2AutoAimEl = document.getElementById("pauseP2AutoAim");
const pauseP2FullAutoEl = document.getElementById("pauseP2FullAutoAttack");

const assistOptions = {
  p1: { autoFire: false, autoAim: false, fullAuto: false },
  p2: { autoFire: false, autoAim: false, fullAuto: false }
};

function syncAssistUI() {
  p1AutoFireEl.checked = assistOptions.p1.autoFire;
  pauseP1AutoFireEl.checked = assistOptions.p1.autoFire;
  p1AutoAimEl.checked = assistOptions.p1.autoAim;
  pauseP1AutoAimEl.checked = assistOptions.p1.autoAim;
  p1FullAutoEl.checked = assistOptions.p1.fullAuto;
  pauseP1FullAutoEl.checked = assistOptions.p1.fullAuto;

  p2AutoFireEl.checked = assistOptions.p2.autoFire;
  pauseP2AutoFireEl.checked = assistOptions.p2.autoFire;
  p2AutoAimEl.checked = assistOptions.p2.autoAim;
  pauseP2AutoAimEl.checked = assistOptions.p2.autoAim;
  p2FullAutoEl.checked = assistOptions.p2.fullAuto;
  pauseP2FullAutoEl.checked = assistOptions.p2.fullAuto;
  if (screenMode === "battle") updateHud();
}

p1AutoFireEl.addEventListener("change", (e) => { assistOptions.p1.autoFire = e.target.checked; syncAssistUI(); });
pauseP1AutoFireEl.addEventListener("change", (e) => { assistOptions.p1.autoFire = e.target.checked; syncAssistUI(); });
p1AutoAimEl.addEventListener("change", (e) => { assistOptions.p1.autoAim = e.target.checked; syncAssistUI(); });
pauseP1AutoAimEl.addEventListener("change", (e) => { assistOptions.p1.autoAim = e.target.checked; syncAssistUI(); });
p1FullAutoEl.addEventListener("change", (e) => { assistOptions.p1.fullAuto = e.target.checked; syncAssistUI(); });
pauseP1FullAutoEl.addEventListener("change", (e) => { assistOptions.p1.fullAuto = e.target.checked; syncAssistUI(); });

p2AutoFireEl.addEventListener("change", (e) => { assistOptions.p2.autoFire = e.target.checked; syncAssistUI(); });
pauseP2AutoFireEl.addEventListener("change", (e) => { assistOptions.p2.autoFire = e.target.checked; syncAssistUI(); });
p2AutoAimEl.addEventListener("change", (e) => { assistOptions.p2.autoAim = e.target.checked; syncAssistUI(); });
pauseP2AutoAimEl.addEventListener("change", (e) => { assistOptions.p2.autoAim = e.target.checked; syncAssistUI(); });
p2FullAutoEl.addEventListener("change", (e) => { assistOptions.p2.fullAuto = e.target.checked; syncAssistUI(); });
pauseP2FullAutoEl.addEventListener("change", (e) => { assistOptions.p2.fullAuto = e.target.checked; syncAssistUI(); });
let selectedStageIndex = 0;
let selectedP1 = "🤯";
let selectedP2 = "💩";
let selectedGearP1 = null;
let selectedGearP2 = null;
let screenMode = "stage"; // "stage" | "char" | "battle" | "result"

const p1Input = { left: false, right: false, jumpPressed: false, pulseHeld: false, pulseReleased: false, specialPressed: false };
const p2Input = { left: false, right: false, jumpPressed: false, pulseHeld: false, pulseReleased: false, specialPressed: false };

let fighters = [];
let pulses = [];
let shockwaves = [];
let hazardZones = [];
let slotMachines = [];
let floatingPopups = [];
let ufoDrones = [];
let fieldItems = [];
let itemSpawnTimer = 5.5;
let particles = [];
let impactFlashes = [];
let timeElapsed = 0;
let screenShakeTimer = 0;
let screenShakeMagnitude = 0;

let paused = false;
let countdownTimer = 0;
let fightBannerTimer = 0;
let hitStopTimer = 0;
let koTimer = 0;
let matchTimer = MATCH_TIME;
let suddenDeath = false;
let resultInfo = null;
let resultBannerText = "K.O.!";
const scores = { p1: 0, p2: 0 };

function refreshSoundBtn() {
  soundBtn.textContent = Sound.isMuted() ? "🔇" : "🔊";
}

function getCurrentStage() {
  return STAGES[selectedStageIndex];
}

function triggerScreenShake(duration, magnitude) {
  screenShakeTimer = Math.max(screenShakeTimer, duration);
  screenShakeMagnitude = Math.max(screenShakeMagnitude, magnitude);
}

function drawStagePreview(miniCanvas, stage) {
  const mctx = miniCanvas.getContext("2d");
  const mw = miniCanvas.width;
  const mh = miniCanvas.height;
  const sx = mw / VIEW_WIDTH;
  const sy = mh / VIEW_HEIGHT;

  const grad = mctx.createLinearGradient(0, 0, 0, mh);
  grad.addColorStop(0, stage.bgTop);
  grad.addColorStop(1, stage.bgBottom);
  mctx.fillStyle = grad;
  mctx.fillRect(0, 0, mw, mh);

  for (const p of stage.platforms) {
    if (p.type === "floor") {
      mctx.fillStyle = stage.floorAccent;
      mctx.fillRect(p.x * sx, p.y * sy, p.w * sx, Math.max(3, p.h * sy));
    } else if (p.type === "wall") {
      mctx.fillStyle = stage.wallAccent || "#ffd166";
      mctx.fillRect(p.x * sx, p.y * sy, Math.max(3, p.w * sx), p.h * sy);
    } else {
      mctx.fillStyle = stage.shelfAccent;
      mctx.fillRect(p.x * sx, p.y * sy, p.w * sx, Math.max(4, p.h * sy));
    }
  }
}

function buildStageSelectUI() {
  stageGrid.innerHTML = "";
  STAGES.forEach((stage, idx) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "stage-card" + (idx === selectedStageIndex ? " active" : "");

    const mini = document.createElement("canvas");
    mini.width = 200;
    mini.height = 112;
    mini.className = "stage-mini-canvas";
    drawStagePreview(mini, stage);

    const nameEl = document.createElement("div");
    nameEl.className = "stage-card-name";
    nameEl.textContent = stage.name;

    const descEl = document.createElement("div");
    descEl.className = "stage-card-desc";
    descEl.textContent = stage.desc;

    card.appendChild(mini);
    card.appendChild(nameEl);
    card.appendChild(descEl);

    card.addEventListener("click", () => { selectStage(idx); animateUiPop(card); });

    stageGrid.appendChild(card);
  });
}

function selectStage(idx) {
  selectedStageIndex = (idx + STAGES.length) % STAGES.length;
  Array.from(stageGrid.children).forEach((el, i) => {
    el.classList.toggle("active", i === selectedStageIndex);
  });
  animateUiPop(stageGrid.children[selectedStageIndex]);
}

function clamp01(v) { return Math.max(0.06, Math.min(1, v)); }

function renderStats(el, def) {
  const items = [
    ["移動", clamp01((def.moveSpeed - 235) / 115)],
    ["跳躍", clamp01(((-def.jumpVel - def.doubleJumpVel) - 1150) / 260)],
    ["射程", clamp01((def.pulseSpeed * def.maxPulseRangeLife) / 520)],
    ["連射", clamp01((1 / def.pulseCooldown - 1.2) / 2.8)],
    ["耐久", clamp01((1 / def.knockbackScale - 0.85) / 0.75)]
  ];
  el.innerHTML = items
    .map(([label, v]) => `<div class="stat-item">${label}<div class="stat-track"><div class="stat-fill" style="width:${Math.round(v * 100)}%"></div></div></div>`)
    .join("");
}

function randomCharacter() {
  return SELECTABLE_CHARACTERS[Math.floor(Math.random() * SELECTABLE_CHARACTERS.length)];
}

function updateGearInfoUI() {
  const update = (grid, info, selected, selectedCharacter) => {
    Array.from(grid.children).forEach((btn) => btn.classList.toggle("active", btn.dataset.gear === (selected || "none")));
    const gear = selected ? EQUIPMENT_DEFS[selected] : null;
    const jumpGearBlocked = !!(gear && gear.jumpBonus && CHARACTER_DEFS[selectedCharacter]?.noAirJump);
    info.textContent = gear
      ? `${gear.emoji} ${gear.name}：${gear.desc}${jumpGearBlocked ? '（🤕のパッシブにより空中ジャンプ効果は無効）' : ''}`
      : "装備なし：キャラクター本来の性能で戦う";
  };
  update(p1GearGrid, p1GearInfo, selectedGearP1, selectedP1);
  update(p2GearGrid, p2GearInfo, selectedGearP2, selectedP2);
}

function buildGearSelectUI() {
  const build = (grid, player) => {
    grid.innerHTML = "";
    EQUIPMENT_CHOICES.forEach((gearEmoji) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gear-btn";
      btn.dataset.gear = gearEmoji || "none";
      btn.textContent = gearEmoji || "なし";
      btn.title = gearEmoji ? `${EQUIPMENT_DEFS[gearEmoji].name}：${EQUIPMENT_DEFS[gearEmoji].desc}` : "装備なし";
      btn.addEventListener("click", () => {
        if (player === "p1") selectedGearP1 = gearEmoji;
        else selectedGearP2 = gearEmoji;
        animateUiPop(btn);
        updateGearInfoUI();
      });
      grid.appendChild(btn);
    });
  };
  build(p1GearGrid, "p1");
  build(p2GearGrid, "p2");
  updateGearInfoUI();
}

function updateAbilityInfoUI() {
  const def1 = CHARACTER_DEFS[selectedP1];
  const def2 = CHARACTER_DEFS[selectedP2];

  p1Preview.textContent = def1.selectLabel || def1.emoji;
  p1AbilityName.textContent = def1.abilityName;
  p1AbilityDesc.textContent = def1.abilityDesc;
  p1SpecialDesc.textContent = `${def1.specialName}: ${def1.specialDesc}`;

  p2Preview.textContent = def2.selectLabel || def2.emoji;
  p2AbilityName.textContent = def2.abilityName;
  p2AbilityDesc.textContent = def2.abilityDesc;
  p2SpecialDesc.textContent = `${def2.specialName}: ${def2.specialDesc}`;
  renderStats(p1Stats, def1);
  renderStats(p2Stats, def2);
  animateCharacterPreview(p1Preview);
  animateCharacterPreview(p2Preview);
  updateGearInfoUI();
}

function buildCharacterSelectUI() {
  p1Grid.innerHTML = "";
  p2Grid.innerHTML = "";

  SELECTABLE_CHARACTERS.forEach((emoji) => {
    const btn1 = document.createElement("button");
    btn1.type = "button";
    btn1.dataset.emoji = emoji;
    btn1.className = "emoji-btn" + (emoji === selectedP1 ? " active" : "");
    btn1.textContent = emoji;
    btn1.addEventListener("click", () => {
      selectedP1 = emoji;
      animateUiPop(btn1);
      refreshActiveButtons();
      updateAbilityInfoUI();
    });
    p1Grid.appendChild(btn1);

    const btn2 = document.createElement("button");
    btn2.type = "button";
    btn2.dataset.emoji = emoji;
    btn2.className = "emoji-btn" + (emoji === selectedP2 ? " active" : "");
    btn2.textContent = emoji;
    btn2.addEventListener("click", () => {
      selectedP2 = emoji;
      animateUiPop(btn2);
      refreshActiveButtons();
      updateAbilityInfoUI();
    });
    p2Grid.appendChild(btn2);
  });

  updateAbilityInfoUI();
  buildGearSelectUI();
}

function refreshActiveButtons() {
  Array.from(p1Grid.children).forEach((el) => {
    el.classList.toggle("active", el.dataset.emoji === selectedP1);
  });
  Array.from(p2Grid.children).forEach((el) => {
    el.classList.toggle("active", el.dataset.emoji === selectedP2);
  });
}

function clearInputs() {
  p1Input.left = false;
  p1Input.right = false;
  p1Input.jumpPressed = false;
  p1Input.pulseHeld = false;
  p1Input.pulseReleased = false;
  p1Input.specialPressed = false;

  p2Input.left = false;
  p2Input.right = false;
  p2Input.jumpPressed = false;
  p2Input.pulseHeld = false;
  p2Input.pulseReleased = false;
  p2Input.specialPressed = false;
}

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

function animatePanelIn(panel) {
  if (!panel || !window.gsap || prefersReducedMotion) return;
  const title = panel.querySelector(".screen-title");
  const cards = panel.querySelectorAll(".stage-card, .player-panel, .action-row > button");
  gsap.killTweensOf([panel, title, ...cards].filter(Boolean));
  gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "power1.out", overwrite: true });
  if (title) {
    gsap.fromTo(title, { y: -18, opacity: 0, scale: 0.96 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.46, ease: "back.out(1.55)", overwrite: true
    });
  }
  if (cards.length) {
    gsap.fromTo(cards, { y: 18, opacity: 0, scale: 0.985 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.38, stagger: 0.045,
      ease: "power2.out", overwrite: true, delay: 0.06
    });
  }
}

function animateUiPop(element) {
  if (!element || !window.gsap || prefersReducedMotion) return;
  gsap.fromTo(element, { scale: 0.88 }, {
    scale: 1, duration: 0.26, ease: "back.out(2.1)", overwrite: true,
    transformOrigin: "50% 50%"
  });
}

function animateCharacterPreview(element) {
  if (!element || !window.gsap || prefersReducedMotion) return;
  gsap.fromTo(element, { scale: 0.68, rotation: -9, opacity: 0.55 }, {
    scale: 1, rotation: 0, opacity: 1, duration: 0.34,
    ease: "back.out(2)", overwrite: true
  });
}

function celebrateVictory() {
  if (prefersReducedMotion || typeof window.confetti !== "function") return;
  const colors = ["#72efdd", "#ff70a6", "#ffd166", "#c77dff", "#ffffff"];
  window.confetti({
    particleCount: 70, spread: 78, startVelocity: 48, ticks: 190,
    gravity: 0.9, scalar: 1.05, origin: { x: 0.12, y: 0.62 },
    colors, disableForReducedMotion: true
  });
  window.confetti({
    particleCount: 70, angle: 120, spread: 78, startVelocity: 48,
    ticks: 190, gravity: 0.9, scalar: 1.05, origin: { x: 0.88, y: 0.62 },
    colors, disableForReducedMotion: true
  });
}

function openStageScreen() {
  clearInputs();
  setPaused(false);
  Sound.setBgm("menu");
  screenMode = "stage";
  battleHud.classList.add("hidden");
  charScreen.classList.add("hidden");
  resultOverlay.classList.add("hidden");
  stageScreen.classList.remove("hidden");
  animatePanelIn(stageScreen);
}

function openCharScreen() {
  clearInputs();
  setPaused(false);
  Sound.setBgm("menu");
  screenMode = "char";
  battleHud.classList.add("hidden");
  stageScreen.classList.add("hidden");
  resultOverlay.classList.add("hidden");
  selectedStageBanner.textContent = `選択ステージ: ${getCurrentStage().name}`;
  charScreen.classList.remove("hidden");
  animatePanelIn(charScreen);
}

function getJumpCapacity(def, gear) {
  // 空中ジャンプ不可のパッシブは、ジャンプ装備より常に優先する
  return def.noAirJump ? 1 : MAX_JUMPS + (gear.jumpBonus || 0);
}

function createFighter(id, label, emoji, gearEmoji, x, facing, accentColor) {
  const def = CHARACTER_DEFS[emoji];
  const gear = gearEmoji ? EQUIPMENT_DEFS[gearEmoji] : {};
  return {
    id,
    label,
    emoji,
    gearEmoji,
    gear,
    def,
    accentColor,
    x,
    y: GROUND_Y - PLAYER_H,
    w: PLAYER_W,
    h: PLAYER_H,
    vx: 0,
    vy: 0,
    maxHp: MAX_HP + (gear.maxHpBonus || 0),
    hp: MAX_HP + (gear.maxHpBonus || 0),
    facing,
    onGround: true,
    jumpsLeft: getJumpCapacity(def, gear),
    invincibleTimer: 0,
    starTimer: 0,
    orbitTimer: 0,
    orbitHitCooldown: 0,
    pulseTimer: 0,
    pulseCooldown: 0,
    pulseChargeTime: 0,
    isChargingPulse: false,
    specialCooldown: 0,
    pendingSpecialCooldown: 0,
    dashStrikeTimer: 0,
    dashStrikeHitIds: new Set(),
    meteorSlamActive: false,
    mindChargeTimer: 0,
    mindChargeMax: 0.45,
    barrierTimer: 0,
    stealthTimer: 0,
    chillTimer: 0,
    slowTimer: 0,
    bandageChangeTimer: 0,
    bandageChangesUsed: 0,
    warpBeacon: null,
    atlasPin: null,
    squashX: 1,
    squashY: 1,
    animTime: 0,
    koAngle: 0
  };
}

function startBattle() {
  clearInputs();
  pulses = [];
  shockwaves = [];
  hazardZones = [];
  slotMachines = [];
  floatingPopups = [];
  ufoDrones = [];
  fieldItems = [];
  itemSpawnTimer = 5.5;
  particles = [];
  impactFlashes = [];
  screenShakeTimer = 0;
  screenShakeMagnitude = 0;
  fighters = [
    createFighter("p1", "1P", selectedP1, selectedGearP1, 110, 1, "#72efdd"),
    createFighter("p2", "2P", selectedP2, selectedGearP2, VIEW_WIDTH - 110 - PLAYER_W, -1, "#ff70a6")
  ];
  screenMode = "battle";
  paused = false;
  pauseOverlay.classList.add("hidden");
  countdownTimer = 3;
  fightBannerTimer = 0;
  hitStopTimer = 0;
  koTimer = 0;
  matchTimer = MATCH_TIME;
  suddenDeath = false;
  resultInfo = null;
  Sound.unlock();
  Sound.setBgm("battle");
  Sound.sfx("count");
  stageScreen.classList.add("hidden");
  charScreen.classList.add("hidden");
  resultOverlay.classList.add("hidden");
  battleHud.classList.remove("hidden");
  stageHud.textContent = `🏟️ ${getCurrentStage().name}`;
  updateHud();
}


function startNewSeries() {
  scores.p1 = 0;
  scores.p2 = 0;
  startBattle();
}

function setPaused(v) {
  if (screenMode !== "battle") v = false;
  paused = v;
  pauseOverlay.classList.toggle("hidden", !v);
  if (v) clearInputs();
}

function finishMatch(winner, reason) {
  screenMode = "result";
  koTimer = reason === "time" ? 0.7 : 1.15;
  resultBannerText = reason === "time" ? "TIME UP!" : "K.O.!";
  resultInfo = { winner, reason };
  if (winner) scores[winner.id] += 1;
  pulses = [];
  shockwaves = [];
  hazardZones = [];
  slotMachines = [];
  ufoDrones = [];
  fieldItems = [];
  for (const f of fighters) {
    f.invincibleTimer = 0;
    f.starTimer = 0;
    f.orbitTimer = 0;
    f.stealthTimer = 0;
    f.barrierTimer = 0;
    f.bandageChangeTimer = 0;
    f.mindChargeTimer = 0;
    f.dashStrikeTimer = 0;
    f.meteorSlamActive = false;
    f.isChargingPulse = false;
    f.pulseChargeTime = 0;
    f.warpBeacon = null;
    f.atlasPin = null;
  }
  triggerScreenShake(0.38, 12);
  if (winner) {
    const wx = winner.x + winner.w / 2;
    const wy = winner.y + winner.h / 2;
    spawnImpactFlash(wx, wy, "#ffd166", 112, 0.42);
    spawnParticles(wx, wy, 34, "#ffd166");
  }
  Sound.sfx("ko");
  updateHud();
}

function handleTimeUp() {
  const a = fighters[0];
  const b = fighters[1];
  if (a.hp !== b.hp) {
    finishMatch(a.hp > b.hp ? a : b, "time");
  } else {
    suddenDeath = true;
    fighters.forEach((f) => { f.hp = 1; });
    spawnPopup(VIEW_WIDTH / 2, 150, "💀 SUDDEN DEATH!! 💀", "#ff5c8a");
    triggerScreenShake(0.3, 6);
    Sound.sfx("sudden");
    updateHud();
  }
}

function showResultOverlay() {
  const info = resultInfo || { winner: null, reason: "ko" };
  resultTitle.textContent = info.winner
    ? `🏆 ${info.winner.label} ${info.winner.emoji} の勝利！`
    : "🤝 引き分け！";
  resultSub.textContent =
    (info.reason === "time" ? "タイムアップ判定（残りHPが多い方の勝ち）　" : "") +
    `通算  1P ${scores.p1} - ${scores.p2} 2P`;
  resultOverlay.classList.remove("hidden");
  if (window.gsap && !prefersReducedMotion) {
    const title = resultOverlay.querySelector("h2");
    const subtitle = resultOverlay.querySelector(".result-sub");
    const buttons = resultOverlay.querySelectorAll(".result-actions button");
    gsap.fromTo(resultOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out", overwrite: true });
    if (title) gsap.fromTo(title, { y: 24, scale: 0.72, rotation: -3, opacity: 0 }, {
      y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.62, ease: "back.out(1.7)", delay: 0.08, overwrite: true
    });
    if (subtitle) gsap.fromTo(subtitle, { y: 12, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.38, delay: 0.2, ease: "power2.out", overwrite: true
    });
    if (buttons.length) gsap.fromTo(buttons, { y: 18, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.34, stagger: 0.07, delay: 0.26, ease: "power2.out", overwrite: true
    });
  }
  if (info.winner) celebrateVictory();
  Sound.sfx("win");
}

function isSpecialActive(f) {
  return (
    f.bandageChangeTimer > 0 ||
    f.barrierTimer > 0 ||
    f.stealthTimer > 0 ||
    f.dashStrikeTimer > 0 ||
    f.meteorSlamActive ||
    f.mindChargeTimer > 0
  );
}

function formatSpBadge(f, keyHint) {
  if (f.def.specialType === "bandage_change") {
    const remaining = Math.max(0, (f.def.bandageChangeLimit || 2) - (f.bandageChangesUsed || 0));
    if (f.bandageChangeTimer > 0) {
      return `<span class="sp-badge active">${keyHint} 🩹包帯交換中 ${f.bandageChangeTimer.toFixed(1)}s</span>`;
    }
    if (remaining <= 0) return `<span class="sp-badge cd">${keyHint} 包帯交換 残0回</span>`;
    if (f.hp >= f.maxHp) return `<span class="sp-badge">${keyHint} HP満タン</span>`;
    if (!f.onGround) return `<span class="sp-badge">${keyHint} 着地して使用</span>`;
    if (f.specialCooldown <= 0) return `<span class="sp-badge">${keyHint} 🩹交換OK 残${remaining}回</span>`;
    const pct = Math.max(0, Math.min(100, (1 - f.specialCooldown / (f.def.specialCooldown || 1)) * 100));
    return `<span class="sp-badge cd" style="--p:${pct.toFixed(0)}%">${keyHint} 🩹CT ${f.specialCooldown.toFixed(1)}s 残${remaining}回</span>`;
  }
  if (f.mindChargeTimer > 0) {
    return `<span class="sp-badge active">${keyHint} 💥臨界チャージ中!</span>`;
  }
  if (isSpecialActive(f)) {
    return `<span class="sp-badge active">${keyHint} 効果中</span>`;
  }
  if (f.warpBeacon) {
    return `<span class="sp-badge active">${keyHint} 🈁ワープOK</span>`;
  }
  if (f.atlasPin) {
    return `<span class="sp-badge active">${keyHint} 📍起爆OK</span>`;
  }
  if (f.specialCooldown <= 0) {
    if (f.def.specialType === "transform_angel_devil" && f.def.morphTarget) {
      return `<span class="sp-badge">${keyHint} →${f.def.morphTarget}変身OK</span>`;
    }
    return `<span class="sp-badge">${keyHint} 特殊OK</span>`;
  }
  const pct = Math.max(0, Math.min(100, (1 - f.specialCooldown / (f.def.specialCooldown || 1)) * 100));
  return `<span class="sp-badge cd" style="--p:${pct.toFixed(0)}%">${keyHint} ${f.specialCooldown.toFixed(1)}s</span>`;
}

function updateHud() {
  const f1 = fighters[0];
  const f2 = fighters[1];
  if (!f1 || !f2) return;
  const statusIcons = (f) => {
    let s = "";
    if (f.chillTimer > 0) s += "❄️";
    if (f.slowTimer > 0) s += "🟢";
    if (f.starTimer > 0) s += "⭐";
    if (f.orbitTimer > 0) s += "🔥";
    return s;
  };
  const assistBadge = (pid) => {
    const opt = assistOptions[pid];
    if (!opt.autoFire && !opt.autoAim && !opt.fullAuto) return "";
    const label = (opt.autoFire ? "🔄" : "") + (opt.autoAim ? "🎯" : "") + (opt.fullAuto ? "⚡" : "");
    return `<span class="assist-pill" title="アシスト有効">${label}</span>`;
  };
  const hearts = (f) => `<span class="hp-hearts">${"♥".repeat(Math.max(0, f.hp))}${"♡".repeat(Math.max(0, f.maxHp - f.hp))}</span>`;
  const wins = (n) => (n > 0 ? `<span class="wins">🏆${n}</span>` : "");
  p1Hud.innerHTML = `1P ${f1.emoji}${f1.gearEmoji || ""}${statusIcons(f1)} ${hearts(f1)} ${formatSpBadge(f1, "Q")} ${assistBadge("p1")} ${wins(scores.p1)}`;
  p2Hud.innerHTML = `${wins(scores.p2)} ${assistBadge("p2")} 2P ${f2.emoji}${f2.gearEmoji || ""}${statusIcons(f2)} ${hearts(f2)} ${formatSpBadge(f2, "左Click")}`;
  const timeText = suddenDeath ? "💀 SUDDEN DEATH" : `⏱ ${Math.max(0, Math.ceil(matchTimer))}`;
  stageHud.textContent = `🏟️ ${getCurrentStage().name} ｜ ${timeText}`;
  stageHud.classList.toggle("warn", suddenDeath || (screenMode === "battle" && countdownTimer <= 0 && matchTimer <= 10));
}

function spawnParticles(x, y, count, color) {
  const safeCount = Math.max(0, Math.min(64, Math.floor(count)));
  for (let i = 0; i < safeCount; i++) {
    const angle = (Math.PI * 2 * i / Math.max(1, safeCount)) + (Math.random() - 0.5) * 0.72;
    const speed = 72 + Math.random() * 205;
    const life = 0.28 + Math.random() * 0.34;
    const shape = i % 4 === 0 ? "spark" : i % 3 === 0 ? "circle" : "diamond";
    particles.push({
      x: x + (Math.random() - 0.5) * 9,
      y: y + (Math.random() - 0.5) * 9,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 24,
      gravity: 230 + Math.random() * 180,
      size: 2 + Math.random() * 4.5,
      life,
      maxLife: life,
      color,
      shape,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 9
    });
  }
  if (particles.length > 260) particles.splice(0, particles.length - 260);
}

function spawnImpactFlash(x, y, color = "#ffffff", maxRadius = 48, life = 0.22) {
  impactFlashes.push({ x, y, color, maxRadius, life, maxLife: life });
  if (impactFlashes.length > 48) impactFlashes.shift();
}

function spawnPopup(x, y, text, color = "#ffd166") {
  floatingPopups.push({
    x,
    y,
    text,
    color,
    age: 0,
    life: 0.95,
    maxLife: 0.95
  });
}

function spawnFieldItem() {
  if (fieldItems.length >= 2) return;
  const stage = getCurrentStage();
  const candidates = [
    { x: 160 + Math.random() * 640, y: GROUND_Y - 22 }
  ];
  for (const p of stage.platforms) {
    if (p.type === "shelf" && p.w >= 110) {
      candidates.push({
        x: p.x + 28 + Math.random() * (p.w - 56),
        y: p.y - 22
      });
    }
  }
  const spot = candidates[Math.floor(Math.random() * candidates.length)];
  const chosenType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  const def = ITEM_DEFS[chosenType];

  fieldItems.push({
    type: def.type,
    emoji: def.emoji,
    label: def.label,
    color: def.color,
    x: spot.x,
    y: spot.y,
    baseY: spot.y,
    radius: 18,
    age: 0,
    life: 14.0
  });
  spawnParticles(spot.x, spot.y, 12, def.color);
}

function applyItemEffect(fighter, item) {
  const cx = fighter.x + fighter.w / 2;
  const cy = fighter.y + fighter.h / 2;
  Sound.sfx("item");
  fighter.squashX = 1.28;
  fighter.squashY = 0.78;
  spawnParticles(cx, cy, 18, item.color);

  if (item.type === "heal") {
    if (fighter.hp < fighter.maxHp) {
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + 1);
      spawnPopup(cx, cy - 26, "💖 HP +1!", "#ff5c8a");
    } else {
      spawnPopup(cx, cy - 26, "💖 MAX HP BONUS!", "#ff5c8a");
      shockwaves.push({
        ownerId: fighter.id,
        x: cx,
        y: cy,
        maxRadius: 95,
        radius: 14,
        life: 0.25,
        maxLife: 0.25,
        color: "#ff5c8a",
        knockVx: 440,
        hitIds: new Set()
      });
    }
  } else if (item.type === "star") {
    fighter.starTimer = ITEM_DEFS.star.duration;
    spawnPopup(cx, cy - 26, "⭐ 無敵スター！", "#ffd166");
  } else if (item.type === "orbit") {
    fighter.orbitTimer = ITEM_DEFS.orbit.duration;
    fighter.orbitHitCooldown = 0;
    spawnPopup(cx, cy - 26, "🔥 回転ファイア！", "#ff9f1c");
  }
  updateHud();
}

function triggerPulse(fighter, chargeRatio = 0) {
  if (fighter.pulseCooldown > 0 || fighter.mindChargeTimer > 0) return;
  fighter.pulseTimer = PULSE_DURATION;
  fighter.pulseCooldown = fighter.def.pulseCooldown * (fighter.gear.pulseCooldownMultiplier || 1);
  Sound.sfx("shoot", chargeRatio);
  fighter.squashX = 1.2;
  fighter.squashY = 0.85;
  if (fighter.stealthTimer > 0) {
    fighter.stealthTimer = 0;
    if (fighter.pendingSpecialCooldown > 0) {
      fighter.specialCooldown = fighter.pendingSpecialCooldown;
      fighter.pendingSpecialCooldown = 0;
    }
  }

  if (fighter.def.attackLungeSpeed) {
    fighter.vx = fighter.facing * Math.max(Math.abs(fighter.vx), fighter.def.attackLungeSpeed);
  }

  const cx = fighter.x + fighter.w / 2;
  const cy = fighter.y + fighter.h / 2;
  const clampedRatio = Math.max(0, Math.min(1, chargeRatio));
  const rangeLife =
    fighter.def.minPulseRangeLife +
    (fighter.def.maxPulseRangeLife - fighter.def.minPulseRangeLife) * clampedRatio * (fighter.gear.pulseRangeMultiplier || 1);

  const style = fighter.def.projectileStyle || "mega_wave";
  const isBullet = style === "bullet";
  const isBounceBall = style === "bounce_ball";
  const isPoopBomb = style === "poop_bomb";
  const isSlimeDrop = style === "slime_drop";
  const baseKnock = fighter.def.baseKnockVx || 380;

  const clownColors = ["#ff5c8a", "#ffd166", "#72efdd", "#c77dff"];
  const randomClownColor = clownColors[Math.floor(Math.random() * clownColors.length)];
  const projColor =
    fighter.def.projectileColorOverride ||
    (isBullet ? "#ffd166" : isBounceBall ? randomClownColor : fighter.accentColor);
  const projectileLife = fighter.def.returningProjectile
    ? rangeLife * 1.75
    : isSlimeDrop
      ? Math.max(rangeLife, 0.48)
      : rangeLife;

  pulses.push({
    ownerId: fighter.id,
    playerColor: fighter.accentColor,
    style,
    x: cx + fighter.facing * (isBullet ? 20 : 22),
    y: fighter.def.groundWave ? GROUND_Y - 10 : cy,
    baseY: fighter.def.groundWave ? GROUND_Y - 10 : cy,
    vx: fighter.facing * fighter.def.pulseSpeed * (fighter.gear.pulseSpeedMultiplier || 1),
    vy: isBounceBall ? -320 - clampedRatio * 120 : isPoopBomb ? -210 - clampedRatio * 95 : isSlimeDrop ? -195 - clampedRatio * 75 : 0,
    gravity: isBounceBall ? 1350 : isPoopBomb ? 980 : isSlimeDrop ? 1050 : 0,
    dir: fighter.facing,
    radius: fighter.def.pulseRadius * (fighter.gear.pulseRadiusMultiplier || 1),
    knockVx: (baseKnock + clampedRatio * 65) * (fighter.gear.knockbackMultiplier || 1),
    chillDuration: fighter.def.chillOnHit || 0,
    homingStrength: fighter.def.homingStrength || 0,
    waveAmplitude: fighter.def.waveAmplitude || 0,
    waveFrequency: fighter.def.waveFrequency || 0,
    groundWave: !!fighter.def.groundWave,
    phaseWalls: !!fighter.def.phaseWalls,
    ricochets: fighter.def.ricochetCount || 0,
    impactBurstRadius: fighter.def.impactBurstRadius || 0,
    slimePoolDuration: fighter.def.slimePoolDuration || 0,
    returningProjectile: !!fighter.def.returningProjectile,
    returnAt: rangeLife * 0.55,
    life: projectileLife,
    maxLife: projectileLife,
    age: 0,
    color: projColor
  });

  if (fighter.def.shockwaveRadius > 0) {
    shockwaves.push({
      ownerId: fighter.id,
      x: cx,
      y: cy,
      maxRadius: fighter.def.shockwaveRadius,
      radius: 12,
      life: 0.22,
      maxLife: 0.22,
      color: fighter.accentColor,
      knockVx: 400,
      hitIds: new Set()
    });
  }

  spawnParticles(cx + fighter.facing * 22, cy, isBullet ? 8 : 12, projColor);
  spawnImpactFlash(cx + fighter.facing * 22, cy, projColor, 34, 0.16);
  if (style === "party_popper") {
    shockwaves.push({
      ownerId: fighter.id, x: cx + fighter.facing * 18, y: cy,
      maxRadius: 38, radius: 10, life: 0.16, maxLife: 0.16,
      color: "#ffd166", knockVx: 220, hitIds: new Set()
    });
    spawnParticles(cx + fighter.facing * 18, cy, 10, "#ffd166");
  }
}

function createSlimePool(pl, x, y) {
  hazardZones.push({
    ownerId: pl.ownerId,
    type: "slime_pool",
    x: Math.max(34, Math.min(VIEW_WIDTH - 34, x)),
    y: Math.min(GROUND_Y, y),
    radius: 46,
    life: pl.slimePoolDuration || 1.45,
    maxLife: pl.slimePoolDuration || 1.45,
    color: "#8dff7a"
  });
  spawnParticles(x, y - 3, 12, "#8dff7a");
}

function spawnProjectileImpact(pl, x, y, hitTargetId = null) {
  spawnImpactFlash(x, y, pl.color || "#ffd166", Math.max(34, pl.impactBurstRadius || 0), 0.22);
  if (pl.impactBurstRadius > 0) {
    shockwaves.push({
      ownerId: pl.ownerId,
      x,
      y,
      maxRadius: pl.impactBurstRadius,
      radius: 9,
      life: 0.24,
      maxLife: 0.24,
      color: pl.color || "#ff9f1c",
      knockVx: Math.max(360, (pl.knockVx || 380) * 0.85),
      hitIds: hitTargetId ? new Set([hitTargetId]) : new Set()
    });
    spawnParticles(x, y, 16, pl.color || "#ff9f1c");
  }
  if (pl.slimePoolDuration > 0) {
    createSlimePool(pl, x, GROUND_Y);
  }
}

function triggerJokerBurst(ownerId, playerColor, x, y, dir) {
  const modes = ["shockwave", "freeze", "scatter", "sniper"];
  const chosen = modes[Math.floor(Math.random() * modes.length)];

  if (chosen === "shockwave") {
    spawnPopup(x, y - 18, "🃏 💥JOKER BOOM!", "#ff5c8a");
    shockwaves.push({
      ownerId,
      x,
      y,
      maxRadius: 96,
      radius: 14,
      life: 0.26,
      maxLife: 0.26,
      color: "#ff5c8a",
      knockVx: 500,
      hitIds: new Set()
    });
    spawnParticles(x, y, 22, "#ff5c8a");
  } else if (chosen === "freeze") {
    spawnPopup(x, y - 18, "🃏 ❄️JOKER FREEZE!", "#70e4ff");
    shockwaves.push({
      ownerId,
      x,
      y,
      maxRadius: 86,
      radius: 14,
      life: 0.24,
      maxLife: 0.24,
      color: "#70e4ff",
      knockVx: 390,
      chillDuration: 2.1,
      hitIds: new Set()
    });
    spawnParticles(x, y, 20, "#70e4ff");
  } else if (chosen === "scatter") {
    spawnPopup(x, y - 18, "🃏 🎪TRICK BALLS!", "#ffd166");
    const angles = [-2.5, -1.9, -1.25, -0.6];
    const colors = ["#ff5c8a", "#ffd166", "#72efdd", "#c77dff"];
    angles.forEach((ang, idx) => {
      pulses.push({
        ownerId,
        playerColor,
        style: "bounce_ball",
        x,
        y: y - 4,
        vx: Math.cos(ang) * 430,
        vy: Math.sin(ang) * 430,
        gravity: 1150,
        dir: Math.cos(ang) >= 0 ? 1 : -1,
        radius: 14,
        knockVx: 390,
        life: 0.58,
        maxLife: 0.58,
        age: 0,
        color: colors[idx % colors.length]
      });
    });
    spawnParticles(x, y, 18, "#ffd166");
  } else {
    spawnPopup(x, y - 18, "🃏 ⚡ACE SHOT!", "#c77dff");
    const target = fighters.find((f) => f.id !== ownerId);
    const aimAngle = target
      ? Math.atan2(target.y + target.h / 2 - y, target.x + target.w / 2 - x)
      : dir > 0
      ? 0
      : Math.PI;
    pulses.push({
      ownerId,
      playerColor,
      style: "joker_card",
      isSubCard: true,
      x,
      y,
      vx: Math.cos(aimAngle) * 760,
      vy: Math.sin(aimAngle) * 760,
      dir: Math.cos(aimAngle) >= 0 ? 1 : -1,
      radius: 18,
      knockVx: 470,
      life: 0.55,
      maxLife: 0.55,
      age: 0,
      color: "#c77dff"
    });
    spawnParticles(x, y, 16, "#c77dff");
  }
}

function triggerSpecialAction(fighter) {
  if (fighter.specialCooldown > 0 || isSpecialActive(fighter) || screenMode !== "battle") return;

  const type = fighter.def.specialType;
  const cx = fighter.x + fighter.w / 2;
  const cy = fighter.y + fighter.h / 2;
  Sound.sfx("special");

  if (type === "bandage_change") {
    const limit = fighter.def.bandageChangeLimit || 2;
    if ((fighter.bandageChangesUsed || 0) >= limit) {
      spawnPopup(cx, cy - 28, "🩹 包帯はもう残っていない！", "#ff5c8a");
      return;
    }
    if (!fighter.onGround) {
      spawnPopup(cx, cy - 28, "🩹 地上で包帯交換してね", "#ffd166");
      return;
    }
    if (fighter.hp >= fighter.maxHp) {
      spawnPopup(cx, cy - 28, "🩹 HPは満タン！", "#72efdd");
      return;
    }

    fighter.bandageChangesUsed = (fighter.bandageChangesUsed || 0) + 1;
    fighter.bandageChangeTimer = fighter.def.bandageChangeDuration || 2.4;
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.onGround = true;
    fighter.isChargingPulse = false;
    fighter.pulseChargeTime = 0;
    fighter.squashX = 0.88;
    fighter.squashY = 1.12;
    spawnPopup(cx, cy - 30, "🩹 包帯交換開始！", "#ffd166");
    spawnParticles(cx, cy, 14, "#fff1d0");
    updateHud();
    return;
  } else if (type === "mind_explosion") {
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.mindChargeMax = fighter.def.chargeDuration || 0.45;
    fighter.mindChargeTimer = fighter.mindChargeMax;
    fighter.vx *= 0.25;
    fighter.vy = Math.min(fighter.vy, -120);
    fighter.squashX = 0.78;
    fighter.squashY = 1.28;
    spawnPopup(cx, cy - 30, "🤯 CHARGING...!", "#ff9f1c");
    spawnParticles(cx, cy, 16, "#ff9f1c");
  } else if (type === "poop_flush") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.28;
    fighter.squashY = 0.76;

    spawnPopup(cx, cy - 28, "🚽 FLUSH TORNADO!", "#70e4ff");
    shockwaves.push({
      ownerId: fighter.id,
      x: cx,
      y: cy,
      maxRadius: 90,
      radius: 14,
      life: 0.26,
      maxLife: 0.26,
      color: "#70e4ff",
      knockVx: 460,
      hitIds: new Set()
    });

    const angles = [-0.62, -0.25, 0.14];
    for (const ang of angles) {
      const speed = 510;
      pulses.push({
        ownerId: fighter.id,
        playerColor: fighter.accentColor,
        style: "poop_bomb",
        x: cx + fighter.facing * 20,
        y: cy - 4,
        vx: Math.cos(ang) * speed * fighter.facing,
        vy: Math.sin(ang) * speed - 80,
        gravity: 960,
        dir: fighter.facing,
        radius: 19,
        knockVx: 410,
        life: 0.62,
        maxLife: 0.62,
        age: 0,
        color: "#b08968"
      });
    }
    spawnParticles(cx, cy, 20, "#70e4ff");
    spawnParticles(cx, cy, 14, "#b08968");
  } else if (type === "atlas_waypoint") {
    if (!fighter.atlasPin) {
      fighter.atlasPin = {
        x: cx,
        y: cy,
        facing: fighter.facing
      };
      fighter.squashX = 1.24;
      fighter.squashY = 0.8;
      spawnPopup(cx, cy - 26, "📍 WAYPOINT SET!", "#ffd166");
      spawnParticles(cx, cy, 16, "#ffd166");
    } else {
      const px = fighter.atlasPin.x;
      const py = fighter.atlasPin.y;
      const pDir = fighter.facing;
      fighter.atlasPin = null;
      fighter.specialCooldown = fighter.def.specialCooldown;
      fighter.squashX = 1.26;
      fighter.squashY = 0.8;

      spawnPopup(px, py - 24, "🗺️ ATLAS STRIKE!", "#72efdd");
      shockwaves.push({
        ownerId: fighter.id,
        x: px,
        y: py,
        maxRadius: 96,
        radius: 14,
        life: 0.26,
        maxLife: 0.26,
        color: "#ffd166",
        knockVx: 480,
        hitIds: new Set()
      });

      const angles = [-0.42, 0, 0.42];
      for (const ang of angles) {
        const speed = 640;
        pulses.push({
          ownerId: fighter.id,
          playerColor: fighter.accentColor,
          style: "compass_arrow",
          x: px,
          y: py,
          vx: Math.cos(ang) * speed * pDir,
          vy: Math.sin(ang) * speed,
          dir: pDir,
          radius: 20,
          knockVx: 400,
          life: 0.48,
          maxLife: 0.48,
          age: 0,
          color: "#ffd166"
        });
      }
      spawnParticles(px, py, 24, "#ffd166");
    }
  } else if (type === "slot_jackpot") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.26;
    fighter.squashY = 0.8;
    const roll = Math.random();
    const outcome = roll < 0.38 ? "jackpot" : roll < 0.82 ? "coin_shower" : "bomb_miss";
    slotMachines.push({
      ownerId: fighter.id,
      playerColor: fighter.accentColor,
      x: cx,
      y: fighter.y - 34,
      facing: fighter.facing,
      spinTimer: 0.55,
      outcome
    });
    spawnParticles(cx, fighter.y - 24, 14, "#ffd166");
  } else if (type === "joker_card") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.26;
    fighter.squashY = 0.8;
    pulses.push({
      ownerId: fighter.id,
      playerColor: fighter.accentColor,
      style: "joker_card",
      isSubCard: false,
      x: cx + fighter.facing * 24,
      y: cy,
      vx: fighter.facing * 670,
      vy: 0,
      dir: fighter.facing,
      radius: 21,
      knockVx: 420,
      life: 0.55,
      maxLife: 0.55,
      age: 0,
      color: "#ff5c8a"
    });
    spawnParticles(cx + fighter.facing * 22, cy, 14, "#ffd166");
  } else if (type === "warp_beacon") {
    if (!fighter.warpBeacon) {
      fighter.warpBeacon = {
        x: cx,
        y: cy
      };
      fighter.squashX = 1.25;
      fighter.squashY = 0.8;
      spawnParticles(cx, cy, 16, "#4cc9f0");
    } else {
      const destX = fighter.warpBeacon.x - fighter.w / 2;
      const destY = fighter.warpBeacon.y - fighter.h / 2;
      spawnParticles(cx, cy, 16, "#4cc9f0");
      fighter.x = Math.max(16, Math.min(VIEW_WIDTH - 16 - fighter.w, destX));
      fighter.y = Math.max(16, Math.min(GROUND_Y - fighter.h, destY));
      fighter.vy = Math.min(0, fighter.vy);
      fighter.warpBeacon = null;
      fighter.specialCooldown = fighter.def.specialCooldown;
      fighter.squashX = 0.72;
      fighter.squashY = 1.32;
      shockwaves.push({
        ownerId: fighter.id,
        x: fighter.x + fighter.w / 2,
        y: fighter.y + fighter.h / 2,
        maxRadius: 62,
        radius: 12,
        life: 0.2,
        maxLife: 0.2,
        color: "#4cc9f0",
        knockVx: 360,
        hitIds: new Set()
      });
      spawnParticles(fighter.x + fighter.w / 2, fighter.y + fighter.h / 2, 20, "#ffd166");
    }
  } else if (type === "ufo_airstrike") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.24;
    fighter.squashY = 0.82;
    const startX = Math.max(60, Math.min(VIEW_WIDTH - 60, cx - fighter.facing * 40));
    ufoDrones.push({
      ownerId: fighter.id,
      playerColor: fighter.accentColor,
      x: startX,
      y: 66,
      vx: fighter.facing * 260,
      dropsLeft: 3,
      dropTimer: 0.12,
      life: 1.25
    });
    spawnParticles(startX, 66, 16, "#b5179e");
  } else if (type === "blizzard_nova") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.28;
    fighter.squashY = 0.78;
    shockwaves.push({
      ownerId: fighter.id,
      x: cx,
      y: cy,
      maxRadius: 88,
      radius: 14,
      life: 0.25,
      maxLife: 0.25,
      color: "#70e4ff",
      knockVx: 410,
      chillDuration: 2.2,
      hitIds: new Set()
    });
    const angles = [-0.28, 0, 0.28];
    for (const ang of angles) {
      const speed = 640;
      pulses.push({
        ownerId: fighter.id,
        playerColor: fighter.accentColor,
        style: "ice_crystal",
        x: cx + fighter.facing * 22,
        y: cy,
        vx: Math.cos(ang) * speed * fighter.facing,
        vy: Math.sin(ang) * speed,
        dir: fighter.facing,
        radius: 20,
        knockVx: 390,
        chillDuration: 2.2,
        life: 0.42,
        maxLife: 0.42,
        age: 0,
        color: "#70e4ff"
      });
    }
    spawnParticles(cx, cy, 20, "#70e4ff");
    spawnParticles(cx + fighter.facing * 20, cy, 10, "#ffffff");
  } else if (type === "transform_angel_devil") {
    const nextEmoji = fighter.def.morphTarget || (fighter.emoji === "😇" ? "😈" : "😇");
    const nextDef = CHARACTER_DEFS[nextEmoji];
    fighter.emoji = nextEmoji;
    fighter.def = nextDef;
    fighter.specialCooldown = nextDef.specialCooldown;
    fighter.squashX = 1.35;
    fighter.squashY = 0.72;
    if (!fighter.onGround) {
      fighter.vy = Math.min(fighter.vy, -240);
    }
    const morphColor = nextEmoji === "😈" ? "#ff5c8a" : "#ffd166";
    shockwaves.push({
      ownerId: fighter.id,
      x: cx,
      y: cy,
      maxRadius: 56,
      radius: 14,
      life: 0.2,
      maxLife: 0.2,
      color: morphColor,
      knockVx: 320,
      hitIds: new Set()
    });
    spawnParticles(cx, cy, 20, morphColor);
  } else if (type === "dash_strike") {
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.dashStrikeTimer = fighter.def.dashDuration;
    fighter.dashStrikeHitIds.clear();
    fighter.vx = fighter.facing * fighter.def.dashSpeed;
    fighter.vy = 0;
    fighter.squashX = 1.32;
    fighter.squashY = 0.75;
    spawnParticles(cx, cy, 14, "#ffd166");
  } else if (type === "meteor_slam") {
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.meteorSlamActive = true;
    fighter.vy = 960;
    fighter.vx *= 0.2;
    fighter.squashX = 0.75;
    fighter.squashY = 1.3;
    spawnParticles(cx, cy, 12, "#c77dff");
  } else if (type === "barrier") {
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.barrierTimer = fighter.def.barrierDuration;
    fighter.squashX = 1.15;
    fighter.squashY = 0.9;
    spawnParticles(cx, cy, 12, "#72efdd");
  } else if (type === "stealth") {
    fighter.pendingSpecialCooldown = fighter.def.specialCooldown;
    fighter.stealthTimer = fighter.def.stealthDuration;
    fighter.squashX = 0.82;
    fighter.squashY = 1.2;
    spawnParticles(cx, cy, 14, "#a9b2d4");
  } else if (type === "triple_shot") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.3;
    fighter.squashY = 0.78;
    const angles = [-0.48, 0, 0.48];
    const rangeLife = fighter.def.tripleRangeLife;
    const pColor = fighter.accentColor;
    const subGlow = fighter.id === "p1" ? "#38b6ff" : "#ffd166";

    shockwaves.push({
      ownerId: fighter.id,
      x: cx + fighter.facing * 18,
      y: cy,
      maxRadius: 68,
      radius: 14,
      life: 0.22,
      maxLife: 0.22,
      color: pColor,
      knockVx: 300,
      hitIds: new Set()
    });

    for (const ang of angles) {
      const speed = 760;
      pulses.push({
        ownerId: fighter.id,
        playerColor: pColor,
        secondaryColor: subGlow,
        style: "cool_triple_wave",
        x: cx + fighter.facing * 22,
        y: cy,
        vx: Math.cos(ang) * speed * fighter.facing,
        vy: Math.sin(ang) * speed,
        dir: fighter.facing,
        radius: 26,
        knockVx: 430,
        life: rangeLife,
        maxLife: rangeLife,
        age: 0,
        color: pColor
      });
    }
    spawnParticles(cx + fighter.facing * 24, cy, 18, pColor);
    spawnParticles(cx + fighter.facing * 24, cy, 10, subGlow);
  } else if (type === "mega_quake") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.28;
    fighter.squashY = 0.78;
    shockwaves.push({
      ownerId: fighter.id,
      x: cx,
      y: cy,
      maxRadius: fighter.def.megaQuakeRadius,
      radius: 14,
      life: 0.26,
      maxLife: 0.26,
      color: "#ffd166",
      knockVx: 500,
      hitIds: new Set()
    });
    spawnParticles(cx, cy, 18, "#ffd166");
  } else if (type === "long_snipe") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.25;
    fighter.squashY = 0.82;
    const rangeLife = fighter.def.snipeRangeLife;
    pulses.push({
      ownerId: fighter.id,
      playerColor: fighter.accentColor,
      style: "bullet",
      x: cx + fighter.facing * 22,
      y: cy,
      vx: fighter.facing * fighter.def.snipeSpeed,
      vy: 0,
      dir: fighter.facing,
      radius: 9,
      knockVx: 540,
      life: rangeLife,
      maxLife: rangeLife,
      age: 0,
      color: "#ff5c8a"
    });
    spawnParticles(cx + fighter.facing * 24, cy, 12, "#ffd166");
  } else if (type === "boomerang") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.24;
    fighter.squashY = 0.82;
    pulses.push({
      ownerId: fighter.id,
      playerColor: fighter.accentColor,
      style: "boomerang",
      x: cx + fighter.facing * 22,
      y: cy,
      vx: fighter.facing * 640,
      vy: 0,
      accelX: -fighter.facing * 1350,
      dir: fighter.facing,
      radius: 25,
      knockVx: 470,
      life: 0.95,
      maxLife: 0.95,
      age: 0,
      color: "#c77dff"
    });
    spawnParticles(cx + fighter.facing * 24, cy, 12, "#c77dff");
  } else if (type === "melt_pool") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.32;
    fighter.squashY = 0.72;
    hazardZones.push({
      ownerId: fighter.id,
      x: cx,
      y: fighter.y + fighter.h,
      radius: 56,
      life: 3.0,
      maxLife: 3.0,
      color: "#ffd166"
    });
    spawnParticles(cx, fighter.y + fighter.h, 16, "#ffd166");
  } else if (type === "mystic_orb") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.24;
    fighter.squashY = 0.82;
    const orbX = Math.max(40, Math.min(VIEW_WIDTH - 40, cx + fighter.facing * 54));
    const orbY = cy - 8;
    spawnPopup(orbX, orbY - 24, "🪬 ORACLE EYE!", "#4cc9f0");
    hazardZones.push({
      ownerId: fighter.id, type: "mystic_orb", x: orbX, y: orbY,
      radius: 34, life: 3.4, maxLife: 3.4, color: "#4cc9f0",
      hitIds: new Set()
    });
    spawnParticles(orbX, orbY, 18, "#4cc9f0");
  } else if (type === "mecha_barrage") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.squashX = 1.28;
    fighter.squashY = 0.78;
    fighter.hoverTimer = 0.62;
    fighter.vy = -210;
    spawnPopup(cx, cy - 28, "🤖 MISSILE LOCK!", "#72efdd");
    const angles = [0.28, 0.48, 0.68, 0.88]; // 前方から斜め下へ広がる4発
    angles.forEach((ang, idx) => {
      const speed = 570 + idx * 30;
      pulses.push({
        ownerId: fighter.id, playerColor: fighter.accentColor,
        style: "mecha_missile", x: cx + fighter.facing * 20,
        y: cy - 10 + idx * 4, vx: Math.cos(ang) * speed * fighter.facing,
        vy: Math.sin(ang) * speed, dir: fighter.facing,
        radius: 15, knockVx: 410, life: 0.68, maxLife: 0.68,
        age: 0, color: "#ff9f1c"
      });
    });
    spawnParticles(cx, cy, 20, "#72efdd");
  } else if (type === "party_carnival") {
    fighter.specialCooldown = fighter.def.specialCooldown;
    fighter.pulseTimer = PULSE_DURATION;
    fighter.squashX = 1.32;
    fighter.squashY = 0.74;
    spawnPopup(cx, cy - 30, "🥳 PARTY TIME!!", "#ffd166");
    shockwaves.push({
      ownerId: fighter.id, x: cx, y: cy, maxRadius: 84,
      radius: 14, life: 0.24, maxLife: 0.24,
      color: "#ff5c8a", knockVx: 430, hitIds: new Set()
    });
    const partyColors = ["#ff5c8a", "#ffd166", "#72efdd", "#c77dff", "#4cc9f0", "#ff9f1c"];
    const angles = [-2.55, -2.2, -1.85, -1.3, -0.95, -0.6];
    angles.forEach((ang, idx) => {
      pulses.push({
        ownerId: fighter.id, playerColor: fighter.accentColor,
        style: "bounce_ball", x: cx, y: cy - 12,
        vx: Math.cos(ang) * 420, vy: Math.sin(ang) * 440 - 60,
        gravity: 1120, dir: Math.cos(ang) >= 0 ? 1 : -1,
        radius: 16, knockVx: 390, life: 0.72, maxLife: 0.72,
        age: 0, color: partyColors[idx % partyColors.length]
      });
    });
    spawnParticles(cx, cy, 26, "#ffd166");
    spawnParticles(cx, cy, 18, "#ff5c8a");
  }

  updateHud();
}

function hitFighter(target, attackerCenterX, baseKnockVx = 340, chillDuration = 0) {
  if (target.invincibleTimer > 0 || target.starTimer > 0 || screenMode !== "battle") return;
  target.hp -= 1;
  if (target.bandageChangeTimer > 0) {
    target.bandageChangeTimer = 0;
    target.pendingSpecialCooldown = 0;
    target.specialCooldown = target.def.specialCooldown;
    spawnPopup(target.x + target.w / 2, target.y - 30, "🩹 包帯交換中断！", "#ff5c8a");
    spawnParticles(target.x + target.w / 2, target.y + target.h / 2, 12, "#ff5c8a");
  }
  target.invincibleTimer = target.def.invincibleDuration;
  hitStopTimer = Math.max(hitStopTimer, target.hp <= 0 ? 0.16 : 0.07);
  triggerScreenShake(0.14, target.hp <= 0 ? 9 : 4);
  Sound.sfx("hit");
  spawnPopup(target.x + target.w / 2, target.y - 6, "-1", "#ff5c8a");
  spawnImpactFlash(target.x + target.w / 2, target.y + target.h / 2, "#ff5c8a", 58, 0.24);
  if (chillDuration > 0) {
    target.chillTimer = Math.max(target.chillTimer, chillDuration);
    spawnParticles(target.x + target.w / 2, target.y + target.h / 2, 12, "#70e4ff");
  }
  if (target.stealthTimer > 0) {
    target.stealthTimer = 0;
    if (target.pendingSpecialCooldown > 0) {
      target.specialCooldown = target.pendingSpecialCooldown;
      target.pendingSpecialCooldown = 0;
    }
  }
  const pushDir = (target.x + target.w / 2) >= attackerCenterX ? 1 : -1;
  target.vx = pushDir * baseKnockVx * target.def.knockbackScale * (target.gear.knockbackMultiplier || 1);
  target.vy = -340;
  target.onGround = false;
  target.jumpsLeft = 0;
  target.squashX = 1.25;
  target.squashY = 0.78;
  spawnParticles(target.x + target.w / 2, target.y + target.h / 2, 14, "#ff5c8a");
  updateHud();

  if (target.hp <= 0) {
    target.hp = 0;
    finishMatch(fighters.find((f) => f.id !== target.id), "ko");
  }
}

function stepFighter(f, input, dt, platforms) {
  const assist = assistOptions[f.id] || { autoFire: false, autoAim: false, fullAuto: false };
  const opponent = fighters.find((other) => other.id !== f.id);

  if (f.invincibleTimer > 0) f.invincibleTimer = Math.max(0, f.invincibleTimer - dt);
  if (f.starTimer > 0) {
    f.starTimer = Math.max(0, f.starTimer - dt);
    if (Math.random() < 0.5) {
      const starColors = ["#ffd166", "#72efdd", "#ff5c8a", "#c77dff"];
      spawnParticles(
        f.x + f.w / 2,
        f.y + f.h / 2,
        1,
        starColors[Math.floor(Math.random() * starColors.length)]
      );
    }
  }
  if (f.orbitTimer > 0) {
    f.orbitTimer = Math.max(0, f.orbitTimer - dt);
    if (f.orbitHitCooldown > 0) f.orbitHitCooldown = Math.max(0, f.orbitHitCooldown - dt);
  }
  if (f.pulseTimer > 0) f.pulseTimer = Math.max(0, f.pulseTimer - dt);
  if (f.pulseCooldown > 0) f.pulseCooldown = Math.max(0, f.pulseCooldown - dt);
  if (f.chillTimer > 0) {
    f.chillTimer = Math.max(0, f.chillTimer - dt);
    if (Math.random() < 0.25) {
      spawnParticles(f.x + f.w / 2, f.y + f.h / 2, 1, "#70e4ff");
    }
  }
  if (f.slowTimer > 0) {
    f.slowTimer = Math.max(0, f.slowTimer - dt);
  }

  // 包帯交換中はその場から動けず、攻撃・ジャンプもできない
  if (f.bandageChangeTimer > 0) {
    f.bandageChangeTimer = Math.max(0, f.bandageChangeTimer - dt);
    f.vx = 0;
    f.vy = 0;
    f.onGround = true;
    input.jumpPressed = false;
    input.pulseHeld = false;
    input.pulseReleased = false;
    input.specialPressed = false;
    f.isChargingPulse = false;
    f.pulseChargeTime = 0;

    if (Math.random() < 0.45) {
      spawnParticles(f.x + f.w / 2, f.y + f.h / 2, 1, "#fff1d0");
    }
    if (f.bandageChangeTimer <= 0) {
      f.pendingSpecialCooldown = 0;
      f.specialCooldown = f.def.specialCooldown;
      if (f.hp < f.maxHp) {
        f.hp = Math.min(f.maxHp, f.hp + 1);
        spawnPopup(f.x + f.w / 2, f.y - 30, "🩹 HP +1！", "#72efdd");
        spawnParticles(f.x + f.w / 2, f.y + f.h / 2, 22, "#fff1d0");
        Sound.sfx("item");
      } else {
        spawnPopup(f.x + f.w / 2, f.y - 30, "🩹 交換完了！", "#ffd166");
      }
      f.squashX = 1.2;
      f.squashY = 0.82;
      updateHud();
    } else {
      updateHud();
    }
    return;
  }

  if (f.mindChargeTimer > 0) {
    f.mindChargeTimer = Math.max(0, f.mindChargeTimer - dt);
    if (Math.random() < 0.65) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 34;
      spawnParticles(
        f.x + f.w / 2 + Math.cos(ang) * dist,
        f.y + f.h / 2 + Math.sin(ang) * dist,
        1,
        Math.random() < 0.5 ? "#ff5c8a" : "#ffd166"
      );
    }
    if (f.mindChargeTimer === 0) {
      const ex = f.x + f.w / 2;
      const ey = f.y + f.h / 2;
      if (f.pendingSpecialCooldown > 0) {
        f.specialCooldown = f.pendingSpecialCooldown;
        f.pendingSpecialCooldown = 0;
      }
      f.squashX = 1.45;
      f.squashY = 0.65;
      triggerScreenShake(0.28, 9);
      spawnPopup(ex, ey - 32, "🤯 KABOOOM!!", "#ff5c8a");
      Sound.sfx("boom");
      shockwaves.push({
        ownerId: f.id,
        x: ex,
        y: ey,
        maxRadius: f.def.explosionRadius || 155,
        radius: 18,
        life: 0.30,
        maxLife: 0.30,
        color: "#ff5c8a",
        knockVx: 660,
        hitIds: new Set()
      });
      shockwaves.push({
        ownerId: f.id,
        x: ex,
        y: ey,
        maxRadius: (f.def.explosionRadius || 155) * 0.72,
        radius: 12,
        life: 0.24,
        maxLife: 0.24,
        color: "#ffd166",
        knockVx: 660,
        hitIds: new Set()
      });
      spawnParticles(ex, ey, 36, "#ff5c8a");
      spawnParticles(ex, ey, 28, "#ffd166");
      spawnParticles(ex, ey, 16, "#ffffff");
    }
  }

  if (f.barrierTimer > 0) {
    f.barrierTimer = Math.max(0, f.barrierTimer - dt);
    if (f.barrierTimer === 0 && f.pendingSpecialCooldown > 0) {
      f.specialCooldown = f.pendingSpecialCooldown;
      f.pendingSpecialCooldown = 0;
    }
  }

  if (f.stealthTimer > 0) {
    f.stealthTimer = Math.max(0, f.stealthTimer - dt);
    if (f.stealthTimer === 0 && f.pendingSpecialCooldown > 0) {
      f.specialCooldown = f.pendingSpecialCooldown;
      f.pendingSpecialCooldown = 0;
    }
  }

  if (!isSpecialActive(f) && !f.warpBeacon && !f.atlasPin && f.specialCooldown > 0) {
    f.specialCooldown = Math.max(0, f.specialCooldown - dt * (f.gear.specialCooldownRate || 1));
  }

  // 攻撃チャージ＆オートチャージ連射＆フルオート攻撃アシスト
  const effectivePulseHeld = input.pulseHeld || assist.fullAuto;

  if (effectivePulseHeld && f.pulseCooldown <= 0 && f.mindChargeTimer <= 0) {
    f.isChargingPulse = true;
    f.pulseChargeTime = Math.min(MAX_CHARGE_TIME, f.pulseChargeTime + dt / (f.gear.chargeMultiplier || 1));

    // オートチャージ連射 または フルオート攻撃時は最大チャージで自動発射
    if ((assist.autoFire || assist.fullAuto) && f.pulseChargeTime >= MAX_CHARGE_TIME) {
      triggerPulse(f, 1.0);
      f.isChargingPulse = false;
      f.pulseChargeTime = 0;
    }
  }

  if (input.pulseReleased) {
    input.pulseReleased = false;
    if (f.isChargingPulse && f.pulseCooldown <= 0 && f.mindChargeTimer <= 0) {
      const chargeRatio = f.pulseChargeTime / MAX_CHARGE_TIME;
      triggerPulse(f, chargeRatio);
    }
    f.isChargingPulse = false;
    f.pulseChargeTime = 0;
  }

  if (!effectivePulseHeld && f.isChargingPulse) {
    f.isChargingPulse = false;
    f.pulseChargeTime = 0;
  }

  // 特殊技の発動（手動ボタン または フルオート攻撃時かつクールタイム完了）
  const autoSpecialAllowed = assist.fullAuto && f.def.specialType !== "bandage_change";
  if (input.specialPressed || (autoSpecialAllowed && f.specialCooldown <= 0 && !isSpecialActive(f))) {
    input.specialPressed = false;
    triggerSpecialAction(f);
  }

  // 発動したフレームも移動・ジャンプ・通常攻撃を通さない
  if (f.bandageChangeTimer > 0) {
    f.vx = 0;
    f.vy = 0;
    f.onGround = true;
    input.jumpPressed = false;
    input.pulseHeld = false;
    input.pulseReleased = false;
    input.specialPressed = false;
    f.isChargingPulse = false;
    f.pulseChargeTime = 0;
    updateHud();
    return;
  }

  const chillSpeedFactor = f.chillTimer > 0 ? 0.48 : 1.0;
  const slimeSpeedFactor = f.slowTimer > 0 ? 0.66 : 1.0;

  if (f.dashStrikeTimer > 0) {
    f.dashStrikeTimer = Math.max(0, f.dashStrikeTimer - dt);
    f.vx = f.facing * f.def.dashSpeed * chillSpeedFactor * slimeSpeedFactor;
    if (Math.random() < 0.7) {
      spawnParticles(f.x + f.w / 2, f.y + f.h / 2, 1, "#ffd166");
    }
    if (f.dashStrikeTimer === 0 && f.pendingSpecialCooldown > 0) {
      f.specialCooldown = f.pendingSpecialCooldown;
      f.pendingSpecialCooldown = 0;
    }
  } else {
    const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const chargeSlow = f.mindChargeTimer > 0 ? 0.35 : 1.0;
    const starBonus = f.starTimer > 0 ? 1.24 : 1.0;
    const speedBonus = (f.stealthTimer > 0 ? 1.25 : 1.0) * chillSpeedFactor * slimeSpeedFactor * chargeSlow * starBonus;
    if (moveDir !== 0) {
      f.facing = moveDir;
      const accel = f.onGround ? 2400 : 1500;
      const desiredVx = moveDir * f.def.moveSpeed * (f.gear.moveSpeedMultiplier || 1) * speedBonus;
      if (f.vx < desiredVx) {
        f.vx = Math.min(desiredVx, f.vx + accel * dt);
      } else if (f.vx > desiredVx) {
        f.vx = Math.max(desiredVx, f.vx - accel * dt);
      }
    } else {
      const friction = f.onGround ? 2200 : 800;
      if (Math.abs(f.vx) <= friction * dt) {
        f.vx = 0;
      } else {
        f.vx -= Math.sign(f.vx) * friction * dt;
      }
    }

    // オート振り向きアシスト（フルオート攻撃時も自動追尾）
    if ((assist.autoAim || assist.fullAuto) && opponent && f.hp > 0) {
      const myCenter = f.x + f.w / 2;
      const opCenter = opponent.x + opponent.w / 2;
      if (Math.abs(opCenter - myCenter) > 4) {
        f.facing = opCenter >= myCenter ? 1 : -1;
      }
    }
  }

  if (input.jumpPressed) {
    input.jumpPressed = false;
    const chillJumpFactor = (f.chillTimer > 0 ? 0.84 : 1.0) * (f.slowTimer > 0 ? 0.9 : 1.0);
    if (f.onGround) {
      f.vy = f.def.jumpVel * chillJumpFactor;
      f.onGround = false;
      if (f.meteorSlamActive) {
        f.meteorSlamActive = false;
        if (f.pendingSpecialCooldown > 0) {
          f.specialCooldown = f.pendingSpecialCooldown;
          f.pendingSpecialCooldown = 0;
        }
      }
      f.jumpsLeft = getJumpCapacity(f.def, f.gear) - 1;
      f.squashX = 0.78;
      f.squashY = 1.25;
      spawnParticles(f.x + f.w / 2, f.y + f.h, 6, f.accentColor);
      Sound.sfx("jump");
    } else if (f.jumpsLeft > 0) {
      f.vy = f.def.doubleJumpVel * chillJumpFactor;
      f.jumpsLeft -= 1;
      if (f.meteorSlamActive) {
        f.meteorSlamActive = false;
        if (f.pendingSpecialCooldown > 0) {
          f.specialCooldown = f.pendingSpecialCooldown;
          f.pendingSpecialCooldown = 0;
        }
      }
      f.squashX = 0.75;
      f.squashY = 1.28;
      spawnParticles(f.x + f.w / 2, f.y + f.h, 9, "#ffd166");
      Sound.sfx("djump");
    }
  }

  if (f.hoverTimer > 0) {
    f.hoverTimer = Math.max(0, f.hoverTimer - dt);
    f.vy = 0;
  } else {
    const gravScale = f.mindChargeTimer > 0 ? 0.45 : (f.def.gravityScale || 1.0);
    f.vy += (f.meteorSlamActive ? GRAVITY * 1.6 : GRAVITY * gravScale) * dt;
  }

  f.x += f.vx * dt;
  if (f.x < 16) {
    f.x = 16;
    f.vx = 0;
  }
  if (f.x + f.w > VIEW_WIDTH - 16) {
    f.x = VIEW_WIDTH - 16 - f.w;
    f.vx = 0;
  }

  for (const p of platforms) {
    if (p.type !== "wall") continue;
    const overlapY = f.y + f.h - 4 > p.y && f.y + 4 < p.y + p.h;
    if (overlapY && f.x + f.w > p.x && f.x < p.x + p.w) {
      const fCenter = f.x + f.w / 2;
      const pCenter = p.x + p.w / 2;
      if (fCenter < pCenter) {
        f.x = p.x - f.w;
      } else {
        f.x = p.x + p.w;
      }
      f.vx = 0;
    }
  }

  const prevBottom = f.y + f.h;
  const prevTop = f.y;
  f.y += f.vy * dt;
  const nextBottom = f.y + f.h;
  const nextTop = f.y;
  const wasOnGround = f.onGround;
  f.onGround = false;

  if (f.vy >= 0) {
    for (const p of platforms) {
      const withinX = f.x + f.w - 6 > p.x && f.x + 6 < p.x + p.w;
      if (withinX && prevBottom <= p.y + 8 && nextBottom >= p.y) {
        f.y = p.y - f.h;
        if (!wasOnGround && f.vy > 180) {
          f.squashX = 1.22;
          f.squashY = 0.8;
        }
        if (f.meteorSlamActive) {
          f.meteorSlamActive = false;
          if (f.pendingSpecialCooldown > 0) {
            f.specialCooldown = f.pendingSpecialCooldown;
            f.pendingSpecialCooldown = 0;
          }
          const slamCx = f.x + f.w / 2;
          const slamCy = f.y + f.h - 4;
          shockwaves.push({
            ownerId: f.id,
            x: slamCx,
            y: slamCy,
            maxRadius: f.def.slamShockwaveRadius,
            radius: 14,
            life: 0.24,
            maxLife: 0.24,
            color: "#c77dff",
            knockVx: 450,
            hitIds: new Set()
          });
          spawnParticles(slamCx, slamCy, 16, "#c77dff");
        }
        f.vy = 0;
        f.onGround = true;
        f.jumpsLeft = getJumpCapacity(f.def, f.gear);
        break;
      }
    }
  } else {
    for (const p of platforms) {
      if (p.type !== "wall") continue;
      const withinX = f.x + f.w - 6 > p.x && f.x + 6 < p.x + p.w;
      if (withinX && prevTop >= p.y + p.h - 8 && nextTop <= p.y + p.h) {
        f.y = p.y + p.h;
        f.vy = 0;
        break;
      }
    }
  }

  f.animTime += dt * (Math.abs(f.vx) > 10 ? 12 : 3);
  f.squashX += (1 - f.squashX) * Math.min(1, dt * 16);
  f.squashY += (1 - f.squashY) * Math.min(1, dt * 16);
}

function update(dt) {
  if (paused) return;
  timeElapsed += dt;
  if (fightBannerTimer > 0) fightBannerTimer = Math.max(0, fightBannerTimer - dt);
  if (screenShakeTimer > 0) {
    screenShakeTimer = Math.max(0, screenShakeTimer - dt);
    if (screenShakeTimer === 0) screenShakeMagnitude = 0;
  }

  if (screenMode === "battle" && fighters.length === 2) {
    if (countdownTimer > 0) {
      const prev = Math.ceil(countdownTimer);
      countdownTimer -= dt;
      const now = Math.ceil(Math.max(0, countdownTimer));
      if (now !== prev) {
        if (countdownTimer > 0) {
          Sound.sfx("count");
        } else {
          Sound.sfx("go");
          fightBannerTimer = 0.9;
          clearInputs();
        }
      }
    } else if (hitStopTimer > 0) {
      hitStopTimer = Math.max(0, hitStopTimer - dt);
    }
  }

  if (screenMode === "battle" && fighters.length === 2 && countdownTimer <= 0 && hitStopTimer <= 0) {
    const stage = getCurrentStage();
    stepFighter(fighters[0], p1Input, dt, stage.platforms);
    stepFighter(fighters[1], p2Input, dt, stage.platforms);

    itemSpawnTimer -= dt;
    if (itemSpawnTimer <= 0) {
      spawnFieldItem();
      itemSpawnTimer = 7.5 + Math.random() * 2.5;
    }

    for (let i = fieldItems.length - 1; i >= 0; i--) {
      const it = fieldItems[i];
      it.age += dt;
      it.life -= dt;
      it.y = it.baseY + Math.sin(it.age * 4.5) * 5;
      if (it.life <= 0) {
        fieldItems.splice(i, 1);
        continue;
      }
      for (const f of fighters) {
        const fcx = f.x + f.w / 2;
        const fcy = f.y + f.h / 2;
        if (Math.hypot(fcx - it.x, fcy - it.y) <= it.radius + f.w * 0.55) {
          applyItemEffect(f, it);
          fieldItems.splice(i, 1);
          break;
        }
      }
    }

    for (const f of fighters) {
      if (f.orbitTimer <= 0 || f.orbitHitCooldown > 0) continue;
      const opponent = fighters.find((other) => other.id !== f.id);
      if (!opponent) continue;
      const fcx = f.x + f.w / 2;
      const fcy = f.y + f.h / 2;
      const ocx = opponent.x + opponent.w / 2;
      const ocy = opponent.y + opponent.h / 2;
      if (Math.hypot(fcx - ocx, fcy - ocy) <= 68) {
        hitFighter(opponent, fcx, 440);
        f.orbitHitCooldown = 0.65;
        spawnParticles(ocx, ocy, 14, "#ff9f1c");
      }
    }

    for (let i = slotMachines.length - 1; i >= 0; i--) {
      const sm = slotMachines[i];
      const owner = fighters.find((f) => f.id === sm.ownerId);
      if (owner) {
        sm.x = owner.x + owner.w / 2;
        sm.y = owner.y - 34;
        sm.facing = owner.facing;
      }
      sm.spinTimer -= dt;
      if (sm.spinTimer <= 0) {
        const ox = owner ? owner.x + owner.w / 2 : sm.x;
        const oy = owner ? owner.y + owner.h / 2 : sm.y + 34;
        const dir = owner ? owner.facing : sm.facing;

        if (sm.outcome === "jackpot") {
          spawnPopup(sm.x, sm.y - 12, "🎰 777 JACKPOT!!", "#ffd166");
          shockwaves.push({
            ownerId: sm.ownerId,
            x: ox,
            y: oy,
            maxRadius: 94,
            radius: 16,
            life: 0.26,
            maxLife: 0.26,
            color: "#ffd166",
            knockVx: 490,
            hitIds: new Set()
          });
          const angles = [-0.35, 0, 0.35];
          for (const ang of angles) {
            pulses.push({
              ownerId: sm.ownerId,
              playerColor: sm.playerColor,
              style: "gold_coin",
              x: ox + dir * 24,
              y: oy,
              vx: Math.cos(ang) * 720 * dir,
              vy: Math.sin(ang) * 720,
              dir,
              radius: 26,
              knockVx: 480,
              life: 0.52,
              maxLife: 0.52,
              age: 0,
              color: "#ffd166"
            });
          }
          spawnParticles(ox, oy, 28, "#ffd166");
        } else if (sm.outcome === "coin_shower") {
          spawnPopup(sm.x, sm.y - 12, "🎰 💰COIN FEVER!", "#72efdd");
          const showerAngles = [-2.4, -1.9, -1.57, -1.24, -0.74];
          for (const ang of showerAngles) {
            pulses.push({
              ownerId: sm.ownerId,
              playerColor: sm.playerColor,
              style: "bounce_ball",
              x: ox,
              y: oy - 10,
              vx: Math.cos(ang) * 410,
              vy: Math.sin(ang) * 410 - 90,
              gravity: 1180,
              dir: Math.cos(ang) >= 0 ? 1 : -1,
              radius: 16,
              knockVx: 390,
              life: 0.65,
              maxLife: 0.65,
              age: 0,
              color: "#ffd166"
            });
          }
          spawnParticles(ox, oy, 20, "#ffd166");
        } else {
          spawnPopup(sm.x, sm.y - 12, "🎰 💣MISS...", "#a9b2d4");
          shockwaves.push({
            ownerId: sm.ownerId,
            x: ox,
            y: oy,
            maxRadius: 56,
            radius: 12,
            life: 0.2,
            maxLife: 0.2,
            color: "#a9b2d4",
            knockVx: 320,
            hitIds: new Set()
          });
          spawnParticles(ox, oy, 14, "#a9b2d4");
        }
        slotMachines.splice(i, 1);
      }
    }

    for (let i = ufoDrones.length - 1; i >= 0; i--) {
      const ufo = ufoDrones[i];
      ufo.life -= dt;
      ufo.x += ufo.vx * dt;
      if (ufo.x < 40 || ufo.x > VIEW_WIDTH - 40) {
        ufo.vx = -ufo.vx;
      }
      ufo.dropTimer -= dt;
      if (ufo.dropsLeft > 0 && ufo.dropTimer <= 0) {
        ufo.dropsLeft -= 1;
        ufo.dropTimer = 0.26;
        pulses.push({
          ownerId: ufo.ownerId,
          playerColor: ufo.playerColor,
          style: "pixel_laser",
          x: ufo.x,
          y: ufo.y + 18,
          vx: 0,
          vy: 640,
          dir: 1,
          radius: 16,
          knockVx: 400,
          life: 0.72,
          maxLife: 0.72,
          age: 0,
          color: "#ff5c8a"
        });
        spawnParticles(ufo.x, ufo.y + 16, 8, "#b5179e");
      }
      if (ufo.life <= 0) {
        ufoDrones.splice(i, 1);
      }
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      const pl = pulses[i];
      pl.age = (pl.age || 0) + dt;
      if (pl.returningProjectile && pl.age >= pl.returnAt) {
        const owner = fighters.find((f) => f.id === pl.ownerId);
        if (owner) {
          const ox = owner.x + owner.w / 2;
          const oy = owner.y + owner.h / 2;
          const dx = ox - pl.x;
          const dy = oy - pl.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 30) {
            pulses.splice(i, 1);
            continue;
          }
          const speed = Math.max(420, Math.hypot(pl.vx, pl.vy || 0));
          const angle = Math.atan2(dy, dx);
          pl.vx = Math.cos(angle) * speed;
          pl.vy = Math.sin(angle) * speed;
          pl.dir = pl.vx >= 0 ? 1 : -1;
          pl.phaseWalls = true;
          pl.returning = true;
        }
      }
      if (pl.homingStrength > 0) {
        const target = fighters.find((f) => f.id !== pl.ownerId);
        if (target && target.stealthTimer <= 0 && target.hp > 0) {
          const tx = target.x + target.w / 2;
          const ty = target.y + target.h / 2;
          const desiredAngle = Math.atan2(ty - pl.y, tx - pl.x);
          const currentAngle = Math.atan2(pl.vy || 0, pl.vx);
          let diff = desiredAngle - currentAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const speed = Math.hypot(pl.vx, pl.vy || 0);
          const maxTurn = pl.homingStrength * dt;
          const newAngle = currentAngle + Math.max(-maxTurn, Math.min(maxTurn, diff));
          pl.vx = Math.cos(newAngle) * speed;
          pl.vy = Math.sin(newAngle) * speed;
          pl.dir = pl.vx >= 0 ? 1 : -1;
        }
      }
      if (pl.accelX) {
        pl.vx += pl.accelX * dt;
        pl.dir = Math.sign(pl.vx) || pl.dir;
      }
      if (pl.gravity) {
        pl.vy = (pl.vy || 0) + pl.gravity * dt;
      }
      pl.x += pl.vx * dt;

      if (pl.style === "zigzag_spring") {
        pl.y = pl.baseY + Math.sin(pl.age * 28) * 18;
      } else if (pl.waveAmplitude > 0) {
        pl.y = pl.baseY + Math.sin(pl.age * (pl.waveFrequency || 7)) * pl.waveAmplitude;
      } else if (pl.groundWave) {
        pl.y = GROUND_Y - 10;
      } else {
        pl.y += (pl.vy || 0) * dt;
      }

      pl.trail = pl.trail || [];
      pl.trailClock = (pl.trailClock || 0) + dt;
      if (pl.trailClock >= 0.035) {
        pl.trailClock %= 0.035;
        pl.trail.push({ x: pl.x, y: pl.y });
        if (pl.trail.length > 9) pl.trail.shift();
      }

      if (pl.style === "cool_triple_wave" && Math.random() < 0.75) {
        spawnParticles(pl.x, pl.y, 1, pl.playerColor || pl.color);
      }
      if (pl.style === "ice_crystal" && Math.random() < 0.45) {
        spawnParticles(pl.x, pl.y, 1, "#70e4ff");
      }
      if (pl.style === "joker_card" && Math.random() < 0.55) {
        spawnParticles(pl.x, pl.y, 1, "#ffd166");
      }
      if (pl.style === "poop_bomb" && Math.random() < 0.45) {
        spawnParticles(pl.x, pl.y, 1, "#b08968");
      }
      if (pl.style === "brain_spark" && Math.random() < 0.55) {
        spawnParticles(pl.x, pl.y, 1, "#ff9f1c");
      }
      if (pl.style === "bandage_fist" && Math.random() < 0.65) {
        spawnParticles(pl.x, pl.y, 1, "#fff1d0");
      }
      if (pl.style === "mystic_eye" && Math.random() < 0.45) {
        spawnParticles(pl.x, pl.y, 1, "#4cc9f0");
      }
      if (pl.style === "plasma_bolt" && Math.random() < 0.7) {
        spawnParticles(pl.x, pl.y, 1, "#72efdd");
      }
      if (pl.style === "mecha_missile" && Math.random() < 0.85) {
        spawnParticles(pl.x - pl.dir * pl.radius, pl.y, 2, "#ffd166");
      }
      if (pl.style === "party_popper" && Math.random() < 0.65) {
        const colors = ["#ff5c8a", "#ffd166", "#72efdd", "#c77dff"];
        spawnParticles(pl.x, pl.y, 1, colors[Math.floor(Math.random() * colors.length)]);
      }
      if (pl.style === "bounce_ball" && Math.random() < 0.55) {
        spawnParticles(pl.x, pl.y + pl.radius, 1, pl.color);
      }
      if (pl.style === "mystic_reflect" && Math.random() < 0.8) {
        spawnParticles(pl.x, pl.y, 1, "#4cc9f0");
      }

      let hitWall = false;
      for (const p of stage.platforms) {
        if (p.type !== "wall" || pl.phaseWalls) continue;
        const hitR = Math.min(10, pl.radius * 0.55);
        if (
          pl.x + hitR >= p.x &&
          pl.x - hitR <= p.x + p.w &&
          pl.y + hitR >= p.y &&
          pl.y - hitR <= p.y + p.h
        ) {
          if (pl.style === "bounce_ball" || pl.ricochets > 0) {
            if (pl.style !== "bounce_ball") pl.ricochets -= 1;
            pl.vx = -pl.vx;
            pl.dir = -pl.dir;
            pl.x += Math.sign(pl.vx) * (hitR + 5);
            spawnParticles(pl.x, pl.y, 5, pl.color);
          } else {
            if (pl.style === "joker_card" && !pl.isSubCard) {
              triggerJokerBurst(pl.ownerId, pl.playerColor, pl.x, pl.y, pl.dir);
            } else if (pl.style === "poop_bomb") {
              shockwaves.push({
                ownerId: pl.ownerId,
                x: pl.x,
                y: pl.y,
                maxRadius: 42,
                radius: 10,
                life: 0.18,
                maxLife: 0.18,
                color: "#b08968",
                knockVx: 360,
                hitIds: new Set()
              });
              spawnParticles(pl.x, pl.y, 10, "#b08968");
            } else {
              spawnParticles(pl.x, pl.y, 6, pl.color);
            }
            if (pl.impactBurstRadius > 0 || pl.slimePoolDuration > 0) {
              spawnProjectileImpact(pl, pl.x, pl.y);
            }
            hitWall = true;
          }
          break;
        }
      }
      if (hitWall) {
        pulses.splice(i, 1);
        continue;
      }

      if (pl.style === "bounce_ball" && pl.vy > 0) {
        for (const p of stage.platforms) {
          if (p.type === "wall") continue;
          if (pl.x >= p.x && pl.x <= p.x + p.w && pl.y + pl.radius >= p.y && pl.y - pl.radius <= p.y + 14) {
            pl.y = p.y - pl.radius;
            pl.vy = -Math.max(340, Math.abs(pl.vy) * 0.85);
            spawnParticles(pl.x, p.y, 4, pl.color);
            break;
          }
        }
      }

      if (pl.vy > 0 && pl.y >= GROUND_Y) {
        if (pl.style === "bounce_ball" && (pl.groundBounces || 0) < 2) {
          pl.y = GROUND_Y - pl.radius;
          pl.vy = -Math.max(300, Math.abs(pl.vy) * 0.72);
          pl.groundBounces = (pl.groundBounces || 0) + 1;
          spawnParticles(pl.x, GROUND_Y, 9, pl.color);
          continue;
        }
        if (pl.style === "poop_bomb") {
          shockwaves.push({
            ownerId: pl.ownerId,
            x: pl.x,
            y: GROUND_Y - 4,
            maxRadius: 42,
            radius: 10,
            life: 0.18,
            maxLife: 0.18,
            color: "#b08968",
            knockVx: 360,
            hitIds: new Set()
          });
          spawnParticles(pl.x, GROUND_Y, 10, "#b08968");
        } else if (pl.style === "bounce_ball") {
          spawnParticles(pl.x, GROUND_Y, 12, pl.color);
          spawnParticles(pl.x, GROUND_Y, 5, "#ffd166");
        } else if (pl.style === "mecha_missile") {
          spawnParticles(pl.x, GROUND_Y, 12, "#ff9f1c");
          spawnParticles(pl.x, GROUND_Y, 6, "#ff5c8a");
        } else {
          spawnParticles(pl.x, GROUND_Y, 6, pl.color);
        }
        if (pl.impactBurstRadius > 0 || pl.slimePoolDuration > 0) {
          spawnProjectileImpact(pl, pl.x, GROUND_Y - 4);
        }
        pulses.splice(i, 1);
        continue;
      }

      pl.life -= dt;
      if (pl.life <= 0 || pl.x < -60 || pl.x > VIEW_WIDTH + 60) {
        pulses.splice(i, 1);
        continue;
      }

      for (const target of fighters) {
        if (target.id === pl.ownerId) continue;
        const tcx = target.x + target.w / 2;
        const tcy = target.y + target.h / 2;
        const dist = Math.hypot(pl.x - tcx, pl.y - tcy);
        if (dist <= pl.radius + target.w * 0.5) {
          if (target.barrierTimer > 0) {
            pl.ownerId = target.id;
            pl.vx = -pl.vx * 1.15;
            if (pl.accelX) pl.accelX = -pl.accelX;
            pl.vy = -(pl.vy || 0);
            pl.dir = -pl.dir;
            pl.life = Math.max(pl.life, 0.26);
            pl.color = target.accentColor;
            pl.playerColor = target.accentColor;
            spawnParticles(pl.x, pl.y, 10, "#72efdd");
          } else {
            const impactKnockback = (pl.knockVx || 380) * (pl.impactBurstRadius > 0 ? 1.18 : 1);
            hitFighter(target, pl.x, impactKnockback, pl.chillDuration || 0);
            if (pl.impactBurstRadius > 0 || pl.slimePoolDuration > 0) {
              spawnProjectileImpact(pl, pl.x, pl.y, target.id);
            }
            if (pl.style === "joker_card" && !pl.isSubCard) {
              triggerJokerBurst(pl.ownerId, pl.playerColor, pl.x, pl.y, pl.dir);
            } else if (pl.style === "poop_bomb") {
              shockwaves.push({
                ownerId: pl.ownerId,
                x: pl.x,
                y: pl.y,
                maxRadius: 42,
                radius: 10,
                life: 0.18,
                maxLife: 0.18,
                color: "#b08968",
                knockVx: 360,
                hitIds: new Set([target.id])
              });
              spawnParticles(pl.x, pl.y, 12, "#b08968");
            } else if (pl.style === "mecha_missile") {
              shockwaves.push({
                ownerId: pl.ownerId, x: pl.x, y: pl.y,
                maxRadius: 38, radius: 8, life: 0.16, maxLife: 0.16,
                color: "#ff9f1c", knockVx: 300, hitIds: new Set([target.id])
              });
              spawnParticles(pl.x, pl.y, 14, "#ff9f1c");
              spawnParticles(pl.x, pl.y, 8, "#ff5c8a");
            } else if (pl.style === "bounce_ball") {
              spawnParticles(pl.x, pl.y, 16, pl.color);
              spawnParticles(pl.x, pl.y, 8, "#ffd166");
            } else if (pl.style === "party_popper") {
              spawnParticles(pl.x, pl.y, 18, "#ff5c8a");
              spawnParticles(pl.x, pl.y, 10, "#ffd166");
            } else if (pl.style === "mystic_eye" || pl.style === "mystic_reflect") {
              spawnParticles(pl.x, pl.y, 14, "#4cc9f0");
            }
            pulses.splice(i, 1);
          }
          break;
        }
      }
    }

    for (let i = hazardZones.length - 1; i >= 0; i--) {
      const hz = hazardZones[i];
      hz.life -= dt;
      if (Math.random() < 0.25) {
        spawnParticles(hz.x + (Math.random() - 0.5) * hz.radius * 1.6, hz.y - 4, 1, hz.color);
      }
      if (hz.type === "mystic_orb") {
        for (let j = pulses.length - 1; j >= 0; j--) {
          const pl = pulses[j];
          if (pl.ownerId !== hz.ownerId && Math.hypot(pl.x - hz.x, pl.y - hz.y) <= hz.radius + pl.radius) {
            // 吸収した弾をオーブの所有者へ向けて返す（最大3発）
            spawnParticles(pl.x, pl.y, 10, "#4cc9f0");
            if ((hz.reflectedCount || 0) < 3) {
              hz.reflectedCount = (hz.reflectedCount || 0) + 1;
              const source = fighters.find((f) => f.id === pl.ownerId);
              const targetX = source ? source.x + source.w / 2 : pl.x - pl.vx;
              const targetY = source ? source.y + source.h / 2 : pl.y;
              const angle = Math.atan2(targetY - hz.y, targetX - hz.x);
              pulses.push({
                ownerId: hz.ownerId, playerColor: "#4cc9f0",
                style: "mystic_reflect", x: hz.x, y: hz.y,
                vx: Math.cos(angle) * 560, vy: Math.sin(angle) * 560,
                dir: Math.cos(angle) >= 0 ? 1 : -1,
                radius: 13, knockVx: 460, life: 0.72, maxLife: 0.72,
                age: 0, color: "#4cc9f0"
              });
              spawnPopup(hz.x, hz.y - 20, "REFLECT!", "#4cc9f0");
            }
            pulses.splice(j, 1);
          }
        }
        for (const target of fighters) {
          if (target.id === hz.ownerId || hz.hitIds.has(target.id)) continue;
          const tcx = target.x + target.w / 2, tcy = target.y + target.h / 2;
          if (Math.hypot(tcx - hz.x, tcy - hz.y) <= hz.radius + target.w * 0.45) {
            hz.hitIds.add(target.id);
            hitFighter(target, hz.x, 450);
            spawnParticles(hz.x, hz.y, 14, "#4cc9f0");
          }
        }
      } else if (hz.type === "slime_pool") {
        for (const target of fighters) {
          if (target.id === hz.ownerId || target.hp <= 0) continue;
          const tcx = target.x + target.w / 2;
          const tbottom = target.y + target.h;
          if (Math.abs(tcx - hz.x) <= hz.radius && tbottom >= hz.y - 16 && tbottom <= hz.y + 34) {
            target.slowTimer = Math.max(target.slowTimer || 0, 0.2);
            if (Math.random() < 0.16) {
              spawnParticles(tcx, hz.y - 5, 1, hz.color);
            }
          }
        }
      } else {
        for (const target of fighters) {
          if (target.id === hz.ownerId) continue;
          const tcx = target.x + target.w / 2;
          const tbottom = target.y + target.h;
          if (Math.abs(tcx - hz.x) <= hz.radius && Math.abs(tbottom - hz.y) <= 26) {
            hitFighter(target, hz.x, 380);
          }
        }
      }
      if (hz.life <= 0) {
        hazardZones.splice(i, 1);
      }
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.life -= dt;
      const progress = 1 - Math.max(0, sw.life / sw.maxLife);
      sw.radius = 12 + (sw.maxRadius - 12) * progress;

      for (const target of fighters) {
        if (target.id === sw.ownerId || sw.hitIds.has(target.id)) continue;
        const tcx = target.x + target.w / 2;
        const tcy = target.y + target.h / 2;
        const dist = Math.hypot(sw.x - tcx, sw.y - tcy);
        if (dist <= sw.radius + target.w * 0.55) {
          hitFighter(target, sw.x, sw.knockVx || 420, sw.chillDuration || 0);
          sw.hitIds.add(target.id);
        }
      }

      if (sw.life <= 0) {
        shockwaves.splice(i, 1);
      }
    }

    const f1 = fighters[0];
    const f2 = fighters[1];
    const overlapX = f1.x + f1.w > f2.x && f1.x < f2.x + f2.w;
    const overlapY = f1.y + f1.h > f2.y && f1.y < f2.y + f2.h;
    if (overlapX && overlapY) {
      if (f1.dashStrikeTimer > 0 && !f1.dashStrikeHitIds.has(f2.id)) {
        f1.dashStrikeHitIds.add(f2.id);
        hitFighter(f2, f1.x + f1.w / 2, 500);
      } else if (f2.dashStrikeTimer > 0 && !f2.dashStrikeHitIds.has(f1.id)) {
        f2.dashStrikeHitIds.add(f1.id);
        hitFighter(f1, f2.x + f2.w / 2, 500);
      } else {
        const f1Center = f1.x + f1.w / 2;
        const f2Center = f2.x + f2.w / 2;
        const pushDir = f1Center <= f2Center ? -1 : 1;
        const overlapDepth = Math.min(f1.x + f1.w, f2.x + f2.w) - Math.max(f1.x, f2.x);
        const sep = Math.max(1, overlapDepth * 0.5);
        f1.x += pushDir * sep;
        f2.x -= pushDir * sep;
      }
    }

    if (screenMode === "battle" && !suddenDeath) {
      matchTimer -= dt;
      if (matchTimer <= 0) {
        matchTimer = 0;
        handleTimeUp();
      }
    }
  }

  if (screenMode === "result" && koTimer > 0) {
    koTimer -= dt;
    const sdt = dt * 0.3;
    const platforms = getCurrentStage().platforms;
    for (const f of fighters) {
      stepFighter(
        f,
        { left: false, right: false, jumpPressed: false, pulseHeld: false, pulseReleased: false, specialPressed: false },
        sdt,
        platforms
      );
      if (f.hp <= 0) f.koAngle += dt * 9;
    }
    if (koTimer <= 0) showResultOverlay();
  }

  for (let i = floatingPopups.length - 1; i >= 0; i--) {
    const fp = floatingPopups[i];
    fp.age = (fp.age || 0) + dt;
    fp.y -= 38 * dt;
    fp.life -= dt;
    if (fp.life <= 0) floatingPopups.splice(i, 1);
  }

  for (let i = impactFlashes.length - 1; i >= 0; i--) {
    impactFlashes[i].life -= dt;
    if (impactFlashes[i].life <= 0) impactFlashes.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= Math.max(0, 1 - dt * 1.1);
    pt.vy += (pt.gravity ?? 320) * dt;
    pt.rotation = (pt.rotation || 0) + (pt.spin || 0) * dt;
    pt.life -= dt;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  if (screenMode === "battle") {
    updateHud();
  }
}

const stageDecor = {};
function seededRandom(seed) {
  let st = seed;
  return () => {
    st = (st * 16807) % 2147483647;
    return (st - 1) / 2147483646;
  };
}

function getDecor(idx) {
  if (stageDecor[idx]) return stageDecor[idx];
  const rnd = seededRandom(1234 + idx * 977);
  const buildings = [];
  let x = -10;
  while (x < VIEW_WIDTH) {
    const w = 40 + rnd() * 70;
    const h = 70 + rnd() * (idx === 1 ? 270 : idx === 2 ? 90 : 150);
    const wins = [];
    for (let wy = GROUND_Y - h + 10; wy < GROUND_Y - 10; wy += 16) {
      for (let wx = x + 6; wx < x + w - 10; wx += 14) {
        if (rnd() < 0.22) wins.push([wx, wy, rnd() * 6.28]);
      }
    }
    buildings.push({ x, w, h, wins });
    x += w + rnd() * 10;
  }
  const orbs = [];
  for (let i = 0; i < 34; i++) {
    orbs.push({ x: rnd() * VIEW_WIDTH, y: rnd() * GROUND_Y, r: 1 + rnd() * 2.6, sp: 6 + rnd() * 18, ph: rnd() * 6.28, amp: 6 + rnd() * 14 });
  }
  const moons = [{ x: 770, y: 96 }, { x: 190, y: 86 }, { x: 480, y: 120 }, { x: 800, y: 110 }];
  stageDecor[idx] = { buildings, orbs, moon: moons[idx % moons.length] };
  return stageDecor[idx];
}

function drawArena() {
  const stage = getCurrentStage();
  const decor = getDecor(selectedStageIndex);
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, stage.bgTop);
  grad.addColorStop(1, stage.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_WIDTH, GROUND_Y);

  const mp = 1 + Math.sin(timeElapsed * 0.8) * 0.03;
  const moonGrad = ctx.createRadialGradient(decor.moon.x, decor.moon.y, 4, decor.moon.x, decor.moon.y, 110 * mp);
  moonGrad.addColorStop(0, "rgba(255,255,255,0.28)");
  moonGrad.addColorStop(0.25, "rgba(255,255,255,0.08)");
  moonGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = moonGrad;
  ctx.fillRect(0, 0, VIEW_WIDTH, GROUND_Y);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.arc(decor.moon.x, decor.moon.y, 28, 0, Math.PI * 2);
  ctx.fill();

  for (const b of decor.buildings) {
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
    for (const w of b.wins) {
      ctx.globalAlpha = 0.2 + 0.2 * (0.5 + 0.5 * Math.sin(timeElapsed * 1.4 + w[2]));
      ctx.fillStyle = stage.floorAccent;
      ctx.fillRect(w[0], w[1], 6, 8);
    }
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = stage.gridColor;
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= VIEW_WIDTH; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }
  for (let y = 64; y < GROUND_Y; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_WIDTH, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 3; i++) {
    const bandX = ((timeElapsed * (18 + i * 7) + i * 390) % (VIEW_WIDTH + 260)) - 130;
    const band = ctx.createLinearGradient(bandX - 78, 0, bandX + 78, 0);
    band.addColorStop(0, "rgba(255,255,255,0)");
    band.addColorStop(0.5, i % 2 === 0 ? "rgba(114,239,221,0.035)" : "rgba(199,125,255,0.04)");
    band.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = band;
    ctx.fillRect(bandX - 78, 0, 156, GROUND_Y);
  }
  ctx.restore();

  ctx.fillStyle = stage.floorAccent;
  for (const o of decor.orbs) {
    const oy = (((o.y - timeElapsed * o.sp) % GROUND_Y) + GROUND_Y) % GROUND_Y;
    const ox = o.x + Math.sin(timeElapsed * 0.6 + o.ph) * o.amp;
    ctx.globalAlpha = 0.14 + 0.14 * (0.5 + 0.5 * Math.sin(timeElapsed * 1.7 + o.ph));
    ctx.beginPath();
    ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const p of stage.platforms) {
    if (p.type === "floor") {
      const fg = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      fg.addColorStop(0, "#241a4d");
      fg.addColorStop(1, "#0f0a24");
      ctx.fillStyle = fg;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.save();
      ctx.shadowColor = stage.floorAccent;
      ctx.shadowBlur = 14;
      ctx.fillStyle = stage.floorAccent;
      ctx.fillRect(p.x, p.y, p.w, 5);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < p.w; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, p.y + 6);
        ctx.lineTo(x - 24, p.y + p.h);
        ctx.stroke();
      }
    } else if (p.type === "wall") {
      ctx.fillStyle = stage.wallFill || "#1f1447";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 5);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = stage.wallAccent || "#72efdd";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = stage.wallAccent || "#72efdd";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = stage.wallAccent || "#72efdd";
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(timeElapsed * 3 + p.x);
      ctx.fillRect(p.x + p.w / 2 - 2, p.y + 8, 4, Math.max(8, p.h - 16));
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = stage.shelfFill;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = stage.shelfAccent;
      ctx.shadowBlur = 8;
      ctx.fillStyle = stage.shelfAccent;
      ctx.fillRect(p.x + 4, p.y + 2, p.w - 8, 4);
      ctx.restore();
    }
  }

  const vg = ctx.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_HEIGHT * 0.45, VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_WIDTH * 0.62);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

function drawFieldItems() {
  for (const it of fieldItems) {
    const blink = it.life < 2.5 && Math.floor(it.life * 10) % 2 === 0;
    if (blink) continue;
    const pulse = 1 + Math.sin(it.age * 7) * 0.1;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
    glow.addColorStop(0, it.color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(it.emoji, 0, 1);
    ctx.restore();
  }
}

function groundYBelow(f) {
  const stage = getCurrentStage();
  const fx = f.x + f.w / 2;
  let best = GROUND_Y;
  for (const p of stage.platforms) {
    if (p.type === "wall") continue;
    if (fx >= p.x && fx <= p.x + p.w && p.y >= f.y + f.h - 6 && p.y < best) best = p.y;
  }
  return best;
}

function drawOverlayBanners() {
  const bannerText = (txt, scale, alpha, color) => {
    ctx.save();
    ctx.translate(VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 30);
    ctx.scale(scale, scale);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.font = '900 96px "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#0b0918";
    ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  };
  if (screenMode === "battle" && countdownTimer > 0) {
    const n = Math.ceil(countdownTimer);
    const t = 1 - (countdownTimer - (n - 1));
    bannerText(String(n), 1.7 - 0.7 * Math.min(1, t * 4), 1 - Math.max(0, (t - 0.75) / 0.25), "#ffd166");
  } else if (screenMode === "battle" && fightBannerTimer > 0) {
    const t = 1 - fightBannerTimer / 0.9;
    bannerText("FIGHT!", 1.5 - 0.5 * Math.min(1, t * 5), fightBannerTimer < 0.25 ? fightBannerTimer / 0.25 : 1, "#72efdd");
  } else if (screenMode === "result" && koTimer > 0) {
    bannerText(resultBannerText, 1.6 - 0.6 * Math.min(1, (1.15 - koTimer) * 6), 1, "#ff5c8a");
  }
}

const CHARACTER_AURA_COLORS = {
  "🤩": "#ffd166", "🤪": "#c77dff", "🥴": "#4cc9f0", "😎": "#72efdd",
  "🫨": "#ff70a6", "🤯": "#ff9f1c", "🤠": "#ffd166", "🤡": "#ff5c8a",
  "🤑": "#ffd166", "🗺️": "#f4c95d", "💩": "#b08968", "💀": "#c4b5fd",
  "🫠": "#8dff7a", "🫥": "#9bf6ff", "🥶": "#70e4ff", "🈁": "#4cc9f0",
  "🪬": "#4cc9f0", "🤖": "#a7b6ff", "🥳": "#ffd166", "👾": "#c77dff",
  "😇": "#fff1a8", "😈": "#ff5c8a", "🤕": "#fff1d0"
};

function getCharacterAuraColor(fighter) {
  return CHARACTER_AURA_COLORS[fighter.emoji] || fighter.def.projectileColorOverride || fighter.accentColor;
}

function drawFighters() {
  for (const f of fighters) {
    if (f.warpBeacon) {
      const pulse = 1 + Math.sin(timeElapsed * 10) * 0.12;
      ctx.save();
      ctx.translate(f.warpBeacon.x, f.warpBeacon.y);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = "#4cc9f0";
      ctx.fillStyle = "rgba(76, 201, 240, 0.2)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '20px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🈁", 0, 0);
      ctx.restore();
    }

    if (f.atlasPin) {
      const pulse = 1 + Math.sin(timeElapsed * 12) * 0.14;
      ctx.save();
      ctx.translate(f.atlasPin.x, f.atlasPin.y);
      ctx.strokeStyle = "rgba(255, 209, 102, 0.45)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.scale(pulse, pulse);
      ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📍", 0, -2);
      ctx.restore();
    }

    if (f.invincibleTimer > 0 && f.starTimer <= 0 && Math.floor(f.invincibleTimer * 18) % 2 === 0) {
      continue;
    }
    {
      const gy = groundYBelow(f);
      const dist = Math.max(0, gy - (f.y + f.h));
      const k = Math.max(0.35, 1 - dist / 320);
      ctx.save();
      ctx.globalAlpha = (f.stealthTimer > 0 ? 0.08 : 0.38) * k;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(f.x + f.w / 2, gy + 1, 17 * k, 4.5 * k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const cx = f.x + f.w / 2;
    const cy = f.y + f.h / 2;
    const bob = f.onGround && Math.abs(f.vx) > 10 ? Math.abs(Math.sin(f.animTime)) * -4 : 0;

    ctx.save();
    if (f.stealthTimer > 0) {
      ctx.globalAlpha = 0.16;
    }
    const jitterX = f.mindChargeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
    const jitterY = f.mindChargeTimer > 0 ? (Math.random() - 0.5) * 6 : 0;
    ctx.translate(cx + jitterX, cy + bob + jitterY);
    if (f.hp <= 0) {
      ctx.rotate(f.koAngle || 0);
    } else {
      ctx.save();
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(11,9,24,0.9)";
      ctx.strokeText(f.label, 0, -34);
      ctx.fillStyle = f.accentColor;
      ctx.fillText(f.label, 0, -34);
      ctx.beginPath();
      ctx.moveTo(-4, -27);
      ctx.lineTo(4, -27);
      ctx.lineTo(0, -22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (f.starTimer > 0) {
      const hue = (timeElapsed * 420) % 360;
      ctx.save();
      ctx.strokeStyle = `hsl(${hue}, 95%, 65%)`;
      ctx.fillStyle = `hsla(${hue}, 95%, 65%, 0.18)`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 29, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (f.orbitTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 159, 28, 0.28)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let k = 0; k < 2; k++) {
        const ang = timeElapsed * 8.5 + k * Math.PI;
        const ox = Math.cos(ang) * 44;
        const oy = Math.sin(ang) * 44;
        ctx.fillStyle = "#ff5c8a";
        ctx.beginPath();
        ctx.arc(ox, oy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (f.bandageChangeTimer > 0) {
      const ratio = 1 - f.bandageChangeTimer / (f.def.bandageChangeDuration || 2.4);
      ctx.save();
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      ctx.font = '22px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🩹", 0, -34);
      ctx.restore();
    }

    if (f.mindChargeTimer > 0) {
      const ratio = 1 - f.mindChargeTimer / (f.mindChargeMax || 0.45);
      const maxR = f.def.explosionRadius || 155;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 92, 138, 0.48)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, maxR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255, 92, 138, 0.16)";
      ctx.beginPath();
      ctx.arc(0, 0, maxR * ratio, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + ratio * 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      ctx.restore();
    }

    if (f.emoji === "😇") {
      ctx.strokeStyle = "rgba(255, 209, 102, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -24, 13, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.emoji === "😈" || f.emoji === "🤯") {
      ctx.strokeStyle = "rgba(255, 92, 138, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.emoji === "🥶") {
      ctx.strokeStyle = "rgba(112, 228, 255, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.emoji === "🤑" || f.emoji === "🗺️") {
      ctx.strokeStyle = "rgba(255, 209, 102, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.emoji === "💩") {
      ctx.strokeStyle = "rgba(176, 137, 104, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (f.chillTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "#70e4ff";
      ctx.fillStyle = "rgba(112, 228, 255, 0.18)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-20, -22, 40, 44, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = f.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, f.h / 2 - 2 - bob, 18, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    const auraColor = getCharacterAuraColor(f);
    const auraPulse = 1 + Math.sin(timeElapsed * 5.5 + (f.id === "p2" ? 1.2 : 0)) * 0.06;
    const auraPower = (f.isChargingPulse || isSpecialActive(f) || f.starTimer > 0) ? 1 : 0.48;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.22 * auraPower;
    const aura = ctx.createRadialGradient(0, 2, 5, 0, 2, 38 * auraPulse);
    aura.addColorStop(0, "rgba(255,255,255,0.22)");
    aura.addColorStop(0.38, auraColor + "55");
    aura.addColorStop(1, auraColor + "00");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 2, 38 * auraPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.34 * auraPower;
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = f.isChargingPulse ? 2.2 : 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 29 + Math.sin(timeElapsed * 4 + f.x * 0.02) * 2, 0, Math.PI * 2);
    ctx.stroke();
    for (let mote = 0; mote < 3; mote++) {
      const angle = timeElapsed * (1.8 + mote * 0.18) + mote * Math.PI * 2 / 3 + (f.id === "p2" ? 0.6 : 0);
      const mx = Math.cos(angle) * 34;
      const my = Math.sin(angle) * 17;
      ctx.globalAlpha = 0.55 * auraPower;
      ctx.fillStyle = mote === 0 ? "#ffffff" : auraColor;
      ctx.beginPath();
      ctx.arc(mx, my, mote === 0 ? 2.4 : 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (f.isChargingPulse) {
      const chargeRatio = Math.min(1, f.pulseChargeTime / MAX_CHARGE_TIME);
      const isMax = chargeRatio >= 0.99;
      ctx.save();
      ctx.strokeStyle = isMax ? "#ffd166" : f.accentColor;
      ctx.lineWidth = isMax ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chargeRatio);
      ctx.stroke();

      const estLife =
        f.def.minPulseRangeLife +
        (f.def.maxPulseRangeLife - f.def.minPulseRangeLife) * chargeRatio * (f.gear.pulseRangeMultiplier || 1);
      const previewSpeed = f.def.pulseSpeed * (f.gear.pulseSpeedMultiplier || 1);
      const previewVy = f.def.projectileStyle === "bounce_ball"
        ? -320 - chargeRatio * 120
        : f.def.projectileStyle === "poop_bomb"
          ? -210 - chargeRatio * 95
          : f.def.projectileStyle === "slime_drop"
            ? -195 - chargeRatio * 75
            : 0;
      const previewVx = f.facing * previewSpeed;
      const previewLength = Math.min(260, Math.hypot(previewVx, previewVy) * estLife * 0.45);
      const previewAngle = Math.atan2(previewVy, previewVx);
      const lineEndX = f.facing * 20 + Math.cos(previewAngle) * previewLength;
      const lineEndY = Math.sin(previewAngle) * previewLength;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(f.facing * 20, 0);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();
      // Small arrowhead indicates the actual initial launch direction.
      ctx.setLineDash([]);
      ctx.translate(lineEndX, lineEndY);
      ctx.rotate(previewAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fillStyle = isMax ? "#ffd166" : f.accentColor;
      ctx.fill();
      ctx.restore();
    }

    const arrowX = f.facing * 26;
    ctx.save();
    ctx.translate(arrowX, 0);
    ctx.scale(f.facing, 1);
    ctx.fillStyle = f.accentColor;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -5.5);
    ctx.lineTo(-4, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (f.barrierTimer > 0) {
      ctx.strokeStyle = "#72efdd";
      ctx.fillStyle = "rgba(114, 239, 221, 0.16)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const chargeScale = f.mindChargeTimer > 0 ? 1 + (1 - f.mindChargeTimer / (f.mindChargeMax || 0.45)) * 0.35 : 1;
    ctx.scale(f.squashX * chargeScale, f.squashY * chargeScale);
    ctx.font = '34px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.emoji, 0, 0);

    if (f.pulseTimer > 0) {
      if (f.def.projectileStyle === "bullet") {
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(f.facing * 24, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = f.def.projectileColorOverride || f.accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(f.facing * 18, 0, 24, f.facing > 0 ? -0.8 : Math.PI - 0.8, f.facing > 0 ? 0.8 : Math.PI + 0.8);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

function drawPulsesAndParticles() {
  for (const sm of slotMachines) {
    const shakeX = (Math.random() - 0.5) * 6;
    const pulseScale = 1.05 + Math.sin(timeElapsed * 42) * 0.14;
    ctx.save();
    ctx.translate(sm.x + shakeX, sm.y);
    ctx.scale(pulseScale, pulseScale);
    ctx.font = '30px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎰", 0, 0);
    ctx.restore();
  }

  for (const ufo of ufoDrones) {
    ctx.save();
    ctx.translate(ufo.x, ufo.y);
    ctx.strokeStyle = "rgba(181, 23, 158, 0.45)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, 70);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '30px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛸", 0, 0);
    ctx.restore();
  }

  for (const hz of hazardZones) {
    const alpha = Math.min(1, hz.life / 0.35);
    ctx.save();
    ctx.globalAlpha = alpha * 0.88;
    if (hz.type === "mystic_orb") {
      const pulseR = hz.radius + Math.sin(timeElapsed * 10) * 3;
      ctx.fillStyle = "rgba(76, 201, 240, 0.22)";
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, pulseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🪬", hz.x, hz.y);
    } else {
      ctx.fillStyle = hz.type === "slime_pool" ? "rgba(141, 255, 122, 0.24)" : "rgba(255, 209, 102, 0.28)";
      ctx.strokeStyle = hz.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(hz.x, hz.y - 3, hz.radius, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const sw of shockwaves) {
    const lifeRatio = Math.max(0, sw.life / sw.maxLife);
    const alpha = Math.min(1, lifeRatio / 0.35);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = sw.maxRadius >= 130 ? 6 : 3.5;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const fx of impactFlashes) {
    const progress = 1 - Math.max(0, fx.life / fx.maxLife);
    const eased = 1 - Math.pow(1 - progress, 3);
    const radius = 7 + (fx.maxRadius - 7) * eased;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.strokeStyle = fx.color;
    ctx.shadowColor = fx.color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 4 * (1 - progress) + 1;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha *= 0.45;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, radius * 0.68, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const pl of pulses) {
    if (pl.trail && pl.trail.length > 1) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let j = 1; j < pl.trail.length; j++) {
        const strength = j / pl.trail.length;
        ctx.globalAlpha = strength * 0.38;
        ctx.strokeStyle = pl.color || "#ffffff";
        ctx.lineWidth = Math.max(1, pl.radius * (0.12 + strength * 0.38));
        ctx.shadowColor = pl.color || "#ffffff";
        ctx.shadowBlur = 4 + 9 * strength;
        ctx.beginPath();
        ctx.moveTo(pl.trail[j - 1].x, pl.trail[j - 1].y);
        ctx.lineTo(pl.trail[j].x, pl.trail[j].y);
        ctx.stroke();
      }
      ctx.restore();
    }
    const lifeRatio = Math.max(0, pl.life / pl.maxLife);
    const alpha = Math.min(1, lifeRatio / 0.18);
    const angle = Math.atan2(pl.vy || 0, pl.vx || pl.dir);
    ctx.save();
    ctx.translate(pl.x, pl.y);
    ctx.globalAlpha = alpha;

    if (pl.style === "bullet") {
      ctx.rotate(angle);
      const r = pl.radius;
      const tailLen = r * 4.5;
      const trailGrad = ctx.createLinearGradient(-tailLen, 0, r, 0);
      trailGrad.addColorStop(0, "rgba(255, 209, 102, 0)");
      trailGrad.addColorStop(1, pl.color);
      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(-tailLen, -r * 0.45);
      ctx.lineTo(0, -r * 0.85);
      ctx.lineTo(0, r * 0.85);
      ctx.lineTo(-tailLen, r * 0.45);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pl.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.35, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(r * 0.4, -r * 0.15, r * 0.65, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "bandage_fist") {
      ctx.rotate(angle);
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 12;
      ctx.font = '30px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🩹", 0, 0);
      ctx.shadowBlur = 0;

    } else if (pl.style === "brain_spark") {
      ctx.rotate((pl.age || 0) * 22);
      const outerR = pl.radius * 0.9;
      const innerR = outerR * 0.44;
      ctx.fillStyle = "#ff5c8a";
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 === 0 ? outerR : innerR;
        const a = (k * Math.PI) / 5;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, outerR * 0.25, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "poop_bomb") {
      ctx.rotate((pl.age || 0) * 14);
      ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💩", 0, 0);

    } else if (pl.style === "compass_arrow") {
      ctx.rotate(angle);
      const r = pl.radius * 0.85;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ff5c8a";
      ctx.beginPath();
      ctx.moveTo(r * 1.15, 0);
      ctx.lineTo(0, -r * 0.36);
      ctx.lineTo(0, r * 0.36);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#72efdd";
      ctx.beginPath();
      ctx.moveTo(-r * 1.15, 0);
      ctx.lineTo(0, -r * 0.36);
      ctx.lineTo(0, r * 0.36);
      ctx.closePath();
      ctx.fill();

    } else if (pl.style === "gold_coin") {
      const spinScale = Math.max(0.25, Math.abs(Math.cos((pl.age || 0) * 18)));
      const r = pl.radius * 0.78;
      ctx.scale(spinScale, 1);
      ctx.fillStyle = "#ffd166";
      ctx.strokeStyle = "#f77f00";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#b5651d";
      ctx.font = `bold ${Math.round(r * 1.25)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);

    } else if (pl.style === "joker_card") {
      ctx.rotate((pl.age || 0) * 20);
      ctx.font = '28px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🃏", 0, 0);

    } else if (pl.style === "cyber_square") {
      ctx.rotate((pl.age || 0) * 12);
      const s = pl.radius * 0.9;
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 3;
      ctx.strokeRect(-s * 0.5, -s * 0.5, s, s);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "rgba(76, 201, 240, 0.35)";
      ctx.fillRect(-s * 0.38, -s * 0.38, s * 0.76, s * 0.76);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-s * 0.38, -s * 0.38, s * 0.76, s * 0.76);

    } else if (pl.style === "pixel_laser") {
      ctx.rotate(angle);
      ctx.fillStyle = pl.color;
      ctx.fillRect(-14, -4, 18, 8);
      ctx.fillStyle = "#72efdd";
      ctx.fillRect(-6, -7, 14, 14);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, -3, 10, 6);

    } else if (pl.style === "ice_crystal") {
      ctx.rotate(angle);
      const r = pl.radius;
      ctx.fillStyle = "#70e4ff";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r * 1.25, 0);
      ctx.lineTo(0, -r * 0.55);
      ctx.lineTo(-r * 1.1, 0);
      ctx.lineTo(0, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-r * 0.25, -r * 0.72);
      ctx.lineTo(r * 0.25, r * 0.72);
      ctx.moveTo(-r * 0.25, r * 0.72);
      ctx.lineTo(r * 0.25, -r * 0.72);
      ctx.stroke();

    } else if (pl.style === "star_shuriken") {
      ctx.rotate((pl.age || 0) * 18);
      const outerR = pl.radius * 0.85;
      const innerR = outerR * 0.42;
      ctx.fillStyle = "#ffd166";
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 === 0 ? outerR : innerR;
        const a = (k * Math.PI) / 4;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (pl.style === "zigzag_spring") {
      ctx.rotate(angle);
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-14, -7);
      ctx.lineTo(-5, 7);
      ctx.lineTo(4, -7);
      ctx.lineTo(13, 0);
      ctx.stroke();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(13, 0, 5, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "dizzy_bubble") {
      ctx.rotate((pl.age || 0) * 10);
      const r = pl.radius * 0.78;
      ctx.fillStyle = "rgba(114, 239, 221, 0.2)";
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      for (let t = 0; t < 12; t++) {
        const sr = (t / 12) * r * 0.75;
        const sa = t * 0.7;
        if (t === 0) ctx.moveTo(0, 0);
        else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
      }
      ctx.stroke();

    } else if (pl.style === "mega_wave") {
      ctx.rotate(angle);
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius, -0.95, 0.95);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-7, 0, pl.radius * 0.72, -0.8, 0.8);
      ctx.stroke();

    } else if (pl.style === "cool_triple_wave") {
      ctx.rotate(angle);
      const pCol = pl.playerColor || pl.color;
      const sCol = pl.secondaryColor || "#ffffff";
      const tailGrad = ctx.createLinearGradient(-46, 0, 12, 0);
      tailGrad.addColorStop(0, "rgba(255,255,255,0)");
      tailGrad.addColorStop(1, pCol);
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(-46, -12);
      ctx.lineTo(6, -22);
      ctx.lineTo(6, 22);
      ctx.lineTo(-46, 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = pCol;
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius, -1.0, 1.0);
      ctx.stroke();

      ctx.strokeStyle = sCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-6, 0, pl.radius * 0.72, -0.85, 0.85);
      ctx.stroke();

    } else if (pl.style === "quake_ring") {
      ctx.rotate(angle);
      const jitter = Math.sin((pl.age || 0) * 60) * 2.5;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, jitter, pl.radius * 0.55, pl.radius * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(-6, -jitter, pl.radius * 0.4, pl.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (pl.style === "bounce_ball") {
      ctx.rotate((pl.age || 0) * 14);
      ctx.fillStyle = pl.color;
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-pl.radius * 0.45, 0);
      ctx.lineTo(pl.radius * 0.45, 0);
      ctx.moveTo(0, -pl.radius * 0.45);
      ctx.lineTo(0, pl.radius * 0.45);
      ctx.stroke();

    } else if (pl.style === "scythe_spin") {
      ctx.rotate((pl.age || 0) * 20);
      ctx.strokeStyle = "#e0aaff";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius * 0.85, -0.4, 2.3);
      ctx.stroke();
      ctx.strokeStyle = "#9d4edd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-pl.radius * 0.6, -pl.radius * 0.3);
      ctx.lineTo(pl.radius * 0.6, pl.radius * 0.5);
      ctx.stroke();

    } else if (pl.style === "slime_drop") {
      ctx.rotate(angle);
      const r = pl.radius * 0.75;
      ctx.fillStyle = "#8dff7a";
      ctx.beginPath();
      ctx.moveTo(r * 1.2, 0);
      ctx.quadraticCurveTo(0, -r * 1.1, -r * 1.3, -r * 0.35);
      ctx.quadraticCurveTo(-r * 0.9, 0, -r * 1.3, r * 0.35);
      ctx.quadraticCurveTo(0, r * 1.1, r * 1.2, 0);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(r * 0.25, -r * 0.25, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "ghost_wisp") {
      ctx.rotate(angle);
      const pulseA = 0.65 + Math.sin((pl.age || 0) * 24) * 0.35;
      ctx.globalAlpha = alpha * pulseA;
      ctx.fillStyle = pl.color;
      ctx.beginPath();
      ctx.arc(2, 0, pl.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, -pl.radius * 0.65);
      ctx.lineTo(-18, 0);
      ctx.lineTo(2, pl.radius * 0.65);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(4, 0, pl.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "angel_halo") {
      ctx.rotate(angle);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, pl.radius * 0.55, pl.radius * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, pl.radius * 0.35, pl.radius * 0.72, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (pl.style === "devil_flame") {
      ctx.rotate(angle);
      const r = pl.radius * 0.85;
      ctx.fillStyle = "#ff5c8a";
      ctx.beginPath();
      ctx.moveTo(r * 1.25, 0);
      ctx.lineTo(-r * 0.8, -r * 0.85);
      ctx.lineTo(-r * 0.35, 0);
      ctx.lineTo(-r * 0.8, r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(r * 0.15, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();

    } else if (pl.style === "boomerang") {
      ctx.rotate((pl.age || 0) * 18);
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius, -1.2, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius, Math.PI - 1.2, Math.PI + 1.2);
      ctx.stroke();

    } else if (pl.style === "mystic_eye") {
      ctx.rotate(angle);
      const r = pl.radius * 0.85;
      ctx.fillStyle = "rgba(76, 201, 240, 0.3)";
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.1, r * 0.68, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.arc(r * 0.2, 0, r * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b0918";
      ctx.beginPath(); ctx.arc(r * 0.28, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();

    } else if (pl.style === "plasma_bolt") {
      ctx.rotate(angle);
      const r = pl.radius * 0.85;
      ctx.fillStyle = "#72efdd"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-r * 1.3, -r * 0.48, r * 2.6, r * 0.96, r * 0.48);
      ctx.fill(); ctx.stroke();

    } else if (pl.style === "mecha_missile") {
      ctx.rotate(angle);
      const r = pl.radius * 0.9;
      ctx.fillStyle = "#ff5c8a";
      ctx.beginPath(); ctx.moveTo(r * 1.2, 0); ctx.lineTo(r * 0.3, -r * 0.45); ctx.lineTo(r * 0.3, r * 0.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e0e6ff"; ctx.fillRect(-r * 0.9, -r * 0.38, r * 1.2, r * 0.76);
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.arc(-r * 1.1, 0, r * 0.36, 0, Math.PI * 2); ctx.fill();

    } else if (pl.style === "party_popper") {
      ctx.rotate(angle);
      const r = pl.radius * 0.85;
      ctx.fillStyle = "#ff5c8a"; ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(r * 1.2, 0); ctx.lineTo(-r * 0.9, -r * 0.75); ctx.lineTo(-r * 0.9, r * 0.75); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#72efdd"; ctx.fillRect(r * 0.2, -r * 0.55, 4, 4);
      ctx.fillStyle = "#ffd166"; ctx.fillRect(r * 0.45, r * 0.25, 4, 4);

    } else if (pl.style === "bounce_ball") {
      // 風船本体、結び目、揺れるひもを描画
      const r = pl.radius * 0.9;
      ctx.fillStyle = pl.color || "#ff5c8a";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.12, r * 0.72, r, Math.sin((pl.age || 0) * 8) * 0.12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, r * 0.82); ctx.lineTo(-r * 0.16, r * 1.05); ctx.lineTo(r * 0.16, r * 1.05);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = pl.color || "#ff5c8a";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.05);
      ctx.quadraticCurveTo(Math.sin((pl.age || 0) * 10) * r * 0.35, r * 1.45, Math.sin((pl.age || 0) * 7) * r * 0.18, r * 1.75);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.ellipse(-r * 0.24, -r * 0.38, r * 0.16, r * 0.28, -0.25, 0, Math.PI * 2); ctx.fill();

    } else if (pl.style === "mystic_reflect") {
      ctx.rotate(angle);
      const r = pl.radius;
      ctx.strokeStyle = "#4cc9f0"; ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(76,201,240,0.25)";
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(r * 0.2, 0, r * 0.28, 0, Math.PI * 2); ctx.fill();

    } else {
      ctx.rotate(angle);
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, pl.radius, -0.9, 0.9);
      ctx.stroke();
    }

    ctx.restore();
  }

  for (const fp of floatingPopups) {
    const entrance = Math.min(1, (fp.age || 0) / 0.18);
    const popScale = entrance < 1
      ? 0.72 + Math.sin(entrance * Math.PI / 2) * 0.42
      : 1.14 - Math.min(0.14, ((fp.age || 0) - 0.18) * 0.8);
    ctx.save();
    ctx.globalAlpha = Math.min(1, fp.life / 0.3);
    ctx.translate(fp.x, fp.y);
    ctx.scale(popScale, popScale);
    ctx.font = "900 16px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#0b0918";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.shadowColor = fp.color;
    ctx.shadowBlur = 10;
    ctx.strokeText(fp.text, 0, 0);
    ctx.fillStyle = fp.color;
    ctx.fillText(fp.text, 0, 0);
    ctx.restore();
  }

  for (const pt of particles) {
    const fade = Math.max(0, pt.life / pt.maxLife);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = fade;
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.rotation || 0);
    ctx.fillStyle = pt.color;
    ctx.strokeStyle = pt.color;
    ctx.shadowColor = pt.color;
    ctx.shadowBlur = 5 + pt.size * 1.8;
    if (pt.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, pt.size * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (pt.shape === "spark") {
      ctx.lineWidth = Math.max(1, pt.size * 0.32);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-pt.size * 1.5, 0);
      ctx.lineTo(pt.size * 1.5, 0);
      ctx.moveTo(0, -pt.size * 0.7);
      ctx.lineTo(0, pt.size * 0.7);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -pt.size);
      ctx.lineTo(pt.size * 0.62, 0);
      ctx.lineTo(0, pt.size);
      ctx.lineTo(-pt.size * 0.62, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function render() {
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.save();
  if (screenShakeTimer > 0 && screenShakeMagnitude > 0) {
    const sx = (Math.random() - 0.5) * 2 * screenShakeMagnitude;
    const sy = (Math.random() - 0.5) * 2 * screenShakeMagnitude;
    ctx.translate(sx, sy);
  }
  drawArena();
  if (screenMode === "battle" || screenMode === "result") {
    drawFieldItems();
    drawFighters();
    drawPulsesAndParticles();
    drawOverlayBanners();
  }
  ctx.restore();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  Sound.unlock();
  const code = e.code;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", " ", "Slash"].includes(e.key) || code === "Slash") {
    e.preventDefault();
  }
  if (code === "KeyM" && !e.repeat) {
    Sound.toggleMute();
    refreshSoundBtn();
    return;
  }

  if (screenMode === "stage") {
    if (code === "ArrowLeft") selectStage(selectedStageIndex - 1);
    else if (code === "ArrowRight") selectStage(selectedStageIndex + 1);
    else if (code === "ArrowUp") selectStage(selectedStageIndex - 2);
    else if (code === "ArrowDown") selectStage(selectedStageIndex + 2);
    else if ((code === "Enter" || code === "NumpadEnter") && !e.repeat) {
      e.preventDefault();
      Sound.sfx("click");
      openCharScreen();
    }
    return;
  }
  if (screenMode === "char") {
    if ((code === "Enter" || code === "NumpadEnter") && !e.repeat) {
      e.preventDefault();
      startNewSeries();
    } else if (code === "Escape" && !e.repeat) {
      openStageScreen();
    }
    return;
  }
  if (screenMode === "result") {
    if (code === "KeyR" && !e.repeat) {
      startBattle();
    } else if ((code === "Enter" || code === "NumpadEnter") && !e.repeat && koTimer <= 0) {
      e.preventDefault();
      startBattle();
    }
    return;
  }

  if ((code === "KeyP" || code === "Escape") && !e.repeat) {
    setPaused(!paused);
    return;
  }
  if (code === "KeyR" && !e.repeat) {
    startBattle();
    return;
  }
  if (screenMode !== "battle" || paused || countdownTimer > 0) return;
  if (code === "Enter" || code === "NumpadEnter") e.preventDefault();
  if (code === "KeyA") p1Input.left = true;
  if (code === "KeyD") p1Input.right = true;
  if ((code === "KeyW" || code === "Space") && !e.repeat) p1Input.jumpPressed = true;
  if (code === "KeyS" && !e.repeat) {
    p1Input.pulseHeld = true;
    p1Input.pulseReleased = false;
  }
  if (code === "KeyQ" && !e.repeat) {
    p1Input.specialPressed = true;
  }
  if (code === "ArrowLeft") p2Input.left = true;
  if (code === "ArrowRight") p2Input.right = true;
  if (code === "ArrowUp" && !e.repeat) p2Input.jumpPressed = true;
  if (code === "ArrowDown" && !e.repeat) {
    p2Input.pulseHeld = true;
    p2Input.pulseReleased = false;
  }
  if ((code === "Enter" || code === "NumpadEnter" || code === "Slash") && !e.repeat) {
    p2Input.specialPressed = true;
  }
});

window.addEventListener("keyup", (e) => {
  const code = e.code;
  if (code === "KeyA") p1Input.left = false;
  if (code === "KeyD") p1Input.right = false;
  if (code === "KeyS") {
    if (p1Input.pulseHeld) {
      p1Input.pulseHeld = false;
      p1Input.pulseReleased = true;
    }
  }

  if (code === "ArrowLeft") p2Input.left = false;
  if (code === "ArrowRight") p2Input.right = false;
  if (code === "ArrowDown") {
    if (p2Input.pulseHeld) {
      p2Input.pulseHeld = false;
      p2Input.pulseReleased = true;
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  Sound.unlock();
  if (screenMode !== "battle" || paused || countdownTimer > 0) return;
  if (e.button === 0) {
    p2Input.specialPressed = true;
  } else if (e.button === 2) {
    p2Input.jumpPressed = true;
  }
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("blur", () => {
  clearInputs();
  if (screenMode === "battle" && countdownTimer <= 0) setPaused(true);
});
window.addEventListener("resize", resizeCanvas);
document.addEventListener("pointerdown", () => Sound.unlock());
document.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest("button")) Sound.sfx("click");
});
soundBtn.addEventListener("click", () => {
  Sound.toggleMute();
  refreshSoundBtn();
  soundBtn.blur();
});
pauseBtn.addEventListener("click", () => {
  setPaused(!paused);
  pauseBtn.blur();
});
resumeBtn.addEventListener("click", () => setPaused(false));
pauseRestartBtn.addEventListener("click", startBattle);
pauseMenuBtn.addEventListener("click", openStageScreen);
p1Random.addEventListener("click", () => {
  selectedP1 = randomCharacter();
  refreshActiveButtons();
  updateAbilityInfoUI();
});
p2Random.addEventListener("click", () => {
  selectedP2 = randomCharacter();
  refreshActiveButtons();
  updateAbilityInfoUI();
});

toCharSelectBtn.addEventListener("click", openCharScreen);
backToStageBtn.addEventListener("click", openStageScreen);
startBattleBtn.addEventListener("click", startNewSeries);
rematchBtn.addEventListener("click", startBattle);
toCharBtn.addEventListener("click", openCharScreen);
toStageBtn.addEventListener("click", openStageScreen);

buildStageSelectUI();
buildCharacterSelectUI();
syncAssistUI();
refreshSoundBtn();
resizeCanvas();
requestAnimationFrame(loop);
