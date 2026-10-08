(() => {
  "use strict";

  const GET_FEEDBACK_URL = "https://d5753d79c5f9e75bbb0e8769af2df5.0e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/02/workflows/f19d3f288d624601ba307c16a771b1ea/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=r7UDalM3DPdRamKSc7qUZkTgozzU-MgrW0mbY2AHqEA";
  const SUBMIT_FEEDBACK_URL = "https://d5753d79c5f9e75bbb0e8769af2df5.0e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/07/workflows/eeedf2175224469b983f22ab49452372/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jU7BRu_E-8g3WutYsyFwfHdSzEMuCAyMGuyEn25UM4I";

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

  function fmtDate(ts){
    const d = new Date(ts);
    return isNaN(d) ? "" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function card(item){
    const art = document.createElement("article");
    art.className = "fb";

    const head = document.createElement("div");
    head.className = "fb-head";
    const title = document.createElement("strong");
    title.textContent = item.ClassTitle || "Unknown Class";
    const date = document.createElement("span");
    date.className = "fb-date";
    date.textContent = fmtDate(item.Timestamp);
    head.append(title, date);

    const who = document.createElement("div");
    who.className = "fb-name";
    who.textContent = item.Name && String(item.Name).trim() ? item.Name : "Anonymous";

    const text = document.createElement("p");
    text.className = "fb-text";
    text.textContent = item.Feedback || "";

    art.append(head, who, text);
    return art;
  }

  async function loadFeedback(){
    const status = $("status"), list = $("list");
    list.replaceChildren();
    if (notConfigured(GET_FEEDBACK_URL)) { status.textContent = "Feedback URL not configured."; return; }
    status.textContent = "Loading feedback…";
    try {
      const res = await fetch(GET_FEEDBACK_URL);
      if (!res.ok) throw new Error(res.status);
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) { status.textContent = "No feedback yet."; return; }
      items.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      status.textContent = "";
      list.append(...items.map(card));
    } catch (e) {
      console.error(e);
      status.textContent = "Couldn't load feedback right now. Please refresh to try again.";
    }
  }

  const panel = $("form-panel"), msg = $("msg"), form = $("form"), btn = $("submit-btn");

  $("open-form").addEventListener("click", () => {
    msg.textContent = ""; msg.className = "";
    panel.hidden = false;
    $("password").focus();
  });
  $("cancel-btn").addEventListener("click", () => { panel.hidden = true; form.reset(); msg.textContent = ""; });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (notConfigured(SUBMIT_FEEDBACK_URL)) { msg.textContent = "Submit URL not configured."; return; }
    btn.disabled = true; btn.textContent = "Submitting…"; msg.textContent = ""; msg.className = "";
    try {
      const res = await fetch(SUBMIT_FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: $("password").value,
          name: $("name").value,
          feedback: $("feedback").value
        })
      });
      if (res.status === 401) { msg.textContent = "Incorrect password. Please try again."; msg.className = "err"; }
      else if (!res.ok) { msg.textContent = "Something went wrong. Please try again."; msg.className = "err"; }
      else {
        msg.textContent = "Thanks for your feedback!"; msg.className = "ok";
        setTimeout(() => { panel.hidden = true; form.reset(); msg.textContent = ""; loadFeedback(); }, 900);
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Something went wrong. Please try again."; msg.className = "err";
    } finally {
      btn.disabled = false; btn.textContent = "Submit";
    }
  });

  loadFeedback();
})();
