(() => {
  "use strict";

  const GET_LINKS_URL = "PASTE_get-links_URL";
  const ADD_LINK_URL = "PASTE_add-link_URL";
  const MANAGE_LINK_URL = "PASTE_manage-link_URL";

  const CATEGORIES = ["Power Platform", "Copilot Studio", "SharePoint", "Teams", "Governance", "ALM / DevOps", "Other"];
  const AUDIENCES = ["Admin", "Developer", "User"];
  const DATES = [["Last 30 days", 30], ["Last 120 days", 120], ["Last 365 days", 365]];
  const ICONS = {
    "Power Platform": "⚡", "Copilot Studio": "🤖", "SharePoint": "📁", "Teams": "💬",
    "Governance": "🛡️", "ALM / DevOps": "🔄", "Other": "❓",
    "Admin": "🛠️", "Developer": "👨‍💻", "User": "👤",
    "Last 30 days": "📅", "Last 120 days": "🗓️", "Last 365 days": "📆"
  };

  const $ = id => document.getElementById(id);
  const root = document.documentElement;

  // Theme
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch {}
  $("theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });

  const notConfigured = u => u.startsWith("PASTE_");
  const daysOld = l => (Date.now() - l.created) / 864e5;

  let links = [];
  const filters = { cat: null, aud: null, days: null, q: "" };
  let password = "";
  try { password = sessionStorage.getItem("linksPw") || ""; } catch {}

  function el(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function fmtDate(d){
    return isNaN(d) ? "" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function safeUrl(u){
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : "#"; } catch { return "#"; }
  }

  async function post(url, payload){
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...payload })
    });
    if (res.status === 401) throw new Error("Incorrect password.");
    if (!res.ok) throw new Error("Something went wrong (" + res.status + ").");
    try { return await res.json(); } catch { return null; }
  }

  // Filtering
  function matches(l, skip){
    if (skip !== "cat" && filters.cat && l.category !== filters.cat) return false;
    if (skip !== "aud" && filters.aud && l.audience !== filters.aud) return false;
    if (skip !== "days" && filters.days && daysOld(l) > filters.days) return false;
    if (filters.q) {
      const hay = [l.title, l.summary, l.category, l.audience].join(" ").toLowerCase();
      if (!hay.includes(filters.q)) return false;
    }
    return true;
  }

  function tiles(container, items, key, labelOf, valueOf){
    container.replaceChildren(...items.map(it => {
      const val = valueOf(it), label = labelOf(it);
      const n = links.filter(l => matches(l, key) && (
        key === "cat" ? l.category === val : key === "aud" ? l.audience === val : daysOld(l) <= val
      )).length;
      const b = el("button", "lk-tile" + (filters[key] === val ? " active" : ""));
      b.type = "button";
      b.setAttribute("aria-pressed", String(filters[key] === val));
      const ico = el("span", "lk-ico", ICONS[label] || "🔗");
      ico.setAttribute("aria-hidden", "true");
      b.append(ico, el("span", "lk-label", label), el("span", "lk-n", String(n)));
      b.addEventListener("click", () => { filters[key] = filters[key] === val ? null : val; render(); });
      return b;
    }));
  }

  function select(field, options, current){
    const s = el("select");
    s.dataset.f = field;
    s.setAttribute("aria-label", field);
    options.forEach(o => {
      const opt = el("option", null, o);
      opt.selected = o === current;
      s.append(opt);
    });
    return s;
  }

  function card(l){
    const art = el("article", "lk-card");
    art.dataset.id = l.id;

    const imgBox = el("div", "lk-img");
    if (l.imageUrl) {
      const img = document.createElement("img");
      img.src = l.imageUrl;
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => { img.remove(); imgBox.textContent = "No image"; });
      imgBox.append(img);
    } else {
      imgBox.textContent = "No image";
    }

    const body = el("div", "lk-body");
    const h3 = el("h3");
    const a = el("a", null, l.title || l.url);
    a.href = safeUrl(l.url); a.target = "_blank"; a.rel = "noopener";
    h3.append(a);

    const tags = el("div", "lk-tags");
    tags.append(el("span", null, l.category), el("span", null, l.audience), el("span", "lk-date", fmtDate(l.created)));

    const admin = el("div", "lk-admin");
    const del = el("button", "btn danger", "Delete");
    del.type = "button"; del.dataset.del = "1";
    admin.append(select("category", CATEGORIES, l.category), select("audience", AUDIENCES, l.audience), del);

    body.append(h3, el("p", null, l.summary || ""), tags, admin);
    art.append(imgBox, body);
    return art;
  }

  function render(){
    tiles($("cats"), CATEGORIES, "cat", x => x, x => x);
    tiles($("auds"), AUDIENCES, "aud", x => x, x => x);
    tiles($("dates"), DATES, "days", x => x[0], x => x[1]);

    const shown = links.filter(l => matches(l));
    $("status").textContent = links.length ? `${shown.length} of ${links.length} links` : "No links yet.";
    $("clear").hidden = !(filters.cat || filters.aud || filters.days || filters.q);

    const list = $("list");
    list.replaceChildren(...shown.map(card));
    if (links.length && !shown.length) list.append(el("p", "lk-empty", "No links match these filters."));
  }

  async function load(){
    const status = $("status");
    if (notConfigured(GET_LINKS_URL)) { status.textContent = "Links URL not configured."; return; }
    status.textContent = "Loading links…";
    try {
      const res = await fetch(GET_LINKS_URL);
      if (!res.ok) throw new Error(res.status);
      const items = await res.json();
      links = (Array.isArray(items) ? items : []).map(l => ({ ...l, created: new Date(l.created) }));
      links.sort((a, b) => b.created - a.created);
      render();
    } catch (e) {
      console.error(e);
      status.textContent = "Couldn't load links right now. Please refresh to try again.";
    }
  }

  $("q").addEventListener("input", e => { filters.q = e.target.value.trim().toLowerCase(); render(); });
  $("clear").addEventListener("click", () => {
    filters.cat = filters.aud = filters.days = null; filters.q = "";
    $("q").value = ""; render();
  });

  // Manage mode (password is checked by the flow)
  function setAdmin(on){
    document.body.classList.toggle("admin", on);
    $("add-panel").hidden = !on;
    if (!on) $("unlock-panel").hidden = true;
    $("manage-btn").textContent = on ? "Exit manage mode" : "Manage links";
  }

  $("manage-btn").addEventListener("click", () => {
    if (document.body.classList.contains("admin")) {
      password = "";
      try { sessionStorage.removeItem("linksPw"); } catch {}
      setAdmin(false);
      return;
    }
    const p = $("unlock-panel");
    p.hidden = !p.hidden;
    if (!p.hidden) $("lk-password").focus();
  });

  $("unlock-form").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = $("unlock-msg");
    msg.textContent = ""; msg.className = "lk-msg";
    if (notConfigured(MANAGE_LINK_URL)) { msg.textContent = "Manage URL not configured."; return; }
    password = $("lk-password").value;
    try {
      await post(MANAGE_LINK_URL, { action: "verify" });
      try { sessionStorage.setItem("linksPw", password); } catch {}
      $("unlock-form").reset();
      setAdmin(true);
    } catch (err) {
      password = "";
      msg.textContent = err.message; msg.className = "lk-msg err";
    }
  });

  if (password && !notConfigured(MANAGE_LINK_URL)) {
    post(MANAGE_LINK_URL, { action: "verify" }).then(() => setAdmin(true)).catch(() => {
      password = "";
      try { sessionStorage.removeItem("linksPw"); } catch {}
    });
  }

  $("add-form").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("add-btn"), msg = $("add-msg"), input = $("new-url");
    if (notConfigured(ADD_LINK_URL)) { msg.textContent = "Add URL not configured."; return; }
    btn.disabled = true; btn.textContent = "Adding…";
    msg.className = "lk-msg"; msg.textContent = "Fetching and analyzing. This can take 15–30 seconds.";
    try {
      const l = await post(ADD_LINK_URL, { url: input.value.trim() });
      links.unshift({ ...l, created: new Date(l.created) });
      input.value = "";
      msg.textContent = "Added: " + (l.title || "link"); msg.className = "lk-msg ok";
      render();
    } catch (err) {
      msg.textContent = err.message; msg.className = "lk-msg err";
    } finally {
      btn.disabled = false; btn.textContent = "Add link";
    }
  });

  const list = $("list");

  list.addEventListener("change", async e => {
    const sel = e.target.closest("select[data-f]");
    if (!sel) return;
    const id = sel.closest(".lk-card").dataset.id, field = sel.dataset.f;
    try {
      await post(MANAGE_LINK_URL, { action: "update", id, field, value: sel.value });
      links.find(l => l.id === id)[field] = sel.value;
      render();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  });

  list.addEventListener("click", async e => {
    if (!e.target.matches("[data-del]")) return;
    const id = e.target.closest(".lk-card").dataset.id;
    if (!confirm("Delete this link?")) return;
    try {
      await post(MANAGE_LINK_URL, { action: "delete", id });
      links = links.filter(l => l.id !== id);
      render();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  });

  load();
})();
