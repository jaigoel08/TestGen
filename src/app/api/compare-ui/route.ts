import { NextRequest, NextResponse } from 'next/server';
import { compareImages, cropRegion } from '@/lib/compare/visual-diff';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageA = formData.get('imageA') as File;
    const imageB = formData.get('imageB') as File;

    if (!imageA || !imageB) {
      return NextResponse.json(
        { error: 'Both Figma and Build images are required' },
        { status: 400 }
      );
    }

    const bufferA = Buffer.from(await imageA.arrayBuffer());
    const bufferB = Buffer.from(await imageB.arrayBuffer());

    console.log('[Compare UI] Starting pixel-diff analysis...');
    const { diffImage, numDiffPixels, boundingBoxes } = await compareImages(
      bufferA,
      bufferB
    );

    if (numDiffPixels === 0) {
      return NextResponse.json({
        success: true,
        diffImage: null,
        numDiffPixels,
        explanation: 'The images are identical. No visual regressions detected.'
      });
    }

    // Crop the primary difference region for Gemini analysis
    console.log(`[Compare UI] Detected ${numDiffPixels} different pixels. Cropping changes...`);
    const crops: Buffer[] = [];
    // For now, we just crop the first major bounding box
    if (boundingBoxes.length > 0) {
      const cropA = await cropRegion(bufferA, boundingBoxes[0]);
      const cropB = await cropRegion(bufferB, boundingBoxes[0]);
      crops.push(cropA, cropB);
    }

    // 4. Send to Gemini for explanation
    console.log('[Compare UI] Orchestrating qualitative analysis via Gemini with fallback...');
    const { generateWithFallback } = await import('@/lib/gemini');

    const prompt = `
      You are a specialized UI/UX QA Engineer. Compare the following two image crops.
      Image A is the intended FIGMA design.
      Image B is the actual BUILD screenshot.
      
      Identify the specific differences (colors, alignment, font, sizing, missing elements).
      Provide a structured explanation of the discrepancies found in the changed region.
    `;

    // Convert buffers to generative parts for Gemini
    const parts = [
      { text: prompt },
      { inlineData: { data: bufferA.toString('base64'), mimeType: 'image/png' } },
      { inlineData: { data: bufferB.toString('base64'), mimeType: 'image/png' } }
    ];

    const explanation = await generateWithFallback(parts);

    console.log('[Compare UI] Successfully completed analysis.');

    return NextResponse.json({
      success: true,
      diffImage: diffImage.toString('base64'),
      numDiffPixels,
      explanation
    });

  } catch (error: any) {
    console.error('[Compare UI Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
