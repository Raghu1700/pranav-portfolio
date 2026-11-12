/* 02 · Projects — snake layout, scroll-scrubbed reveal, drawn path. */
(function () {
  const host = document.getElementById('projectGroups');
  if (!host) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const SETS = [
    {
      idx: '01', title: 'DOP in short films', count: '04 films', opens: true, frames: '30 stills',
      items: [
        { title: 'One Shot Reloaded', meta: 'DOP · Short film', year: '2026', link: 'https://youtu.be/tTehKczkKw0', image: 'assets/img/one-shot-reloaded.jpg' },
        { title: 'Dejavu', meta: 'DOP · Short film', year: '2026', link: 'https://youtu.be/Zy4TYVB5fgM', image: 'assets/img/dejavu.jpg' },
        { title: 'The Big Three', meta: 'DOP · Short film', year: '2026', link: 'https://youtu.be/p8P6fl-gCH0', image: 'assets/img/the-big-three.jpg' },
        { title: 'Production #1', meta: 'DOP · Luke Pictures', year: '2026', link: '', image: 'assets/img/production-1.jpg', poster: 'assets/img/production-1-poster.jpg', post: 'https://www.instagram.com/p/Da7ujSuy7OA/' }
      ]
    },
    {
      idx: '02', title: 'College projects', count: '03 projects',
      items: [
        { title: 'Aran', meta: 'Aftermovie', year: '2026', link: '', image: 'assets/img/college/aran-banner.jpg', page: 2, start: 0 },
        { title: 'Aran', meta: 'Promo', year: '2025', link: '', image: 'assets/img/college/aran-promo.jpg', page: 2, start: 1 },
        { title: 'Agam', meta: 'Aftermovie', year: '2026', link: '', image: 'assets/img/college/agam-aftermovie.jpg', page: 3, start: 0 }
      ]
    }
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let n = 0;
  const groups = SETS.map((set, gi) => {
    const sec = document.createElement('section');
    sec.setAttribute('aria-labelledby', 'pgroup-' + gi);
    const cards = set.items.map((d) => {
      n += 1;
      const num = String(n).padStart(2, '0');
      const has = !!d.link, opens = d.page !== undefined, pos = !!d.poster;
      const media = d.image
        ? '<img src="' + d.image + '" alt="Still from ' + esc(d.title) + '" loading="lazy"><div class="shade"></div>'
        : '<span class="num" aria-hidden="true">' + num + '</span>';
      const inner =
        '<div class="pmedia">' + media +
        '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
        '<span class="take" aria-hidden="true">Take ' + num + '</span>' +
        (has || opens || pos ? '<span class="watch" aria-hidden="true">' + (opens ? 'Play ↗' : pos ? 'View ↗' : 'Watch ↗') + '</span>' : '') +
        '</div>' +
        '<div class="pinfo"><div style="min-width:0"><span class="kind">' + num + ' — ' + esc(d.meta) + '</span><h4>' + esc(d.title) + '</h4></div><span class="year">' + d.year + '</span></div>';
      if (pos) return '<div class="pwrap"><button type="button" class="pcard haslink pbtn" data-open-poster="' + esc(d.poster) + '" data-title="' + esc(d.title) + '" data-post="' + esc(d.post || '') + '" aria-haspopup="dialog" aria-label="' + esc(d.title + ' — ' + d.meta) + ', view the poster">' + inner + '</button></div>';
      if (opens) return '<div class="pwrap"><button type="button" class="pcard haslink pbtn" data-open-gig="' + d.page + '" data-start="' + (d.start || 0) + '" aria-haspopup="dialog" aria-label="' + esc(d.title + ' — ' + d.meta) + ', play the video">' + inner + '</button></div>';
      return has
        ? '<div class="pwrap"><a class="pcard haslink" href="' + d.link + '" target="_blank" rel="noopener" aria-label="' + esc(d.title + ' — ' + d.meta) + ', watch on ' + (d.link.indexOf('drive.google') > -1 ? 'Google Drive' : 'YouTube') + ' (opens in a new tab)">' + inner + '</a></div>'
        : '<div class="pwrap"><div class="pcard nolink">' + inner + '</div></div>';
    }).join('');
    const headInner = '<h3 id="pgroup-' + gi + '"><span>' + set.idx + '</span>' + esc(set.title) + '</h3>';
    sec.innerHTML =
      (set.opens
        ? '<div class="group-head" data-ghead><button type="button" class="group-btn" data-open-dop aria-haspopup="dialog">' + headInner +
          '<span class="open-pill">Open the frames <span class="ct">' + set.frames + '</span> <span aria-hidden="true">↗</span></span></button></div>'
        : '<div class="group-head" data-ghead>' + headInner + '<span class="meta">' + set.count + '</span></div>') +
      '<div class="pgrid">' +
      '<svg class="snake" aria-hidden="true">' +
      '<path class="s-glow" fill="none" stroke="#F2EDE4" stroke-width="1" stroke-linecap="round" opacity=".08"></path>' +
      '<path class="s-path" fill="none" stroke="#F2EDE4" stroke-width="1" stroke-linecap="round" opacity=".42"></path>' +
      '<path class="s-pulse" fill="none" stroke="#F2EDE4" stroke-width="1.5" stroke-linecap="round" opacity="0"></path>' +
      '<circle class="s-dot" cx="-50" cy="-50" r="4" fill="#F2EDE4" opacity="0"></circle>' +
      '</svg>' + cards + '</div>';
    host.appendChild(sec);
    return {
      head: sec.querySelector('[data-ghead]'),
      grid: sec.querySelector('.pgrid'),
      svg: sec.querySelector('svg'),
      glow: sec.querySelector('.s-glow'),
      path: sec.querySelector('.s-path'),
      pulse: sec.querySelector('.s-pulse'),
      dot: sec.querySelector('.s-dot'),
      cards: Array.from(sec.querySelectorAll('.pwrap')),
      cp: []
    };
  });

  function place() {
    const cols = host.offsetWidth >= 900 ? 2 : 1;
    groups.forEach((g) => {
      g.grid.classList.toggle('one', cols === 1);
      g.cards.forEach((el, i) => {
        const row = Math.floor(i / cols), p = i % cols;
        const col = row % 2 === 0 ? p : cols - 1 - p;
        el.style.gridColumn = String(col + 1);
        el.style.gridRow = String(row + 1);
        el.style.justifySelf = cols === 1 ? (i % 2 === 0 ? 'start' : 'end') : 'stretch';
        el.style.width = cols === 1 ? '90%' : 'auto';
        el.style.marginTop = cols === 2 && col === 1 ? '120px' : '0px';
        el.style.zIndex = String(2 + i);
      });
    });
  }

  function layout(g) {
    const W = g.grid.offsetWidth, H = g.grid.offsetHeight;
    if (!W || !H) return;
    g.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const pts = [{ x: W / 2, y: 0 }];
    g.cards.forEach((el) => pts.push({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight * 0.38 }));
    pts.push({ x: W / 2, y: H - 8 });
    const P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
    let d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
    const samples = [{ x: pts[0].x, y: pts[0].y, l: 0 }];
    let L = 0;
    for (let i = 1; i < P.length - 2; i++) {
      const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      d += ' C' + c1.x.toFixed(1) + ',' + c1.y.toFixed(1) + ' ' + c2.x.toFixed(1) + ',' + c2.y.toFixed(1) + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
      let px = p1.x, py = p1.y;
      for (let s = 1; s <= 32; s++) {
        const t = s / 32, mt = 1 - t;
        const x = mt * mt * mt * p1.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p2.x;
        const y = mt * mt * mt * p1.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p2.y;
        L += Math.hypot(x - px, y - py);
        samples.push({ x: x, y: y, l: L });
        px = x; py = y;
      }
    }
    [g.path, g.glow, g.pulse].forEach((p) => p.setAttribute('d', d));
    g.real = g.path.getTotalLength();
    g.samples = samples;
    g.total = L;
    g.path.setAttribute('stroke-dasharray', g.real + ' ' + g.real);
    g.glow.setAttribute('stroke-dasharray', '2 7');
  }

  function at(g, len) {
    const s = g.samples;
    let lo = 0, hi = s.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (s[mid].l < len) lo = mid + 1; else hi = mid; }
    return s[lo];
  }

  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (v) => 1 - Math.pow(1 - v, 3);

  function frame(now) {
    requestAnimationFrame(frame);
    const vh = window.innerHeight;
    groups.forEach((g) => {
      const gr = g.grid.getBoundingClientRect();
      if (gr.bottom < -200 || gr.top > vh + 400) return;

      const hr = g.head.getBoundingClientRect();
      const hp = reduce ? 1 : ease(clamp((vh * 0.95 - hr.top) / (vh * 0.3)));
      g.head.style.opacity = hp.toFixed(3);
      g.head.style.transform = 'translateY(' + ((1 - hp) * 30).toFixed(1) + 'px)';

      g.cards.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const target = reduce ? 1 : clamp((vh * 0.98 - r.top) / (vh * 0.42));
        const prev = g.cp[i] === undefined ? target : g.cp[i];
        let v = prev + (target - prev) * 0.14;
        if (Math.abs(target - v) < 0.001) v = target;
        g.cp[i] = v;
        const e = ease(v);
        const dir = el.offsetLeft > g.grid.offsetWidth / 3 ? 1 : -1;
        el.style.opacity = Math.min(1, e * 1.4).toFixed(3);
        el.style.transform = 'translate(' + ((1 - e) * dir * 60).toFixed(1) + 'px,' + ((1 - e) * 150).toFixed(1) + 'px) rotate(' + ((1 - e) * dir * 5).toFixed(2) + 'deg) scale(' + (0.88 + 0.12 * e).toFixed(4) + ')';
        el.style.filter = e < 0.995 ? 'blur(' + ((1 - e) * 12).toFixed(2) + 'px)' : 'none';
      });

      if (!g.samples) return;
      const yT = vh * 0.8 - gr.top;
      let target = 0;
      if (reduce) target = g.total;
      else for (let j = 0; j < g.samples.length; j++) if (g.samples[j].y <= yT) target = g.samples[j].l;
      if (g.cur === undefined) g.cur = target;
      g.cur += (target - g.cur) * 0.1;
      if (Math.abs(target - g.cur) < 0.5) g.cur = target;
      const ratio = g.total ? g.real / g.total : 1;
      g.path.setAttribute('stroke-dashoffset', (g.real - g.cur * ratio).toFixed(1));
      const done = g.cur >= g.total - 1;
      if (g.cur > 2 && !done) {
        const h = at(g, g.cur);
        g.dot.setAttribute('cx', h.x.toFixed(1));
        g.dot.setAttribute('cy', h.y.toFixed(1));
        g.dot.setAttribute('opacity', '1');
      } else g.dot.setAttribute('opacity', '0');
      if (done) {
        const sp = (now * 0.26) % (g.real + 140);
        g.pulse.setAttribute('stroke-dasharray', '140 ' + g.real);
        g.pulse.setAttribute('stroke-dashoffset', (140 - sp).toFixed(1));
        g.pulse.setAttribute('opacity', '.75');
      } else g.pulse.setAttribute('opacity', '0');
    });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-poster]');
    if (b && window.openPoster) { e.preventDefault(); window.openPoster({ src: b.getAttribute('data-open-poster'), title: b.getAttribute('data-title'), post: b.getAttribute('data-post') }, b); }
  });

  function relayout() { place(); groups.forEach(layout); }
  relayout();
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  host.querySelectorAll('img').forEach((im) => im.addEventListener('load', relayout));
  requestAnimationFrame(frame);
})();
