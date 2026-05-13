// FOLLOW: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // 1. GET KEYS FROM SUPABASE SECRETS (Never exposed to client)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const PHOTOROOM_API_KEY = Deno.env.get('PHOTOROOM_API_KEY');
    const GCP_PROJECT_ID = Deno.env.get('GCP_PROJECT_ID');
    const GCP_CLIENT_EMAIL = Deno.env.get('GCP_CLIENT_EMAIL');
    const GCP_PRIVATE_KEY = Deno.env.get('GCP_PRIVATE_KEY');
    const GCP_LOCATION = Deno.env.get('GCP_LOCATION') || 'us-central1';

    // --- ACTION: VERTEX AI (GCP Imagen) ---
    if (action === 'vertex') {
      if (!GCP_PROJECT_ID || !GCP_PRIVATE_KEY) throw new Error('GCP Credentials missing in secrets');

      // 1. Auth via JWT (Moved from client to server)
      const { default: initJose } = await import('https://deno.land/x/jose@v4.14.4/index.ts');
      const privateKey = await initJose.importPKCS8(GCP_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256');
      const jwt = await new initJose.SignJWT({
        iss: GCP_CLIENT_EMAIL, sub: GCP_CLIENT_EMAIL,
        aud: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/cloud-platform',
      }).setProtectedHeader({ alg: 'RS256' }).setIssuedAt().setExpirationTime('1h').sign(privateKey);

      const authRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
      });
      const { access_token } = await authRes.json();

      // 2. Predict via Vertex
      const ENDPOINT = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/imagegeneration@006:predict`;
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ image: { bytesBase64Encoded: payload.image }, prompt: payload.prompt || 'Professional catalog product shot, white studio background.' }],
          parameters: { sampleCount: 1, mode: 'upscale' },
        }),
      });

      const result = await res.json();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- ACTION: REFINE TEXT (Gemini) ---
    if (action === 'refine-text') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload.prompt }] }],
        }),
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- ACTION: PHOTOROOM STUDIO ---
    if (action === 'photoroom') {
      if (!PHOTOROOM_API_KEY) throw new Error('Photoroom API key missing');
      
      const b64Data = payload.image;
      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formPayload = new FormData();
      formPayload.append('imageFile', blob);
      formPayload.append('background.prompt', 'Professional white studio, soft lighting, centered');
      formPayload.append('background.color', '#ffffff');
      formPayload.append('shadow.mode', 'ai.soft');
      formPayload.append('padding', '0.1');
      formPayload.append('center', 'true');

      const res = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers: { 'x-api-key': PHOTOROOM_API_KEY },
        body: formPayload,
      });

      if (!res.ok) throw new Error('Photoroom API error');
      const resultBlob = await res.blob();
      return new Response(resultBlob, {
        headers: { ...corsHeaders, 'Content-Type': 'image/png' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
