(function () {
  "use strict";

  // Fixed forever: 3 November 2006, 7:03:00 PM, Asia/Dhaka (UTC+06:00).
  // An ISO string with an explicit offset is one exact instant, so the result
  // is identical on every device regardless of its own time zone.
  var START_MS = BigInt(Date.parse("2006-11-03T19:03:00+06:00"));
  var DAY_MS = 86400000n;
  var MAX_WAIT = 60000; // re-check at least once a minute (covers sleep and clock changes)

  var el = document.getElementById("days");
  var lastText = "";
  var timer = null;

  // Whole elapsed days, computed from the real clock. BigInt means no overflow, ever.
  function elapsedDays(nowMs) {
    var diff = nowMs - START_MS;
    if (diff < 0n) return 0n; // never negative
    return diff / DAY_MS;
  }

  function group(big) {
    return big.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function render(first) {
    var now = BigInt(Date.now());
    var days = elapsedDays(now);
    var text = group(days);

    if (text !== lastText) {
      el.textContent = text;
      el.setAttribute("aria-label", text + " days");
      // Digit-weighted width: commas are narrower than digits.
      var commas = (text.match(/,/g) || []).length;
      el.style.setProperty("--n", String(text.length - commas + commas * 0.5));

      if (!first) {
        el.classList.remove("tick");
        void el.offsetWidth; // restart the animation
        el.classList.add("tick");
      }
      lastText = text;
    }

    // Sleep until the next day boundary, but never longer than MAX_WAIT.
    var next = START_MS + (days + 1n) * DAY_MS;
    var wait = Number(next - now);
    if (!(wait > 0)) wait = 1000;
    wait = Math.min(wait + 50, MAX_WAIT);

    clearTimeout(timer);
    timer = setTimeout(function () { render(false); }, wait);
  }

  // Timers are throttled or paused in background tabs and during sleep,
  // so recalculate from the real clock the moment the page is visible again.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render(false);
  });
  window.addEventListener("focus", function () { render(false); });
  window.addEventListener("pageshow", function () { render(false); });
  window.addEventListener("online", function () { render(false); });

  render(true);
})();
