"use client";

import { useEffect } from "react";
import { registrarServiceWorker } from "@/lib/notificacoes";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    registrarServiceWorker().then((registro) => {
      if (registro) console.log("Service worker registrado:", registro.scope);
    });
  }, []);

  return null;
}
