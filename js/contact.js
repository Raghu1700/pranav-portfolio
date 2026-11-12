/* 05 · Contact — "Camera rolling": tap Roll, burst flash, a polaroid of Pranav develops. */
(function () {
  const $ = (id) => document.getElementById(id);
  const finder = $('finder'), result = $('result');
  if (!finder) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sfx = (k) => { if (window.SFX) window.SFX.play(k); };

  let phase = 'idle';           // idle | rolling | done
  const timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const A = (el, kf, o) => { if (el && el.animate && !reduce) return el.animate(kf, o); };

  const film = $('stageVideo'), filmBox = film ? film.parentNode : null;
  let filmSeen = false;
  function filmSync() {
    if (!film) return;
    const want = phase === 'done' && filmSeen && !document.documentElement.classList.contains('overlay-open');
    if (want && film.paused) film.play().catch(() => {});
    else if (!want && !film.paused) film.pause();
  }
  if (film && 'IntersectionObserver' in window) {
    new IntersectionObserver((en) => { filmSeen = en[0].isIntersecting; filmSync(); }, { threshold: 0.15 }).observe(filmBox);
    setInterval(filmSync, 1000);
  } else filmSeen = true;

  function status(t) { $('camStatus').textContent = t || ''; }
  function ui() {
    const rolling = phase === 'rolling';
    $('hudText').textContent = rolling ? 'Rec' : 'Standby';
    const dot = $('hudDot');
    dot.style.background = rolling ? '#FF4D4D' : 'var(--cream)';
    dot.style.opacity = rolling ? '1' : '.4';
  }

  function roll() {
    if (phase !== 'idle') return;
    if (window.SFX) window.SFX.unlock();
    phase = 'rolling';
    status('Rolling… hold the frame');
    ui();
    sfx('beep');
    A($('reticle'), [{ transform: 'scale(1.25)', borderColor: 'rgba(242,237,228,.35)' }, { transform: 'scale(.62)', borderColor: 'rgba(120,255,160,.9)' }], { duration: 380, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'forwards' });
    A($('brackets'), [{ transform: 'scale(1)' }, { transform: 'scale(.94)' }], { duration: 380, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'forwards' });
    A($('cheese'), [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
    later(200, () => sfx('charge'));
    [560, 760, 960].forEach((ms, i) => later(ms, () => {
      sfx('shutter');
      if (i === 0) sfx('pop');
      A($('flash'), [{ opacity: 0 }, { opacity: i === 2 ? 1 : 0.85, offset: 0.12 }, { opacity: 0 }], { duration: i === 2 ? 900 : 260, easing: 'ease-out' });
      A($('blindTop'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.45 }, { transform: 'scaleY(0)' }], { duration: 120 });
      A($('blindBot'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.45 }, { transform: 'scaleY(0)' }], { duration: 120 });
    }));
    later(reduce ? 0 : 1040, showResult);
  }

  function stamp() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2) + ' · ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function showResult() {
    phase = 'done';
    status('');
    $('stamp').textContent = stamp();
    finder.hidden = true;
    result.hidden = false;
    ui();
    if (film) { film.preload = 'auto'; try { film.currentTime = 0; } catch (e) {} filmSeen = true; filmSync(); }
    if (reduce) return;
    A(filmBox, [
      { opacity: 0, transform: 'translateY(40px) scale(.96)', filter: 'blur(10px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0px)' }
    ], { duration: 1200, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'backwards' });
    sfx('eject');
    A($('polaroid'), [
      { transform: 'translateY(120px) rotate(6deg) scale(.86)', opacity: 0 },
      { transform: 'translateY(-14px) rotate(-6deg) scale(1.02)', opacity: 1, offset: 0.6 },
      { transform: 'rotate(-4deg)', opacity: 1 }
    ], { duration: 1100, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'backwards' });
    A($('photo'), [
      { filter: 'brightness(.08) sepia(1) contrast(.5) blur(6px)' },
      { filter: 'brightness(.55) sepia(.8) contrast(.8) blur(2px)', offset: 0.45 },
      { filter: 'brightness(1) sepia(0) contrast(1) blur(0px)' }
    ], { duration: 3200, delay: 300, easing: 'ease-out', fill: 'backwards' });
    Array.prototype.forEach.call($('info').children, (el, i) => A(el,
      [{ opacity: 0, transform: 'translateY(20px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      { duration: 1000, delay: 500 + i * 140, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'backwards' }));
  }

  function retake() {
    timers.forEach(clearTimeout); timers.length = 0;
    phase = 'idle';
    result.hidden = true;
    finder.hidden = false;
    if (film) film.pause();
    ['reticle', 'brackets', 'cheese'].forEach((id) => { const el = $(id); if (el.getAnimations) el.getAnimations().forEach((a) => a.cancel()); });
    status('');
    ui();
  }

  $('shutterBtn').addEventListener('click', roll);
  $('retake').addEventListener('click', retake);
  ui();
})();
