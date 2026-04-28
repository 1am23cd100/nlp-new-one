import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add it to your project secrets." 
        });
      }

      const genAI = new GoogleGenAI({ apiKey });
      const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text. Do not include any introductory sentences, quotes, or explanations. If the text is empty, return an empty string.\n\nText: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();

      res.json({ translatedText: translatedText.trim() });
    } catch (error: any) {
      console.error("Translation Error:", error);
      res.status(500).json({ error: error.message || "Internal server error during translation" });
    }
  });

  app.post("/api/detect", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add it to your project secrets." 
        });
      }

      const genAI = new GoogleGenAI({ apiKey });
      const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Identify the language of the following text. Return ONLY the name of the language (e.g., 'English', 'French', 'Kannada'). If you cannot identify it, return 'Unknown'.\n\nText: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const lang = response.text();

      res.json({ language: lang.trim() || "Unknown" });
    } catch (error: any) {
      console.error("Detection Error:", error);
      res.status(500).json({ error: error.message || "Internal server error during detection" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
