import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface WeatherInsight {
  title: string;
  value: string;
  description: string;
}

export interface ProductSuggestion {
  name: string;
  reason: string;
  category: "clothing" | "protection" | "accessory";
}

export interface TravelPlan {
  bestDays: string[];
  rainDays: string[];
  packingSuggestions: string[];
  summary: string;
}

export async function getWeatherInsights(weatherData: any): Promise<WeatherInsight[]> {
  const prompt = `Based on this weather data: ${JSON.stringify(weatherData.current)}, provide 3-4 short, practical weather insights for a user. 
  Focus on activities like jogging, UV risk, rain probability, or clothing.
  Return the response as a JSON array of objects with 'title', 'value', and 'description' fields.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              value: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "value", "description"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return [];
  }
}

export async function getTravelPlan(city: string, dates: string, forecastData: any): Promise<TravelPlan | null> {
  const prompt = `User wants to travel to ${city} during ${dates}. 
  Here is the forecast data for the next few days: ${JSON.stringify(forecastData?.list?.slice(0, 16))}.
  Provide a travel plan including:
  1. Best sightseeing days (based on weather).
  2. Potential rain days.
  3. Packing suggestions.
  4. A short summary.
  Return as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestDays: { type: Type.ARRAY, items: { type: Type.STRING } },
            rainDays: { type: Type.ARRAY, items: { type: Type.STRING } },
            packingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: ["bestDays", "rainDays", "packingSuggestions", "summary"],
        },
      },
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    return null;
  }
}

export async function getSmartAlerts(forecastData: any): Promise<string[]> {
  const prompt = `Analyze this forecast data: ${JSON.stringify(forecastData?.list?.slice(0, 8))}.
  Identify any significant weather changes or alerts (e.g., "Storm arriving in 2 hours", "Temperature drop expected tonight").
  Return as a JSON array of strings. Keep them very short.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching smart alerts:", error);
    return [];
  }
}

export async function getProductSuggestions(weatherData: any): Promise<ProductSuggestion[]> {
  const prompt = `Based on this weather data: ${JSON.stringify(weatherData.current)}, suggest 3-4 essential products or items the user should have.
  Examples: Sunscreen for high UV, Umbrella for rain, Heavy Jacket for cold, Sunglasses for bright sun.
  Return the response as a JSON array of objects with 'name', 'reason', and 'category' (one of: clothing, protection, accessory) fields.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                enum: ["clothing", "protection", "accessory"]
              },
            },
            required: ["name", "reason", "category"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching product suggestions:", error);
    return [];
  }
}
