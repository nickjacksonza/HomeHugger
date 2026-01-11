
import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

const API_KEY = process.env.API_KEY || '';

// Safely initialize the client only if key exists
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const findManual = async (itemName: string, modelInfo?: string): Promise<SearchResult[]> => {
  if (!API_KEY) {
    console.warn("No API Key provided");
    return [];
  }

  const query = `Find the official PDF user manual or support page for: ${itemName} ${modelInfo || ''}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (!chunks) return [];

    // Extract web links from grounding chunks
    const results: SearchResult[] = [];
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
        results.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Error finding manual:", error);
    return [];
  }
};

export const suggestRoomItems = async (roomName: string, description: string): Promise<string[]> => {
  if (!API_KEY) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 common household items one might find in a "${roomName}" described as "${description}". Return only a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text;
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to parse Gemini JSON response", e);
      return [];
    }
  } catch (error) {
    console.error("Error suggesting items:", error);
    return [];
  }
};

export const analyzeItemValue = async (itemName: string, description: string, currencyCode: string = 'USD'): Promise<string> => {
  if (!API_KEY) return "Unable to estimate";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Estimate the average insurance replacement value range (in ${currencyCode}) for a used: ${itemName}. Description: ${description}. Keep it very brief (e.g., "50 - 100 ${currencyCode}").`,
    });
    
    return response.text || "Unknown";
  } catch (error) {
    console.error("Error estimating value:", error);
    return "Error";
  }
};
