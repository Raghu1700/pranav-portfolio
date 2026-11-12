/* 01 · Hero — liquid reveal of the second angle + live timecode. */
(function () {
  const stage = document.getElementById('about');
  const layer = document.getElementById('heroLayer');
  const canvas = document.getElementById('heroCanvas');
  const imgA = document.getElementById('heroA');
  const imgB = document.getElementById('heroB');
  const tc = document.getElementById('timecode');
  if (!stage || !canvas) return;

  const LENS = 210;
  const m = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, tpx: 0, tpy: 0, init: false, lx: null, ly: null };
  const parts = [];
  let head = 0, idle = 999, cleared = false, active = false;
  let lw = 0, lh = 0, dpr = 1, ms = 0.25, pos = [0.5, 0.28];
  let trail, work, thr, rim, tctx, wctx, thctx, rctx, thrData, rimData, vctx;
  const t0 = performance.now();
  let last = t0;

  const radius = () => (stage.offsetWidth < 700 ? LENS * 0.75 : LENS);

  function local(e) {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: stage.offsetWidth || 1, h: stage.offsetHeight || 1 };
  }
  function point(p, snap) {
    m.tx = p.x + 28; m.ty = p.y + 28;
    if (snap || !m.init) { m.x = m.tx; m.y = m.ty; m.lx = null; m.init = true; }
    m.tpx = -(p.x / p.w - 0.5) * 22;
    m.tpy = -(p.y / p.h - 0.5) * 16;
  }

  function ensure() {
    const w = layer.offsetWidth, h = layer.offsetHeight;
    if (!w || !h) return false;
    if (w === lw && h === lh) return true;
    lw = w; lh = h;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const mw = Math.ceil(w * ms), mh = Math.ceil(h * ms);
    const mk = () => { const c = document.createElement('canvas'); c.width = mw; c.height = mh; return c; };
    trail = mk(); work = mk(); thr = mk(); rim = mk();
    tctx = trail.getContext('2d');
    wctx = work.getContext('2d', { willReadFrequently: true });
    thctx = thr.getContext('2d');
    rctx = rim.getContext('2d');
    thrData = thctx.createImageData(mw, mh);
    rimData = rctx.createImageData(mw, mh);
    vctx = canvas.getContext('2d');
    const op = getComputedStyle(imgA).objectPosition.split(' ');
    pos = [parseFloat(op[0]) / 100 || 0.5, parseFloat(op[1]) / 100 || 0.28];
    return true;
  }

  function blob(ctx, x, y, r, a) {
    x *= ms; y *= ms; r *= ms;
    if (r < 0.5 || a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, a) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    const p2 = (n) => String(Math.floor(n)).padStart(2, '0');
    if (tc) tc.textContent = 'TC 01:' + p2((t / 60) % 60) + ':' + p2(t % 60) + ':' + p2((t * 24) % 24);

    // skip the heavy work when the hero is off screen
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;

    const k = 1 - Math.pow(1 - 0.22, dt * 60);
    m.x += (m.tx - m.x) * k; m.y += (m.ty - m.y) * k;
    const kp = 1 - Math.pow(1 - 0.06, dt * 60);
    m.px += (m.tpx - m.px) * kp; m.py += (m.tpy - m.py) * kp;
    layer.style.transform = 'translate3d(' + m.px.toFixed(2) + 'px,' + m.py.toFixed(2) + 'px,0)';
    if (!ensure()) return;

    const R = radius();
    const cx = m.x - m.px, cy = m.y - m.py;
    head += ((active ? 1 : 0) - head) * (1 - Math.pow(1 - 0.12, dt * 60));

    tctx.globalCompositeOperation = 'destination-out';
    tctx.fillStyle = 'rgba(0,0,0,' + (1 - Math.pow(1 - 0.04, dt * 60)).toFixed(4) + ')';
    tctx.fillRect(0, 0, trail.width, trail.height);
    tctx.globalCompositeOperation = 'lighter';
    let moved = 0;
    if (active && m.lx !== null) {
      const dx = cx - m.lx, dy = cy - m.ly;
      moved = Math.hypot(dx, dy);
      const n = Math.min(40, Math.floor(moved / (R * 0.22)));
      for (let i = 1; i <= n; i++) blob(tctx, m.lx + dx * i / n, m.ly + dy * i / n, R * 1.05, 0.5);
      if (n > 0) { m.lx = cx; m.ly = cy; }
      if (moved > 10 && parts.length < 90) {
        const cnt = Math.min(4, Math.floor(moved / 14));
        for (let i = 0; i < cnt; i++) {
          const a = Math.random() * 6.2832, d = Math.random() * R * 0.55, life = 0.6 + Math.random() * 0.7;
          parts.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: dx * 0.08 + (Math.random() - 0.5) * 3, vy: dy * 0.08 + (Math.random() - 0.5) * 3, r: R * (0.22 + Math.random() * 0.22), life: life, l0: life });
        }
      }
    } else if (active) { m.lx = cx; m.ly = cy; }

    wctx.globalCompositeOperation = 'copy';
    wctx.drawImage(trail, 0, 0);
    wctx.globalCompositeOperation = 'lighter';
    const hr = R * 1.3 * head;
    if (hr > 1) {
      for (let i = 0; i < 4; i++) {
        const a = t * (1.3 + i * 0.37) + i * 1.57;
        const o = R * (0.16 + 0.05 * Math.sin(t * 2.1 + i));
        blob(wctx, cx + Math.cos(a) * o, cy + Math.sin(a * 1.21) * o, hr * (0.9 + 0.08 * Math.sin(t * 3 + i * 2)), 0.62);
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const f = dt * 60;
      p.x += p.vx * f; p.y += p.vy * f;
      p.vx *= Math.pow(0.93, f); p.vy = p.vy * Math.pow(0.93, f) + 0.12 * f;
      const q = p.life / p.l0;
      blob(wctx, p.x, p.y, p.r * (0.6 + 0.4 * q), 0.9 * q);
    }

    const busy = head > 0.01 || parts.length || moved > 0;
    idle = busy ? 0 : idle + dt;
    if (idle > 2.5) {
      if (!cleared) { vctx.clearRect(0, 0, canvas.width, canvas.height); cleared = true; }
      return;
    }
    cleared = false;

    const src = wctx.getImageData(0, 0, work.width, work.height).data;
    const out = thrData.data, rm = rimData.data;
    for (let i = 3; i < src.length; i += 4) {
      const a = src[i] / 255;
      let s = (a - 0.3) / 0.16;
      s = s <= 0 ? 0 : s >= 1 ? 1 : s * s * (3 - 2 * s);
      out[i - 3] = 255; out[i - 2] = 255; out[i - 1] = 255; out[i] = s * 255;
      let b = 1 - Math.abs(a - 0.36) / 0.08;
      b = b > 0 ? b : 0;
      rm[i - 3] = 255; rm[i - 2] = 255; rm[i - 1] = 255; rm[i] = b * 70;
    }
    thctx.putImageData(thrData, 0, 0);
    rctx.putImageData(rimData, 0, 0);

    const W = lw, H = lh, D = dpr;
    vctx.setTransform(1, 0, 0, 1, 0, 0);
    vctx.globalCompositeOperation = 'copy';
    vctx.imageSmoothingEnabled = true;
    vctx.imageSmoothingQuality = 'high';
    vctx.drawImage(thr, 0, 0, canvas.width, canvas.height);
    if (imgB.complete && imgB.naturalWidth) {
      vctx.globalCompositeOperation = 'source-in';
      const sc = Math.max(W / imgB.naturalWidth, H / imgB.naturalHeight);
      const dw = imgB.naturalWidth * sc, dh = imgB.naturalHeight * sc;
      vctx.drawImage(imgB, (W - dw) * pos[0] * D, (H - dh) * pos[1] * D, dw * D, dh * D);
    }
    vctx.globalCompositeOperation = 'source-over';
    vctx.drawImage(rim, -1.5 * D, -1.5 * D, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);

  stage.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; point(local(e), true); active = true; });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && !active) return;
    point(local(e), false);
    if (e.pointerType === 'mouse') active = true;
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') active = false; m.tpx = 0; m.tpy = 0; });
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target.closest('a,button')) return;
    point(local(e), true); active = true;
  });
  const up = (e) => { if (e.pointerType !== 'mouse') active = false; };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
})();
