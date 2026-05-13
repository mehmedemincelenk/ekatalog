/**
 * REPLICATE GENERATIVE STUDIO (FLUX EDITION)
 * -----------------------------------------
 * High-End Image-to-Image pipeline using FLUX.
 * Converts raw assets into "Diamond Standard" studio photographs.
 */

const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

/**
 * processInReplicateStudio: Generative reconstruction via FLUX.
 */
export async function processInReplicateStudio(imageFile: File | Blob): Promise<Blob> {
  if (!REPLICATE_API_KEY) throw new Error('Replicate API anahtarı eksik.');

  const base64Image = await fileToBase64(imageFile);

  // 1. CREATE PREDICTION via Proxy
  // Using a stable FLUX Image-to-Image compatible model/version
  const createResponse = await fetch('/api/replicate/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // This is a common version for FLUX-based image transformations/editing
      version: "f4486586071ef2e861ea5d36e2f694ca97d519abd113b28b7e735e5d1796d132", 
      input: {
        image: `data:image/jpeg;base64,${base64Image}`,
        prompt: "A professional high-end minimalist studio product photography, clean white background, soft cinematic lighting, 8k resolution, crisp details, expensive catalog aesthetic",
        strength: 0.35, // Preserves the essence of the original product
        num_outputs: 1,
        guidance_scale: 3.5,
        num_inference_steps: 28,
      }
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({ detail: 'İstek başarısız' }));
    throw new Error(`Replicate Hata: ${errorData.detail}`);
  }

  let prediction = await createResponse.json();

  // 2. POLL FOR COMPLETION
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(`/api/replicate/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` },
    });
    prediction = await pollResponse.json();
  }

  if (prediction.status === 'failed') {
    throw new Error(`Replicate işlemi başarısız: ${prediction.error}`);
  }

  // 3. FETCH RESULT
  const output = prediction.output;
  const resultImageUrl = Array.isArray(output) ? output[0] : output;
  
  const imageResponse = await fetch(resultImageUrl, { mode: 'cors' });
  if (!imageResponse.ok) throw new Error('Üretilen görsel indirilemedi.');
  
  return await imageResponse.blob();
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
