import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractApkMetadata } from '@/lib/apkUtils';
import fs from 'fs';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to tmp directory
    const tmpDir = join(process.cwd(), 'tmp', 'uploads');
    if (!fs.existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    const fileId = uuidv4();
    const filePath = join(tmpDir, `${fileId}.apk`);
    await writeFile(filePath, buffer);

    // Extract metadata
    const metadata = await extractApkMetadata(filePath);

    // Optional: Delete file after extraction if not needed for generation
    // For now, let's keep it if LLM needs more info, but metadata should be enough.
    // await unlink(filePath);

    return NextResponse.json({ 
      success: true, 
      fileId,
      metadata 
    });
  } catch (error: any) {
    console.error('APK Upload Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process APK upload.' 
    }, { status: 500 });
  }
}
