import { Router } from 'express';
import { scrapeWebsite } from '../lib/scraper/scrapeWebsite.js';
import { detectLoginFeature } from '../lib/feature-detection/detectLoginFeature.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scrapedData = await scrapeWebsite(url);
    const detectionResult = detectLoginFeature(scrapedData);
    
    res.json({
      ...scrapedData,
      ...detectionResult
    });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json(
      { error: error.message || 'An error occurred while processing the request' }
    );
  }
});

export default router;
