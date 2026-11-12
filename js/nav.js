/* Pinned nav: smooth scroll, active-section sync, and scroll reveals. */
(function () {
  const nav = document.getElementById('sitenav');
  const ids = ['about', 'work', 'gigs', 'reels', 'contact'];
  const sections = ids.map((id) => document.getElementById(id));
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shared helper: is an element (mostly) on screen?
  window.inView = function (el, f) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * (f || 0.85) && r.bottom > 0;
  };

  window.goTo = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    e.preventDefault();
    window.goTo(b.getAttribute('data-go'));
  });

  let ticking = false;
  function sync() {
    ticking = false;
    const vh = window.innerHeight;
    let cur = 'about';
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= vh * 0.4) cur = ids[i]; });
    nav.querySelectorAll('[data-go]').forEach((b) => b.setAttribute('aria-current', b.getAttribute('data-go') === cur ? 'true' : 'false'));
    nav.classList.toggle('solid', window.pageYOffset > 40 || cur !== 'about');
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  window.addEventListener('resize', sync);
  sync();

  // Generic reveal for headings and rules.
  const targets = document.querySelectorAll('[data-reveal], [data-draw]');
  if (reduce || !('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.2 });
  targets.forEach((t) => io.observe(t));

})();
