import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Client com a service role key — ignora RLS.
 * Uso exclusivo em rotas server-side de confiança (ex: cron jobs).
 * NUNCA importar em código que roda no browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chaveServico) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  return createSupabaseClient<Database>(url, chaveServico, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
