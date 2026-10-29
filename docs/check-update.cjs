const { chromium } = require('C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const profile = path.join(root, 'preview', '.validation-profile');
const previewURL = (route = 'index.html') => {
  if (process.env.MICRO_PREVIEW_URL) return new URL(route, process.env.MICRO_PREVIEW_URL).href;
  const [file, hash] = route.split('#');
  const destination = pathToFileURL(path.join(root, file || 'index.html'));
  if (hash) destination.hash = hash;
  return destination.href;
};

(async () => {
  const context = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: true });
  const browser = {
    newPage: async (options = {}) => {
      const page = await context.newPage();
      if (options.viewport) await page.setViewportSize(options.viewport);
      await page.emulateMedia({ reducedMotion: options.reducedMotion || 'reduce', colorScheme: options.colorScheme || 'dark' });
      return page;
    },
    close: () => context.close(),
  };
  const errors = [];
  try {
    for (const width of [320, 390, 768, 1366, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto(previewURL('index.html'), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.hero .eyebrow').textContent(), 'Bem-vindo à Micro Digital Informática');
      const home = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        heroLeft: document.querySelector('.hero h1').getBoundingClientRect().left,
        logoLeft: document.querySelector('.brand').getBoundingClientRect().left,
        gsap: !!window.gsap,
        scrollTrigger: !!window.ScrollTrigger,
      }));
      assert.equal(home.overflow, false);
      assert.equal(await page.locator('.header-nav a').count(), 7);
      assert.equal(await page.locator('dialog, #menu-toggle').count(), 0);
      assert.equal(await page.locator('.service-feature').count(), 3);
      assert.equal(await page.locator('.marquee-list:not([data-marquee-clone]) li').count(), 21);
      assert.equal(await page.locator('[data-marquee-clone]').isVisible(), false);
      assert.ok(await page.locator('.header-nav a').evaluateAll(links => links.every(link => {
        const rect = link.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth;
      })));
      assert.equal(await page.locator('.product-photo').count(), 0);
      assert.equal(await page.locator('.catalog-item-media img').count(), 4);
      assert.equal(home.gsap && home.scrollTrigger, true);
      assert.equal(await page.evaluate(() => ScrollTrigger.getAll().length), 0);
      for (const link of await page.locator('[data-wa]').all()) {
        const url = new URL(await link.getAttribute('href'));
        assert.equal(url.hostname, 'wa.me');
        assert.equal(url.pathname, '/5567992537517');
        assert.ok(url.searchParams.get('text'));
        const item = await link.getAttribute('data-item');
        if (item) assert.ok(url.searchParams.get('text').includes(item));
      }
      await page.locator('#catalog-grid').scrollIntoViewIfNeeded();
      await page.locator('.catalog-item-media img').evaluateAll(images => { images.forEach(image => { image.loading = 'eager'; }); });
      await page.waitForFunction(() => [...document.querySelectorAll('.catalog-item-media img')].every(image => image.complete && image.naturalWidth === 640));
      if (width === 1366) { assert.equal(home.logoLeft, 50); assert.ok(home.heroLeft >= 50); }
      await page.evaluate(() => scrollTo(0, 0));
      if ([390, 1366].includes(width))
        await page.screenshot({ path: path.resolve(__dirname, `../preview/home-update-${width}.png`), fullPage: true });
      if (width === 390) {
        const reducedGroup = page.locator('#servicos .service-groups details').nth(1);
        await reducedGroup.locator('summary').click();
        assert.equal(await reducedGroup.getAttribute('open'), '');
        await reducedGroup.locator('summary').click();
        assert.equal(await reducedGroup.getAttribute('open'), null);
      }
      await page.locator('.header-nav a[href="blog.html"]').click();
      await page.waitForURL('**/blog.html');
      assert.equal(await page.locator('h1').innerText(), 'Dicas para cuidar\nda sua tecnologia.');
      assert.equal(await page.locator('.article-card').count(), 4);
      assert.equal(await page.locator('[data-wa]').count(), 2);
      for (const link of await page.locator('[data-wa]').all())
        assert.ok(new URL(await link.getAttribute('href')).searchParams.get('text'));
      const currentNavItem = page.locator('.header-nav a[aria-current]');
      assert.equal(await currentNavItem.count(), 1);
      assert.ok(['page', 'location'].includes(await currentNavItem.getAttribute('aria-current')));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ([390, 1366].includes(width))
        await page.screenshot({ path: path.resolve(__dirname, `../preview/blog-update-${width}.png`), fullPage: true });
      await page.locator('.article-detail summary').first().click();
      assert.equal(await page.locator('.article-detail').first().getAttribute('open'), '');
      await page.locator('.header-nav a[href="index.html#produtos"]').click();
      await page.waitForURL('**/index.html#produtos');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'produtos');
      await page.locator('.header-nav a[href="lp-notebooks.html"]').click();
      await page.waitForURL('**/lp-notebooks.html');
      assert.equal(await page.locator('#repair-page-title').innerText(), 'Mais vida para\no seu notebook.');
      assert.equal(await page.locator('.repair-page-card').count(), 4);
      const currentRepairNavItem = page.locator('.header-nav a[aria-current]');
      assert.equal(await currentRepairNavItem.count(), 1);
      assert.ok(['page', 'location'].includes(await currentRepairNavItem.getAttribute('aria-current')));
      const repairItems = [];
      for (const link of await page.locator('.repair-page-card [data-wa="repair"]').all()) {
        const url = new URL(await link.getAttribute('href'));
        assert.equal(url.pathname, '/5567992537517');
        const item = await link.getAttribute('data-item');
        assert.ok(url.searchParams.get('text').includes(item));
        repairItems.push(item);
      }
      assert.deepEqual(repairItems, [
        'reparo de placa-mãe e BGA',
        'troca de tela, conserto de dobradiças e carcaça',
        'limpeza, formatação e recuperação de dados',
        'substituição de HD por SSD',
      ]);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const image of await page.locator('.repair-page-card img').all()) {
        await image.evaluate(el => { el.loading = 'eager'; });
        await image.evaluate(el => el.decode());
      }
      if ([390, 1366].includes(width))
        await page.screenshot({ path: path.resolve(__dirname, `../preview/notebooks-update-${width}.png`), fullPage: true });
      await page.close();
    }
    const animated = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'no-preference' });
    animated.on('pageerror', error => errors.push(error.message));
    await animated.goto(previewURL('blog.html'), { waitUntil: 'networkidle' });
    assert.ok(await animated.evaluate(() => ScrollTrigger.getAll().length > 0));
    await animated.locator('.article-card').first().scrollIntoViewIfNeeded();
    await animated.waitForTimeout(900);
    assert.equal(await animated.locator('.article-card').first().evaluate(el => getComputedStyle(el).opacity), '1');
    const articleDetail = animated.locator('.article-detail').first();
    const articleClosed = await articleDetail.evaluate(el => el.getBoundingClientRect().height);
    await articleDetail.locator('summary').click();
    await animated.waitForTimeout(120);
    const articleMid = await articleDetail.evaluate(el => el.getBoundingClientRect().height);
    await animated.waitForTimeout(430);
    const articleOpen = await articleDetail.evaluate(el => el.getBoundingClientRect().height);
    assert.ok(articleMid > articleClosed && articleMid < articleOpen, 'blog summary opens progressively');
    await articleDetail.locator('summary').click();
    await animated.waitForTimeout(390);
    assert.equal(await articleDetail.getAttribute('open'), null);
    await animated.close();
    const notebookAnimated = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'no-preference' });
    notebookAnimated.on('pageerror', error => errors.push(error.message));
    await notebookAnimated.goto(previewURL('lp-notebooks.html'), { waitUntil: 'networkidle' });
    assert.ok(await notebookAnimated.evaluate(() => ScrollTrigger.getAll().length > 0));
    await notebookAnimated.locator('.repair-page-card').first().scrollIntoViewIfNeeded();
    await notebookAnimated.waitForTimeout(900);
    assert.equal(await notebookAnimated.locator('.repair-page-card').first().evaluate(el => getComputedStyle(el).opacity), '1');
    await notebookAnimated.close();
    const detailsPage = await browser.newPage({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference' });
    detailsPage.on('pageerror', error => errors.push(error.message));
    await detailsPage.goto(previewURL('index.html'), { waitUntil: 'networkidle' });
    const group = detailsPage.locator('#servicos .service-groups details').nth(1);
    await group.scrollIntoViewIfNeeded();
    await detailsPage.waitForTimeout(750);
    const closedHeight = await group.evaluate(el => el.getBoundingClientRect().height);
    await group.locator('summary').click();
    await detailsPage.waitForTimeout(120);
    const midHeight = await group.evaluate(el => el.getBoundingClientRect().height);
    await detailsPage.waitForTimeout(450);
    const openHeight = await group.evaluate(el => el.getBoundingClientRect().height);
    assert.ok(midHeight > closedHeight && midHeight < openHeight, 'accordion opens progressively');
    assert.equal(await group.getAttribute('open'), '');
    await group.locator('summary').click();
    await detailsPage.waitForTimeout(400);
    assert.equal(await group.getAttribute('open'), null);
    await group.locator('summary').focus();
    await detailsPage.keyboard.press('Space');
    await detailsPage.waitForTimeout(450);
    assert.equal(await group.getAttribute('open'), '');
    assert.ok(await group.evaluate(el => el.getBoundingClientRect().height >= el.querySelector('summary').offsetHeight + el.querySelector('.detail-content').offsetHeight), 'keyboard expansion contains panel');
    await detailsPage.evaluate(() => scrollTo(0, 0));
    await detailsPage.screenshot({ path: path.resolve(__dirname, '../preview/hero-dark-gradient.png') });
    for (const [selector, name] of [['#servicos', 'services-detail'], ['#quem-somos', 'about-diamond']]) {
      await detailsPage.locator(selector).scrollIntoViewIfNeeded();
      await detailsPage.waitForTimeout(800);
      await detailsPage.locator(selector).screenshot({ path: path.resolve(__dirname, `../preview/${name}.png`) });
    }
    await detailsPage.goto(previewURL('lp-notebooks.html'), { waitUntil: 'networkidle' });
    await detailsPage.locator('.repair-page-grid').screenshot({ path: path.resolve(__dirname, '../preview/notebooks-detail.png') });
    await detailsPage.goto(previewURL('index.html#contato'), { waitUntil: 'networkidle' });
    await detailsPage.locator('.contact-logo').scrollIntoViewIfNeeded();
    await detailsPage.waitForTimeout(800);
    assert.equal(await detailsPage.locator('.contact-logo').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.ok((await detailsPage.locator('.contact-logo img').getAttribute('src')).endsWith('.png'));
    await detailsPage.locator('#contato').screenshot({ path: path.resolve(__dirname, '../preview/contact-transparent-logo.png') });
    await detailsPage.setViewportSize({ width: 1920, height: 1440 });
    await detailsPage.goto(previewURL(), { waitUntil: 'load' });
    assert.ok(await detailsPage.locator('.hero h1 .reveal-word').count() > 0);
    await detailsPage.waitForFunction(() => [...document.querySelectorAll('.hero .reveal-word')].every(word => getComputedStyle(word).filter === 'none'));
    await detailsPage.locator('.services-marquee').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await detailsPage.waitForFunction(() => !document.querySelector('.services-marquee').classList.contains('is-offscreen'));
    const track = detailsPage.locator('.marquee-track');
    const initialPosition = await track.evaluate(el => getComputedStyle(el).transform);
    await detailsPage.waitForTimeout(120);
    assert.notEqual(await track.evaluate(el => getComputedStyle(el).transform), initialPosition);
    await detailsPage.locator('.marquee-toggle').focus();
    await detailsPage.keyboard.press('Enter');
    assert.equal(await track.evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    const pausedPosition = await track.evaluate(el => getComputedStyle(el).transform);
    await detailsPage.waitForTimeout(120);
    assert.equal(await track.evaluate(el => getComputedStyle(el).transform), pausedPosition);
    await detailsPage.keyboard.press('Enter');
    assert.equal(await track.evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    await detailsPage.emulateMedia({ reducedMotion: 'reduce' });
    await detailsPage.waitForFunction(() => document.querySelector('.services-marquee').classList.contains('is-reduced'));
    assert.equal(await detailsPage.locator('.reveal-word').count(), 0);
    assert.equal(await detailsPage.locator('[data-marquee-clone]').isVisible(), false);
    await detailsPage.emulateMedia({ reducedMotion: 'no-preference' });
    await detailsPage.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    assert.ok(await detailsPage.locator('.site-footer').evaluate(el => [...el.children].every(child => getComputedStyle(child).visibility !== 'hidden' && getComputedStyle(child).opacity !== '0')));
    await detailsPage.close();
    assert.deepEqual(errors, []);
    console.log('OK: mobile/desktop, blog, notebook repairs, visible navigation, marquee, blur reveal, images, WhatsApp, GSAP, accordion, keyboard, reduced motion, no overflow/errors.');
  } finally {
    await browser.close();
    if (profile.startsWith(root + path.sep)) fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  }
})().catch(error => { console.error(error); process.exit(1); });
