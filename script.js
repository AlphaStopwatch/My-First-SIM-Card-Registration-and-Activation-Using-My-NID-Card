(function () {
  "use strict";

  // Permanent source of truth: 3 Nov 2006, 7:03 PM, Asia/Dhaka (UTC+6).
  var START = Date.parse("2006-11-03T19:03:00+06:00");
  var DAY_MS = 24 * 60 * 60 * 1000;
  var MAX_WAIT = 60 * 60 * 1000; // re-check at least hourly (also guards setTimeout limits)

  var digitsEl = document.getElementById("digits");
  var counterEl = document.getElementById("counter");
  var unitEl = document.getElementById("unit");
  var timer = null;
  var shown = null;

  // ---- seven-segment drawing (SVG scales, so the full number always fits) ----
  function h(x, y, l, t) {
    return [[x, y + t / 2], [x + t / 2, y], [x + l - t / 2, y], [x + l, y + t / 2],
            [x + l - t / 2, y + t], [x + t / 2, y + t]].join(" ");
  }
  function v(x, y, l, t) {
    return [[x + t / 2, y], [x + t, y + t / 2], [x + t, y + l - t / 2], [x + t / 2, y + l],
            [x, y + l - t / 2], [x, y + t / 2]].join(" ");
  }
  var SEG = {
    a: h(5, 0, 42, 9),
    b: v(43, 8, 33, 9),
    c: v(43, 51, 33, 9),
    d: h(5, 83, 42, 9),
    e: v(0, 51, 33, 9),
    f: v(0, 8, 33, 9),
    g: h(5, 41.5, 42, 9)
  };
  var MAP = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc",
    "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg"
  };
  var ORDER = "abcdefg";
  var PITCH = 62; // 52 wide cell + 10 gap

  function drawDigits(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var on = MAP[text.charAt(i)] || "";
      out += '<g transform="translate(' + i * PITCH + ' 0)">';
      for (var s = 0; s < ORDER.length; s++) {
        var k = ORDER.charAt(s);
        out += '<polygon class="' + (on.indexOf(k) > -1 ? "on" : "off") +
               '" points="' + SEG[k] + '"/>';
      }
      out += "</g>";
    }
    digitsEl.setAttribute("viewBox", "0 0 " + (text.length * PITCH - 10) + " 92");
    digitsEl.innerHTML = out;
  }

  // ---- counting: completed 24-hour periods since START, computed from the clock ----
  function completedDays(now) {
    return Math.max(0, Math.floor((now - START) / DAY_MS));
  }

  function render(days) {
    if (days === shown) return;
    shown = days;
    var text = String(days);
    drawDigits(text);
    unitEl.textContent = days === 1 ? "DAY ELAPSED" : "DAYS ELAPSED";
    counterEl.setAttribute("aria-label", text + (days === 1 ? " day elapsed" : " days elapsed"));
  }

  function tick() {
    clearTimeout(timer);
    var now = Date.now();
    var days = completedDays(now);
    render(days);
    var nextBoundary = START + (days + 1) * DAY_MS;
    var wait = Math.min(Math.max(nextBoundary - now, 0) + 500, MAX_WAIT);
    timer = setTimeout(tick, wait);
  }

  // Recompute whenever the page returns (tab switch, sleep, bfcache, long absence).
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) tick();
  });
  window.addEventListener("pageshow", tick);
  window.addEventListener("focus", tick);
  tick();

  // ---- flip between front and back ----
  var flipper = document.getElementById("flipper");
  var flipBtn = document.getElementById("flip");
  var front = document.getElementById("front");
  var back = document.getElementById("back");

  function setFace(flipped) {
    flipper.classList.toggle("flipped", flipped);
    flipBtn.textContent = flipped ? "Flip to front" : "Flip to back";
    flipBtn.setAttribute("aria-pressed", flipped ? "true" : "false");
    front.setAttribute("aria-hidden", flipped ? "true" : "false");
    back.setAttribute("aria-hidden", flipped ? "false" : "true");
    if ("inert" in front) { front.inert = flipped; back.inert = !flipped; }
  }
  flipBtn.addEventListener("click", function () {
    setFace(!flipper.classList.contains("flipped"));
  });
  setFace(false);
})();
