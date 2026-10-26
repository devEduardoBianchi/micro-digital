const {
  chromium,
} = require("C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.screenshot({ path: "preview/hero-desktop.png" });
  await page.locator("#produtos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "preview/produtos-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.screenshot({ path: "preview/hero-mobile.png" });
  await page.emulateMedia({ colorScheme: "dark" });
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
  await page.screenshot({ path: "preview/mobile-dark.png", fullPage: true });
  await page.screenshot({ path: "preview/hero-mobile-dark.png" });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.screenshot({ path: "preview/hero-desktop-dark.png" });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
