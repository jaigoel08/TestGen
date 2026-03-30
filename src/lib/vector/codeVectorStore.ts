import { generateBGEEmbedding } from '../embedding/bge-m3';

/**
 * In-memory vector store using cosine similarity.
 * Replaces ChromaDB to remove the external cloud DB dependency.
 */

interface Snippet {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
}

// Module-level in-memory store (cleared per server restart, scoped to one request in serverless)
let store: Snippet[] = [];

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function clearStore(): void {
  store = [];
}

export async function storeCodeSnippet(id: string, code: string, metadata: Record<string, any>): Promise<void> {
  const embedding = await generateBGEEmbedding(code);
  // Upsert: replace if same id exists
  const existing = store.findIndex(s => s.id === id);
  if (existing >= 0) {
    store[existing] = { id, content: code, metadata, embedding };
  } else {
    store.push({ id, content: code, metadata, embedding });
  }
}

export async function retrieveCodeSnippets(query: string, topK = 5): Promise<Array<{ id: string; content: string; metadata: Record<string, any> }>> {
  if (store.length === 0) return [];

  const queryEmbedding = await generateBGEEmbedding(query);

  const scored = store.map(snippet => ({
    ...snippet,
    score: cosineSimilarity(queryEmbedding, snippet.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ id, content, metadata }) => ({ id, content, metadata }));
}
