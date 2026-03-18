import { chromium } from 'playwright-core';
async function test() {
  console.log('Launching browser via playwright-core...');
  // Note: we might need to specify executablePath if not installed in default location
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('Browser launched!');
    await browser.close();
  } catch (err) {
    console.error('Launch failed, but import worked.');
    console.error(err);
  }
}
test().catch(console.error);
