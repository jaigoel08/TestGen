import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper/scrapeWebsite';
import { detectLoginFeature } from '@/lib/feature-detection/detectLoginFeature';
import { storeContext, retrieveContext } from '@/lib/vector/retrieveContext';
import { generateTestCases } from '@/lib/test-generator/generateTestCases';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { url, featureName } = await req.json();

    if (!url || !featureName) {
      return NextResponse.json(
        { error: 'Website URL and Feature Name are required.' },
        { status: 400 }
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
      // We continue even if storage fails, as we have the current context
    });

    // 4. Retrieve relevant context
    // We retrieve based on the featureName to find semantically similar past contexts
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

    return NextResponse.json({
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
    return NextResponse.json(
      { success: false, error: error.message || 'An internal error occurred during the workflow.' },
      { status: 500 }
    );
  }
}
