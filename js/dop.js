/* DOP showcase — opens from "DOP in short films": YouTube poster + stills per film, with a lightbox. */
(function () {
  const dop = document.getElementById('dop');
  const scroller = document.getElementById('dopScroll');
  const filmsHost = document.getElementById('dopFilms');
  const index = document.getElementById('dopIndex');
  if (!dop || !filmsHost) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FILMS = [
    {
      key: 'oneshot', title: ['One Shot', 'Reloaded'], name: 'One Shot Reloaded', frames: 6, ratio: '2.19 / 1',
      yt: 'https://youtu.be/tTehKczkKw0', poster: 'assets/img/one-shot-reloaded.jpg',
      line: 'Teal shadows, cold walls and a barrel that never stops searching the room.'
    },
    {
      key: 'dejavu', title: ['Dejavu'], name: 'Dejavu', frames: 13, ratio: '2.4 / 1',
      yt: 'https://youtu.be/Zy4TYVB5fgM', poster: 'assets/img/dejavu.jpg',
      line: 'Dusk on the shoreline, mirrors on the street and city lights blurring into memory.'
    },
    {
      key: 'bigthree', title: ['The Big', 'Three'], name: 'The Big Three', frames: 11, ratio: '16 / 9',
      yt: 'https://youtu.be/p8P6fl-gCH0', poster: 'assets/img/the-big-three.jpg',
      line: 'Tungsten grit against midnight blue — a single flame doing all the talking.'
    }
  ];
  const total = FILMS.reduce((a, f) => a + f.frames, 0);
  document.getElementById('dopCount').textContent = FILMS.length + ' films · ' + total + ' frames';
  const pad = (n) => String(n).padStart(2, '0');
  const src = (f, i, thumb) => 'assets/img/dop/' + f.key + '-' + pad(i) + (thumb ? '-t' : '') + '.jpg';

  // ---- build ----
  index.innerHTML = FILMS.map((f, i) => '<button type="button" data-film="' + f.key + '"><span>' + pad(i + 1) + '</span>' + f.name + '</button>').join('');
  filmsHost.innerHTML = FILMS.map((f, fi) => {
    const stills = Array.from({ length: f.frames }, (_, k) =>
      '<button type="button" class="still reveal" data-film="' + fi + '" data-i="' + k + '" style="aspect-ratio: ' + f.ratio + '" aria-label="Open still ' + (k + 1) + ' of ' + f.frames + ' from ' + f.name + '">' +
      '<img src="' + src(f, k + 1, true) + '" alt="" loading="lazy"><span class="no" aria-hidden="true">' + pad(k + 1) + '</span></button>').join('');
    return '<section class="film" id="film-' + f.key + '" aria-labelledby="film-t-' + f.key + '">' +
      '<div class="film-hero reveal">' +
        '<a class="film-poster" href="' + f.yt + '" target="_blank" rel="noopener" aria-label="Watch ' + f.name + ' on YouTube (opens in a new tab)">' +
          '<img src="' + f.poster + '" alt="" loading="lazy"><div class="shade"></div>' +
          '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
          '<span class="play" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 5.5v13l10-6.5z"></path></svg></span>' +
          '<span class="yt" aria-hidden="true">Watch on YouTube ↗</span>' +
        '</a>' +
        '<div class="film-info">' +
          '<span class="kind">' + pad(fi + 1) + ' — DOP · Short film · 2026</span>' +
          '<h3 id="film-t-' + f.key + '">' + f.title[0] + (f.title[1] ? '<br><span class="line2">' + f.title[1] + '</span>' : '') + '</h3>' +
          '<p>' + f.line + '</p>' +
          '<a class="btn btn-primary" href="' + f.yt + '" target="_blank" rel="noopener">Watch it on YouTube <span class="arw" aria-hidden="true">↗</span></a>' +
        '</div>' +
      '</div>' +
      '<div class="stills-head reveal"><span>Frames from the set</span><span>' + pad(f.frames) + ' stills</span></div>' +
      '<div class="stills">' + stills + '</div>' +
      '</section>';
  }).join('');

  // ---- reveal inside the overlay ----
  let io = null;
  function armReveals() {
    const els = filmsHost.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { root: scroller, threshold: 0.12 });
    els.forEach((e) => { if (!e.classList.contains('in')) io.observe(e); });
  }

  // ---- index highlight ----
  scroller.addEventListener('scroll', () => {
    let cur = '';
    FILMS.forEach((f) => { const el = document.getElementById('film-' + f.key); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = f.key; });
    index.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', b.getAttribute('data-film') === cur ? 'true' : 'false'));
  }, { passive: true });
  index.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const el = document.getElementById('film-' + b.getAttribute('data-film'));
    const bar = dop.querySelector('.dop-bar');
    if (el) scroller.scrollTo({ top: el.offsetTop - (bar ? bar.offsetHeight : 56) + 8, behavior: reduce ? 'auto' : 'smooth' });
  });

  // ---- open / close ----
  let opener = null;
  function open(from) {
    opener = from || null;
    if (from) {
      const r = from.getBoundingClientRect();
      dop.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
      dop.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
    }
    dop.hidden = false;
    scroller.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('overlay-open');
    requestAnimationFrame(() => requestAnimationFrame(() => dop.classList.add('open')));
    armReveals();
    setTimeout(() => { const c = document.getElementById('dopClose'); if (c) c.focus({ preventScroll: true }); }, 400);
  }
  function close() {
    dop.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('overlay-open');
    setTimeout(() => { dop.hidden = true; if (opener) opener.focus({ preventScroll: true }); }, reduce ? 0 : 850);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-dop]');
    if (b) { e.preventDefault(); open(b); }
  });
  document.getElementById('dopClose').addEventListener('click', close);
  document.getElementById('dopBack').addEventListener('click', close);

  // ---- lightbox ----
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  let lf = 0, li = 0, lastStill = null, single = null;
  const lbPrev = document.getElementById('lbPrev'), lbNext = document.getElementById('lbNext');
  function show() {
    if (single) {
      lbImg.style.opacity = '0';
      const pi = new Image();
      pi.onload = () => { lbImg.src = pi.src; lbImg.alt = single.title + ' poster'; lbImg.style.opacity = '1'; };
      pi.src = single.src;
      document.getElementById('lbTitle').textContent = single.title + ' · First look';
      const c = document.getElementById('lbCount');
      c.innerHTML = single.post ? '<a href="' + single.post + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;border-bottom:1px solid rgba(242,237,228,.35)">Instagram ↗</a>' : '';
      return;
    }
    const f = FILMS[lf];
    lbImg.style.opacity = '0';
    const im = new Image();
    im.onload = () => { lbImg.src = im.src; lbImg.alt = 'Still ' + (li + 1) + ' from ' + f.name; lbImg.style.opacity = '1'; };
    im.src = src(f, li + 1, false);
    document.getElementById('lbTitle').textContent = f.name;
    document.getElementById('lbCount').textContent = pad(li + 1) + ' / ' + pad(f.frames);
  }
  window.openPoster = function (o, btn) {
    single = o; lastStill = btn || null;
    lbPrev.style.visibility = 'hidden'; lbNext.style.visibility = 'hidden';
    lb.setAttribute('aria-label', 'Poster viewer');
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    show();
    document.getElementById('lbClose').focus({ preventScroll: true });
  };
  function lbOpen(fi, i, btn) {
    single = null; lbPrev.style.visibility = ''; lbNext.style.visibility = '';
    lb.setAttribute('aria-label', 'Still viewer');
    lf = fi; li = i; lastStill = btn;
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    show();
    document.getElementById('lbClose').focus({ preventScroll: true });
  }
  function lbClose() {
    lb.classList.remove('open');
    setTimeout(() => { lb.hidden = true; if (lastStill) lastStill.focus({ preventScroll: true }); }, 400);
  }
  const step = (d) => { if (single) return; const n = FILMS[lf].frames; li = (li + d + n) % n; show(); };
  filmsHost.addEventListener('click', (e) => {
    const b = e.target.closest('.still');
    if (b) lbOpen(+b.getAttribute('data-film'), +b.getAttribute('data-i'), b);
  });
  document.getElementById('lbPrev').addEventListener('click', () => step(-1));
  document.getElementById('lbNext').addEventListener('click', () => step(1));
  document.getElementById('lbClose').addEventListener('click', lbClose);
  lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) step(e.clientX < sx ? 1 : -1); sx = null; });

  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      return;
    }
    if (!dop.hidden && e.key === 'Escape') close();
  });
})();
