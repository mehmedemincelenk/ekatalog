/**
 * OPENAI GENERATIVE STUDIO
 * -----------------------------------------
 * Two-step reconstruction: GPT-4o Vision -> DALL-E 3
 * processProductAnalysis: Vision-based architectural analysis of the product.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function processInOpenAIStudio(imageFile: File | Blob): Promise<Blob> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API anahtarı eksik.');

  const base64Image = await fileToBase64(imageFile);

  // 1. PHASE ONE: VISION ANALYSIS via Proxy
  const visionResponse = await fetch('/api/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "ARCHITECTURAL PRODUCT ANALYSIS: Describe the product in the image with absolute precision. Extract the EXACT BRAND NAME and PRODUCT NAME from the labels. Count the EXACT NUMBER of items. Describe the STACK ARRANGEMENT (e.g., 1 on top, 2 in middle, 3 at bottom). Describe the EXACT LID COLORS and JAR SHAPES. Your description will be used for a 1:1 faithful reconstruction. Be obsessive about the details." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 300
    })
  });

  const visionData = await visionResponse.json();
  if (visionData.error) throw new Error(`Vision Hatası: ${visionData.error.message}`);
  const detailedPrompt = visionData.choices[0].message.content;

  // 2. PHASE TWO: DALL-E 3 GENERATION via Proxy
  const dalleResponse = await fetch('/api/openai/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Master-tier professional studio product photography. ${detailedPrompt}. Centered square 1:1 composition on a minimalist white studio background. Soft directional side lighting, realistic shadows, 4k high-fidelity. No distortion. Perfectly balanced hero shot.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json"
    })
  });

  const dalleData = await dalleResponse.json();
  if (dalleData.error) throw new Error(`DALL-E Hatası: ${dalleData.error.message}`);
  
  // LOG ESTIMATED COST (Standard OpenAI Rates)
  console.log(`📊 Diamond Studio Maliyet Raporu: ~$0.09 (Vision Analysis + DALL-E 3 HD)`);
  
  const b64Data = dalleData.data[0].b64_json;
  
  // 3. CONVERT B64 TO BLOB (No fetch needed, bypasses CORS)
  const byteCharacters = atob(b64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

/**
 * HELPERS
 */
async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
}
