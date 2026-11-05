// SPLICE CONTROLLER  v1.0.0  (quarto-splice)
// Controls secondary Reveal.js presentations via direct same-origin API access.
// No modification of the secondary HTML is required.

document.addEventListener("DOMContentLoaded", function () {

  console.log("SPLICE CONTROLLER v1.0.0: cargado");

  // Auto-fit: set iframe height to remaining vertical space after siblings.
  function autoFitSplice(slide) {
    if (!slide) return;
    var iframe = slide.querySelector("iframe.splice-secondary");
    if (!iframe) return;
    var slideHeight = Reveal.getConfig().height;
    var usedHeight = 0;
    Array.from(iframe.parentElement.children).forEach(function (el) {
      if (el === iframe) return;
      var st = window.getComputedStyle(el);
      usedHeight += el.offsetHeight
        + parseFloat(st.marginTop) + parseFloat(st.marginBottom);
    });
    var available = slideHeight - usedHeight;
    if (available > 50) iframe.style.height = available + "px";
  }

  // Disable Reveal's built-in keyboard handling — our capture-phase
  // listener takes over arrow key navigation completely.
  Reveal.configure({ keyboard: false });


  // ─────────────────────────────────────────────
  // Auto-descubrimiento de iframes generados por splice.lua
  // ─────────────────────────────────────────────

  const secState = {};

  document.querySelectorAll("iframe.splice-secondary").forEach(function (iframe, i) {

    if (!iframe.id) iframe.id = "splice-secondary-" + i;

    const id  = iframe.id;
    const src = iframe.getAttribute("data-splice-src") || "";

    secState[id] = {
      cfg: { id, src },
      iframe,
      index: 0,
      total: null,
      ready: false
    };

    console.log("SPLICE registrado:", id, "→", src);


    // ─────────────────────────────────────────────
    // Conexión directa al Reveal.js del secondary
    // Se registra ANTES de setear src (lazy loading)
    // ─────────────────────────────────────────────

    iframe.addEventListener("load", function () {

      const iframeReveal = iframe.contentWindow && iframe.contentWindow.Reveal;

      if (!iframeReveal) {
        console.warn("SPLICE: no se encontró Reveal en", id,
          "(¿cross-origin? ¿no es una presentación Reveal.js?)");
        return;
      }

      // Reset so listeners are re-registered if the iframe reloads
      // (Quarto revealjs triggers a load event on hash changes in some browsers).
      secState[id].ready = false;

      function onReady() {
        if (secState[id].ready) return; // guard: evitar doble llamada dentro del mismo load

        const s    = secState[id];
        s.total    = iframeReveal.getTotalSlides();
        s.index    = iframeReveal.getIndices().h;
        s.ready    = true;

        // Seguimiento de cambios de slide en el secondary
        iframeReveal.on("slidechanged", function (event) {
          s.index = event.indexh;
          console.log(id + " estado:", s.index, "/ total:", s.total);
        });

        console.log(id + " → total:", s.total, "→ READY");
      }

      // Reveal puede estar listo ya (isReady) o aún inicializando
      if (iframeReveal.isReady()) {
        onReady();
      } else {
        iframeReveal.on("ready", onReady);
      }

    });

  });


  // ─────────────────────────────────────────────
  // Lazy loading: cargar el secondary al entrar al slide
  // ─────────────────────────────────────────────

  Reveal.on("slidechanged", function (event) {

    autoFitSplice(event.currentSlide);

    Object.values(secState).forEach(function (s) {
      if (!s.iframe) return;
      if (event.currentSlide.contains(s.iframe) && !s.iframe.getAttribute("src")) {
        console.log("Cargando " + s.cfg.id + "...");
        s.iframe.src = s.cfg.src;
      }
    });

  });

  // Also fit on the initial slide (no slidechanged fires on load).
  Reveal.on("ready", function () { autoFitSplice(Reveal.getCurrentSlide()); });


  // ─────────────────────────────────────────────
  // Navegación (fase de captura)
  // ─────────────────────────────────────────────

  document.addEventListener("keydown", function (event) {

    console.log("KEY PRESSED:", event.key, "| code:", event.code);

    // pip-aware navigation (same behavior as → / ←)
    const isRight = event.key === "ArrowRight" || event.key === "n" || event.key === "N"
                 || event.key === "PageDown"
                 || (event.key === " " && !event.shiftKey);
    const isLeft  = event.key === "ArrowLeft"  || event.key === "p" || event.key === "P"
                 || event.key === "PageUp"
                 || (event.key === " " && event.shiftKey);

    // Reveal.js core shortcuts restored (PRIMARY only, no pip involvement)
    const isUp       = event.key === "ArrowUp";
    const isDown     = event.key === "ArrowDown";
    const isFirst    = event.key === "Home";
    const isLast     = event.key === "End";
    const isPause    = event.key === "b" || event.key === "B" || event.key === ".";
    const isEscape   = event.key === "Escape" && Reveal.isOverview();
    const isOverview = event.key === "o" || event.key === "O";

    if (!isRight && !isLeft && !isUp && !isDown && !isFirst && !isLast && !isPause && !isEscape && !isOverview) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    // Non-navigation shortcuts — delegate directly to Reveal, no pip logic
    if (isPause)    { Reveal.togglePause();                                   return; }
    if (isOverview) { Reveal.toggleOverview();                                return; }
    if (isUp)       { Reveal.up();                                            return; }
    if (isDown)     { Reveal.down();                                          return; }
    if (isFirst)    { Reveal.slide(0);                                        return; }
    if (isLast)     { Reveal.slide(999, 999); return; }
    if (isEscape)   { Reveal.toggleOverview(false);                           return; }

    // In overview mode, delegate navigation to Reveal directly (no secondary control)
    if (Reveal.isOverview()) {
      if (isRight) { Reveal.right(); return; }
      if (isLeft)  { Reveal.left();  return; }
    }

    const currentSlide = Reveal.getCurrentSlide();

    const active = Object.values(secState).find(
      s => s.iframe && currentSlide.contains(s.iframe)
    );

    console.log(
      "TECLA:", event.key,
      "| active:", active ? active.cfg.id : "ninguno",
      active ? "| index:" + active.index + "/" + active.total + " ready:" + active.ready : "",
      "| primary:", Reveal.getIndices()
    );


    if (isRight) {

      if (active) {
        if (!active.ready) {
          console.log("→ " + active.cfg.id + " no está READY (esperar)");
          return;
        }
        if (active.index < active.total - 1) {
          console.log("→ " + active.cfg.id + ".next()");
          active.iframe.contentWindow.Reveal.next();
        } else {
          console.log("→ PRIMARY.next()");
          Reveal.next();
        }
      } else {
        console.log("→ PRIMARY.next()");
        Reveal.next();
      }

    }


    if (isLeft) {

      if (active) {
        if (!active.ready) {
          console.log("← PRIMARY.prev() (secondary no listo)");
          Reveal.prev();
          return;
        }
        if (active.index > 0) {
          console.log("← " + active.cfg.id + ".prev()");
          active.iframe.contentWindow.Reveal.prev();
        } else {
          console.log("← PRIMARY.prev()");
          Reveal.prev();
        }
      } else {
        console.log("← PRIMARY.prev()");
        Reveal.prev();
      }

    }

  }, true);

});
