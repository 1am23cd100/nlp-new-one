
import { GoogleGenAI } from "@google/genai";

// AI Studio injects GEMINI_API_KEY into process.env at runtime.
// Vite maps this via 'define' in vite.config.ts.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateText(text: string, targetLanguage: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text. Do not include any introductory sentences, quotes, or explanations: \n\n${text}`,
  });
  
  if (!response.text) {
    throw new Error("Translation failed: The AI returned an empty response.");
  }
  
  return response.text.trim();
}

export async function detectLanguage(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Identify the language of the following text. Return ONLY the name of the language (e.g., 'English', 'French', 'Kannada'). If you cannot identify it, return 'Unknown': \n\n${text}`,
  });

  return response.text?.trim() || "Unknown";
}
