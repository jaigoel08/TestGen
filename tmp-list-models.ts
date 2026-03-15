import dotenv from "dotenv";

dotenv.config();

type GeminiModel = {
  name: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
};

async function listModels(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_google_genai_api_key_here") {
    console.error("❌ GEMINI_API_KEY is not set in .env file.");
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();

    if (data?.error) {
      console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
      return;
    }

    if (!data?.models || data.models.length === 0) {
      console.log("⚠️ No models returned.");
      return;
    }

    const filteredModels: GeminiModel[] = data.models.filter((model: GeminiModel) => {
      const methods = model.supportedGenerationMethods ?? [];
      return (
        methods.includes("generateContent") &&
        (model.name.includes("1.5") || model.name.includes("latest"))
      );
    });

    console.log("\n✅ Filtered Gemini Models:\n");

    filteredModels.forEach((model) => {
      console.log(`Model: ${model.name}`);
      console.log(`Display Name: ${model.displayName ?? "N/A"}`);
      console.log(`Description: ${model.description ?? "N/A"}`);
      console.log(`Input Token Limit: ${model.inputTokenLimit ?? "N/A"}`);
      console.log(`Output Token Limit: ${model.outputTokenLimit ?? "N/A"}`);
      console.log(
        `Methods: ${(model.supportedGenerationMethods ?? []).join(", ")}`
      );
      console.log("--------------------------------------------------\n");
    });
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

listModels();