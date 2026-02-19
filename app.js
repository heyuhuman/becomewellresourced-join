// ====== SPARKLE CANVAS (dots + occasional swoosh comets) ======
(() => {
  const rand = (min, max) => Math.random() * (max - min) + min;
  const TAU = Math.PI * 2;

  function createSparkleField(canvas) {
    if (!canvas) return null;

    const ctx = canvas.getContext("2d", { alpha: true });

    // ---- Tunables (same as your original) ----
    const COUNT = 160;
    const SPEED = 0.18;
    const WANDER = 0.45;
    const TWINKLE = 0.8;

    const MAX_COMETS = 18;
    const COMET_CHANCE = 0.06;
    const COMET_LIFE_MIN = 34;
    const COMET_LIFE_MAX = 54;

    // ---- Local size/state ----
    let w = 0, h = 0, dpr = 1;

    const dots = [];
    const comets = [];

    function makeDot() {
      return {
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.7, 2.2),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED),
        phase: rand(0, TAU),
        phaseSpeed: rand(0.008, 0.02),
        alpha: rand(0.25, 0.9),
      };
    }

    function portalCenter() {
      // same “center” feel as original, but relative to THIS canvas
      return { x: w * 0.5, y: h * 0.38 };
    }

    function spawnComet() {
      const c = portalCenter();

      const ang = rand(0, TAU);
      const spd = rand(2.2, 4.4);

      const r0 = rand(0, 20);
      const x = c.x + Math.cos(ang) * r0;
      const y = c.y + Math.sin(ang) * r0;

      const life = Math.floor(rand(COMET_LIFE_MIN, COMET_LIFE_MAX));

      return {
        x, y, px: x, py: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        curve: rand(-0.03, 0.03),
        w: rand(0.8, 1.6),
        a: rand(0.35, 0.75),
        hue: rand(42, 52),
        life,
        maxLife: life,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);

      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      // keep CSS size driven by layout; just ensure transform matches dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-seed dots so density feels consistent per section
      dots.length = 0;
      for (let i = 0; i < COUNT; i++) dots.push(makeDot());

      // Optional: clear comets on resize to avoid weird jumps
      comets.length = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // glow haze toward center (same as your original)
      const g = ctx.createRadialGradient(
        w * 0.5, h * 0.38, 0,
        w * 0.5, h * 0.38, Math.min(w, h) * 0.55
      );
      g.addColorStop(0, "rgba(246,231,168,0.08)");
      g.addColorStop(0.35, "rgba(214,179,90,0.05)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      // ---- dots ----
      for (const p of dots) {
        p.phase += p.phaseSpeed;
        const tw = (Math.sin(p.phase) * 0.5 + 0.5) * TWINKLE;

        p.vx += rand(-0.01, 0.01) * WANDER;
        p.vy += rand(-0.01, 0.01) * WANDER;

        p.vx = Math.max(-0.45, Math.min(0.45, p.vx));
        p.vy = Math.max(-0.45, Math.min(0.45, p.vy));

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
        rg.addColorStop(0, `rgba(246,231,168,${(p.alpha + tw) * 0.9})`);
        rg.addColorStop(0.25, `rgba(214,179,90,${(p.alpha + tw) * 0.35})`);
        rg.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + tw * 0.9), 0, TAU);
        ctx.fill();
      }

      // spawn comets occasionally (same logic)
      if (comets.length < MAX_COMETS && Math.random() < COMET_CHANCE) {
        comets.push(spawnComet());
      }

      // ---- comets ----
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];

        c.px = c.x; c.py = c.y;

        const vx = c.vx, vy = c.vy;
        const cs = Math.cos(c.curve), sn = Math.sin(c.curve);
        c.vx = vx * cs - vy * sn;
        c.vy = vx * sn + vy * cs;

        c.x += c.vx;
        c.y += c.vy;

        c.vx *= 0.985;
        c.vy *= 0.985;

        const t = c.life / c.maxLife;
        const a = c.a * t;

        const lg = ctx.createLinearGradient(c.px, c.py, c.x, c.y);
        lg.addColorStop(0, `hsla(${c.hue},95%,75%,0)`);
        lg.addColorStop(0.6, `hsla(${c.hue},95%,70%,${a * 0.25})`);
        lg.addColorStop(1, `hsla(${c.hue},95%,82%,${a})`);

        ctx.strokeStyle = lg;
        ctx.lineWidth = c.w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(c.px, c.py);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();

        const rg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 18);
        rg.addColorStop(0, `hsla(${c.hue},95%,82%,${a})`);
        rg.addColorStop(0.4, `hsla(${c.hue},90%,65%,${a * 0.2})`);
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4.0, 0, TAU);
        ctx.fill();

        c.life--;
        if (c.life <= 0) comets.splice(i, 1);
      }

      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }

    // Resize to element size, not viewport
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("orientationchange", resize, { passive: true });

    resize();
    draw();

    return { resize };
  }

  // Init both canvases using the same engine
  createSparkleField(document.getElementById("sparkles"));
  createSparkleField(document.getElementById("sparklesBottom"));
})();

// ====== PERSONALIZED KICKERS ======
(function(){
  const params = new URLSearchParams(window.location.search);
  const rawName = params.get("name");

  const topKicker = document.querySelector(".kicker:not(.bottomKicker)");
  const bottomKicker = document.querySelector(".bottomKicker");

  if(!rawName){
    // No name in URL — leave default text
    return;
  }

  // Clean + format name safely
  const name = decodeURIComponent(rawName)
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if(topKicker){
    topKicker.textContent = `${name}, WELCOME TO THE`;
  }

  if(bottomKicker){
    bottomKicker.textContent = `${name}… JOIN US INSIDE THE`;
  }
})();

(() => {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("identity") || "").trim();

  const el = document.getElementById("ptIdentity");
  if (!el) return;

  // If nothing passed, remove the whole block
  if (!raw) {
    el.remove();
    return;
  }

  // Support line breaks passed as %0A (actual newlines) or \n
  const text = raw.replace(/\\n/g, "\n");
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);

  el.innerHTML = lines
    .map(line => `<div class="line">${line}</div>`)
    .join("");
})();



