import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://xrstcgfhukzeqnjaecfx.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc3RjZ2ZodWt6ZXFuamFlY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1ODkyNDQsImV4cCI6MjEwMjE2NTI0NH0.iSw3TBd1BLqkVrn4PIER2cXAlYqj1pM_Yqu49fCZn_E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


