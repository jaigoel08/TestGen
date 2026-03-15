import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey || apiKey === 'your_google_genai_api_key_here') {
    console.error("GOOGLE_GENAI_API_KEY is not set.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else if (data.models) {
      console.log("Filtered Models:");
      data.models.filter((m: any) => 
        m.supportedGenerationMethods.includes('generateContent') && 
        (m.name.includes('1.5') || m.name.includes('latest'))
      ).forEach((m: any) => {
        console.log(`- ${m.name}`);
      });
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

listModels();
