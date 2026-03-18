import playwright from 'playwright';
const { chromium } = playwright;
import fs from 'fs';
import path from 'path';

export interface ScrapedData {
  page: string;
  inputs: string[];
  buttons: string[];
  links: string[];
  screenshotUrl?: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const data: ScrapedData = {
      page: "login", // Defaulting to login as per request focus
      inputs: [],
      buttons: [],
      links: []
    };

    // Extract Inputs
    const inputs = await page.$$eval('input, textarea, [role="textbox"]', (elements) => {
      return elements.map(el => {
        const placeholder = el.getAttribute('placeholder') || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        const name = el.getAttribute('name') || '';
        const id = el.getAttribute('id') || '';
        
        // Return a descriptive string for identification
        return [placeholder, ariaLabel, name, id].find(s => s?.trim().length > 0) || 'unknown input';
      });
    });
    data.inputs = inputs.filter(val => val !== 'unknown input').slice(0, 10);

    // Extract Buttons
    const buttons = await page.$$eval('button, input[type="submit"], input[type="button"], [role="button"]', (elements) => {
      return elements.map(el => {
        const text = el.textContent?.trim() || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        const value = el.getAttribute('value') || '';
        
        return [text, ariaLabel, value].find(s => s?.trim().length > 0) || 'unknown button';
      });
    });
    data.buttons = buttons.filter(val => val !== 'unknown button').slice(0, 10);

    // Extract Links (specifically login/forgot password related)
    const links = await page.$$eval('a', (elements) => {
      const authKeywords = ['login', 'sign in', 'forgot', 'account', 'password', 'register', 'sign up'];
      return elements
        .map(el => {
           const text = el.textContent?.trim().toLowerCase() || '';
           const href = el.getAttribute('href') || '';
           if (authKeywords.some(keyword => text.includes(keyword) || href.includes(keyword))) {
             return el.textContent?.trim() || '';
           }
           return '';
        })
        .filter(text => text.length > 0);
    });
    data.links = [...new Set(links)].slice(0, 10);

    // Capture Screenshot
    // Note: In the separated backend, we might want to store screenshots differently
    // For now, let's keep the logic similar but ensure the directory exists relative to backend root or a shared public folder.
    // However, the frontend is Next.js and expects screenshots in its public folder.
    // We might need to rethink this. For now, let's use a 'public/screenshots' in the backend root.
    const screenshotDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotName = `${Buffer.from(url).toString('base64').substring(0, 16)}-${Date.now()}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);
    
    await page.screenshot({ path: screenshotPath });
    // This URL will be relative to the backend server
    data.screenshotUrl = `/screenshots/${screenshotName}`;

    return data;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
