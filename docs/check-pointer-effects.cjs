const { chromium } = require('C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const evidence = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['index.html', 'blog.html', 'lp-notebooks.html']) {
      await page.goto(`http://127.0.0.1:4174/${route}`, { waitUntil: 'networkidle' });
      const button = page.locator('.button').first();
      await button.hover();
      await page.waitForFunction(() => document.querySelector('.button.is-pointer-active > .pointer-light'));
      const shine = await button.locator(':scope > .pointer-light').evaluate(light => ({
        transform: light.style.transform,
        hidden: light.getAttribute('aria-hidden'),
        zIndex: getComputedStyle(light).zIndex,
      }));
      assert.match(shine.transform, /translate3d/);
      assert.equal(shine.hidden, 'true');
      assert.equal(shine.zIndex, '-1');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      evidence.push({ route, specularButton: true });
    }

    await page.goto('http://127.0.0.1:4174/index.html', { waitUntil: 'networkidle' });
    // Keep automated pointer coordinates stable during programmatic scrolling.
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    const card = page.locator('.catalog-card').first();
    await card.scrollIntoViewIfNeeded();
    // Let the existing GSAP entrance finish before recording the layout.
    await page.waitForFunction(() => {
      const style = getComputedStyle(document.querySelector('.catalog-card'));
      return Number(style.opacity) > 0.99 && style.visibility === 'visible';
    });
    await card.hover();
    const light = card.locator(':scope > .pointer-light');
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.55);
    await page.waitForFunction(() => !!document.querySelector('.catalog-card.is-pointer-active > .pointer-light')?.style.transform, null, { timeout: 5000 });
    const before = await light.getAttribute('style');
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7);
    await page.waitForFunction(previous => document.querySelector('.catalog-card > .pointer-light').getAttribute('style') !== previous, before);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('.catalog-showcase').screenshot({ path: path.resolve(__dirname, '../preview/catalog-pointer-effects-desktop.png'), style: '.site-header, .skip-link { visibility: hidden !important; }' });

    const cta = card.locator('.catalog-cta');
    await cta.focus();
    assert.equal(await cta.evaluate(link => link === document.activeElement), true);
    assert.equal(await card.evaluate(card => card.matches(':focus-within')), true);
    const whatsapp = new URL(await cta.getAttribute('href'));
    assert.equal(whatsapp.pathname, '/5567992537517');
    assert.ok(whatsapp.searchParams.get('text').includes('Nexa 14'));
    await page.locator('#catalog-category').selectOption('monitores');
    assert.equal(await page.locator('.catalog-card:visible').count(), 1);
    assert.match(await page.locator('.catalog-card:visible h4').innerText(), /Vision 24/);
    await page.locator('#catalog-category').selectOption('all');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelectorAll('.pointer-light').length === 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelectorAll('.pointer-light').length > 0);
    const surfaces = await page.locator('[data-pointer-effect]').count();
    assert.equal(await page.locator('.pointer-light').count(), surfaces);
    evidence.push({ pointerMovement: true, keyboardFocus: true, filtering: true, reducedMotionCleanup: true });

    for (const width of [320, 390, 768, 1920]) {
      const mobile = width < 768;
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: mobile, isMobile: mobile, reducedMotion: 'reduce' });
      const responsive = await context.newPage();
      responsive.on('pageerror', error => errors.push(error.message));
      await responsive.goto('http://127.0.0.1:4174/index.html', { waitUntil: 'networkidle' });
      assert.equal(await responsive.locator('.pointer-light').count(), 0);
      assert.equal(await responsive.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await responsive.locator('.catalog-cta').first().focus();
      assert.equal(await responsive.locator('.catalog-card').first().evaluate(card => card.matches(':focus-within')), true);
      if (width === 390) {
        await responsive.emulateMedia({ reducedMotion: 'no-preference' });
        assert.equal(await responsive.locator('.pointer-light').count(), 0);
        await responsive.emulateMedia({ reducedMotion: 'reduce' });
        await responsive.locator('.catalog-showcase').screenshot({ path: path.resolve(__dirname, '../preview/catalog-pointer-effects-mobile.png'), style: '.site-header, .skip-link { visibility: hidden !important; }' });
      }
      evidence.push({ width, noOverflow: true, keyboardFocus: true, layersDisabled: true });
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ ok: true, evidence, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
