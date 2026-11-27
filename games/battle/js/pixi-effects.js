/*
 * GPU effect overlay for Emoji Battle Arena.
 * Gameplay, collisions and physics remain in the existing Canvas engine.
 * PixiJS only renders short-lived visual effects and falls back cleanly.
 */
(function () {
  "use strict";

  const PIXI = window.PIXI;
  if (!PIXI || !PIXI.Application || !PIXI.ParticleContainer || !PIXI.Particle) {
    console.warn("[BattleEffects] PixiJS is unavailable; using Canvas effects.");
    return;
  }

  const WIDTH = 960;
  const HEIGHT = 540;
  const PARTICLE_CAP = 140;
  const TRAIL_CAP = 180;
  const RING_CAP = 48;

  let app = null;
  let particlePool = [];
  let trailPool = [];
  let ringPool = [];
  let ready = false;
  let failed = false;

  function colorNumber(value) {
    if (typeof value === "number") return value;
    const hex = String(value || "#ffffff").replace("#", "");
    const parsed = Number.parseInt(hex, 16);
    return Number.isFinite(parsed) ? parsed : 0xffffff;
  }

  function makeSoftDotTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(16, 16, 1, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.32, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.72, "rgba(255,255,255,0.24)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return PIXI.Texture.from(canvas);
  }

  function makeRingTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    context.beginPath();
    context.arc(32, 32, 25, 0, Math.PI * 2);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 4;
    context.stroke();
    return PIXI.Texture.from(canvas);
  }

  function createPool(container, texture, count) {
    const pool = [];
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Particle({
        texture,
        x: -100,
        y: -100,
        scaleX: 0,
        scaleY: 0,
        tint: 0xffffff,
        alpha: 0
      });
      container.addParticle(particle);
      pool.push(particle);
    }
    return pool;
  }

  function makeParticleContainer() {
    return new PIXI.ParticleContainer({
      boundsArea: new PIXI.Rectangle(0, 0, WIDTH, HEIGHT),
      dynamicProperties: {
        position: true,
        rotation: true,
        vertex: true,
        color: true
      }
    });
  }

  function hidePool(pool, from = 0) {
    for (let i = from; i < pool.length; i++) {
      pool[i].alpha = 0;
    }
  }

  function renderTrails(pulses, shakeX, shakeY) {
    let cursor = 0;
    for (const projectile of pulses) {
      const points = projectile.trail;
      if (!points || points.length < 2) continue;
      const start = Math.max(1, points.length - 5);
      const total = points.length - start;
      for (let i = start; i < points.length; i++) {
        if (cursor >= trailPool.length) break;
        const a = points[i - 1];
        const b = points[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.5) continue;

        const particle = trailPool[cursor++];
        const strength = (i - start + 1) / Math.max(1, total);
        particle.x = (a.x + b.x) * 0.5 + shakeX;
        particle.y = (a.y + b.y) * 0.5 + shakeY;
        particle.rotation = Math.atan2(dy, dx);
        particle.scaleX = Math.max(0.08, distance / 32);
        particle.scaleY = Math.max(0.035, Math.min(0.18, (projectile.radius || 10) * 0.22 / 16));
        particle.tint = colorNumber(projectile.color || projectile.playerColor);
        particle.alpha = Math.min(0.42, strength * 0.42);
      }
      if (cursor >= trailPool.length) break;
    }
    hidePool(trailPool, cursor);
  }

  function renderParticles(particles, shakeX, shakeY) {
    const count = Math.min(particles.length, particlePool.length);
    for (let i = 0; i < count; i++) {
      const source = particles[i];
      const particle = particlePool[i];
      const size = Math.max(1.2, source.size || 3);
      particle.x = source.x + shakeX;
      particle.y = source.y + shakeY;
      particle.rotation = source.rotation || 0;
      if (source.shape === "spark") {
        particle.scaleX = (size * 2.4) / 32;
        particle.scaleY = (size * 0.46) / 32;
      } else if (source.shape === "diamond") {
        particle.scaleX = (size * 1.05) / 32;
        particle.scaleY = (size * 1.8) / 32;
        particle.rotation += Math.PI / 4;
      } else {
        particle.scaleX = (size * 1.7) / 32;
        particle.scaleY = (size * 1.7) / 32;
      }
      particle.tint = colorNumber(source.color);
      particle.alpha = Math.max(0, Math.min(1, source.life / source.maxLife));
    }
    hidePool(particlePool, count);
  }

  function setRing(particle, x, y, radius, tint, alpha, shakeX, shakeY) {
    particle.x = x + shakeX;
    particle.y = y + shakeY;
    particle.scaleX = Math.max(0.01, (radius * 2) / 64);
    particle.scaleY = particle.scaleX;
    particle.rotation = 0;
    particle.tint = tint;
    particle.alpha = Math.max(0, Math.min(1, alpha));
  }

  function renderRings(flashes, fighters, shakeX, shakeY) {
    let cursor = 0;
    for (const flash of flashes) {
      if (cursor + 1 >= ringPool.length) break;
      const progress = 1 - Math.max(0, flash.life / flash.maxLife);
      const eased = 1 - Math.pow(1 - progress, 3);
      const radius = 7 + (flash.maxRadius - 7) * eased;
      const alpha = Math.max(0, 1 - progress);
      const tint = colorNumber(flash.color);
      setRing(ringPool[cursor++], flash.x, flash.y, radius, tint, alpha * 0.78, shakeX, shakeY);
      setRing(ringPool[cursor++], flash.x, flash.y, radius * 0.76, tint, alpha * 0.28, shakeX, shakeY);
    }

    for (const fighter of fighters) {
      if (!fighter || fighter.hp <= 0 || cursor + 1 >= ringPool.length) continue;
      const color = colorNumber(fighter.def.projectileColorOverride || fighter.accentColor);
      const centerX = fighter.x + fighter.w / 2;
      const centerY = fighter.y + fighter.h / 2;
      const pulse = 1 + Math.sin((fighter.animTime || 0) * 2.2) * 0.045;
      const strength = fighter.isChargingPulse || fighter.specialCooldown <= 0 ? 0.38 : 0.2;
      setRing(ringPool[cursor++], centerX, centerY, 29 * pulse, color, strength, shakeX, shakeY);
      setRing(ringPool[cursor++], centerX, centerY, 35 * pulse, color, strength * 0.32, shakeX, shakeY);
    }
    hidePool(ringPool, cursor);
  }

  async function initialize() {
    const host = document.querySelector(".game-wrap");
    if (!host) throw new Error("Game container not found");

    app = new PIXI.Application();
    await app.init({
      width: WIDTH,
      height: HEIGHT,
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      resolution: Math.min(1.25, window.devicePixelRatio || 1),
      autoStart: false,
      preference: "webgl",
      powerPreference: "high-performance"
    });
    app.stop();

    app.canvas.className = "pixi-effects-canvas";
    app.canvas.setAttribute("aria-hidden", "true");
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    app.canvas.style.pointerEvents = "none";
    host.appendChild(app.canvas);

    const softTexture = makeSoftDotTexture();
    const ringTexture = makeRingTexture();
    const trailLayer = makeParticleContainer();
    const particleLayer = makeParticleContainer();
    const ringLayer = makeParticleContainer();

    trailPool = createPool(trailLayer, softTexture, TRAIL_CAP);
    particlePool = createPool(particleLayer, softTexture, PARTICLE_CAP);
    ringPool = createPool(ringLayer, ringTexture, RING_CAP);

    app.stage.addChild(trailLayer, particleLayer, ringLayer);
    ready = true;
    console.info("[BattleEffects] PixiJS GPU effects enabled.");
  }

  window.BattleEffects = {
    get isReady() {
      return ready && !failed;
    },
    render(flashes, pulses, particles, fighters, shakeX = 0, shakeY = 0) {
      if (!ready || failed || !app) return false;
      try {
        renderTrails(pulses, shakeX, shakeY);
        renderParticles(particles, shakeX, shakeY);
        renderRings(flashes, fighters, shakeX, shakeY);
        app.render();
        return true;
      } catch (error) {
        failed = true;
        ready = false;
        app.canvas.remove();
        console.warn("[BattleEffects] PixiJS renderer stopped; falling back to Canvas.", error);
        return false;
      }
    }
  };

  initialize().catch((error) => {
    failed = true;
    ready = false;
    if (app && app.canvas) app.canvas.remove();
    console.warn("[BattleEffects] GPU initialization failed; using Canvas effects.", error);
  });
})();
