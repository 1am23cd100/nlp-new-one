import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured. Please add the API key to use translation features.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function translateText(text: string, targetLanguage: string) {
  const ai = getAI();
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a professional translator. Your task is to translate the provided text into the target language. You must provide ONLY the translated text. Do not include quotes, preamble, notes, or any other text.",
  });

  const prompt = `Target Language: ${targetLanguage}\n\nText to translate:\n${text}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const translatedText = response.text();

  if (!translatedText) {
    throw new Error("Translation failed: The AI returned an empty response.");
  }
  
  return translatedText.trim();
}

export async function detectLanguage(text: string) {
  const ai = getAI();
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Identify the language of the provided text. Return ONLY the name of the language. If unknown, return 'Unknown'. No other text permitted.",
  });

  const result = await model.generateContent(text);
  const response = await result.response;
  const lang = response.text();

  return lang ? lang.trim() : "Unknown";
}
