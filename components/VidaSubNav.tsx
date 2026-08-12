"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/vida", label: "Painel" },
  { href: "/vida/proposito", label: "Propósito" },
  { href: "/vida/habitos", label: "Hábitos" },
  { href: "/vida/diario", label: "Diário" },
  { href: "/vida/semana", label: "Semana" },
  { href: "/vida/progresso", label: "Progresso" },
  { href: "/vida/config", label: "Config" },
];

export default function VidaSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto px-4 pb-1">
      {ABAS.map((aba) => {
        const ativo = aba.href === "/vida" ? pathname === "/vida" : pathname.startsWith(aba.href);
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              ativo ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {aba.label}
          </Link>
        );
      })}
    </div>
  );
}
