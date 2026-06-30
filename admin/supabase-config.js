window.SUPABASE_URL = "https://vexxlnugvrlkliyijltv.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHhsbnVndnJsa2xpeWlqbHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODU3NzEsImV4cCI6MjA5ODM2MTc3MX0.G2MgcHCSsIg2cqtnqVDl7CBYNzddA0FSoBlPRtG9-jc";

window.isSupabaseConfigured =
  window.SUPABASE_URL.startsWith("https://") &&
  !window.SUPABASE_URL.includes("PASTE_YOUR") &&
  !window.SUPABASE_ANON_KEY.includes("PASTE_YOUR");

window.supabaseClient = window.isSupabaseConfigured
  ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;
