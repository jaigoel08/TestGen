import { GoogleGenerativeAI } from '@google/generative-ai';
import { UIContext } from '../vector/retrieveContext';

/**
 * Generates comprehensive test cases based on the provided UI context and feature name using Google Gemini.
 * 
 * @param context - The retrieved UI context from the vector database.
 * @param featureName - The name of the feature to generate test cases for.
 * @returns A string containing the generated test cases in a structured format.
 */
export async function generateTestCases(context: UIContext, featureName: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey || apiKey === 'your_google_genai_api_key_here') {
    return 'Error: GOOGLE_GENAI_API_KEY is not configured in the .env file. Please provide a valid API key to generate test cases.';
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
You are a senior QA engineer.

Based on this website functionality, generate comprehensive test cases for the feature: "${featureName}".

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
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = await result.response;
    return response.text() || 'Failed to generate test cases.';
  } catch (error: any) {
    console.error('Error generating test cases with Gemini:', error);
    throw new Error(`Test case generation failed: ${error.message}`);
  }
}
