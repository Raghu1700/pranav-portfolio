/* Gig pages — each commission opens its own page with a reel cylinder. */
(function () {
  const page = document.getElementById('gigPage');
  if (!page) return;
  const scroller = document.getElementById('gpScroll');
  const host = document.getElementById('gpCyl');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GIGS = [
    {
      name: 'Studio 149', t: ['Studio', '149'], act: 'Act I · MMXXV', logo: 'assets/img/studio149.png',
      desc: 'Helmed both camera and cutting room — sculpting raw footage into a luminous promotional piece.',
      meta: '02 reels · 2025',
      reels: [
        { title: 'Studio 149', meta: 'Cut 01 · 2025', video: 'assets/video/gigs/studio149-1.mp4', poster: 'assets/img/gigs/studio149-1.jpg', insta: 'https://www.instagram.com/reel/DST9eIyEfDq/' },
        { title: 'Studio 149', meta: 'Cut 02 · 2025', video: 'assets/video/gigs/studio149-2.mp4', poster: 'assets/img/gigs/studio149-2.jpg', insta: 'https://www.instagram.com/reel/DR9-u95k4tb/' }
      ]
    },
    {
      name: 'Poonthari Silks', t: ['Poonthari', 'Silks'], act: 'Act II · MMXXVI', logo: 'assets/img/poonthari.png',
      desc: 'Chased light across lustrous drapes, then stitched every take into a vivid, rhythmic advertisement.',
      meta: '05 reels · 2026',
      reels: [
        { title: 'Poonthari', meta: 'Spot 01 · 2026', video: 'assets/video/gigs/poonthari-1.mp4', poster: 'assets/img/gigs/poonthari-1.jpg', insta: 'https://www.instagram.com/reel/DfdvK3MTkA6/' },
        { title: 'Poonthari', meta: 'Spot 02 · 2026', video: 'assets/video/gigs/poonthari-2.mp4', poster: 'assets/img/gigs/poonthari-2.jpg', insta: 'https://www.instagram.com/reel/DfdqAqATJmZ/' },
        { title: 'Poonthari', meta: 'Spot 03 · 2026', video: 'assets/video/gigs/poonthari-3.mp4', poster: 'assets/img/gigs/poonthari-3.jpg', insta: 'https://www.instagram.com/reel/DflUIDoSsoM/' },
        { title: 'Poonthari', meta: 'Spot 04 · 2026', video: 'assets/video/gigs/poonthari-4.mp4', poster: 'assets/img/gigs/poonthari-4.jpg', insta: 'https://www.instagram.com/reel/DferSD6zhH2/' },
        { title: 'Poonthari', meta: 'Spot 05 · 2026', video: 'assets/video/gigs/poonthari-5.mp4', poster: 'assets/img/gigs/poonthari-5.jpg', insta: 'https://www.instagram.com/reel/DfjL0VjSQe4/' }
      ]
    },
    {
      name: 'Aran', t: ['Aran', 'Cuts'], act: 'Campus · MMXXV–MMXXVI', logo: '',
      root: 'College projects', no: '(02)', back: 'Back to projects', wide: true, noun: 'Video',
      desc: 'Chronicled the campus event frame by frame, then carved that footage into a rousing aftermovie and a brooding promo.',
      meta: '02 films · 2025–2026',
      reels: [
        { title: 'Aran', meta: 'Aftermovie · 2026', video: 'assets/video/college/aran-aftermovie.mp4', poster: 'assets/img/college/aran-banner.jpg', insta: 'https://www.instagram.com/reel/DUxUP0Igo8a/' },
        { title: 'Aran', meta: 'Promo · 2025', video: 'assets/video/college/aran-promo.mp4', poster: 'assets/img/college/aran-promo.jpg', insta: 'https://www.instagram.com/reel/DUhq67OAl_X/' }
      ]
    },
    {
      name: 'Agam', t: ['Agam', 'Recap'], act: 'Campus · MMXXVI', logo: '',
      root: 'College projects', no: '(02)', back: 'Back to projects', wide: true, noun: 'Video',
      desc: 'Shadowed the festival from first light to final bow, then spliced each candid moment into one spirited recap.',
      meta: '01 film · 2026',
      reels: [
        { title: 'Agam', meta: 'Aftermovie · 2026', video: 'assets/video/college/agam-aftermovie.mp4', poster: 'assets/img/college/agam-aftermovie.jpg', insta: '' }
      ]
    }
  ];

  const ARROW_L = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>';
  const ARROW_R = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>';

  let cyl = null, opener = null, closeTimer = null;

  function open(i, from, start) {
    const g = GIGS[i];
    if (!g) return;
    clearTimeout(closeTimer);
    opener = from || null;
    document.getElementById('gpCrumb').textContent = g.name;
    document.getElementById('gpAct').textContent = g.act;
    document.getElementById('gp-title').innerHTML = g.t[0] + '<br><span class="outline">' + g.t[1] + '</span>';
    document.getElementById('gpRoot').textContent = g.root || 'Gigs';
    document.getElementById('gpNo').textContent = g.no || '(03)';
    document.getElementById('gpBackTxt').textContent = g.back || 'Back to gigs';
    const logo = document.getElementById('gpLogo');
    if (g.logo) { logo.hidden = false; logo.src = g.logo; logo.alt = g.name + ' logo'; }
    else { logo.hidden = true; logo.removeAttribute('src'); logo.alt = ''; }
    document.getElementById('gpDesc').textContent = g.desc;
    document.getElementById('gpMeta').textContent = g.meta;
    const hn = (g.noun || 'Reel').toLowerCase();
    document.getElementById('gpHint').textContent = g.reels.length > 1 ? 'Drag, swipe or use the arrows · tap the front ' + hn + ' for sound' : 'Tap the ' + hn + ' for sound';

    // fresh cylinder markup every time, so no stale listeners
    if (cyl) { cyl.destroy(); cyl = null; }
    const noun = g.noun || 'Reel', low = noun.toLowerCase();
    host.innerHTML =
      '<div class="ring-stage" aria-roledescription="carousel" aria-label="' + g.name + ' ' + low + 's"><div class="ring-floor" aria-hidden="true"></div><div class="ring"></div></div>' +
      '<div class="ring-controls">' +
        '<button type="button" class="arrow" data-prev aria-label="Previous ' + low + '">' + ARROW_L + '</button>' +
        '<div class="counter" aria-live="polite">' +
          '<a data-insta href="#" target="_blank" rel="noopener" class="mono" style="display:inline-flex;align-items:center;min-height:32px;text-decoration:none;font-size:11px;letter-spacing:.18em;text-transform:uppercase;border-bottom:1px solid rgba(242,237,228,.35)">View on Instagram ↗</a>' +
          '<span class="mono" style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--soft)"><span data-num style="color:var(--cream)">01</span> / <span data-total>01</span></span>' +
          '<div class="dots" data-dots aria-hidden="true"></div>' +
        '</div>' +
        '<button type="button" class="arrow" data-next aria-label="Next ' + low + '">' + ARROW_R + '</button>' +
      '</div>';

    if (from) {
      const r = from.getBoundingClientRect();
      page.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
      page.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
    }
    page.hidden = false;
    scroller.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('overlay-open');
    requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('open')));

    const q = (sel) => host.querySelector(sel);
    // build once the page is laid out so the cylinder measures the right width
    setTimeout(() => {
      cyl = window.ReelCylinder({
        overlay: true, wide: !!g.wide, noun: noun, start: start || 0,
        stage: q('.ring-stage'), ring: q('.ring'), floor: q('.ring-floor'),
        prev: q('[data-prev]'), next: q('[data-next]'),
        num: q('[data-num]'), total: q('[data-total]'), dots: q('[data-dots]'), insta: q('[data-insta]'),
        reels: g.reels
      });
    }, reduce ? 0 : 450);
    setTimeout(() => { const c = document.getElementById('gpClose'); if (c) c.focus({ preventScroll: true }); }, 400);
  }

  function close() {
    page.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('overlay-open');
    if (cyl) { cyl.destroy(); cyl = null; }
    closeTimer = setTimeout(() => {
      page.hidden = true;
      host.innerHTML = '';
      if (opener) opener.focus({ preventScroll: true });
    }, reduce ? 0 : 850);
  }

  window.openGig = open;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-gig]');
    if (b) { e.preventDefault(); open(+b.getAttribute('data-open-gig'), b, +(b.getAttribute('data-start') || 0)); }
  });
  document.getElementById('gpClose').addEventListener('click', close);
  document.getElementById('gpBack').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !page.hidden) close(); });
})();
