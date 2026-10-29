(() => {
  "use strict";

  // Native adaptations inspired by ReactBits Magic Bento and Specular Button.
  // One shared animation frame runs only when pointer coordinates change.
  const preference = matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  let dispose = () => {};

  function syncEffects() {
    dispose();
    dispose = () => {};
    if (!preference.matches) return;

    const records = [];
    const pending = new Set();
    let frame = 0;

    function paint() {
      frame = 0;
      const updates = [...pending];
      pending.clear();
      // Read all geometry before writing styles. Scroll/resize invalidates it.
      updates.forEach((record) => {
        record.rect ??= record.surface.getBoundingClientRect();
      });
      updates.forEach(({ surface, light, rect, x, y, size, centered }) => {
        const localX = centered ? rect.width / 2 : x - rect.left;
        const localY = centered ? rect.height * 0.65 : y - rect.top;
        if (!centered && (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height)) {
          surface.classList.remove("is-pointer-active");
          return;
        }
        light.style.transform = `translate3d(${localX - size / 2}px, ${localY - size / 2}px, 0)`;
      });
    }

    function schedule(record) {
      pending.add(record);
      if (!frame) frame = requestAnimationFrame(paint);
    }

    document.querySelectorAll(".catalog-card, .button, .catalog-cta").forEach((surface) => {
      const spotlight = surface.classList.contains("catalog-card");
      const size = spotlight ? 480 : 240;
      const light = document.createElement("span");
      light.className = "pointer-light";
      light.setAttribute("aria-hidden", "true");
      light.style.setProperty("--light-size", `${size}px`);
      surface.dataset.pointerEffect = spotlight ? "spotlight" : "specular";
      surface.append(light);

      const record = { surface, light, size, rect: null, x: 0, y: 0, centered: false };
      const move = (event) => {
        if (event.pointerType === "touch") return;
        record.x = event.clientX;
        record.y = event.clientY;
        record.centered = false;
        surface.classList.add("is-pointer-active");
        schedule(record);
      };
      const leave = () => {
        surface.classList.remove("is-pointer-active");
        pending.delete(record);
        record.rect = null;
      };
      const focus = () => {
        record.centered = true;
        schedule(record);
      };
      surface.addEventListener("pointerenter", move, { passive: true });
      surface.addEventListener("pointermove", move, { passive: true });
      surface.addEventListener("pointerleave", leave, { passive: true });
      surface.addEventListener("pointercancel", leave, { passive: true });
      surface.addEventListener("focusin", focus);
      records.push({ record, surface, light, move, leave, focus });
    });

    const invalidateGeometry = () => {
      records.forEach(({ record, surface }) => {
        record.rect = null;
        if (surface.classList.contains("is-pointer-active") || surface.matches(":focus-within"))
          schedule(record);
      });
    };
    const reset = () => {
      records.forEach(({ record, surface }) => {
        record.rect = null;
        surface.classList.remove("is-pointer-active");
      });
      pending.clear();
      cancelAnimationFrame(frame);
      frame = 0;
    };
    window.addEventListener("scroll", invalidateGeometry, { passive: true, capture: true });
    window.addEventListener("resize", invalidateGeometry, { passive: true });
    window.addEventListener("blur", reset);
    dispose = () => {
      reset();
      records.forEach(({ surface, light, move, leave, focus }) => {
        surface.removeEventListener("pointerenter", move);
        surface.removeEventListener("pointermove", move);
        surface.removeEventListener("pointerleave", leave);
        surface.removeEventListener("pointercancel", leave);
        surface.removeEventListener("focusin", focus);
        delete surface.dataset.pointerEffect;
        light.remove();
      });
      window.removeEventListener("scroll", invalidateGeometry, true);
      window.removeEventListener("resize", invalidateGeometry);
      window.removeEventListener("blur", reset);
    };
  }

  preference.addEventListener("change", syncEffects);
  syncEffects();
})();
