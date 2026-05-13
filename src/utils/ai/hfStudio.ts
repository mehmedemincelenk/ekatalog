/**
 * HUGGING FACE GENERATIVE STUDIO
 * -----------------------------------------
 * Instruct-Pix2Pix: True Image-to-Image editing.
 * Preserves the original object while modifying the environment.
 */

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;

export async function processInHFStudio(imageFile: File | Blob): Promise<Blob> {
  if (!HF_TOKEN) throw new Error('Hugging Face Token eksik.');

  // MODEL: Instruct-Pix2Pix (Specialized in edit-based Image-to-Image)
  const MODEL_URL = "/api/hf/models/timbrooks/instruct-pix2pix";
  
  const base64Image = await fileToBase64(imageFile);
  console.log(`📊 AI Üretim Hattına Gönderilen Veri Boyutu: ${(base64Image.length / 1024).toFixed(2)} KB`);

  const payload = {
    inputs: base64Image,
    parameters: {
      prompt: "Put the product on a professional minimalist white studio background with soft cinematic lighting and realistic shadows. Ultra-clean high-end catalog style.",
      image_guidance_scale: 1.5, // High value = More like original image
      guidance_scale: 7.5,
      num_inference_steps: 25
    }
  };

  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face Hatası: ${error.error || response.statusText}`);
  }

  return await response.blob();
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
