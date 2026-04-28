

export async function translateText(text: string, targetLanguage: string) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Translation request failed");
  }

  const data = await response.json();
  return data.translatedText;
}

export async function detectLanguage(text: string) {
  const response = await fetch("/api/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Language detection failed");
  }

  const data = await response.json();
  return data.language || "Unknown";
}
