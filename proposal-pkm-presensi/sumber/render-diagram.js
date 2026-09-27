// Merender setiap <svg id="..."> di diagram.html menjadi PNG di folder gambar/.
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 3 });
  await page.goto('file://' + path.join(__dirname, 'diagram.html'));
  for (const id of ['tahap', 'arsitektur', 'berlapis', 'validasi']) {
    await page.locator('#' + id).screenshot({ path: path.join(__dirname, 'gambar', id + '.png') });
  }
  await browser.close();
})();
