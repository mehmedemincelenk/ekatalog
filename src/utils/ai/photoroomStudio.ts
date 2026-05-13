/**
 * PHOTOROOM DIAMOND STUDIO
 * -----------------------------------------
 * Professional e-commerce image processing.
 * Background Removal + AI Backgrounds + Realistic Shadows.
 */

const PHOTOROOM_API_KEY = import.meta.env.VITE_PHOTOROOM_API_KEY;

export async function processInPhotoroomStudio(imageFile: File | Blob): Promise<Blob> {
  if (!PHOTOROOM_API_KEY) throw new Error('Photoroom API Key eksik.');

  const formData = new FormData();
  formData.append('imageFile', imageFile);
  
  // Rasyonel Diamond Ayarları (Klasik Katalog - Saf Beyaz PNG)
  formData.append('background.color', 'FFFFFF'); 
  formData.append('shadow.mode', 'ai.soft');
  formData.append('padding', '0.12');
  formData.append('lighting.mode', 'ai.preserve-hue-and-saturation');
  formData.append('outputSize', 'originalImage');
  formData.append('format', 'png'); // Rasyonel kalite için PNG mührü

  const response = await fetch('/api/photoroom/v2/edit', {
    method: 'POST',
    headers: {
      'x-api-key': PHOTOROOM_API_KEY
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Photoroom Detaylı Hata:', errorData);
    throw new Error(`Photoroom Hatası: ${errorData.message || JSON.stringify(errorData) || response.statusText}`);
  }

  return await response.blob();
}
