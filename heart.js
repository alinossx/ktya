const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  const size = Math.min(window.innerWidth * 0.85, 420);
  canvas.width = size;
  canvas.height = size;
}
resize();
window.addEventListener('resize', resize);

const dots = [];
const DOT_COUNT = 280;
const HEART_SCALE = 0.018;

// Классическая формула сердца
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

// Создаём точки внутри сердца
for (let i = 0; i < DOT_COUNT; i++) {
  const t = Math.random() * Math.PI * 2;
  const r = 0.15 + Math.random() * 0.85; // чуть плотнее к краю
  const p = heartPoint(t);
  dots.push({
    baseX: p.x * r,
    baseY: p.y * r,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 2.1 + Math.random() * 2.6,
    alpha: 0.7 + Math.random() * 0.3
  });
}

let mouse = { x: -9999, y: -9999 };
let mouseActive = false;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouseActive = true;
});

canvas.addEventListener('mouseleave', () => {
  mouseActive = false;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  mouseActive = true;
}, { passive: false });

canvas.addEventListener('touchend', () => {
  mouseActive = false;
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 12;
  const scale = canvas.width * HEART_SCALE;

  dots.forEach(dot => {
    const targetX = cx + dot.baseX * scale;
    const targetY = cy + dot.baseY * scale;

    // Инициализация позиции
    if (dot.x === 0 && dot.y === 0) {
      dot.x = targetX;
      dot.y = targetY;
    }

    // Отталкивание от курсора
    if (mouseActive) {
      const dx = dot.x - mouse.x;
      const dy = dot.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
      const forceRadius = 95;

      if (dist < forceRadius) {
        const force = (forceRadius - dist) / forceRadius;
        const angle = Math.atan2(dy, dx);
        dot.vx += Math.cos(angle) * force * 5.2;
        dot.vy += Math.sin(angle) * force * 5.2;
      }
    }

    // Притяжение обратно к форме сердца
    const dx = targetX - dot.x;
    const dy = targetY - dot.y;
    
    dot.vx += dx * 0.055;
    dot.vy += dy * 0.055;
    
    // Трение
    dot.vx *= 0.78;
    dot.vy *= 0.78;
    
    dot.x += dot.vx;
    dot.y += dot.vy;

    // Рисуем точку
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 35, 75, ${dot.alpha})`;
    ctx.fill();

    // Мягкое свечение
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size * 1.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 50, 90, ${dot.alpha * 0.22})`;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();
