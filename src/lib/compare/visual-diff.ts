import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';

export interface DiffResult {
  diffImage: Buffer;
  numDiffPixels: number;
  boundingBoxes: { x: number; y: number; width: number; height: number }[];
}

export async function compareImages(
  img1Buffer: Buffer,
  img2Buffer: Buffer
): Promise<DiffResult> {
  // Ensure images are the same size using sharp
  const metadata1 = await sharp(img1Buffer).metadata();
  const metadata2 = await sharp(img2Buffer).metadata();

  const width = Math.max(metadata1.width || 0, metadata2.width || 0);
  const height = Math.max(metadata1.height || 0, metadata2.height || 0);

  const img1Resized = await sharp(img1Buffer)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
  const img2Resized = await sharp(img2Buffer)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();

  const img1 = PNG.sync.read(img1Resized);
  const img2 = PNG.sync.read(img2Resized);
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  // Find bounding boxes of differences
  const boxes = findDifferenceBoxes(diff.data, width, height);

  return {
    diffImage: PNG.sync.write(diff),
    numDiffPixels,
    boundingBoxes: boxes,
  };
}

function findDifferenceBoxes(
  diffData: Buffer,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number }[] {
  // Implementation of a simple clustering algorithm to find bounding boxes
  // For now, we'll find the overall bounding box of all changes as a starting point
  // In a more complex version, we'd use a connected-component labeling algorithm.
  
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      // If pixel is red (difference color in pixelmatch)
      if (diffData[idx] === 255 && diffData[idx + 1] === 0 && diffData[idx + 2] === 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return [];

  return [{
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  }];
}

export async function cropRegion(
  imageBuffer: Buffer,
  box: { x: number; y: number; width: number; height: number }
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const imgWidth = metadata.width || 0;
  const imgHeight = metadata.height || 0;

  const left = Math.max(0, Math.min(box.x, imgWidth - 1));
  const top = Math.max(0, Math.min(box.y, imgHeight - 1));
  const width = Math.max(1, Math.min(box.width, imgWidth - left));
  const height = Math.max(1, Math.min(box.height, imgHeight - top));

  return await sharp(imageBuffer)
    .extract({
      left,
      top,
      width,
      height
    })
    .toBuffer();
}
