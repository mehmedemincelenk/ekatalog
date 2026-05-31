import { createClient } from '@supabase/supabase-js';

const PORTFOYS_SB_URL = 'https://pjbuobkxlltedchzmhzt.supabase.co';

// Public anon token for the remote Portfoys db to fetch unique countries, cities and districts.
export const portfoysSupabase = createClient(
  PORTFOYS_SB_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnVvYmt4bGx0ZWRjaHptaHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjM0NzEsImV4cCI6MjA5MDczOTQ3MX0.-Cbccz5lg0ijAixRXTJ-TKQDKqpnajwzbrGjJptMzms'
);
