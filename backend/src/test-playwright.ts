import playwright from 'playwright';
const { chromium } = playwright;
async function test() {
  console.log('Launching browser...');
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('Browser launched!');
    await browser.close();
  } catch (err) {
    console.error('Launch failed, but import worked.');
  }
}
test().catch(console.error);
