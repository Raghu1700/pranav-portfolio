/* Tiny synthesised sound kit — no audio files needed. */
(function () {
  const S = { ctx: null, muted: false };

  function ctx() {
    if (!S.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { S.ctx = new C(); } catch (e) { return null; }
    }
    if (S.ctx.state === 'suspended') { try { S.ctx.resume(); } catch (e) {} }
    return S.ctx;
  }

  // Browsers only allow audio after a user gesture.
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
    document.addEventListener(ev, () => ctx(), { capture: true, passive: true }));

  function noise(c, dur) {
    const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; return s;
  }

  function play(kind, pan) {
    const c = ctx();
    if (!c || c.state !== 'running' || S.muted) return;
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.value = 0.55;
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan || 0; out.connect(p); p.connect(c.destination); }
    else out.connect(c.destination);
    const env = (node, at, peak, len) => {
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      node.connect(g); g.connect(out); return g;
    };

    if (kind === 'thwip') {
      const s = noise(c, 0.26);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.6;
      f.frequency.setValueAtTime(5200, t); f.frequency.exponentialRampToValueAtTime(420, t + 0.22);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + 0.26);
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.16);
      env(o, t, 0.12, 0.17); o.start(t); o.stop(t + 0.18);
    }
    if (kind === 'beep') {
      [0, 0.1].forEach((d) => { const o = c.createOscillator(); o.frequency.value = 2300; env(o, t + d, 0.18, 0.06); o.start(t + d); o.stop(t + d + 0.08); });
    }
    if (kind === 'charge') {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(5200, t + 0.42);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.46);
    }
    if (kind === 'shutter') {
      [[0, 4200, 0.95], [0.05, 1600, 0.7]].forEach((p) => {
        const s = noise(c, 0.06);
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = p[1]; f.Q.value = 0.9;
        s.connect(f); env(f, t + p[0], p[2], 0.05); s.start(t + p[0]); s.stop(t + p[0] + 0.07);
      });
      const o = c.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(180, t + 0.05); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      env(o, t + 0.05, 0.25, 0.08); o.start(t + 0.05); o.stop(t + 0.14);
    }
    if (kind === 'pop') {
      const s = noise(c, 0.12);
      const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
      s.connect(f); env(f, t, 0.35, 0.1); s.start(t); s.stop(t + 0.12);
    }
    if (kind === 'eject') {
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(130, t + 0.5);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.05); g.gain.setValueAtTime(0.08, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.56);
    }
  }

  window.SFX = { play: play, unlock: ctx };
})();
