/* 03 · Gigs — two webs shoot in, then each commission emerges from its web. */
(function () {
  const stage = document.getElementById('webStage');
  const svg = document.getElementById('webSvg');
  if (!stage || !svg) return;
  const halves = [document.getElementById('webHalf0'), document.getElementById('webHalf1')];
  const cards = [document.getElementById('gigCard0'), document.getElementById('gigCard1')];
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const N = 13, K = 11, DEW = 14, CT = 1650;

  // clicking a card opens its reel
  cards.forEach((c) => c.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-open-gig]')) return;
    const b = c.querySelector('[data-open-gig]');
    if (b && window.openGig) window.openGig(+b.getAttribute('data-open-gig'), b);
  }));

  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    parent.appendChild(el);
    return el;
  };
  const W = [0, 1].map(() => {
    const thread = mk('path', { fill: 'none', stroke: '#F2EDE4', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0 }, svg);
    const group = mk('g', {}, svg);
    const spokes = [], rings = [], dew = [];
    for (let i = 0; i < N; i++) spokes.push({ el: mk('path', { fill: 'none', stroke: '#F2EDE4', 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .55 }, group) });
    for (let i = 0; i < K; i++) rings.push({ el: mk('path', { fill: 'none', stroke: '#F2EDE4', 'stroke-width': .8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .4 }, group) });
    for (let i = 0; i < DEW; i++) dew.push({ el: mk('circle', { cx: -20, cy: -20, r: 1.8, fill: '#FFFFFF', opacity: 0 }, group) });
    return { thread: thread, group: group, spokes: spokes, rings: rings, dew: dew };
  });

  function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function build() {
    const SW = stage.offsetWidth, SH = stage.offsetHeight;
    if (!SW || !SH) return;
    svg.setAttribute('viewBox', '0 0 ' + SW + ' ' + SH);
    const side = SW >= 1100;
    W.forEach((w, wi) => {
      const h = halves[wi], c = cards[wi];
      const rx1 = h.offsetLeft - (side && wi === 1 ? 50 : 0);
      const rx2 = h.offsetLeft + h.offsetWidth + (side && wi === 0 ? 50 : 0);
      const ry1 = h.offsetTop - (side ? 0 : (wi === 1 ? 40 : 0));
      const ry2 = h.offsetTop + h.offsetHeight + (side ? 0 : (wi === 0 ? 40 : 0));
      const cx = h.offsetLeft + c.offsetLeft + c.offsetWidth / 2;
      const cy = h.offsetTop + c.offsetTop + c.offsetHeight / 2;
      w.cx = cx; w.cy = cy;
      const rand = rnd(wi ? 7919 : 104729);
      const dirs = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + (wi ? 0.21 : -0.13) + (rand() - 0.5) * 0.16;
        const dx = Math.cos(a), dy = Math.sin(a);
        let t = 1e9;
        if (dx > 1e-6) t = Math.min(t, (rx2 - cx) / dx);
        if (dx < -1e-6) t = Math.min(t, (rx1 - cx) / dx);
        if (dy > 1e-6) t = Math.min(t, (ry2 - cy) / dy);
        if (dy < -1e-6) t = Math.min(t, (ry1 - cy) / dy);
        dirs.push({ dx: dx, dy: dy, L: Math.max(40, t) });
      }
      w.spokes.forEach((p, i) => {
        const d = dirs[i];
        p.el.setAttribute('d', 'M' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' L' + (cx + d.dx * d.L).toFixed(1) + ',' + (cy + d.dy * d.L).toFixed(1));
        p.len = d.L;
        p.el.setAttribute('stroke-dasharray', d.L + ' ' + d.L);
      });
      const maxL = Math.max.apply(null, dirs.map((d) => d.L));
      const nodes = [];
      w.rings.forEach((p, k) => {
        const r = 34 + Math.pow((k + 1) / K, 1.25) * (maxL * 0.97 - 34);
        const pts = dirs.map((d) => {
          const rr = Math.min(r * (1 + (rand() - 0.5) * 0.08), d.L * 0.985);
          return { x: cx + d.dx * rr, y: cy + d.dy * rr, clamped: r >= d.L * 0.985 };
        });
        let ds = '', pen = false;
        for (let i = 0; i < N; i++) {
          const a = pts[i], b = pts[(i + 1) % N];
          if (a.clamped && b.clamped) { pen = false; continue; }
          if (!pen) { ds += 'M' + a.x.toFixed(1) + ',' + a.y.toFixed(1) + ' '; pen = true; }
          const qx = cx + ((a.x + b.x) / 2 - cx) * 0.86, qy = cy + ((a.y + b.y) / 2 - cy) * 0.86 + 4;
          ds += 'Q' + qx.toFixed(1) + ',' + qy.toFixed(1) + ' ' + b.x.toFixed(1) + ',' + b.y.toFixed(1) + ' ';
          if (k % 3 === 1 && i % 4 === 2) nodes.push(b);
        }
        p.el.setAttribute('d', ds || 'M0,0');
        p.len = p.el.getTotalLength();
        p.el.setAttribute('stroke-dasharray', p.len + ' ' + p.len);
      });
      w.dew.forEach((p, i) => {
        const nd = nodes[(i * 3 + wi) % Math.max(1, nodes.length)];
        if (!nd) return;
        p.el.setAttribute('cx', nd.x.toFixed(1));
        p.el.setAttribute('cy', (nd.y + 3).toFixed(1));
        p.ph = rand() * 6.28;
      });
      const ox = SW / 2 + (wi ? 40 : -40), oy = SH + 30;
      w.thread.setAttribute('d', 'M' + ox + ',' + oy + ' Q' + ((ox + cx) / 2 + (wi ? 60 : -60)) + ',' + ((oy + cy) / 2 + 80) + ' ' + cx.toFixed(1) + ',' + cy.toFixed(1));
      w.threadLen = w.thread.getTotalLength();
      w.thread.setAttribute('stroke-dasharray', w.threadLen + ' ' + w.threadLen);
    });
    built = true;
  }

  const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  let built = false;
  const started = [false, false], t0 = [0, 0];
  let sideBySide = true;

  function paint(now, hidden) {
    W.forEach((w, wi) => {
      const t = (hidden || !started[wi]) ? -1 : (reduce ? 99999 : now - t0[wi]);
      const card = cards[wi];
      if (!hidden && !reduce && t >= 0 && !w.shot) { w.shot = true; if (window.SFX) window.SFX.play('thwip', wi ? 0.55 : -0.55); }
      const tp = ease(t / 340);
      w.thread.setAttribute('stroke-dashoffset', (w.threadLen || 1000) * (1 - tp));
      w.thread.setAttribute('opacity', (t < 0 ? 0 : t < 340 ? 0.9 : Math.max(0, 0.9 - (t - 340) / 700)).toFixed(3));
      w.spokes.forEach((p, i) => { if (p.len) p.el.setAttribute('stroke-dashoffset', (p.len * (1 - ease((t - 300 - i * 26) / 480))).toFixed(1)); });
      w.rings.forEach((p, k) => { if (p.len) p.el.setAttribute('stroke-dashoffset', (p.len * (1 - ease((t - 600 - k * 72) / 480))).toFixed(1)); });
      const tt = (now - t0[wi]) / 1000;
      w.dew.forEach((p) => {
        const a = t < 1700 ? 0 : Math.min(1, (t - 1700) / 600) * (0.45 + 0.55 * Math.abs(Math.sin(tt * 1.3 + (p.ph || 0))));
        p.el.setAttribute('opacity', a.toFixed(3));
      });
      let sway = 0, bob = 0, rec = 1;
      if (t > 340) rec = 1 + 0.03 * Math.exp(-(t - 340) / 320) * Math.sin((t - 340) / 55);
      if (t > CT) {
        const u = t - CT;
        rec += 0.035 * Math.exp(-u / 300) * Math.sin(u / 60);
        sway = 0.5 * Math.sin(tt * 0.8 + wi * 1.7) * Math.min(1, u / 1500);
        bob = 4 * Math.sin(tt * 1.1 + wi * 2.3) * Math.min(1, u / 1500);
      }
      if (w.cx !== undefined) {
        w.group.setAttribute('transform', 'translate(0,' + bob.toFixed(2) + ') rotate(' + sway.toFixed(3) + ' ' + w.cx.toFixed(1) + ' ' + w.cy.toFixed(1) + ') translate(' + w.cx.toFixed(1) + ',' + w.cy.toFixed(1) + ') scale(' + rec.toFixed(4) + ') translate(' + (-w.cx).toFixed(1) + ',' + (-w.cy).toFixed(1) + ')');
      }
      if (t < CT) {
        card.style.opacity = '0';
        card.style.clipPath = card.style.webkitClipPath = 'circle(0% at 50% 50%)';
        card.style.transform = 'scale(.7) rotate(' + (wi ? 8 : -8) + 'deg)';
        card.style.filter = 'blur(10px)';
      } else {
        const u = t - CT;
        const e = ease(u / 1100);
        const sc = 1 - Math.exp(-u / 260) * Math.cos(u / 110) * 0.3;
        const rot = (wi ? 8 : -8) * Math.exp(-u / 300) * Math.cos(u / 120) + sway;
        const clip = e >= 0.999 ? 'none' : 'circle(' + (e * 80).toFixed(2) + '% at 50% 50%)';
        card.style.opacity = Math.min(1, u / 200).toFixed(3);
        card.style.clipPath = card.style.webkitClipPath = clip;
        card.style.transform = 'translateY(' + bob.toFixed(2) + 'px) rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')';
        const bl = Math.max(0, 10 * (1 - u / 600));
        card.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
      }
    });
  }

  function fullyIn(el) {
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return vis >= Math.min(r.height, vh) * 0.72;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!built) return;
    sideBySide = halves[0].offsetTop === halves[1].offsetTop;
    if (sideBySide) {
      if (!started[0] && (reduce || fullyIn(stage))) { started[0] = started[1] = true; t0[0] = now + 250; t0[1] = now + 670; }
    } else {
      [0, 1].forEach((i) => { if (!started[i] && (reduce || fullyIn(halves[i]))) { started[i] = true; t0[i] = now + 200; } });
    }
    const r = stage.getBoundingClientRect();
    if ((started[0] || started[1]) && (r.bottom < -100 || r.top > window.innerHeight + 100)) return;
    paint(now, false);
  }

  build();
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  requestAnimationFrame(frame);
})();
