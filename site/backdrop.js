// Holo Search's ground, in the frame's immersive mode: Earth at night (NASA,
// on Unsplash) on the search home, and an aurora (Condor Wei, on Unsplash)
// behind every app it opens. The frame loads its photos only after the
// visitor's first input, so without this a new visitor sees a bare ground
// first. This runs before first paint: it sets the frame's own classes and
// properties and starts the photo at high priority from this site, with a
// 40 px copy of it inline in the stylesheet underneath; then it fetches the
// other photo while the page is idle, so a switch between home and an app is
// instant too. Choices stay the frame's: a mode or a photo picked in its
// panel is stored under its keys and wins over both defaults.
(function () {
  var root = document.documentElement;
  var own = {
    Q1p7bh3SHj8: { file: "backdrop.webp", color: "#0c2626" },
    oMcTmNHclZI: { file: "backdrop-app.webp", color: "#0c2626" },
  };
  var home = "Q1p7bh3SHj8";
  var app = "oMcTmNHclZI";

  function stored(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  // The visitor's own photo: one of the frame's, published beside it under
  // its Unsplash id, or one found by search, kept with its address.
  function picked(id) {
    var recent = [];
    try {
      recent = JSON.parse(stored("prism-backdrop-recent") || "[]");
    } catch (e) {}
    var found = Array.isArray(recent) ? recent.filter(function (p) { return p && p.id === id; })[0] : null;
    if (found) {
      var url = /^https:\/\/images\.unsplash\.com\/[^"\\\s]+$/.test(found.image) ? found.image + "&w=2400" : null;
      return { url: url, color: found.color };
    }
    return /^[\w-]{6,20}$/.test(id) ? { url: "https://uor-foundation.github.io/template/frame/backdrops/" + id + ".jpg" } : null;
  }

  function url(file) {
    return new URL(file, document.baseURI).href;
  }

  // Once the frame runs, what it shows is the truth: it may have painted a
  // photo itself, or cleared it for another mode.
  function showing() {
    var frame = document.getElementById("frame");
    return frame && window.customElements && customElements.get("prism-frame") ? frame.backdrop : root.dataset.backdrop;
  }

  function show(id, photo, priority) {
    if (showing() === id) return;
    if (/^#[0-9a-f]{6}$/i.test(photo.color || "")) root.style.setProperty("--prism-backdrop-color", photo.color);
    if (!photo.url) return;
    var preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = photo.url;
    preload.fetchPriority = priority;
    document.head.appendChild(preload);
    root.style.setProperty("--prism-backdrop", 'url("' + photo.url + '")');
    // The frame takes this as its own (site/holo-frame.mjs), so it does not
    // load the photo again or put its default in its place.
    root.dataset.backdrop = id;
    var frame = document.getElementById("frame");
    if (frame) {
      frame.backdrop = id;
      frame.chosen = { id: id };
    }
  }

  // Paints the ground for the home (false) or an app (true). Called again by
  // site/holo-frame.mjs whenever the page moves between them.
  function paint(opened) {
    var mode = stored("prism-theme");
    if (mode === "light" || mode === "dark") return;
    root.classList.add("dark", "immersive");
    var photo = stored("prism-backdrop");
    if (photo) {
      var found = own[photo] ? { url: url(own[photo].file), color: own[photo].color } : picked(photo);
      if (found) show(photo, found, "high");
      return;
    }
    var id = opened ? app : home;
    show(id, { url: url(own[id].file), color: own[id].color }, "high");
  }

  window.holoBackdrop = paint;
  paint(new URLSearchParams(location.search).has("r"));

  // The other default, fetched once the page is idle.
  if (stored("prism-backdrop") || !root.classList.contains("immersive")) return;
  addEventListener("load", function () {
    var later = window.requestIdleCallback || function (f) { setTimeout(f, 1000); };
    later(function () {
      var other = root.dataset.backdrop === home ? app : home;
      var image = new Image();
      image.fetchPriority = "low";
      image.src = url(own[other].file);
    });
  });
})();
