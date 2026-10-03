/* ===================================================
   Jamie's Universe — interactive orbit explorer
   - twinkling star field
   - hand-drawn planets (Rough.js)
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

/* ---------- 2. Hand-drawn planets with Rough.js ---------- */
(function planets() {
  if (typeof rough === 'undefined') return;

  const palettes = {
    projects: { fill: '#4a90e2', stroke: '#f0f6ff', ring: '#ffe9a8' },
    life:     { fill: '#1e4d8c', stroke: '#a8d0f0', ring: '#4a90e2' },
    about:    { fill: '#a8d0f0', stroke: '#f0f6ff', ring: '#ffe9a8' },
  };

  document.querySelectorAll('.planet-canvas').forEach((canvas) => {
    const rc = rough.canvas(canvas);
    const key = canvas.dataset.planet;
    const p = palettes[key] || palettes.projects;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width * 0.34;

    rc.circle(cx, cy, r * 2, {
      fill: p.fill, fillStyle: 'hachure', hachureGap: 5, fillWeight: 1.5,
      stroke: p.stroke, strokeWidth: 2.5, roughness: 2,
    });

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.4);
    rc.ellipse(0, 0, canvas.width * 0.92, canvas.width * 0.38, {
      stroke: p.ring, strokeWidth: 2, roughness: 2.2, fill: 'none',
    });
    ctx.restore();

    rc.circle(cx + r * 1.1, cy - r * 0.8, canvas.width * 0.09, {
      fill: p.ring, fillStyle: 'solid', stroke: p.stroke, strokeWidth: 1.5, roughness: 1.8,
    });
  });
})();

/* ---------- 3. Orbital motion (JS-driven) ---------- */
(function orbits() {
  const system = document.getElementById('orbitSystem');
  const planets = Array.from(document.querySelectorAll('.planet'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Each planet: its ring radius (as a fraction of half the box), angular speed, start angle
  // radiusFrac = fraction of HALF the box; matches the ring sizes
  // (.orbit-1 = 56% of box → radius 0.56 * half, etc.)
  const config = [
    { radiusFrac: 0.56, speed: 0.10, angle: 0 },                   // orbit-1 (Projects)
    { radiusFrac: 0.78, speed: -0.072, angle: (2 * Math.PI) / 3 }, // orbit-2 (Life) reverse
    { radiusFrac: 1.00, speed: 0.055, angle: (4 * Math.PI) / 3 },  // orbit-3 (About)
  ];

  let paused = false;
  let last = performance.now();

  // pause on hover/focus of any planet
  planets.forEach((pl) => {
    ['mouseenter', 'focusin'].forEach((e) => pl.addEventListener(e, () => (paused = true)));
    ['mouseleave', 'focusout'].forEach((e) => pl.addEventListener(e, () => (paused = false)));
  });

  function place() {
    const size = system.clientWidth;
    const half = size / 2;
    planets.forEach((pl, i) => {
      const c = config[i];
      const radius = half * c.radiusFrac;
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

/* ---------- 4. Click a planet → zoom into detail ---------- */
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

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  // deep-link support (e.g. refresh on #projects)
  const initial = location.hash.replace('#', '');
  if (initial && document.getElementById(initial)) openDetail(initial);
})();
