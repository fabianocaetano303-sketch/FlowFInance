"use client";

export function notificacoesSuportadas(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!notificacoesSuportadas()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function pedirPermissao(): Promise<NotificationPermission | "unsupported"> {
  if (!notificacoesSuportadas()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function mostrarNotificacao(titulo: string, corpo: string, url: string, tag?: string): Promise<void> {
  if (!notificacoesSuportadas() || Notification.permission !== "granted") return;
  const registro = await navigator.serviceWorker.ready.catch(() => null);
  const opcoes: NotificationOptions = { body: corpo, data: { url }, tag, icon: "/icon.svg" };
  if (registro) {
    registro.showNotification(titulo, opcoes);
  } else {
    // eslint-disable-next-line no-new
    new Notification(titulo, opcoes);
  }
}

function msAteHorario(horario: string, diasAFrente = 0): number {
  const [h, m] = horario.split(":").map(Number);
  const agora = new Date();
  const alvo = new Date(agora);
  alvo.setDate(agora.getDate() + diasAFrente);
  alvo.setHours(h, m || 0, 0, 0);
  if (diasAFrente === 0 && alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1);
  }
  return alvo.getTime() - agora.getTime();
}

/** Agenda `callback` para o próximo horário HH:MM (hoje se ainda não passou, senão amanhã) e se re-arma todo dia. Retorna função de limpeza. */
export function agendarDiario(horario: string, callback: () => void): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  function armar() {
    const delay = msAteHorario(horario);
    timeoutId = setTimeout(() => {
      callback();
      armar();
    }, delay);
  }

  armar();
  return () => clearTimeout(timeoutId);
}

/** Agenda `callback` para o próximo dia da semana (0=domingo) no horário HH:MM, e se re-arma toda semana. Retorna função de limpeza. */
export function agendarSemanal(diaSemana: number, horario: string, callback: () => void): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  function armar() {
    const [h, m] = horario.split(":").map(Number);
    const agora = new Date();
    const diasAFrente = (diaSemana - agora.getDay() + 7) % 7;
    const alvo = new Date(agora);
    alvo.setDate(agora.getDate() + diasAFrente);
    alvo.setHours(h, m || 0, 0, 0);
    if (alvo.getTime() <= agora.getTime()) {
      alvo.setDate(alvo.getDate() + 7);
    }
    const delay = alvo.getTime() - agora.getTime();
    timeoutId = setTimeout(() => {
      callback();
      armar();
    }, delay);
  }

  armar();
  return () => clearTimeout(timeoutId);
}
