import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseUrl = "https://ytgmkmerzfjkdxldbolo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z21rbWVyemZqa2R4bGRib2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMDI4MTYsImV4cCI6MjEwMTU3ODgxNn0.BmyLysJJO63bHoZXemSeCM2eqXhP1j-NrmUuLns4Ih4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
