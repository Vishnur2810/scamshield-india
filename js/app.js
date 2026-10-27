/* ScamShield India — UI controller. License: MIT */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Populate sample dropdown
  (window.SAMPLE_MESSAGES || []).forEach((s, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = s.title;
    $("sample").appendChild(o);
  });
  $("sample").addEventListener("change", (e) => {
    const s = window.SAMPLE_MESSAGES[e.target.value];
    if (s) { $("msg").value = s.text; run(); }
  });

  function highlight(text, matches) {
    let out = esc(text);
    const uniq = Array.from(new Set(matches)).sort((a, b) => b.length - a.length);
    uniq.forEach((m) => {
      const em = esc(m).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out = out.replace(new RegExp(em, "g"), (x) => "<mark>" + x + "</mark>");
    });
    return out;
  }

  function run() {
    const text = $("msg").value;
    const r = window.ScamShield.analyze(text);
    const box = $("result");
    box.classList.remove("hidden");
    $("score").textContent = r.score;
    $("bar").className = "bar lv-" + r.level;
    $("bar").style.width = r.score + "%";
    $("verdict").className = "verdict lv-" + r.level;
    $("verdict").textContent = r.label;
    $("highlight").innerHTML = text.trim() ? highlight(text, r.matches) : "";

    $("indicators").innerHTML = r.indicators.length
      ? r.indicators.map((i) => `<li><span class="cat">${esc(i.category)}:</span> ${esc(i.label)} <span class="ev">— found “${esc(i.evidence)}”</span></li>`).join("")
      : "<li>None of the common scam patterns were found.</li>";

    const tips = r.tips.length ? r.tips : [
      "No warning signs detected, but stay alert. If the sender is unknown, verify before responding.",
      "Never share OTP, PIN or passwords with anyone.",
    ];
    $("tips").innerHTML = tips.map((t) => `<li>${esc(t)}</li>`).join("");
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("check").addEventListener("click", run);
  $("clear").addEventListener("click", () => { $("msg").value = ""; $("result").classList.add("hidden"); $("sample").value = ""; $("msg").focus(); });
  $("msg").addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
})();
