import Link from "next/link";

export default function VidaMantra({ motivo, destaque = false }: { motivo: string | null; destaque?: boolean }) {
  if (!motivo) {
    return (
      <Link
        href="/vida/proposito"
        className={`block card border-accent/50 bg-accent/5 text-accent font-medium text-center ${
          destaque ? "!p-8 text-lg" : "!p-4 text-sm"
        }`}
      >
        Defina seu propósito →
      </Link>
    );
  }

  if (destaque) {
    return (
      <div className="card !p-8 border-accent/50 bg-accent/5 text-center animate-fade-in">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">Seu Propósito</p>
        <p className="text-xl font-semibold text-on-surface italic leading-relaxed">&ldquo;{motivo}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="card !p-4 border-accent/40 bg-accent/5">
      <p className="text-xs font-medium tracking-wide text-accent uppercase mb-1">Seu propósito</p>
      <p className="text-sm text-on-surface italic">&ldquo;{motivo}&rdquo;</p>
    </div>
  );
}
