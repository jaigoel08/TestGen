import { generateWithFallback } from '../gemini';
import { UIContext } from '../vector/retrieveContext';

/**
 * Generates comprehensive test cases based on the provided UI context and feature name using Google Gemini.
 * 
 * @param context - The retrieved UI context from the vector database.
 * @param featureName - The name of the feature to generate test cases for.
 * @returns A string containing the generated test cases in a structured format.
 */
export async function generateTestCases(context: UIContext, featureName: string): Promise<string> {
  const prompt = `
You are a senior QA engineer.

FIRST, validate if the feature: "${featureName}" is actually present or relevant to the provided UI context for the page: "${context.url}".
Check the provided buttons, links, and input fields.

If the feature is NOT present on the page or is not relevant to the elements listed below, return EXACTLY:
"Error: The feature '${featureName}' was not found on this page. Please check the feature name and try again."

Otherwise, generate comprehensive test cases for the feature: "${featureName}".

Website Context:
- Page: ${context.page}
- URL: ${context.url}
- Login Type: ${context.loginType}
- Input Fields: ${context.inputs.join(', ')}
- Buttons: ${context.buttons.join(', ')}
- Links: ${context.links.join(', ')}

Include:
- Positive cases
- Negative cases
- Edge cases
- Security cases
- OAuth cases if present (e.g., Google OAuth, Social Login)

Return output EXACTLY in this format for each test case:

Test Case ID:
Title:
Steps:
Expected Result:
Priority:
`;

  try {
    return await generateWithFallback(prompt, { temperature: 0.7 });
  } catch (error: any) {
    console.error('Error generating test cases with Gemini:', error);
    throw new Error(`Test case generation failed: ${error.message}`);
  }
}
