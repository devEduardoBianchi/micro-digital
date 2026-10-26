(() => {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    const entry = document.querySelector(".hero-content, .blog-hero-inner");
    if (entry) {
      const intro = gsap.utils.toArray(entry.querySelectorAll(".eyebrow, h1, .hero-description, .hero-since, .actions, .blog-hero-aside"));
      gsap.timeline({ defaults: { ease: "power2.out", duration: 0.72 } })
        .from(intro, { autoAlpha: 0, y: 20, stagger: 0.09, clearProps: "opacity,visibility,transform" });
    }

    const selectors = [
      "#servicos .section-heading", ".services-layout > *",
      ".products-section .section-heading", ".product-photo", ".product-group",
      ".notebook-photo", ".notebook-content", ".repair-grid > *",
      ".about-layout > *", ".blog-section > *", ".contact-layout > *", ".careers",
      ".blog-list-heading > *", ".article-card", ".blog-contact-inner > *", ".site-footer > *"
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
    };
  });
})();
