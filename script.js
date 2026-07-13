const body = document.body;
const loader = document.querySelector(".loader");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress span");
const cursorGlow = document.querySelector(".cursor-glow");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-header nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

body.classList.add("is-loading");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader?.classList.add("is-done");
    body.classList.remove("is-loading");
  }, prefersReducedMotion ? 0 : 1050);
});

document.querySelector("#year").textContent = new Date().getFullYear();

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? scrollTop / scrollRange : 0;

  header?.classList.toggle("scrolled", scrollTop > 30);
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

if (cursorGlow && !prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  navigation?.classList.toggle("open", !expanded);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -30px" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || "";
    const format = element.dataset.format;
    const startedAt = performance.now();
    const duration = prefersReducedMotion ? 1 : 1400;

    function tick(now) {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = Math.round(target * eased);
      element.textContent = `${format === "comma" ? value.toLocaleString("en-US") : value}${suffix}`;
      if (elapsed < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    metricObserver.unobserve(element);
  });
}, { threshold: 0.7 });

document.querySelectorAll(".metric-number").forEach((element) => metricObserver.observe(element));

function bindCardGlow(card) {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
}

document.querySelectorAll(".repo-card").forEach(bindCardGlow);

if (!prefersReducedMotion) {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.13;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.13;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

const filters = document.querySelectorAll("[data-filter]");

function applyFilter(filter) {
  document.querySelectorAll(".repo-card").forEach((card) => {
    const tags = card.dataset.tags || "";
    card.classList.toggle("is-hidden", filter !== "all" && !tags.includes(filter));
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyFilter(button.dataset.filter || "all");
  });
});

function inferTags(repository) {
  const text = `${repository.name} ${repository.description || ""} ${repository.language || ""}`.toLowerCase();
  const tags = [];
  if (/ai|model|vision|python|caption|gesture|drows|skin/.test(text)) tags.push("ai");
  if (/app|web|javascript|typescript|css|html|product|site/.test(text)) tags.push("product");
  if (/data|analysis|notebook|fda/.test(text)) tags.push("data");
  return tags.length ? tags.join(" ") : "product";
}

function createLiveRepositoryCard(repository, index) {
  const article = document.createElement("article");
  article.className = "repo-card reveal";
  article.dataset.repo = repository.name;
  article.dataset.tags = inferTags(repository);

  const top = document.createElement("div");
  top.className = "repo-card-top";
  const id = document.createElement("span");
  id.className = "repo-id";
  id.textContent = String(index).padStart(2, "0");
  const language = document.createElement("span");
  language.className = "language";
  language.textContent = repository.language || "Repository";
  top.append(id, language);

  const content = document.createElement("div");
  const label = document.createElement("p");
  label.className = "repo-label";
  label.textContent = "NEW ON GITHUB";
  const title = document.createElement("h3");
  title.textContent = repository.name.replace(/-/g, " ");
  const description = document.createElement("p");
  description.textContent = repository.description || "Explore this project and its source on GitHub.";
  content.append(label, title, description);

  const footer = document.createElement("div");
  footer.className = "repo-footer";
  const detail = document.createElement("span");
  detail.textContent = `${repository.language || "Code"} · ${repository.stargazers_count || 0} stars`;
  const link = document.createElement("a");
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", `Open ${repository.name} on GitHub`);
  link.textContent = "↗";
  footer.append(detail, link);

  article.append(top, content, footer);
  return article;
}

async function syncGitHubRepositories() {
  try {
    const response = await fetch("https://api.github.com/users/shihabbk18/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) return;

    const repositories = await response.json();
    if (!Array.isArray(repositories)) return;

    const publicRepositories = repositories.filter((repo) => !repo.fork);
    const count = document.querySelector("#repoCount");
    if (count) count.textContent = String(publicRepositories.length);

    publicRepositories.forEach((repository) => {
      const existing = document.querySelector(`[data-repo="${CSS.escape(repository.name)}"]`);
      if (existing) {
        const language = existing.querySelector(".language");
        if (language && repository.language) language.textContent = repository.language;
      }
    });

    const known = new Set([...document.querySelectorAll("[data-repo]")].map((card) => card.dataset.repo));
    const grid = document.querySelector("#repoGrid");
    if (!grid) return;

    publicRepositories.filter((repo) => !known.has(repo.name)).forEach((repository, offset) => {
      const card = createLiveRepositoryCard(repository, known.size + offset + 2);
      grid.appendChild(card);
      bindCardGlow(card);
      revealObserver.observe(card);
    });
  } catch {
    // The curated repository list remains fully usable if GitHub rate limits or blocks the request.
  }
}

syncGitHubRepositories();
