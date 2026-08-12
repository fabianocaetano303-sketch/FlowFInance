import Link from "next/link";
import RegistrarForm from "@/components/RegistrarForm";

export default function RegistrarPage({
  searchParams,
}: {
  searchParams: { tipo?: string };
}) {
  const tipoInicial = searchParams.tipo === "gasto" ? "gasto" : "ganho";

  return (
    <>
      <header className="flex items-center gap-3 px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <Link
          href="/"
          aria-label="Voltar"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Novo Registro</h1>
          <p className="text-xs text-on-surface-variant">Registre suas movimentações diárias</p>
        </div>
      </header>

      <RegistrarForm tipoInicial={tipoInicial} />
    </>
  );
}
