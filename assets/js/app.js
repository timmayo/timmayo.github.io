(() => {
  "use strict";
  const USER = "timmayo";
  const CACHE_KEY = "repos:" + USER;
  const TTL = 30 * 60 * 1000;

  const $ = id => document.getElementById(id);
  const grid = $("grid"), statusEl = $("status");
  let repos = [];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const store = {
    get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    raw(k,v){ try { v === undefined ? localStorage.getItem(k) : localStorage.setItem(k,v); } catch {} }
  };

  // Theme
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch {}
  $("theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });

  // Reveal on scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .1 }) : null;
  document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  function skeletons(){
    grid.innerHTML = Array.from({length:6}, () => '<div class="skeleton"></div>').join("");
  }

  async function fetchAll(){
    let all = [], page = 1;
    while (page <= 5) {
      const r = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated&page=${page}`);
      if (!r.ok) {
        const err = new Error(String(r.status));
        err.rateLimited = r.status === 403 && r.headers.get("x-ratelimit-remaining") === "0";
        throw err;
      }
      const batch = await r.json();
      all = all.concat(batch);
      if (batch.length < 100) break;
      page++;
    }
    return all;
  }

  async function load(force){
    const cached = store.get(CACHE_KEY);
    if (!force && cached && Date.now() - cached.t < TTL) { repos = cached.data; return ready(); }
    skeletons(); statusEl.textContent = "Loading repositories…";
    try {
      repos = await fetchAll();
      store.set(CACHE_KEY, { t: Date.now(), data: repos });
      ready();
    } catch (e) {
      if (cached) { repos = cached.data; ready(); statusEl.textContent += " (showing cached data; live refresh failed)"; return; }
      grid.innerHTML = "";
      const msg = !navigator.onLine ? "You appear to be offline."
        : e.rateLimited ? "GitHub API rate limit reached. Try again later."
        : e.message === "404" ? `GitHub user "${USER}" was not found.`
        : "Could not load repositories.";
      statusEl.innerHTML = esc(msg) + ' <button class="btn" id="retry" type="button">Retry</button>';
      $("retry").addEventListener("click", () => load(true));
    }
  }

  function ready(){
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
    const sel = $("lang"), cur = sel.value;
    sel.innerHTML = '<option value="">All languages</option>' + langs.map(l => `<option>${esc(l)}</option>`).join("");
    sel.value = langs.includes(cur) ? cur : "";
    render();
  }

  function ago(iso){
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (d < 1) return "today";
    if (d < 30) return d + "d ago";
    if (d < 365) return Math.floor(d / 30) + "mo ago";
    return Math.floor(d / 365) + "y ago";
  }

  function render(){
    const q = $("q").value.trim().toLowerCase(), lang = $("lang").value, sort = $("sort").value, hideForks = $("forks").checked;
    let list = repos.filter(r => !(hideForks && r.fork) && (!lang || r.language === lang) &&
      (!q || [r.name, r.description, r.language, ...(r.topics || [])].join(" ").toLowerCase().includes(q)));
    const by = {
      updated: (a,b) => new Date(b.pushed_at) - new Date(a.pushed_at),
      stars: (a,b) => b.stargazers_count - a.stargazers_count,
      name: (a,b) => a.name.localeCompare(b.name),
      created: (a,b) => new Date(b.created_at) - new Date(a.created_at)
    };
    list.sort(by[sort]);
    if (!repos.length) { grid.innerHTML = ""; statusEl.textContent = "No public repositories yet."; return; }
    if (!list.length) { grid.innerHTML = ""; statusEl.textContent = "No repositories match your filters."; return; }
    statusEl.textContent = `${list.length} repositor${list.length === 1 ? "y" : "ies"}`;
    grid.innerHTML = list.map(r => `
      <article class="repo">
        <h3><a href="${esc(r.html_url)}">${esc(r.name)}</a></h3>
        <p>${esc(r.description || "No description.")}</p>
        ${(r.topics || []).length ? `<div class="topics">${r.topics.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="meta">
          ${r.language ? `<span><i class="dot"></i>${esc(r.language)}</span>` : ""}
          <span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span>
          <span>Updated ${esc(ago(r.pushed_at))}</span>
        </div>
        <div class="links">
          <a href="${esc(r.html_url)}">Code</a>
          ${r.homepage && /^https?:\/\//.test(r.homepage) ? `<a href="${esc(r.homepage)}">Live demo</a>` : ""}
        </div>
      </article>`).join("");
  }

  ["q","lang","sort","forks"].forEach(id => $(id).addEventListener("input", render));
  $("refresh").addEventListener("click", () => load(true));
  load(false);
})();
