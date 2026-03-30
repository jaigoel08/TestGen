import { generateWithFallback } from '../gemini';

export async function generateTestCasesFromApk(
  apkMetadata: any, 
  feature: string, 
  frs: string
): Promise<string> {
  const prompt = `
You are a senior Mobile QA engineer. Your task is to generate comprehensive test cases for a specific feature of an Android application based on its APK metadata and the provided Functional Requirement Specification (FRS).

App Details:
- Package: ${apkMetadata.packageName}
- Feature Selected: ${feature}

Functional Requirement Specification (FRS):
${frs}

Generate comprehensive test cases that cover all scenarios for this specific feature.

Include:
- Positive cases (functional requirements)
- Negative cases (error handling, invalid inputs)
- Edge cases (boundary values, unusual conditions)
- Mobile-specific cases:
    - Connectivity (Offline, Low bandwidth)
    - Device Interrupts (Incoming calls, Notifications)
    - Hardware interaction (if relevant from permissions)
    - Screen orientation (Portrait/Landscape)

Return output EXACTLY in this format for each test case:

Test Case ID: [APP-FEATURE]-TC-X
Title:
Description:
Steps to Reproduce:
Expected Result:
Priority:
`;

  try {
    return await generateWithFallback(prompt, { temperature: 0.7 });
  } catch (error: any) {
    console.error('Error generating APK test cases with Gemini:', error);
    throw new Error(`APK test case generation failed: ${error.message}`);
  }
}
