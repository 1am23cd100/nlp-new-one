

import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    let apiKey = "";
    try {
      // Safe check for process.env
      apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    } catch {
      apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
    }

    if (!apiKey) {
      console.error("Gemini API key not found in any environment source.");
      throw new Error("GEMINI_API_KEY is missing. Please configuration your key in settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function translateText(text: string, targetLanguage: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text. Do not include any introductory sentences, quotes, or explanations. \n\nText: ${text}`,
  });
  
  if (!response.text) {
    throw new Error("The translation module returned an empty result.");
  }
  
  return response.text.trim();
}

export async function detectLanguage(text: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Identify the language of the following text. Return ONLY the name of the language (e.g., 'English'). If unknown, return 'Unknown'. \n\nText: ${text}`,
    });

    return response.text?.trim() || "Unknown";
  } catch (error) {
    console.error("Language detection failed:", error);
    return "Unknown";
  }
}
