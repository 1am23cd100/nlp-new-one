

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateText(text: string, targetLanguage: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it in project secrets.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text. Do not include any introductory sentences, quotes, or explanations. If the text is empty, return an empty string. \n\nText: ${text}`,
    });
    
    const translatedText = response.text;
    
    if (!translatedText) {
      throw new Error("The translation module returned an empty result.");
    }
    
    return translatedText.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function detectLanguage(text: string) {
  if (!process.env.GEMINI_API_KEY) {
    return "Unknown";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the language of the following text. Return ONLY the name of the language (e.g., 'English', 'French', 'Kannada'). If you cannot identify it, return 'Unknown'. \n\nText: ${text}`,
    });

    return response.text?.trim() || "Unknown";
  } catch (error) {
    console.error("Language detection failed:", error);
    return "Unknown";
  }
}
