(() => {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger temporarily resets scrolling while rebuilding media contexts.
  // Keep the last settled position so changing motion preferences preserves it.
  let lastScrollPosition = window.scrollY;
  let preferenceScrollPosition = lastScrollPosition;
  let rebuildingMedia = false;
  window.addEventListener("scroll", () => {
    if (!rebuildingMedia) lastScrollPosition = window.scrollY;
  }, { passive: true });
  gsap.addEventListener("matchMediaInit", () => {
    preferenceScrollPosition = lastScrollPosition;
    rebuildingMedia = true;
  });
  gsap.addEventListener("matchMedia", () => {
    window.scrollTo({ top: preferenceScrollPosition, behavior: "instant" });
    lastScrollPosition = window.scrollY;
    rebuildingMedia = false;
    ScrollTrigger.update();
  });

  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".hero-content");
    const heroSnapshots = [];
    if (hero) {
      // Split only text nodes so the existing line break and accent remain intact.
      const splitWords = (element) => {
        if (!element) return [];
        heroSnapshots.push([element, element.innerHTML]);
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
            else {
              const word = document.createElement("span");
              word.className = "reveal-word";
              word.textContent = part;
              fragment.append(word);
            }
          });
          node.replaceWith(fragment);
        });
        return [...element.querySelectorAll(".reveal-word")];
      };
      const groups = [".eyebrow", "h1", ".hero-description", ".hero-since"].map((selector) => splitWords(hero.querySelector(selector)));
      const reveal = { autoAlpha: 0, y: 12, filter: "blur(6px)", duration: .65, ease: "power2.out", clearProps: "opacity,visibility,transform,filter" };
      gsap.timeline()
        .from(groups[0], { ...reveal, stagger: .025 }, 0)
        .from(groups[1], { ...reveal, stagger: .065, duration: .8 }, .12)
        .from(groups[2], { ...reveal, stagger: .015, duration: .55 }, .36)
        .from(groups[3], { ...reveal, stagger: .02, duration: .5 }, .5)
        .from(hero.querySelector(".actions"), { autoAlpha: 0, y: 14, duration: .65, ease: "power2.out", clearProps: "opacity,visibility,transform" }, .64);
    } else {
      const entry = document.querySelector(".blog-hero-inner, .repair-page-content");
      if (entry) {
        const intro = gsap.utils.toArray(entry.querySelectorAll(".eyebrow, h1, .hero-description, .hero-since, .actions, .blog-hero-aside"));
        gsap.timeline({ defaults: { ease: "power2.out", duration: .72 } })
          .from(intro, { autoAlpha: 0, y: 20, stagger: .09, clearProps: "opacity,visibility,transform" });
      }
    }

    const selectors = [
      "#servicos .section-heading", ".service-feature", ".services-layout > *",
      ".products-section .section-heading", ".catalog-heading > *",
      ".catalog-notice", ".catalog-grid", ".product-group",
      ".notebook-photo", ".notebook-content", ".repair-grid > *",
      ".repair-page-photo", ".repair-page-card", ".repair-page-contact-inner > *",
      ".about-layout > *", ".blog-section > *", ".contact-layout > *", ".careers",
      ".blog-list-heading > *", ".article-card", ".blog-contact-inner > *"
    ];
    const targets = gsap.utils.toArray(selectors.join(", "));
    gsap.set(targets, { autoAlpha: 0, y: 26 });
    ScrollTrigger.batch(targets, {
      start: "top 92%",
      once: true,
      interval: 0.14,
      batchMax: 4,
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out",
        stagger: 0.1, clearProps: "opacity,visibility,transform",
        overwrite: true
      })
    });

    const disclosureHandlers = [];
    document.querySelectorAll("#servicos .service-groups details, .article-detail").forEach((detail) => {
      const summary = detail.querySelector("summary");
      const panel = detail.querySelector(".detail-content, :scope > div");
      if (!summary || !panel) return;
      const handleClick = (event) => {
        event.preventDefault();
        const intendedOpen = detail.dataset.targetOpen === undefined
          ? detail.open : detail.dataset.targetOpen === "true";
        const nextOpen = !intendedOpen;
        detail.dataset.targetOpen = String(nextOpen);
        gsap.killTweensOf([detail, panel]);
        const border = parseFloat(getComputedStyle(detail).borderTopWidth) +
          parseFloat(getComputedStyle(detail).borderBottomWidth);
        const collapsedHeight = summary.getBoundingClientRect().height + border;
        if (nextOpen) {
          const currentHeight = detail.open
            ? detail.getBoundingClientRect().height : collapsedHeight;
          detail.open = true;
          const expandedHeight = summary.offsetHeight + panel.scrollHeight + border;
          gsap.set(detail, { height: currentHeight });
          gsap.set(panel, { opacity: 0, y: -6 });
          gsap.to(detail, {
            height: expandedHeight, duration: 0.38, ease: "power2.inOut",
            onComplete: () => {
              gsap.set(detail, { clearProps: "height" });
              gsap.set(panel, { clearProps: "opacity,transform" });
              delete detail.dataset.targetOpen;
              ScrollTrigger.refresh();
            }
          });
          gsap.to(panel, { opacity: 1, y: 0, duration: 0.31, delay: 0.07, ease: "power2.out" });
        } else {
          gsap.set(detail, { height: detail.getBoundingClientRect().height });
          gsap.to(detail, {
            height: collapsedHeight, duration: 0.32, ease: "power2.inOut",
            onComplete: () => {
              detail.open = false;
              gsap.set(detail, { clearProps: "height" });
              gsap.set(panel, { clearProps: "opacity,transform" });
              delete detail.dataset.targetOpen;
              ScrollTrigger.refresh();
            }
          });
          gsap.to(panel, { opacity: 0, y: -6, duration: 0.2, ease: "power1.in" });
        }
      };
      summary.addEventListener("click", handleClick);
      disclosureHandlers.push([detail, summary, panel, handleClick]);
    });
    return () => {
      disclosureHandlers.forEach(([detail, summary, panel, handleClick]) => {
        summary.removeEventListener("click", handleClick);
        gsap.killTweensOf([detail, panel]);
        if (detail.dataset.targetOpen !== undefined)
          detail.open = detail.dataset.targetOpen === "true";
        delete detail.dataset.targetOpen;
        gsap.set(detail, { clearProps: "height" });
        gsap.set(panel, { clearProps: "opacity,transform" });
      });
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.set(targets, { clearProps: "opacity,visibility,transform" });
      heroSnapshots.forEach(([element, original]) => { element.innerHTML = original; });
    };
  });
})();
