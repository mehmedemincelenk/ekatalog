/**
 * AI INTELLIGENCE HUB (DIAMOND EDITION)
 * -----------------------------------------
 * Unified orchestrator for all generative operations:
 * 1. Visual Studio (Photoroom, OpenAI, Vertex, Replicate, HF)
 * 2. Text Polishing (Gemini Copywriting)
 * 3. Smart Search & Metadata Analysis
 */
import * as jose from 'jose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product, ProductAnalysis } from '../../types';
import { supabase } from '../../supabase';
import { fileToBase64, base64ToBlob } from '../core';

// --- CONFIGURATION & INITIALIZATION ---

// SET THIS TO TRUE once you deploy your Supabase Edge Functions
// Command: supabase functions deploy ai-orchestrator
// And set secrets: supabase secrets set GEMINI_API_KEY=... PHOTOROOM_API_KEY=...
const USE_EDGE_FUNCTIONS = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const GCP = {
  PROJECT_ID: import.meta.env.VITE_GCP_PROJECT_ID,
  CLIENT_EMAIL: import.meta.env.VITE_GCP_CLIENT_EMAIL,
  PRIVATE_KEY: (import.meta.env.VITE_GCP_PRIVATE_KEY || '')
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n')
    .trim(),
  LOCATION: import.meta.env.VITE_GCP_LOCATION || 'us-central1',
};

// --- VISUAL STUDIO OPERATIONS (Görsel Zeka) ---

export const isAIStudioReady = (apiKey?: string): boolean => {
  return !!apiKey && apiKey.length > 10;
};

/**
 * Photoroom: Precision isolation & studio reconstruction.
 */
export async function processProductInDiamondStudio(
  imageFile: File | Blob,
  apiKey: string,
): Promise<Blob> {
  if (USE_EDGE_FUNCTIONS) {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: {
        action: 'photoroom',
        payload: {
          image: await fileToBase64(imageFile),
        },
      },
    });
    if (error) throw error;
    return data; // Assuming Edge Function returns the blob directly
  }

  if (!apiKey) throw new Error('Photoroom API anahtarı eksik.');
  const formPayload = new FormData();
  formPayload.append('imageFile', imageFile);
  formPayload.append('background.prompt', 'Professional white studio, soft lighting, centered');
  formPayload.append('background.color', '#ffffff');
  formPayload.append('shadow.mode', 'ai.soft');
  formPayload.append('padding', '0.1');
  formPayload.append('center', 'true');

  const response = await fetch('https://image-api.photoroom.com/v2/edit', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: formPayload,
  });

  if (!response.ok) throw new Error('AI Studio (Photoroom) hatası.');
  return await response.blob();
}

/**
 * OpenAI: Vision analysis + DALL-E 3 faithful reconstruction.
 */
export async function processInOpenAIStudio(imageFile: File | Blob): Promise<Blob> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API anahtarı eksik.');
  const b64 = await fileToBase64(imageFile);

  const visionRes = await fetch('/api/openai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'Analyze this product for 1:1 reconstruction.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
      ]}],
      max_tokens: 300,
    }),
  });

  const visionData = await visionRes.json();
  const prompt = visionData.choices[0].message.content;

  const dalleRes = await fetch('/api/openai/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `Master-tier studio product photography. ${prompt}. Centered 1:1, white background.`,
      size: '1024x1024',
      quality: 'hd',
      response_format: 'b64_json',
    }),
  });

  const dalleData = await dalleRes.json();
  return base64ToBlob(dalleData.data[0].b64_json, 'image/png');
}

/**
 * Vertex AI: Imagen 3 professional reconstruction.
 */
