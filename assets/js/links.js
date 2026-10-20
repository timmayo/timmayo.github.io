(() => {
  "use strict";

  const GET_LINKS_URL = "https://d5753d79c5f9e75bbb0e8769af2df5.0e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/21/workflows/32ef2531183d4e92a5e58cb535d112e7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Sz6P8sCa3m_eX2b0Sd8CvXWsv5ZuJbEKvHg4hRtOTb8";
  const ADD_LINK_URL = "https://d5753d79c5f9e75bbb0e8769af2df5.0e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/08/workflows/f48320379d5f43faaf8fffbc71fb74bb/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LT8DLN8LlAtVwdQTbW1VCZ3nFbY3Lf62w0L-3WqbNMo";
  const MANAGE_LINK_URL = "https://d5753d79c5f9e75bbb0e8769af2df5.0e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/00/workflows/08fb299d6e974142997dcebb21a08587/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qISbPN7j2bXG8Np4us-pQp0HqeNizTcbSf5AtPG94gU";

  const CATEGORIES = ["Power Platform", "Copilot Studio", "SharePoint", "Teams", "Governance", "ALM / DevOps", "Other"];
  const AUDIENCES = ["Admin", "Developer", "User"];
  const DATES = [["Last 30 days", 30], ["Last 120 days", 120], ["Last 365 days", 365]];
  const ICONS = {
    "Power Platform": "⚡", "Copilot Studio": "🤖", "SharePoint": "📁", "Teams": "💬",
    "Governance": "🛡️", "ALM / DevOps": "🔄", "Other": "❓",
    "Admin": "🛠️", "Developer": "👨‍💻", "User": "👤",
    "Last 30 days": "📅", "Last 120 days": "🗓️", "Last 365 days": "📆"
  };

  // Colored line icons (Tabler Icons, MIT), one hue per tile.
  const GLYPHS = {
    "Power Platform":  { c: "#D4537E", d: '<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"/>' },
    "Copilot Studio":  { c: "#D85A30", d: '<path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4"/><path d="M12 2v2"/><path d="M9 12v9"/><path d="M15 12v9"/><path d="M5 16l4 -2"/><path d="M15 14l4 2"/><path d="M9 18h6"/><path d="M10 8v.01"/><path d="M14 8v.01"/>' },
    "SharePoint":      { c: "#1D9E75", d: '<path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/><path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/>' },
    "Teams":           { c: "#7F77DD", d: '<path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1"/>' },
    "Governance":      { c: "#639922", d: '<path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06"/><path d="M15 19l2 2l4 -4"/>' },
    "ALM / DevOps":    { c: "#BA7517", d: '<path d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828"/>' },
    "Other":           { c: "#888780", d: '<path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>' },
    "Admin":           { c: "#D4537E", d: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>' },
    "Developer":       { c: "#7F77DD", d: '<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>' },
    "User":            { c: "#378ADD", d: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>' }
  };

  function iconFor(label, active){
    const ico = document.createElement("span");
    ico.className = "lk-ico";
    ico.setAttribute("aria-hidden", "true");
    ico.style.cssText = "display:inline-flex;width:18px;height:18px;align-items:center;justify-content:center";
    const g = GLYPHS[label];
    if (g) {
      ico.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="' + (active ? "currentColor" : g.c) + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + g.d + '</svg>';
    } else {
      ico.textContent = ICONS[label] || "🔗";
      ico.style.fontSize = "1.05rem";
    }
    return ico;
  }

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

  const PAGE_SIZE = 12; // 4 rows of 3 cards
  let visible = PAGE_SIZE;

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
      const ico = iconFor(label, filters[key] === val);
      b.append(ico, el("span", "lk-label", label), el("span", "lk-n", String(n)));
      b.addEventListener("click", () => { filters[key] = filters[key] === val ? null : val; visible = PAGE_SIZE; render(); });
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

  function pill(label, value){
    const p = el("span", "lk-pill", value || "—");
    p.dataset.v = value || "";
    const wrap = el("span", "lk-field");
    wrap.append(el("span", "lk-fl", label + ":"), p);
    return wrap;
  }

  function card(l){
    const art = el("article", "lk-card");
    art.dataset.id = l.id;
    const href = safeUrl(l.url);

    const imgBox = el("a", "lk-img");
    imgBox.href = href; imgBox.target = "_blank"; imgBox.rel = "noopener";
    imgBox.tabIndex = -1; imgBox.setAttribute("aria-hidden", "true");
    const placeholder = () => { imgBox.classList.add("lk-ph"); imgBox.textContent = ICONS[l.category] || "🔗"; };
    if (l.imageUrl) {
      const img = document.createElement("img");
      img.src = l.imageUrl;
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => { img.remove(); placeholder(); });
      imgBox.append(img);
    } else {
      placeholder();
    }

    const body = el("div", "lk-body");
    const h3 = el("h3");
    const a = el("a", null, l.title || l.url);
    a.href = href; a.target = "_blank"; a.rel = "noopener";
    h3.append(a);

    const meta = el("div", "lk-meta");
    meta.append(pill("Category", l.category), pill("Audience", l.audience));

    const open = el("a", "btn primary lk-open", "Open link");
    open.href = href; open.target = "_blank"; open.rel = "noopener";

    const admin = el("div", "lk-admin");
    const del = el("button", "btn danger", "Delete");
    del.type = "button"; del.dataset.del = "1";
    admin.append(select("category", CATEGORIES, l.category), select("audience", AUDIENCES, l.audience), del);

    body.append(h3, el("p", "lk-sum", l.summary || ""), meta, el("span", "lk-date", fmtDate(l.created)), open, admin);
    art.append(imgBox, body);
    return art;
  }

  function render(){
    tiles($("cats"), CATEGORIES, "cat", x => x, x => x);
    tiles($("auds"), AUDIENCES, "aud", x => x, x => x);
    tiles($("dates"), DATES, "days", x => x[0], x => x[1]);

    const shown = links.filter(l => matches(l));
    const page = shown.slice(0, visible);
    $("status").textContent = !links.length ? "No links yet."
      : page.length < shown.length ? `Showing ${page.length} of ${shown.length} links`
      : `${shown.length} of ${links.length} links`;
    $("clear").hidden = !(filters.cat || filters.aud || filters.days || filters.q);

    const list = $("list");
    list.replaceChildren(...page.map(card));
    if (links.length && !shown.length) list.append(el("p", "lk-empty", "No links match these filters."));

    const left = shown.length - page.length;
    $("more-wrap").hidden = left <= 0;
    $("more").textContent = `Show more (${Math.min(left, PAGE_SIZE)} of ${left} remaining)`;
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

  $("q").addEventListener("input", e => { filters.q = e.target.value.trim().toLowerCase(); visible = PAGE_SIZE; render(); });
  $("clear").addEventListener("click", () => {
    filters.cat = filters.aud = filters.days = null; filters.q = "";
    $("q").value = ""; visible = PAGE_SIZE; render();
  });
  $("more").addEventListener("click", () => { visible += PAGE_SIZE; render(); });

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
