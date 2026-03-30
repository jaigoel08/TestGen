import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const MODEL_LIST = [
  "gemini-flash-latest",       // Verified working for this key
  "gemini-1.5-flash-latest",   // Standard latest
  "gemini-1.5-pro-latest",    // Standard pro
  "gemini-2.0-flash",         // Next gen
];

/**
 * Helper function to sleep for a specified duration.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates content using Google Gemini with an automatic fallback mechanism.
 * If the primary model fails (503, 404, etc.), it tries the next one in the list.
 */
export async function generateWithFallback(
  parts: string | (string | Part)[],
  config: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODEL_LIST) {
    let attempts = 0;
    const maxAttempts = 2; // Retry once per model if rate limited

    while (attempts < maxAttempts) {
      try {
        console.log(`[Gemini] Attempting generation with model: ${modelName} (Attempt ${attempts + 1})`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: typeof parts === "string" ? [{ text: parts }] : (parts as any) }],
          generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxOutputTokens,
          },
        });

        const response = await result.response;
        const text = response.text();
        
        if (text) {
          console.log(`[Gemini] Success with model: ${modelName}`);
          return text;
        }
      } catch (err: any) {
        lastError = err;
        const isRateLimit = err.message?.includes("429") || err.status === 429;
        
        if (isRateLimit && attempts < maxAttempts - 1) {
          const delay = 2000 * Math.pow(2, attempts); // 2s, 4s...
          console.warn(`[Gemini] Rate limit hit for ${modelName}. Retrying in ${delay}ms...`);
          await sleep(delay);
          attempts++;
          continue;
        }

        console.warn(`[Gemini] Model ${modelName} failed: ${err.message}. Trying next model...`);
        break; // Move to next model
      }
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`);
}
