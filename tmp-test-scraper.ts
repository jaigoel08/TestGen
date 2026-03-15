import { scrapeWebsite } from './src/lib/scraper/scrapeWebsite';
import { detectLoginFeature } from './src/lib/feature-detection/detectLoginFeature';

async function test() {
  const url = 'https://github.com/login';
  console.log(`Testing scraper and detection with: ${url}`);
  try {
    const scrapedData = await scrapeWebsite(url);
    const detectionResult = detectLoginFeature(scrapedData);

    console.log('Processed Result:', JSON.stringify({
      ...scrapedData,
      ...detectionResult
    }, null, 2));
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

test();
