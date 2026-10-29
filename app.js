(() => {
  "use strict";
  const config = window.MICRO_CONFIG;
  const messages = {
    general: () =>
      "Olá, Micro Digital! Gostaria de informações sobre os produtos e serviços da loja.",
    question: () =>
      "Olá, Micro Digital! Tenho uma dúvida sobre informática. Podem me orientar?",
    product: (item) =>
      `Olá, Micro Digital! Tenho interesse em ${item}. Podem informar as opções e a disponibilidade?`,
    catalog: (item) =>
      `Olá, Micro Digital! Vi o item demonstrativo ${item} no catálogo da proposta. Podem informar os modelos reais, valores e disponibilidade?`,
    service: (item) =>
      `Olá, Micro Digital! Gostaria de informações e orçamento de manutenção para ${item}. Vou informar o modelo e o problema do equipamento.`,
    repair: (item) =>
      `Olá, Micro Digital! Gostaria de informações e orçamento para ${item} no meu notebook. Vou informar o modelo e o problema.`,
  };
  document.querySelectorAll("[data-wa]").forEach((link) => {
    const text = messages[link.dataset.wa](link.dataset.item);
    const url = new URL(`https://wa.me/${config.whatsapp}`);
    url.searchParams.set("text", text);
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (link.dataset.item)
      link.setAttribute(
        "aria-label",
        `${link.textContent.trim()}: ${link.dataset.item}. Abre o WhatsApp em outra aba.`,
      );
  });
  const hours = document.querySelector("#business-hours");
  const days = document.querySelector("#business-days");
  if (hours) hours.textContent = config.hours;
  if (days)
    days.textContent =
      config.daysConfirmed && config.days
        ? config.days
        : "Dias de atendimento a confirmar com o dono.";

  const catalogTools = document.querySelector("#catalog-tools");
  const catalogGrid = document.querySelector("#catalog-grid");
  if (catalogTools && catalogGrid) {
    const search = document.querySelector("#catalog-search");
    const category = document.querySelector("#catalog-category");
    const sort = document.querySelector("#catalog-sort");
    const results = document.querySelector("#catalog-results");
    const empty = document.querySelector("#catalog-empty");
    const cards = [...catalogGrid.querySelectorAll("[data-catalog-card]")];
    catalogTools.hidden = false;

    const catalogMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const runningAnimations = new Set();
    const cancelCatalogAnimations = () => {
      [...runningAnimations].forEach((animation) => animation.cancel());
      runningAnimations.clear();
    };
    const animateCatalogElement = (element, frames, options = {}) => {
      const animation = element.animate(frames, {
        duration: 300,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "backwards",
        ...options,
      });
      runningAnimations.add(animation);
      const release = () => runningAnimations.delete(animation);
      animation.addEventListener("finish", release, { once: true });
      animation.addEventListener("cancel", release, { once: true });
    };
    catalogMotion.addEventListener("change", cancelCatalogAnimations);
    window.addEventListener("resize", cancelCatalogAnimations, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelCatalogAnimations();
    });

    function updateCatalog() {
      const term = search.value.trim().toLocaleLowerCase("pt-BR");
      const chosenCategory = category.value;
      const visible = cards.filter((card) => {
        const matchesTerm = card.textContent.toLocaleLowerCase("pt-BR").includes(term);
        const matchesCategory =
          chosenCategory === "all" || card.dataset.category === chosenCategory;
        return matchesTerm && matchesCategory;
      });
      if (sort.value === "price-low")
        visible.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
      if (sort.value === "price-high")
        visible.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));

      const previous = [...catalogGrid.children].filter((card) => !card.hidden);
      if (previous.length === visible.length && previous.every((card, index) => card === visible[index])) return;
      const animate = !catalogMotion.matches && typeof catalogGrid.animate === "function";
      // Capture visual positions before cancelling any interrupted transition.
      // All geometry is read once before and once after the DOM update.
      const before = animate
        ? new Map(previous.map((card) => [card, card.getBoundingClientRect()]))
        : new Map();
      cancelCatalogAnimations();
      visible.forEach((card) => catalogGrid.append(card));
      cards.forEach((card) => { card.hidden = !visible.includes(card); });
      results.textContent = visible.length === 1
        ? "1 produto demonstrativo"
        : `${visible.length} produtos demonstrativos`;
      empty.hidden = visible.length !== 0;
      window.ScrollTrigger?.refresh();
      if (!animate) return;

      const positions = visible.map((card) => ({
        card,
        rect: card.getBoundingClientRect(),
        base: getComputedStyle(card).transform,
      }));
      positions.forEach(({ card, rect, base }, index) => {
        const original = before.get(card);
        const transform = base === "none" ? "" : base;
        const x = original ? original.left - rect.left : 0;
        const y = original ? original.top - rect.top : 12;
        animateCatalogElement(card, [
          { transform: `translate(${x}px, ${y}px) ${transform}`.trim(), opacity: original ? .72 : 0 },
          { transform: transform || "none", opacity: 1 },
        ], { delay: original ? 0 : Math.min(index * 30, 90) });
      });
      animateCatalogElement(results, [
        { opacity: .4, transform: "translateY(3px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 180 });
      if (!empty.hidden) animateCatalogElement(empty, [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 220 });
    }

    search.addEventListener("input", updateCatalog);
    category.addEventListener("change", updateCatalog);
    sort.addEventListener("change", updateCatalog);
  }

  const navigationLinks = [...document.querySelectorAll(".header-nav a")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const localLinks = navigationLinks.filter((link) => link.pathname === location.pathname && link.hash);
  localLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!section) return;
      event.preventDefault();
      history.pushState(null, "", link.hash);
      section.focus({ preventScroll: true });
      section.scrollIntoView({ behavior: reduceMotion.matches ? "instant" : "smooth", block: "start" });
    });
  });
  if (localLinks.length && "IntersectionObserver" in window) {
    const sections = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        localLinks.forEach((link) => {
          if (link.getAttribute("aria-current") === "page") return;
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-20% 0px -65% 0px" });
    document.querySelectorAll("main section[id]").forEach((section) => sections.observe(section));
  }

  const marquee = document.querySelector(".services-marquee");
  if (marquee) {
    const group = marquee.querySelector(".marquee-list");
    const button = marquee.querySelector(".marquee-toggle");
    const clone = group.cloneNode(true);
    clone.dataset.marqueeClone = "";
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    group.parentElement.append(clone);
    marquee.classList.add("is-ready");
    let paused = false;
    const syncPreference = () => {
      marquee.classList.toggle("is-reduced", reduceMotion.matches);
      button.hidden = reduceMotion.matches;
    };
    button.addEventListener("click", () => {
      paused = !paused;
      marquee.classList.toggle("is-paused", paused);
      button.setAttribute("aria-pressed", String(paused));
      button.querySelector("span").textContent = paused ? "Retomar faixa" : "Pausar faixa";
    });
    reduceMotion.addEventListener("change", syncPreference);
    syncPreference();
    const setSpeed = () => marquee.style.setProperty("--marquee-duration", `${Math.max(40, group.scrollWidth / 44)}s`);
    document.fonts.ready.then(setSpeed);
    if ("ResizeObserver" in window) new ResizeObserver(setSpeed).observe(group);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => marquee.classList.toggle("is-offscreen", !entry.isIntersecting)).observe(marquee);
    }
    const syncVisibility = () => marquee.classList.toggle("is-document-hidden", document.hidden);
    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();
  }
})();
