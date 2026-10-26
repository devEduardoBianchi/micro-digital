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

  const toggle = document.querySelector("#menu-toggle");
  const dialog = document.querySelector("#navigation-dialog");
  const close = document.querySelector("#menu-close");
  const nav = dialog.querySelector("nav");
  const links = [...nav.querySelectorAll("a")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let selectionTimer;
  let destination = null;
  let savedOverflow = "";
  if (typeof dialog.showModal !== "function") return;
  toggle.hidden = false;

  function highlight(index) {
    nav.style.setProperty("--selected-progress", (index + 0.5) / links.length);
    links.forEach((link, current) =>
      link.classList.toggle("branch-active", current === index),
    );
  }
  function finish() {
    clearTimeout(selectionTimer);
    dialog.close();
  }
  toggle.addEventListener("click", () => {
    destination = null;
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Menu aberto");
    dialog.showModal();
    const active = Math.max(0, links.findIndex((link) =>
      link.pathname === location.pathname &&
      (link.hash ? link.hash === location.hash : !location.hash),
    ));
    highlight(active);
    links[active].focus();
  });
  close.addEventListener("click", () => {
    destination = null;
    finish();
  });
  dialog.addEventListener("cancel", () => {
    destination = null;
    clearTimeout(selectionTimer);
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const first = close;
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = savedOverflow;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    if (destination) {
      const section = document.querySelector(destination);
      if (!section) return;
      history.pushState(null, "", destination);
      section.focus({ preventScroll: true });
      section.scrollIntoView({
        behavior: reduceMotion.matches ? "instant" : "smooth",
        block: "start",
      });
      destination = null;
    } else toggle.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      destination = null;
      finish();
    }
  });
  links.forEach((link, index) => {
    link.style.setProperty("--branch-index", index);
    link.addEventListener("pointerenter", () => highlight(index));
    link.addEventListener("focus", () => highlight(index));
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      if (link.pathname !== location.pathname || !link.hash) {
        dialog.close();
        return;
      }
      event.preventDefault();
      clearTimeout(selectionTimer);
      destination = link.hash;
      highlight(index);
      selectionTimer = setTimeout(finish, reduceMotion.matches ? 0 : 170);
    });
    link.addEventListener("keydown", (event) => {
      const keys = {
        ArrowDown: (index + 1) % links.length,
        ArrowUp: (index - 1 + links.length) % links.length,
        Home: 0,
        End: links.length - 1,
      };
      if (event.key in keys) {
        event.preventDefault();
        links[keys[event.key]].focus();
      }
    });
  });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => {
          if (link.pathname === location.pathname && link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else if (link.hash) link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-15% 0px -65% 0px" },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => observer.observe(section));
})();
