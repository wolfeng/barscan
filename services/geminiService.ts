import { GoogleGenAI, Type } from "@google/genai";
import { ProductInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyProduct = async (barcode: string, format: string): Promise<ProductInfo> => {
  try {
    const prompt = `I just scanned a barcode with value "${barcode}" and format "${format}". 
    Please identify what product this likely is. 
    If it's a standard GTIN/EAN/UPC, try to guess the specific product. 
    If you can't be 100% sure, provide the most likely generic description (e.g., "A consumer good", "A book").
    
    Return the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The likely name of the product" },
            category: { type: Type.STRING, description: "The category of the product (e.g., Food, Electronics, Book)" },
            description: { type: Type.STRING, description: "A short description of what the product is." },
            estimatedPrice: { type: Type.STRING, description: "Estimated price range if known (e.g., $5-$10), or 'Unknown'" },
          },
          required: ["name", "category", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as ProductInfo;
  } catch (error) {
    console.error("Gemini lookup failed:", error);
    return {
      name: "Unknown Product",
      category: "Unknown",
      description: "Could not identify product details via AI.",
    };
  }
};
