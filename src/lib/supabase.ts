import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://slrrphmdnnjzmkaaxscv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase: SupabaseClient | null =
  supabaseAnonKey && supabaseAnonKey !== "COLOQUE_SUA_ANON_KEY_AQUI"
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
