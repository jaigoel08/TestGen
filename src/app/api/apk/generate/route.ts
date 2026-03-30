import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateTestCasesFromApk } from '@/lib/test-generator/apkTestGenerator';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { metadata, feature, frs } = await request.json();

    if (!metadata || !feature || !frs) {
      return NextResponse.json({ 
        error: 'Metadata, feature, and FRS are all required.' 
      }, { status: 400 });
    }

    // Generate test cases using LLM
    const testCases = await generateTestCasesFromApk(metadata, feature, frs);

    return NextResponse.json({ 
      success: true, 
      testCases 
    });
  } catch (error: any) {
    console.error('APK Generation Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate test cases.' 
    }, { status: 500 });
  }
}
