"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    setCarregando(false);

    if (error) {
      setErro(error.message === "User already registered" ? "Este email já está cadastrado." : "Não foi possível criar a conta.");
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSucesso(true);
  }

  if (sucesso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm card text-center space-y-3">
          <h1 className="text-lg font-semibold text-on-surface">Confirme seu email</h1>
          <p className="text-sm text-on-surface-variant">
            Enviamos um link de confirmação para {email}. Confirme para poder entrar.
          </p>
          <Link href="/login" className="btn-primary inline-block w-full text-center">
            Ir para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-on-surface">Criar conta</h1>
          <p className="text-sm text-on-surface-variant mt-1">Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label-field" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label-field" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="input-field"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label-field" htmlFor="confirmar-senha">
              Confirmar senha
            </label>
            <input
              id="confirmar-senha"
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              className="input-field"
              autoComplete="new-password"
            />
          </div>

          {erro && <p className="text-sm text-error">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Já possui conta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
