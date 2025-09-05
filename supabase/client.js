// supabase/client.js
// Setup koneksi Supabase

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Ganti dengan project kamu sendiri
const SUPABASE_URL = "https://grcgachetkbbxgdewcty.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyY2dhY2hldGtiYnhnZGV3Y3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzM1MzcsImV4cCI6MjA3MjYwOTUzN30.AxFhUICmyR3IP16Fox9a_7rqu7JCsAQbmB59CR0M-CA"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);