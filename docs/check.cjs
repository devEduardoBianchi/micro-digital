const {
  chromium,
} = require("C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    colorScheme: "light",
  });
  const failures = [];
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.resolve(__dirname, "../preview");
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({
    path: path.join(out, "desktop.png"),
    fullPage: true,
  });
  await page.locator("#menu-toggle").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "menu-desktop.png") });
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "menu-toggle",
  );
  const targets = await page
    .locator(".branched-nav a")
    .evaluateAll((ls) => ls.map((l) => l.hash));
  for (const hash of targets) {
    await page.locator("#menu-toggle").click();
    await page.locator(`.branched-nav a[href="${hash}"]`).click();
    await page.waitForTimeout(230);
    assert.equal(await page.evaluate(() => location.hash), hash);
    assert.equal(await page.locator("dialog").evaluate((d) => d.open), false);
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      hash.slice(1),
    );
  }
  await page.locator("#menu-toggle").click();
  await page.locator(".branched-nav a").first().focus();
  await page.keyboard.press("End");
  assert.equal(
    await page.evaluate(() => document.activeElement.hash),
    "#lp-notebooks",
  );
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(
        () => document.activeElement.closest("dialog") !== null,
      ),
      true,
    );
  }
  await page.keyboard.press("Escape");
  const whatsapp = await page
    .locator("[data-wa]")
    .evaluateAll((ls) =>
      ls.map((l) => ({
        href: l.href,
        item: l.dataset.item,
        type: l.dataset.wa,
        rel: l.rel,
        target: l.target,
      })),
    );
  assert.equal(whatsapp.filter((l) => l.type === "product").length, 12);
  for (const link of whatsapp) {
    const url = new URL(link.href);
    assert.equal(url.hostname, "wa.me");
    assert.equal(url.pathname, "/5567992537517");
    assert.ok(url.searchParams.get("text"));
    if (link.item) assert.ok(url.searchParams.get("text").includes(link.item));
    assert.equal(link.target, "_blank");
    assert.ok(link.rel.includes("noopener"));
  }
  // Intercept external destinations: validate opening without contacting WhatsApp.
  await page
    .context()
    .route("https://wa.me/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Destino de teste</title>",
      }),
    );
  await page
    .locator("details")
    .evaluateAll((ds) => ds.forEach((d) => (d.open = true)));
  const waLinks = page.locator("[data-wa]");
  for (let i = 0; i < (await waLinks.count()); i++) {
    const expected = await waLinks.nth(i).getAttribute("href");
    const popupPromise = page.waitForEvent("popup");
    await waLinks.nth(i).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(popup.url(), expected);
    await popup.close();
  }
  await page
    .locator("details")
    .evaluateAll((ds) => ds.forEach((d, i) => (d.open = i === 0)));
  const sizes = [];
  for (const width of [320, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      images: [...document.images].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    }));
    // Lazy images are verified after scrolling to each image.
    assert.ok(
      metrics.scroll <= width,
      `Overflow at ${width}: ${metrics.scroll}`,
    );
    for (const img of await page.locator("img").all()) {
      await img.evaluate((i) => {
        i.loading = "eager";
        i.scrollIntoView({ behavior: "instant" });
      });
      await page.waitForFunction(
        (i) => i.complete && i.naturalWidth > 0,
        await img.elementHandle(),
      );
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(out, `width-${width}.png`),
      fullPage: true,
    });
    sizes.push({ width, overflow: false });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4174/");
  await page.locator("#menu-toggle").click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, "menu-mobile.png") });
  await page.keyboard.press("Escape");
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4174/");
  await page.screenshot({
    path: path.join(out, "mobile-dark.png"),
    fullPage: true,
  });
  await page.locator("#menu-toggle").click();
  assert.equal(
    await page
      .locator(".branched-nav a")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.screenshot({
    path: path.join(out, "desktop-dark.png"),
    fullPage: true,
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4174/docs/apresentacao.html", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: path.join(out, "apresentacao.png"),
    fullPage: true,
  });
  assert.deepEqual(failures, []);
  const report = {
    menuTargets: targets,
    whatsappLinks: whatsapp.length,
    productCategories: 12,
    allWhatsAppPopupsIntercepted: true,
    keyboardEscapeFocus: true,
    focusContainment: true,
    reducedMotion: true,
    viewports: sizes,
    runtimeErrors: failures,
  };
  fs.writeFileSync(
    path.join(out, "checks.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
