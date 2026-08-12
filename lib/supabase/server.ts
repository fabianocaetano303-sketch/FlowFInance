import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Intencionalmente vazio: Server Components só leem a sessão.
          // Quem persiste refresh de token é o middleware (roda antes do
          // render, sempre seguro). Tentar escrever cookies aqui dentro é o
          // que causa ERR_HTTP_HEADERS_SENT em rotas com streaming (Suspense
          // via loading.tsx) quando o token expira em produção: o header já
          // foi enviado ao cliente antes desse write chegar até o Node.
        },
      },
    }
  );
}
