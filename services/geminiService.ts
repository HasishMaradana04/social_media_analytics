import { GoogleGenAI, Type } from "@google/genai";

// Safely retrieve environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        // @ts-ignore
        return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }
  } catch (e) {}
  return '';
};

const apiKey = getEnv('API_KEY') || ''; 

// In a real app, we would handle missing API keys more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey });

export const analyzeSentiment = async (text: string): Promise<string> => {
  try {
    if (!apiKey) return "No API Key";
    
    // Fast AI responses using Flash Lite
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `Analyze the sentiment of the following social media comment or post. 
      Return ONLY one word: "Positive", "Negative", or "Neutral".
      
      Text: "${text}"`,
    });
    return response.text?.trim() || "Neutral";
  } catch (error) {
    console.error("Gemini Sentiment Error:", error);
    return "Error";
  }
};

export const generateContentStrategy = async (topic: string, platform: string): Promise<string> => {
  try {
    if (!apiKey) throw new Error("API Key missing. Cannot generate strategy.");
    
    // Use Thinking model for complex strategy generation
    // STRICT: gemini-3-pro-preview with thinkingBudget 32768
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a social media expert. Generate a brief bullet-point content strategy (3 ideas) for the topic "${topic}" specifically for ${platform}. Keep it concise.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text || "No strategy generated.";
  } catch (error: any) {
    console.error("Gemini Strategy Error:", error);
    throw new Error("Failed to generate strategy: " + (error.message || "Unknown error"));
  }
};

export const predictViralScore = async (description: string): Promise<{ score: number; reasoning: string }> => {
  try {
    if (!apiKey) throw new Error("API Key missing");
    
    // Use Thinking model for analytical prediction
    // STRICT: gemini-3-pro-preview with thinkingBudget 32768
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Predict the viral potential of this post description on a scale of 0 to 100.
      
      Description: "${description}"
      
      Return JSON format: { "score": number, "reasoning": "short explanation" }`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["score", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Prediction Error:", error);
    throw new Error("Failed to predict viral score: " + (error.message || "Unknown error"));
  }
};