export async function reconstructProductInVertexStudio(imageFile: File | Blob): Promise<Blob> {
  if (USE_EDGE_FUNCTIONS) {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: {
        action: 'vertex',
        payload: {
          image: await fileToBase64(imageFile),
          prompt: 'Professional catalog product shot, white studio background.',
        },
      },
    });
    if (error) throw error;
    return base64ToBlob(data.predictions[0].bytesBase64Encoded, 'image/png');
  }

  if (!GCP.PROJECT_ID || !GCP.PRIVATE_KEY) throw new Error('Vertex AI kimlik bilgileri eksik.');
  
  const privateKey = await jose.importPKCS8(GCP.PRIVATE_KEY, 'RS256');
  const jwt = await new jose.SignJWT({
    iss: GCP.CLIENT_EMAIL, sub: GCP.CLIENT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  }).setProtectedHeader({ alg: 'RS256' }).setIssuedAt().setExpirationTime('1h').sign(privateKey);

  const authRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const { access_token } = await authRes.json();

  const b64 = await fileToBase64(imageFile);
  const ENDPOINT = `https://${GCP.LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP.PROJECT_ID}/locations/${GCP.LOCATION}/publishers/google/models/imagegeneration@006:predict`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ image: { bytesBase64Encoded: b64 }, prompt: 'Professional catalog product shot, white studio background.' }],
      parameters: { sampleCount: 1, mode: 'upscale' },
    }),
  });

  const result = await res.json();
  return base64ToBlob(result.predictions[0].bytesBase64Encoded, 'image/png');
}

/**
 * Replicate: FLUX generative transformation.
 */
export async function processInReplicateStudio(imageFile: File | Blob): Promise<Blob> {
  if (!REPLICATE_API_KEY) throw new Error('Replicate API anahtarı eksik.');
  const b64 = await fileToBase64(imageFile);

  const res = await fetch('/api/replicate/predictions', {
    method: 'POST',
    headers: { Authorization: `Token ${REPLICATE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: 'f4486586071ef2e861ea5d36e2f694ca97d519abd113b28b7e735e5d1796d132',
      input: { image: `data:image/jpeg;base64,${b64}`, prompt: 'Minimalist studio product photography, clean white background', strength: 0.35 },
    }),
  });

  let prediction = await res.json();
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await fetch(`/api/replicate/predictions/${prediction.id}`, { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } });
    prediction = await poll.json();
  }

  const imgRes = await fetch(Array.isArray(prediction.output) ? prediction.output[0] : prediction.output);
  return await imgRes.blob();
}

/**
 * Hugging Face: Instruct-Pix2Pix environment modification.
 */
export async function processInHFStudio(imageFile: File | Blob): Promise<Blob> {
  if (!HF_TOKEN) throw new Error('Hugging Face Token eksik.');
  const b64 = await fileToBase64(imageFile);

  const res = await fetch('/api/hf/models/timbrooks/instruct-pix2pix', {
    method: 'POST',
    headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: b64, parameters: { prompt: 'Put on professional minimalist white studio background.' } }),
  });

  if (!res.ok) throw new Error('Hugging Face hatası.');
  return await res.blob();
}

// --- TEXT & ANALYSIS OPERATIONS (Metin Zeka) ---

/**
 * refineProductTexts: Luxury boutique copywriting via Gemini.
 */
export async function refineProductTexts(product: Partial<Product>): Promise<{ name: string; description: string }> {
  const localFallback = () => {
    const desc = product.description || '';
    const name = product.name || '';
    const formatted = desc.includes('•') ? desc : desc.split(/[,،\n]| ve /).map(s => `• ${s.trim()}`).join('\n');
    const polishedName = name.includes(' ') ? name : `Premium ${name}`;
    return { name: polishedName, description: formatted };
  };

  if (USE_EDGE_FUNCTIONS) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          action: 'refine-text',
          payload: {
            prompt: `Senior Copywriter role. JSON output for product: Name: ${product.name}, Desc: ${product.description}`,
          },
        },
      });
      if (error) throw error;
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = raw.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : localFallback();
    } catch (e) {
      console.error('Edge Function Error:', e);
      return localFallback();
    }
  }

  if (!GEMINI_API_KEY) return localFallback();

  try {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Senior Copywriter role. JSON output for product: Name: ${product.name}, Desc: ${product.description}`,
              },
            ],
          },
        ],
      }),
    });
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : localFallback();
  } catch {
    return localFallback();
  }
}

/**
 * analyzeProductImage: Visual-to-Metadata analysis via Gemini.
 */
export async function analyzeProductImage(imageFile: File | Blob): Promise<ProductAnalysis | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const b64 = await fileToBase64(imageFile);
    const result = await model.generateContent([
      'B2B Assistant role. Analyze product and return JSON: {name, description, category}',
      { inlineData: { data: b64, mimeType: (imageFile as File).type || 'image/jpeg' } }
    ]);
    const match = (await result.response).text().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

