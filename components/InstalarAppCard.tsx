"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectarIOS(): boolean {
  const ua = navigator.userAgent;
  const iPhoneOuIPod = /iPhone|iPod/.test(ua);
  const iPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return iPhoneOuIPod || iPad;
}

export default function InstalarAppCard() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [ios, setIos] = useState(false);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalado(standalone);
    setIos(detectarIOS() && !standalone);

    function aoTerPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    function aoInstalar() {
      setInstalado(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", aoTerPrompt);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoTerPrompt);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!promptEvent) return;
    setInstalando(true);
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalando(false);
  }

  if (instalado) {
    return (
      <div className="card !p-4 flex items-center gap-3">
        <span className="text-xl">✓</span>
        <div>
          <p className="text-sm font-medium text-on-surface">App instalado</p>
          <p className="text-xs text-on-surface-variant">Você já está usando o FinanceFlow como app.</p>
        </div>
      </div>
    );
  }

  if (ios) {
    return (
      <div className="card !p-4 space-y-1.5">
        <p className="text-sm font-medium text-on-surface">Instalar o FinanceFlow</p>
        <p className="text-xs text-on-surface-variant">
          No Safari, toque em <span className="font-medium text-on-surface">Compartilhar</span> (ícone de seta pra
          cima) e depois em <span className="font-medium text-on-surface">Adicionar à Tela de Início</span>.
        </p>
      </div>
    );
  }

  if (!promptEvent) return null;

  return (
    <div className="card !p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-on-surface">Instalar o FinanceFlow</p>
        <p className="text-xs text-on-surface-variant">Acesso rápido direto da tela inicial, sem abrir o navegador.</p>
      </div>
      <button onClick={instalar} disabled={instalando} className="btn-primary shrink-0 !px-4 !py-2 !text-sm">
        {instalando ? "..." : "Instalar"}
      </button>
    </div>
  );
}
