import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

// Initialize with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelList = await genAI.getGenerativeModelFactory().listModels();
    
    console.log("Available Models:");
    console.log("-----------------");
    
    // Sort and filter for models that support generating content
    const models = modelList.models || modelList; // Handle different SDK response structures
    
    for (const model of models) {
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`Name: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Version: ${model.version}`);
        console.log("-----------------");
      }
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
