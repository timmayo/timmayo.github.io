(() => {
  "use strict";

  // Paste the same flow URL used in timmayo/classes/index.html (POWER_AUTOMATE_URL).
  const POWER_AUTOMATE_URL = "PASTE_FLOW_URL_HERE";

  const $ = id => document.getElementById(id);
  const root = document.documentElement;

  // Theme (same behavior as the home page)
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch {}
  $("theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });

  const safeUrl = u => /^https?:\/\//i.test(u) ? u : "#";

  function show(data){
    $("title").textContent = data.name || "Class materials";
    $("intro").textContent = "Download your slides below.";
    const list = $("list");
    list.replaceChildren();
    (data.materials || []).forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = safeUrl(m.url);
      a.setAttribute("download", "");
      a.textContent = (m.title || "Download").replace(/\.pptx$/i, "");
      li.append(a);
      list.append(li);
    });
    $("login").hidden = true;
    $("materials").hidden = false;
  }

  $("form").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = $("msg"), pw = $("pw").value.trim();
    if (!pw) { msg.textContent = "Please enter a password."; return; }
    if (POWER_AUTOMATE_URL.startsWith("PASTE")) { msg.textContent = "Flow URL not configured."; return; }
    msg.textContent = "Loading materials…";
    try {
      const r = await fetch(POWER_AUTOMATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      if (!r.ok) { msg.textContent = "Invalid password. Try again."; return; }
      show(await r.json());
      msg.textContent = "";
    } catch (err) {
      console.error(err);
      msg.textContent = "Something went wrong. Please try again.";
    }
  });

  $("logout").addEventListener("click", () => {
    $("pw").value = "";
    $("materials").hidden = true;
    $("login").hidden = false;
    $("title").textContent = "Download your slides.";
    $("intro").textContent = "Enter the password provided in class.";
  });
})();
