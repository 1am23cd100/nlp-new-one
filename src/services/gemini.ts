

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateText(text: string, targetLanguage: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text. Do not include any introductory sentences, quotes, or explanations. If the text is empty, return an empty string. \n\nText: ${text}`,
  });
  
  if (!response.text) {
    throw new Error("Translation failed: The AI returned an empty response.");
  }
  
  return response.text.trim();
}

export async function detectLanguage(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Identify the language of the following text. Return ONLY the name of the language (e.g., 'English', 'French', 'Kannada'). If you cannot identify it, return 'Unknown'. \n\nText: ${text}`,
  });

  return response.text?.trim() || "Unknown";
}
