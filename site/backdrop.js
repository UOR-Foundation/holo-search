// Holo Search opens on Earth at night (NASA, on Unsplash), in the frame's
// immersive mode. The frame loads its photos only after the visitor's first
// input, so without this a new visitor sees a bare ground first. This runs
// before first paint: it sets the frame's own classes and properties, and
// starts the photo at high priority from this site, with a 40 px copy of it
// inline in the stylesheet underneath. Choices stay the frame's: a mode or a
// photo picked in its panel is stored under its keys and painted here on the
// next visit.
(function () {
  var mode = null;
  var photo = null;
  var recent = [];
  try {
    mode = localStorage.getItem("prism-theme");
    photo = localStorage.getItem("prism-backdrop");
    recent = JSON.parse(localStorage.getItem("prism-backdrop-recent") || "[]");
  } catch (e) {}
  if (mode === "light" || mode === "dark") return;

  var root = document.documentElement;
  var earth = "Q1p7bh3SHj8";
  var id = photo || earth;
  var url = null;
  var color = null;
  if (id === earth) {
    url = new URL("backdrop.webp", document.baseURI).href;
    color = "#0c2626";
    root.classList.add("holo-earth");
  } else {
    // A photo found by search is kept with its address; the frame's own
    // photos are published beside it under their Unsplash id.
    var found = Array.isArray(recent) ? recent.filter(function (p) { return p && p.id === id; })[0] : null;
    if (found) {
      if (/^https:\/\/images\.unsplash\.com\/[^"\\\s]+$/.test(found.image)) url = found.image + "&w=2400";
      color = found.color;
    } else if (/^[\w-]{6,20}$/.test(id)) {
      url = "https://uor-foundation.github.io/template/frame/backdrops/" + id + ".jpg";
    }
  }

  root.classList.add("dark", "immersive");
  if (/^#[0-9a-f]{6}$/i.test(color || "")) root.style.setProperty("--prism-backdrop-color", color);
  if (!url) return;
  var preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "image";
  preload.href = url;
  preload.fetchPriority = "high";
  document.head.appendChild(preload);
  root.style.setProperty("--prism-backdrop", 'url("' + url + '")');
  // site/holo-frame.mjs hands this to the frame, so it does not load the photo again.
  root.dataset.backdrop = id;
})();
