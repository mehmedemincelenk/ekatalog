import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug') || 'default';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch store branding details
    const { data: store, error } = await supabase
      .from('stores')
      .select('name, tagline, logo_url')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !store) {
      // Return fallback default manifest
      return new Response(
        JSON.stringify({
          name: 'Toptan Ambalajcım',
          short_name: 'Toptan Ambalaj',
          description: 'Ambalajda Güvenilir Çözüm Ortağınız',
          theme_color: '#ffffff',
          background_color: '#f7f5f2',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/logo-favicon.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: '/logo-favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        }),
        { headers: corsHeaders }
      );
    }

    const name = store.name || 'ekatalog';
    const description = store.tagline || 'Katalog';
    const logoUrl = store.logo_url || '/logo-favicon.svg';

    const manifest = {
      name: name,
      short_name: name,
      description: description,
      theme_color: '#ffffff',
      background_color: '#f7f5f2',
      display: 'standalone',
      start_url: `/${slug}`,
      icons: [
        {
          src: logoUrl,
          sizes: '192x192',
        },
        {
          src: logoUrl,
          sizes: '512x512',
        },
      ],
    };

    return new Response(JSON.stringify(manifest), {
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
