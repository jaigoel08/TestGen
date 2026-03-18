import { Router } from 'express';
import { scrapeWebsite } from '../lib/scraper/scrapeWebsite.js';
import { detectLoginFeature } from '../lib/feature-detection/detectLoginFeature.js';
import { storeContext, retrieveContext } from '../lib/vector/retrieveContext.js';
import { generateTestCases } from '../lib/test-generator/generateTestCases.js';
import * as uuid from 'uuid';
const uuidv4 = uuid.v4;

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { url, featureName } = req.body;

    if (!url || !featureName) {
      return res.status(400).json(
        { error: 'Website URL and Feature Name are required.' }
      );
    }

    console.log(`[Workflow] Starting generation for: ${url} (Feature: ${featureName})`);

    // 1. Scrape the website
    console.log('[Workflow] 1/5 Scrapping website...');
    const scrapedData = await scrapeWebsite(url).catch(err => {
      throw new Error(`Scraping failed: ${err.message}`);
    });

    // 2. Detect feature type
    console.log('[Workflow] 2/5 Detecting feature type...');
    const detectionResult = detectLoginFeature(scrapedData);

    // 3. Store context in Chroma
    console.log('[Workflow] 3/5 Storing context in vector database...');
    const contextId = `${Buffer.from(url).toString('base64').substring(0, 16)}-${uuidv4().substring(0, 8)}`;
    const fullContext = {
      id: contextId,
      url,
      ...scrapedData,
      ...detectionResult
    };
    
    await storeContext(fullContext).catch(err => {
      console.error('[Workflow] Non-blocking error storing context:', err);
    });

    // 4. Retrieve relevant context
    console.log('[Workflow] 4/5 Retrieving relevant context...');
    const retrievedContexts = await retrieveContext(featureName, 3).catch(err => {
      console.error('[Workflow] Non-blocking error retrieving context:', err);
      return [];
    });

    // Use the current context if retrieval is empty or not relevant enough
    const contextToUse = retrievedContexts.length > 0 ? retrievedContexts[0] : fullContext;

    // 5. Generate structured test cases
    console.log('[Workflow] 5/5 Generating test cases via AI...');
    const testCases = await generateTestCases(contextToUse, featureName);

    console.log('[Workflow] Successfully completed workflow.');

    res.json({
      success: true,
      url,
      featureName,
      loginType: detectionResult.loginType,
      testCases,
      screenshotUrl: scrapedData.screenshotUrl,
      metadata: {
        contextId,
        retrievedCount: retrievedContexts.length
      }
    });

  } catch (error: any) {
    console.error('[Workflow Error]:', error);
    res.status(500).json(
      { success: false, error: error.message || 'An internal error occurred during the workflow.' }
    );
  }
});

export default router;
