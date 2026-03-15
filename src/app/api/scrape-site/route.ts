import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper/scrapeWebsite';
import { detectLoginFeature } from '@/lib/feature-detection/detectLoginFeature';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scrapedData = await scrapeWebsite(url);
    const detectionResult = detectLoginFeature(scrapedData);
    
    return NextResponse.json({
      ...scrapedData,
      ...detectionResult
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
}
