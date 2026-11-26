// ============================================================================
// WebAudio 合成サウンド・BGMエンジン
// ============================================================================

const Sound = (() => {
  let ac = null, master = null, bgmGain = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem("emojiArenaMuted") === "1"; } catch (e) {}
  let bgmMode = "menu", step = 0, nextTime = 0, timer = null;
  const STEP = 60 / 132 / 2;
  const CHORDS = [
    { b: 55.0, n: [220, 261.63, 329.63, 440] },
    { b: 43.65, n: [174.61, 220, 261.63, 349.23] },
    { b: 65.41, n: [261.63, 329.63, 392, 523.25] },
    { b: 49.0, n: [196, 246.94, 293.66, 392] }
  ];

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ac = new AC();
        master = ac.createGain();
        master.gain.value = muted ? 0 : 0.8;
        master.connect(ac.destination);
        bgmGain = ac.createGain();
        bgmGain.gain.value = 0.5;
        bgmGain.connect(master);
        noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; return null; }
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  function tone(o) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = o.at !== undefined ? o.at : c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || "square";
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.end) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.end), t0 + o.dur);
    const vol = o.vol !== undefined ? o.vol : 0.1;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    g.connect(o.bus || master);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.03);
  }

  function noise(o) {
    const c = ensure();
    if (!c || muted || !noiseBuf) return;
    const t0 = o.at !== undefined ? o.at : c.currentTime + (o.delay || 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = o.filter || "lowpass";
    f.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t0 + o.dur);
    const g = c.createGain();
    g.gain.setValueAtTime(o.vol !== undefined ? o.vol : 0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f); f.connect(g); g.connect(o.bus || master);
    src.start(t0);
    src.stop(t0 + o.dur + 0.03);
  }

  function playStep(s, at) {
    const ch = CHORDS[Math.floor(s / 8) % 4];
    const i = s % 8;
    const battle = bgmMode === "battle";
    if (i % 2 === 0) {
      tone({ freq: ch.b * (i === 4 ? 2 : 1), dur: STEP * 1.7, type: "triangle", vol: battle ? 0.17 : 0.12, at, bus: bgmGain });
    }
    const pat = [0, 1, 2, 3, 2, 1, 2, 3];
    if (battle || i % 2 === 0) {
      tone({ freq: ch.n[pat[i]], dur: STEP * 0.85, type: battle ? "square" : "sine", vol: battle ? 0.03 : 0.04, at, bus: bgmGain });
    }
    if (battle && i % 2 === 1) noise({ dur: 0.04, vol: 0.035, freq: 7000, filter: "highpass", at, bus: bgmGain });
    if (battle && (i === 0 || i === 4)) tone({ freq: 130, end: 45, dur: 0.12, type: "sine", vol: 0.2, at, bus: bgmGain });
  }

  function pump() {
    if (!ac) return;
    if (muted) { nextTime = ac.currentTime + 0.05; return; }
    if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.05;
    while (nextTime < ac.currentTime + 0.3) {
      playStep(step, nextTime);
      step++;
      nextTime += STEP;
    }
  }

  function unlock() {
    if (!ensure()) return;
    if (!timer) {
      nextTime = ac.currentTime + 0.1;
      timer = setInterval(pump, 100);
    }
  }

  function setBgm(mode) { bgmMode = mode; }

  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem("emojiArenaMuted", muted ? "1" : "0"); } catch (e) {}
    if (master) master.gain.value = muted ? 0 : 0.8;
    unlock();
    return muted;
  }

  function sfx(name, arg) {
    switch (name) {
      case "click": tone({ freq: 760, end: 1100, dur: 0.06, type: "square", vol: 0.06 }); break;
      case "jump": tone({ freq: 300, end: 640, dur: 0.12, type: "sine", vol: 0.13 }); break;
      case "djump": tone({ freq: 420, end: 900, dur: 0.12, type: "sine", vol: 0.13 }); break;
      case "shoot": {
        const p = arg || 0;
        tone({ freq: 760 - p * 200, end: 200, dur: 0.1 + p * 0.07, type: "square", vol: 0.06 + p * 0.04 });
        noise({ dur: 0.06, vol: 0.05, freq: 3000, filter: "highpass" });
        break;
      }
      case "hit":
        noise({ dur: 0.2, vol: 0.25, freq: 2400, freqEnd: 200 });
        tone({ freq: 240, end: 60, dur: 0.18, type: "sawtooth", vol: 0.16 });
        break;
      case "item":
        tone({ freq: 587.33, dur: 0.09, type: "triangle", vol: 0.14 });
        tone({ freq: 880, dur: 0.16, type: "triangle", vol: 0.14, delay: 0.07 });
        tone({ freq: 1174.66, dur: 0.22, type: "sine", vol: 0.12, delay: 0.14 });
        break;
      case "special":
        tone({ freq: 220, end: 980, dur: 0.22, type: "sawtooth", vol: 0.08 });
        tone({ freq: 440, end: 1480, dur: 0.22, type: "triangle", vol: 0.08, delay: 0.03 });
        break;
      case "boom":
        noise({ dur: 0.6, vol: 0.4, freq: 1800, freqEnd: 80 });
        tone({ freq: 110, end: 28, dur: 0.55, type: "sine", vol: 0.35 });
        break;
      case "count": tone({ freq: 660, dur: 0.14, type: "sine", vol: 0.16 }); break;
      case "go":
        tone({ freq: 990, dur: 0.32, type: "square", vol: 0.1 });
        tone({ freq: 1320, dur: 0.32, type: "triangle", vol: 0.1 });
        break;
      case "ko":
        noise({ dur: 0.5, vol: 0.3, freq: 2200, freqEnd: 90 });
        tone({ freq: 520, end: 70, dur: 0.7, type: "sawtooth", vol: 0.16 });
        break;
      case "sudden":
        tone({ freq: 330, end: 165, dur: 0.5, type: "sawtooth", vol: 0.12 });
        tone({ freq: 311, end: 155, dur: 0.5, type: "sawtooth", vol: 0.1 });
        break;
      case "win":
        [523.25, 659.25, 783.99, 1046.5].forEach((fr, k) => tone({ freq: fr, dur: 0.22, type: "square", vol: 0.09, delay: k * 0.11 }));
        tone({ freq: 1046.5, dur: 0.55, type: "triangle", vol: 0.1, delay: 0.46 });
        break;
    }
  }

  return { sfx, unlock, setBgm, toggleMute, isMuted: () => muted };
})();
