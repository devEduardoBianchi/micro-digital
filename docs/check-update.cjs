const { chromium } = require('C:/Users/peiti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    for (const width of [320, 390, 768, 1366, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.hero .eyebrow').textContent(), 'Bem-vindo à Micro Digital Informática');
      const home = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        heroLeft: document.querySelector('.hero h1').getBoundingClientRect().left,
        menuLeft: document.querySelector('.hamburger').getBoundingClientRect().left,
        image: document.querySelector('.product-photo img').currentSrc,
        imageHeight: document.querySelector('.product-photo img').getBoundingClientRect().height,
        gsap: !!window.gsap,
        scrollTrigger: !!window.ScrollTrigger,
      }));
      assert.equal(home.overflow, false);
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
      if (width === 1366) { assert.equal(home.menuLeft, 50); assert.ok(home.heroLeft > 50); assert.ok(home.imageHeight > 500); }
      await page.locator('.product-photo').scrollIntoViewIfNeeded();
      await page.locator('.product-photo img').evaluate(image => { image.loading = 'eager'; });
      await page.waitForFunction(() => { const image = document.querySelector('.product-photo img'); return image.complete && image.naturalWidth > 0; });
      assert.ok((await page.locator('.product-photo img').evaluate(image => image.currentSrc)).includes('products-tall-'));
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
      await page.locator('#menu-toggle').click();
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
      await page.locator('.branched-nav a[href="blog.html"]').click();
      await page.waitForURL('**/blog.html');
      assert.equal(await page.locator('h1').innerText(), 'Dicas para cuidar\nda sua tecnologia.');
      assert.equal(await page.locator('.article-card').count(), 4);
      assert.equal(await page.locator('[data-wa]').count(), 2);
      for (const link of await page.locator('[data-wa]').all())
        assert.ok(new URL(await link.getAttribute('href')).searchParams.get('text'));
      assert.equal(await page.locator('.branched-nav a[aria-current="page"]').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ([390, 1366].includes(width))
        await page.screenshot({ path: path.resolve(__dirname, `../preview/blog-update-${width}.png`), fullPage: true });
      await page.locator('.article-detail summary').first().click();
      assert.equal(await page.locator('.article-detail').first().getAttribute('open'), '');
      await page.locator('#menu-toggle').click();
      await page.locator('.branched-nav a[href="index.html#produtos"]').click();
      await page.waitForURL('**/index.html#produtos');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'produtos');
      await page.close();
    }
    const animated = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'no-preference' });
    animated.on('pageerror', error => errors.push(error.message));
    await animated.goto('http://127.0.0.1:4174/blog.html', { waitUntil: 'networkidle' });
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
    const detailsPage = await browser.newPage({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference' });
    detailsPage.on('pageerror', error => errors.push(error.message));
    await detailsPage.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
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
    for (const [selector, name] of [['#servicos', 'services-detail'], ['#lp-notebooks', 'notebooks-detail'], ['#quem-somos', 'about-diamond']]) {
      await detailsPage.locator(selector).scrollIntoViewIfNeeded();
      await detailsPage.waitForTimeout(800);
      await detailsPage.locator(selector).screenshot({ path: path.resolve(__dirname, `../preview/${name}.png`) });
    }
    await detailsPage.locator('.contact-logo').scrollIntoViewIfNeeded();
    await detailsPage.waitForTimeout(800);
    assert.equal(await detailsPage.locator('.contact-logo').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.ok((await detailsPage.locator('.contact-logo img').getAttribute('src')).endsWith('.png'));
    await detailsPage.locator('#contato').screenshot({ path: path.resolve(__dirname, '../preview/contact-transparent-logo.png') });
    await detailsPage.close();
    assert.deepEqual(errors, []);
    console.log('OK: mobile/desktop, blog, menu, image, GSAP, accordion, keyboard, reduced motion, no overflow/errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
