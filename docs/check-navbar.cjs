const { chromium } = require('C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ colorScheme: 'light', reducedMotion: 'reduce' });
    const report = [];
    for (const width of [320, 390, 1024, 1366, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect();
        return {
          width: innerWidth,
          menuLeft: rect('.hamburger').left,
          buttonRight: innerWidth - rect('.header-actions .button').right,
          heroLeft: rect('.hero h1').left,
          heroParagraphLeft: rect('.hero-description').left,
          heroButtonsLeft: rect('.hero .actions').left,
          overflow: document.documentElement.scrollWidth > innerWidth,
          logoLoaded: document.querySelector('.brand img').naturalWidth > 0,
          brandBackground: getComputedStyle(document.querySelector('.brand')).backgroundColor,
        };
      });
      assert.equal(dimensions.overflow, false);
      assert.equal(dimensions.logoLoaded, true);
      if (width >= 768) {
        for (const field of ['menuLeft', 'buttonRight', 'heroLeft', 'heroParagraphLeft', 'heroButtonsLeft']) assert.equal(dimensions[field], 50, field);
      }
      report.push(dimensions);
      if ([390, 1920].includes(width)) await page.screenshot({ path: `preview/navbar-v2-${width}.png` });
    }
    await page.emulateMedia({ colorScheme: 'dark' });
    assert.equal(await page.locator('.brand').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    await page.screenshot({ path: 'preview/navbar-v2-dark.png' });
    fs.writeFileSync('preview/navbar-v2-checks.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
