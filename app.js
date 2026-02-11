// ====== SPARKLE CANVAS (dots + occasional swoosh comets) ======
const canvas = document.getElementById("sparkles");
const ctx = canvas.getContext("2d");

function resize(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rand = (min, max) => Math.random() * (max - min) + min;
const TAU = Math.PI * 2;

// ---- Base dots (your original) ----
const COUNT = 160;
const SPEED = 0.18;
const WANDER = 0.45;
const TWINKLE = 0.8;
const dots = [];

function makeDot(){
  return {
    x: rand(0, innerWidth),
    y: rand(0, innerHeight),
    r: rand(0.7, 2.2),
    vx: rand(-SPEED, SPEED),
    vy: rand(-SPEED, SPEED),
    phase: rand(0, TAU),
    phaseSpeed: rand(0.008, 0.02),
    alpha: rand(0.25, 0.9)
  };
}
for(let i=0;i<COUNT;i++) dots.push(makeDot());

// ---- Comets (the swoosh) ----
const comets = [];
const MAX_COMETS = 18;
const COMET_CHANCE = 0.06;      // higher = more swooshes
const COMET_LIFE_MIN = 34;
const COMET_LIFE_MAX = 54;

function portalCenter(){
  return { x: innerWidth * 0.5, y: innerHeight * 0.38 };
}

function spawnComet(){
  const c = portalCenter();

  // Launch outward in a random direction
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
    curve: rand(-0.03, 0.03),      // slight arc
    w: rand(0.8, 1.6),             // thickness
    a: rand(0.35, 0.75),
    hue: rand(42, 52),
    life,
    maxLife: life
  };
}

function draw(){
  ctx.clearRect(0,0,innerWidth, innerHeight);

  // glow haze toward center
  const g = ctx.createRadialGradient(
    innerWidth * 0.5, innerHeight * 0.38, 0,
    innerWidth * 0.5, innerHeight * 0.38, Math.min(innerWidth, innerHeight) * 0.55
  );
  g.addColorStop(0, "rgba(246,231,168,0.08)");
  g.addColorStop(0.35, "rgba(214,179,90,0.05)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,innerWidth, innerHeight);

  ctx.globalCompositeOperation = "lighter";

  // ---- dots ----
  for(const p of dots){
    p.phase += p.phaseSpeed;
    const tw = (Math.sin(p.phase) * 0.5 + 0.5) * TWINKLE;

    p.vx += rand(-0.01, 0.01) * WANDER;
    p.vy += rand(-0.01, 0.01) * WANDER;

    p.vx = Math.max(-0.45, Math.min(0.45, p.vx));
    p.vy = Math.max(-0.45, Math.min(0.45, p.vy));

    p.x += p.vx;
    p.y += p.vy;

    if(p.x < -20) p.x = innerWidth + 20;
    if(p.x > innerWidth + 20) p.x = -20;
    if(p.y < -20) p.y = innerHeight + 20;
    if(p.y > innerHeight + 20) p.y = -20;

    const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
    rg.addColorStop(0, `rgba(246,231,168,${(p.alpha + tw) * 0.9})`);
    rg.addColorStop(0.25, `rgba(214,179,90,${(p.alpha + tw) * 0.35})`);
    rg.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 + tw * 0.9), 0, TAU);
    ctx.fill();
  }

  // spawn comets occasionally
  if(comets.length < MAX_COMETS && Math.random() < COMET_CHANCE){
    comets.push(spawnComet());
  }

  // ---- comets (swooshes) ----
  for(let i=comets.length-1;i>=0;i--){
    const c = comets[i];

    c.px = c.x; c.py = c.y;

    // curve velocity slightly
    const vx = c.vx, vy = c.vy;
    const cs = Math.cos(c.curve), sn = Math.sin(c.curve);
    c.vx = vx * cs - vy * sn;
    c.vy = vx * sn + vy * cs;

    c.x += c.vx;
    c.y += c.vy;

    c.vx *= 0.985;
    c.vy *= 0.985;

    const t = c.life / c.maxLife; // 1..0
    const a = c.a * t;

    // gradient tail (this avoids “sticks”)
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

    // tiny head glow
    const rg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 18);
    rg.addColorStop(0, `hsla(${c.hue},95%,82%,${a})`);
    rg.addColorStop(0.4, `hsla(${c.hue},90%,65%,${a * 0.2})`);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4.0, 0, TAU);
    ctx.fill();

    c.life--;
    if(c.life <= 0) comets.splice(i,1);
  }

  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(draw);
}

draw();
