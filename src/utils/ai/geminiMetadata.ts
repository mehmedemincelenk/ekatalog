/**
 * GEMINI METADATA SERVICE
 * -----------------------------------------
 * Leverages Gemini 1.5 Flash to analyze product images
 * and automatically generate professional metadata (Name, Description, Category).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ProductAnalysis {
  name: string;
  description: string;
  category: string;
}

/**
 * analyzeProductImage: Sends a visual asset to Gemini and returns professional metadata.
 */
export async function analyzeProductImage(imageFile: File): Promise<ProductAnalysis | null> {
  if (!API_KEY) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to Generative AI part (base64)
    const imageData = await fileToGenerativePart(imageFile);

    const prompt = `
      Sen profesyonel bir B2B e-katalog asistanısın. 
      Sana bir ürün fotoğrafı gönderiyorum. Lütfen bu ürünü incele ve şu 3 bilgiyi TÜRKÇE olarak ver:
      1. Ürün Adı (Kısa, net ve profesyonel)
      2. Ürün Açıklaması (Müşteriyi cezbedecek, teknik özelliklere değinen bir paragraf)
      3. Ürün Kategorisi (Sadece tek bir kelime, örn: Ambalaj, Gıda, Tekstil vb.)

      Yanıtını şu JSON formatında ver:
      {
        "name": "...",
        "description": "...",
        "category": "..."
      }
    `;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

/**
 * fileToGenerativePart: Helper to convert File to Gemini format.
 */
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise as string,
      mimeType: file.type
    },
  };
}
