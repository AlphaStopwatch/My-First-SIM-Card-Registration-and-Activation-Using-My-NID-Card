(function () {
  "use strict";

  // Permanent starting moment: 3 November 2026, 7:03:00 PM, Asia/Dhaka (UTC+06:00).
  // Defined once, never modified, never replaced by "now".
  var START_ISO = "2026-11-03T19:03:00+06:00";
  var START_MS = Date.parse(START_ISO);

  var MS_PER_DAY = 86400000n; // BigInt: no digit limit, no overflow, no truncation.
  var REFRESH_MS = 30000;     // Refresh the *display* only; the value is always recomputed from START_MS.

  var el = document.getElementById("days");
  var lastText = "";

  // Complete elapsed days since the fixed start, derived purely from timestamps.
  function elapsedDays() {
    var diff = Date.now() - START_MS;
    if (!(diff > 0)) return 0n;                // never negative (also guards NaN)
    return BigInt(Math.floor(diff)) / MS_PER_DAY;
  }

  // Thousands separators without locale dependence or Number limits.
  function format(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function render() {
    var text = format(elapsedDays());
    if (text === lastText) return;             // avoid needless DOM work
    lastText = text;
    el.textContent = text;
    el.style.setProperty("--chars", String(text.length));
  }

  render();
  setInterval(render, REFRESH_MS);

  // Recompute immediately whenever the page becomes active again
  // (reopened, un-backgrounded, restored from bfcache, woken from sleep).
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
  window.addEventListener("pageshow", render);
  window.addEventListener("focus", render);
  window.addEventListener("online", render);
})();
