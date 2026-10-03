/* ===================================================
   Jamie's Universe — interactive orbit explorer
   - twinkling star field
   - realistic CSS planets orbiting a central sun
   - JS-driven orbital motion with pause-on-hover
   - click a planet to zoom into its detail view
   =================================================== */

/* ---------- 1. Twinkling star field ---------- */
(function stars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, starList = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 6000);
    starList = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.75,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of starList) {
      const twinkle = s.base + Math.sin(t * s.speed + s.phase) * 0.35;
      ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
      ctx.fillStyle = s.warm ? '#ffe9a8' : '#f0f6ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ---------- 2. Orbital motion (JS-driven) ----------
   Each planet rides its own well-separated ring, so planets never
   overlap: even if two line up in angle they sit at different radii. */
(function orbits() {
  const system = document.getElementById('orbitSystem');
  // keep a fixed order: projects (inner), life (middle), about (outer)
  const planets = [
    document.querySelector('.planet--projects'),
    document.querySelector('.planet--life'),
    document.querySelector('.planet--about'),
  ];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // radiusFrac mirrors the ring sizes: ring is X% of the box, so the
  // orbit radius is (X% / 2) of the box = (X% ) * half / ... → we use
  // ringWidthFrac/2 against half the box. ringWidthFrac: 0.50, 0.76, 1.00
  const config = [
    { ringFrac: 0.46, speed:  0.085, angle: -Math.PI / 2 },        // Projects — starts at top
    { ringFrac: 0.74, speed: -0.060, angle:  Math.PI / 2 + 0.5 },  // Life — reverse direction
    { ringFrac: 1.00, speed:  0.045, angle:  Math.PI + 0.3 },      // About — slowest
  ];

  let paused = false;
  let last = performance.now();

  planets.forEach((pl) => {
    ['mouseenter', 'focusin'].forEach((e) => pl.addEventListener(e, () => (paused = true)));
    ['mouseleave', 'focusout'].forEach((e) => pl.addEventListener(e, () => (paused = false)));
  });

  function place() {
    const size = system.clientWidth;
    const half = size / 2;
    planets.forEach((pl, i) => {
      const c = config[i];
      const radius = half * c.ringFrac; // ring radius = (ringWidthFrac * box) / 2 = ringFrac * half
      const x = half + Math.cos(c.angle) * radius;
      const y = half + Math.sin(c.angle) * radius;
      pl.style.left = `${(x / size) * 100}%`;
      pl.style.top = `${(y / size) * 100}%`;
    });
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused && !prefersReduced) {
      config.forEach((c) => (c.angle += c.speed * dt));
    }
    place();
    requestAnimationFrame(tick);
  }

  place();
  window.addEventListener('resize', place);
  requestAnimationFrame(tick);
})();

/* ---------- 3. Click a planet → zoom into detail ---------- */
(function navigation() {
  const universe = document.getElementById('universe');
  const planets = document.querySelectorAll('.planet');
  const details = document.querySelectorAll('.detail');
  const backBtns = document.querySelectorAll('[data-back]');

  function openDetail(id) {
    const target = document.getElementById(id);
    if (!target) return;
    universe.classList.add('receded');
    target.classList.add('open');
    target.setAttribute('aria-hidden', 'false');
    document.body.classList.add('detail-open');
    target.scrollTop = 0;
    history.replaceState(null, '', '#' + id);
  }

  function closeDetail() {
    details.forEach((d) => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
    });
    universe.classList.remove('receded');
    document.body.classList.remove('detail-open');
    history.replaceState(null, '', ' ');
  }

  planets.forEach((pl) =>
    pl.addEventListener('click', () => openDetail(pl.dataset.target))
  );
  backBtns.forEach((b) => b.addEventListener('click', closeDetail));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  const initial = location.hash.replace('#', '');
  if (initial && document.getElementById(initial)) openDetail(initial);
})();
