/* 3D reel cylinder — reusable. Used by "Portfolio shoots" and by each gig page. */
(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP = 34;
  const ICON_ON = 'M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12';
  const ICON_OFF = 'M17 9l5 5M22 9l-5 5';
  const pad = (n) => String(n).padStart(2, '0');

  function inView(el, f) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * (f || 0.85) && r.bottom > 0;
  }

  window.ReelCylinder = function (o) {
    const { stage, ring, floor, reels } = o;
    const n = reels.length;
    const noun = o.noun || 'Reel';
    ring.innerHTML = '';
    const els = reels.map((r, i) => {
      const d = document.createElement('div');
      d.className = o.wide ? 'reel wide' : 'reel';
      d.setAttribute('role', 'group');
      d.setAttribute('aria-roledescription', 'slide');
      d.setAttribute('aria-label', noun + ' ' + (i + 1) + ' of ' + n);
      d.innerHTML =
        '<div class="reel-inner">' +
        '<video src="' + r.video + '" poster="' + r.poster + '" muted loop playsinline preload="metadata" aria-label="' + r.title + ' — ' + r.meta + '"></video>' +
        '<div class="topshade" aria-hidden="true"></div>' +
        '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
        '<span class="label" aria-hidden="true"><span class="dot" style="width:6px;height:6px"></span>' + noun + ' ' + pad(i + 1) + '</span>' +
        '<span class="sound" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h4l5-4v13l-5-4H4z"></path><path class="sicon" d="' + ICON_OFF + '"></path></svg><span class="stext">Muted</span></span>' +
        '<div class="cap"><b>' + r.title + '</b><span>' + r.meta + '</span></div>' +
        '</div>';
      ring.appendChild(d);
      const v = d.querySelector('video');
      v.muted = true;
      return { el: d, inner: d.querySelector('.reel-inner'), video: v, icon: d.querySelector('.sicon'), stext: d.querySelector('.stext') };
    });

    o.dots.innerHTML = reels.map(() => '<i></i>').join('');
    const dotEls = Array.from(o.dots.children);
    o.total.textContent = pad(n);
    if (n < 2) { o.prev.style.visibility = 'hidden'; o.next.style.visibility = 'hidden'; o.dots.style.display = 'none'; }

    let idx = Math.max(0, Math.min(n - 1, o.start || 0)), drag = 0, dragging = false, moved = false, x0 = 0, shown = false, soundOn = false, alive = true;
    let cw = 300, ch = 533, radius = 500;

    function measure() {
      const w = stage.offsetWidth || window.innerWidth;
      const vh = window.innerHeight || 800;
      if (o.wide) {
        cw = Math.round(Math.max(240, Math.min(760, w * (w < 600 ? 0.86 : 0.74), vh * 0.66 * 16 / 9)));
        ch = Math.round(cw * 9 / 16);
      } else {
        cw = Math.round(Math.max(150, Math.min(320, w * 0.58, vh * 0.7 * 9 / 16)));
        ch = Math.round(cw * 16 / 9);
      }
      radius = Math.round((cw + 36) / (2 * Math.tan((STEP / 2) * Math.PI / 180)));
      stage.style.height = (ch + 70) + 'px';
      stage.classList.toggle('tiny', cw < 230);
      floor.style.width = Math.round(cw * 2.6) + 'px';
      floor.style.marginLeft = -Math.round(cw * 1.3) + 'px';
      ring.style.width = cw + 'px';
      ring.style.height = ch + 'px';
      ring.style.marginLeft = -Math.round(cw / 2) + 'px';
      els.forEach((r, i) => {
        r.el.style.width = cw + 'px';
        r.el.style.height = ch + 'px';
        r.el.style.transform = 'rotateY(' + (i * STEP) + 'deg) translateZ(' + radius + 'px)';
      });
      render();
    }

    function render() {
      const pos = idx - drag;
      const intro = shown ? 0 : Math.min(3, n);
      ring.style.transition = dragging || !shown ? 'none' : 'transform 1.1s cubic-bezier(.19,1,.22,1)';
      ring.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + (-(pos + intro) * STEP).toFixed(2) + 'deg)';
      els.forEach((r, i) => {
        const a = Math.abs(i - pos);
        const active = i === idx;
        r.el.classList.toggle('active', active);
        r.el.setAttribute('aria-hidden', a > 2.5 ? 'true' : 'false');
        r.inner.style.opacity = shown ? Math.max(0, 1 - a * 0.28).toFixed(3) : '0';
        r.inner.style.filter = 'brightness(' + Math.max(0.35, 1 - a * 0.35).toFixed(3) + ')';
        const on = active && soundOn;
        r.icon.setAttribute('d', on ? ICON_ON : ICON_OFF);
        r.stext.textContent = active ? (on ? 'Sound on' : 'Tap for sound') : 'Muted';
      });
      dotEls.forEach((d, i) => d.classList.toggle('on', i === idx));
      o.num.textContent = pad(idx + 1);
      if (o.insta) {
        const l = reels[idx].insta;
        o.insta.style.display = l ? 'inline-flex' : 'none';
        if (l) o.insta.href = l; else o.insta.removeAttribute('href');
      }
    }

    function visible() {
      if (!alive) return false;
      if (!o.overlay && document.documentElement.classList.contains('overlay-open')) return false;
      return inView(stage, 1);
    }

    function sync() {
      const vis = visible();
      els.forEach((r, i) => {
        const v = r.video;
        const want = vis && i === idx;
        v.muted = !(want && soundOn);
        if (want && v.paused) {
          const p = v.play();
          if (p && p.catch) p.catch(() => { v.muted = true; soundOn = false; v.play().catch(() => {}); render(); });
        } else if (!want && !v.paused) v.pause();
      });
    }

    function go(i) { idx = ((i % n) + n) % n; drag = 0; render(); sync(); }

    const onPrev = () => go(idx - 1);
    const onNext = () => go(idx + 1);
    o.prev.addEventListener('click', onPrev);
    o.next.addEventListener('click', onNext);

    stage.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false; x0 = e.clientX;
      stage.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 6) moved = true;
      drag = dx / (cw + 36);
      render();
    });
    stage.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
      const target = Math.round(idx - drag);
      drag = 0;
      if (moved) { idx = Math.max(0, Math.min(n - 1, target)); render(); sync(); return; }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const reel = hit && hit.closest && hit.closest('.reel');
      const i = reel ? els.findIndex((r) => r.el === reel) : -1;
      if (i >= 0 && i !== idx) { go(i); return; }
      if (i === idx) {
        soundOn = !soundOn;
        const v = els[idx].video;
        v.muted = !soundOn;
        if (v.paused) v.play().catch(() => {});
        render();
      }
    });
    stage.addEventListener('pointercancel', () => { dragging = false; drag = 0; stage.classList.remove('dragging'); render(); });

    let lastWheel = 0;
    stage.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      const t = performance.now();
      if (t - lastWheel < 500) return;
      lastWheel = t;
      idx = Math.max(0, Math.min(n - 1, idx + (e.deltaX > 0 ? 1 : -1)));
      render(); sync();
    }, { passive: true });

    const timer = setInterval(() => {
      if (!shown && (reduce || inView(stage, 0.9))) {
        shown = true;
        requestAnimationFrame(() => requestAnimationFrame(render));
      }
      sync();
    }, 200);
    window.addEventListener('resize', measure);
    measure();

    return {
      destroy() {
        alive = false;
        clearInterval(timer);
        window.removeEventListener('resize', measure);
        o.prev.removeEventListener('click', onPrev);
        o.next.removeEventListener('click', onNext);
        els.forEach((r) => { try { r.video.pause(); r.video.removeAttribute('src'); r.video.load(); } catch (e) {} });
      },
      sync: sync
    };
  };

  // ---- 04 · Portfolio shoots ----
  const stage = document.getElementById('ringStage');
  if (!stage) return;
  window.ReelCylinder({
    stage: stage,
    ring: document.getElementById('ring'),
    floor: document.getElementById('ringFloor'),
    prev: document.getElementById('reelPrev'),
    next: document.getElementById('reelNext'),
    num: document.getElementById('reelNum'),
    total: document.getElementById('reelTotal'),
    dots: document.getElementById('reelDots'),
    insta: document.getElementById('reelInsta'),
    reels: [
      { title: 'Reel 1', meta: 'Portfolio shoot · 2025', video: 'assets/video/reel-1.mp4', poster: 'assets/img/reel-1.jpg', insta: 'https://www.instagram.com/reel/DQ_lQ3xkUX7/' },
      { title: 'Reel 2', meta: 'Portfolio shoot · 2025', video: 'assets/video/reel-2.mp4', poster: 'assets/img/reel-2.jpg', insta: 'https://www.instagram.com/reel/DRFYT-AEzv0/' },
      { title: 'Reel 3', meta: 'Portfolio shoot · 2025', video: 'assets/video/reel-3.mp4', poster: 'assets/img/reel-3.jpg', insta: 'https://www.instagram.com/reel/DRw0rJokXWR/' }
    ]
  });
})();
