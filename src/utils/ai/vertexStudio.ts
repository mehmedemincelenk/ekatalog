/**
 * VERTEX AI GENERATIVE STUDIO (IMAGEN 3)
 * -----------------------------------------
 * Professional Image-to-Image reconstruction engine.
 * Converts "merchant photos" into "studio-standard catalog photos".
 */

import * as jose from 'jose';

const PROJECT_ID = import.meta.env.VITE_GCP_PROJECT_ID;
const CLIENT_EMAIL = import.meta.env.VITE_GCP_CLIENT_EMAIL;
const PRIVATE_KEY = (import.meta.env.VITE_GCP_PRIVATE_KEY || '')
  .replace(/^"|"$/g, '') // Remove wrapping quotes
  .replace(/\\n/g, '\n')  // Standardize newlines
  .trim();
const LOCATION = import.meta.env.VITE_GCP_LOCATION || 'us-central1';

/**
 * getVertexAccessToken: Signs a JWT and exchanges it for a Google Cloud Access Token.
 */
async function getVertexAccessToken(): Promise<string> {
  if (!PRIVATE_KEY || !CLIENT_EMAIL) throw new Error('Vertex AI kimlik bilgileri eksik.');

  const pkcs8 = PRIVATE_KEY;
  const privateKey = await jose.importPKCS8(pkcs8, 'RS256');

  const jwt = await new jose.SignJWT({
    iss: CLIENT_EMAIL,
    sub: CLIENT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'Auth Token alınamadı.');
  return data.access_token;
}

/**
 * reconstructProductInVertexStudio: Uses Imagen 3 to regenerate the product image.
 */
export async function reconstructProductInVertexStudio(imageFile: File | Blob): Promise<Blob> {
  if (!PROJECT_ID) throw new Error('GCP Project ID eksik.');

  const accessToken = await getVertexAccessToken();
  const base64Image = await fileToBase64(imageFile);

  const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;

  const payload = {
    instances: [
      {
        image: {
          bytesBase64Encoded: base64Image
        },
        prompt: "Professional B2B catalog product shot. Minimalist white studio background. Sharp-focus, front-facing orthographic perspective. Diffused, soft global lighting with subtle professional contact shadows. Pristine product reconstruction: preserve all original branding, logos, and text with absolute high-fidelity. Balanced centering and level alignment. High fidelity, clean 720p aesthetic."
      }
    ],
    parameters: {
      sampleCount: 1,
      // NOTE: 'edit' or 'upscale' might be used depending on exact Vertex model version
      // For Reconstruction, we use Gen-to-Gen logic
      mode: "upscale", // Upscale mode often preserves original details better for products
    }
  };

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Vertex AI Hatası: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const outputBase64 = result.predictions[0].bytesBase64Encoded;
  
  return base64ToBlob(outputBase64, 'image/png');
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

function base64ToBlob(base64: string, mime: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}
