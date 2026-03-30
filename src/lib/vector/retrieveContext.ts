import { ChromaClient, EmbeddingFunction } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UIContext {
  id: string;
  url: string;
  page: string;
  loginType: string;
  inputs: string[];
  buttons: string[];
  links: string[];
  /** Cosine similarity score, 0–1. Higher is more relevant. */
  score?: number;
  screenshotUrl?: string;
}

// ── Google Gemini embedding function for Chroma ─────────────────────────────

class GeminiEmbedder implements EmbeddingFunction {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-embedding-001') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  public async generate(texts: string[]): Promise<number[][]> {
    const embeddingModel = this.genAI.getGenerativeModel({ model: this.model });
    
    const results = await Promise.all(
      texts.map(async (text) => {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
      })
    );
    
    return results;
  }
}

// ── Singleton setup ───────────────────────────────────────────────────────────

const COLLECTION_NAME = process.env.CHROMA_COLLECTION_NAME ?? 'ui-contexts';

let _chromaClient: ChromaClient | null = null;
let _embedder: GeminiEmbedder | null = null;

function getClient(): ChromaClient {
  if (!_chromaClient) {
    const apiKey = process.env.CHROMA_API_KEY;
    const tenant = process.env.CHROMA_TENANT;
    const database = process.env.CHROMA_DATABASE;

    if (!apiKey || !tenant || !database) {
      throw new Error('Chroma Cloud credentials (API Key, Tenant, Database) are not configured in .env');
    }

    console.log(`[Chroma] Initializing client for ${tenant}/${database} at api.trychroma.com (Context Store)`);
    _chromaClient = new ChromaClient({
      host: "api.trychroma.com",
      port: 443,
      ssl: true,
      tenant,
      database,
      headers: {
        "x-chroma-token": apiKey
      }
    });
  }
  return _chromaClient;
}

function getEmbedder(): GeminiEmbedder {
  if (!_embedder) {
    const key = process.env.GEMINI_API_KEY ?? '';
    if (!key || key === 'your_google_genai_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    _embedder = new GeminiEmbedder(key);
  }
  return _embedder;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a rich text document from a UIContext to embed.
 */
function buildDocument(ctx: Omit<UIContext, 'score'>): string {
  return [
    `Page: ${ctx.page}`,
    `Login Type: ${ctx.loginType}`,
    `Inputs: ${ctx.inputs.join(', ')}`,
    `Buttons: ${ctx.buttons.join(', ')}`,
    `Links: ${ctx.links.join(', ')}`,
    `URL: ${ctx.url}`,
  ].join('\n');
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Store (or update) a UI context in the Chroma vector database.
 */
export async function storeContext(context: Omit<UIContext, 'score'>): Promise<void> {
  const client = getClient();
  const embedder = getEmbedder();

  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
    metadata: { 'hnsw:space': 'cosine' },
  });

  const document = buildDocument(context);

  await collection.upsert({
    ids: [context.id],
    documents: [document],
    metadatas: [
      {
        url: context.url,
        page: context.page,
        loginType: context.loginType,
        inputs: context.inputs.join('|'),
        buttons: context.buttons.join('|'),
        links: context.links.join('|'),
      },
    ],
  });
}

/**
 * Search the Chroma vector database for the top-K most relevant UI contexts.
 */
export async function retrieveContext(query: string, topK = 3): Promise<UIContext[]> {
  const client = getClient();
  const embedder = getEmbedder();

  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
    metadata: { 'hnsw:space': 'cosine' },
  });

  const count = await collection.count();
  if (count === 0) return [];

  const results = await collection.query({
    queryTexts: [query],
    nResults: Math.min(topK, count),
  });

  const ids = results.ids[0] ?? [];
  const metadatas = results.metadatas[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  return ids.map((id, i) => {
    const meta = (metadatas[i] ?? {}) as Record<string, string>;
    return {
      id,
      url: meta.url ?? '',
      page: meta.page ?? '',
      loginType: meta.loginType ?? '',
      inputs: meta.inputs ? meta.inputs.split('|') : [],
      buttons: meta.buttons ? meta.buttons.split('|') : [],
      links: meta.links ? meta.links.split('|') : [],
      score: (distances[i] != null)
        ? parseFloat((1 - (distances[i] as number)).toFixed(4))
        : undefined,
    };
  });
}
