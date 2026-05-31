import { createClient } from '@supabase/supabase-js';

const PORTFOYS_SB_URL = 'https://pjbuobkxlltedchzmhzt.supabase.co';

// Note: Using the portfoys.com public anonymous credentials. 
// The actual anon token from .env.local was copied. Let's make sure it's valid and robust.
export const portfoysSupabase = createClient(
  PORTFOYS_SB_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnVvYmt4bGx0ZWRjaHptaHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjM0NzEsImV4cCI6MjA5MDczOTQ3MX0.-Cbccz5lg0ijAixRXTJ-TKQDKqpnajwzbrGjJptMzms'
);
