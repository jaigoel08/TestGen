import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generates a text embedding using Gemini's text-embedding-004 model.
 * Replaces the previous BGE-M3 local model to avoid large model downloads.
 */
export async function generateBGEEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'text-embedding-004' });
  // Truncate to avoid hitting token limits
  const truncated = text.slice(0, 8000);
  const result = await model.embedContent(truncated);
  return result.embedding.values;
}

export async function generateBatchBGEEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await generateBGEEmbedding(text));
  }
  return results;
}
