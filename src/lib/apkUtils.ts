import ApkReader from 'node-apk-parser';
import fs from 'fs';

export interface ApkMetadata {
  packageName: string;
  versionName: string;
  versionCode: number;
  features: string[];
}

/**
 * Extracts metadata and features from an APK file.
 */
export async function extractApkMetadata(filePath: string): Promise<ApkMetadata> {
  if (!fs.existsSync(filePath)) {
    throw new Error('APK file not found.');
  }

  try {
    const reader = ApkReader.readFile(filePath);
    const manifest = reader.readManifestSync();

    // Extract basic info
    const packageName = manifest.package;
    const versionName = manifest.versionName;
    const versionCode = manifest.versionCode;

    // Features can be derived from activities, services, receivers, and permissions
    const features: string[] = [];

    if (manifest.application) {
      // Activities (likely main user-facing features)
      if (manifest.application.activities) {
        manifest.application.activities.forEach((activity: any) => {
          const name = activity.name.split('.').pop();
          if (name) features.push(`Activity: ${name}`);
        });
      }

      // Services
      if (manifest.application.services) {
        manifest.application.services.forEach((service: any) => {
          const name = service.name.split('.').pop();
          if (name) features.push(`Service: ${name}`);
        });
      }
    }

    // Permissions (indicate capabilities)
    if (manifest.usesPermissions) {
      manifest.usesPermissions.forEach((permission: any) => {
        const name = permission.name.split('.').pop();
        if (name) features.push(`Permission: ${name}`);
      });
    }

    // Deduplicate and filter out common/boring stuff if needed
    const uniqueFeatures = Array.from(new Set(features)).filter(f => !f.includes('ComponentFactory'));

    return {
      packageName,
      versionName,
      versionCode,
      features: uniqueFeatures,
    };
  } catch (error: any) {
    console.error('Error parsing APK:', error);
    throw new Error(`Failed to parse APK: ${error.message}`);
  }
}
