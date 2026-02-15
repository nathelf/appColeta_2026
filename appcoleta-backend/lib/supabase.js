import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://slrrphmdnnjzmkaaxscv.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.warn("SUPABASE_ANON_KEY (ou SUPABASE_KEY) não definida. Cliente Supabase desabilitado.");
}

export const supabase = supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;
