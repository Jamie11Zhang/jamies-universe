/* ===================================================
   Jamie's Universe — interactions
   - twinkling star field
   - hand-drawn planets (Rough.js)
   - scroll-reveal animations
   =================================================== */

/* ---------- 1. Twinkling star field ---------- */
(function stars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, starList = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 6000); // density
    starList = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.75, // some warm-glow stars
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

  document.querySelectorAll('.planet-doodle').forEach((canvas) => {
    const rc = rough.canvas(canvas);
    const key = canvas.dataset.planet;
    const p = palettes[key] || palettes.projects;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // planet body
    rc.circle(cx, cy, 70, {
      fill: p.fill,
      fillStyle: 'hachure',
      hachureGap: 5,
      fillWeight: 1.5,
      stroke: p.stroke,
      strokeWidth: 2.5,
      roughness: 2,
    });

    // a wobbly orbit ring
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.4);
    rc.ellipse(0, 0, 110, 44, {
      stroke: p.ring,
      strokeWidth: 2,
      roughness: 2.2,
      fill: 'none',
    });
    ctx.restore();

    // a little moon dot
    rc.circle(cx + 46, cy - 30, 10, {
      fill: p.ring,
      fillStyle: 'solid',
      stroke: p.stroke,
      strokeWidth: 1.5,
      roughness: 1.8,
    });
  });
})();

/* ---------- 3. Scroll-reveal animations ---------- */
(function reveal() {
  const targets = document.querySelectorAll(
    '.planet-header, .card, .life-card, .character-sheet, .footer'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for a playful feel
          setTimeout(() => entry.target.classList.add('visible'), i * 90);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
})();

/* ---------- 4. Active nav highlight ---------- */
(function activeNav() {
  const sections = document.querySelectorAll('.section');
  const links = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) =>
            l.style.setProperty(
              'border-color',
              l.getAttribute('href') === '#' + id
                ? 'var(--glow)'
                : 'rgba(168, 208, 240, 0.4)'
            )
          );
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((s) => io.observe(s));
})();
