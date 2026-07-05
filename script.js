const filterButtons = document.querySelectorAll(".filter-button");
const repoCards = document.querySelectorAll(".repo-card");
const revealItems = document.querySelectorAll(".reveal");
const showreelCanvas = document.querySelector("#aiShowreel");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startShowreel(canvas) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const colors = ["#44d7b6", "#6aa8ff", "#f4c95d", "#ff725c", "#a990ff"];
  const nodes = Array.from({ length: 58 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0018,
    vy: (Math.random() - 0.5) * 0.0018,
    radius: 1.6 + Math.random() * 2.8,
    color: colors[index % colors.length],
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function draw(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(width * 0.55, height * 0.46, 10, width * 0.5, height * 0.5, width * 0.7);
    gradient.addColorStop(0, "rgba(68, 215, 182, 0.17)");
    gradient.addColorStop(0.45, "rgba(106, 168, 255, 0.08)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0.04 || node.x > 0.96) node.vx *= -1;
      if (node.y < 0.06 || node.y > 0.94) node.vy *= -1;
    });

    for (let index = 0; index < nodes.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
        const a = nodes[index];
        const b = nodes[nextIndex];
        const ax = a.x * width;
        const ay = a.y * height;
        const bx = b.x * width;
        const by = b.y * height;
        const distance = Math.hypot(ax - bx, ay - by);

        if (distance < 130) {
          context.strokeStyle = `rgba(68, 215, 182, ${0.22 * (1 - distance / 130)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.stroke();
        }
      }
    }

    nodes.forEach((node, index) => {
      const x = node.x * width;
      const y = node.y * height;
      const pulse = Math.sin(time * 0.002 + index) * 0.5 + 0.5;
      context.fillStyle = node.color;
      context.shadowColor = node.color;
      context.shadowBlur = 16 + pulse * 16;
      context.beginPath();
      context.arc(x, y, node.radius + pulse * 1.5, 0, Math.PI * 2);
      context.fill();
    });

    context.shadowBlur = 0;
    const scanX = (Math.sin(time * 0.0009) * 0.5 + 0.5) * width;
    context.strokeStyle = "rgba(244, 201, 93, 0.72)";
    context.lineWidth = 2;
    context.setLineDash([10, 10]);
    context.strokeRect(scanX * 0.42, height * 0.18, width * 0.34, height * 0.24);
    context.strokeRect(width * 0.18, height * 0.52, width * 0.42, height * 0.2);
    context.setLineDash([]);

    context.fillStyle = "rgba(255, 255, 255, 0.82)";
    context.font = "700 12px Inter, sans-serif";
    context.fillText("confidence 98.2%", width * 0.18, height * 0.5);
    context.fillText("explainability heatmap", scanX * 0.42, height * 0.16);

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  draw(0);
}

startShowreel(showreelCanvas);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    repoCards.forEach((card) => {
      const tags = card.dataset.tags || "";
      card.classList.toggle("is-hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

repoCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
