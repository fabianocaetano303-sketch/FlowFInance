"use client";

import { useState } from "react";
import { formatarMoeda, hojeISO } from "@/lib/financas";

interface ResumoRelatorio {
  periodoLabel: string;
  ganhos: number;
  gastos: number;
  saldo: number;
}

export default function ExportarPdfButton({
  resumo,
  porCategoria,
  graficosId,
}: {
  resumo: ResumoRelatorio;
  porCategoria: [string, number][];
  graficosId: string;
}) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function exportar() {
    setErro(null);
    setGerando(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const larguraPagina = doc.internal.pageSize.getWidth();
      const margem = 14;
      let y = margem;

      doc.setFontSize(16);
      doc.text("FinanceFlow — Relatório", margem, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(resumo.periodoLabel, margem, y);
      doc.setTextColor(0);
      y += 10;

      doc.setFontSize(12);
      doc.text("Resumo", margem, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Ganhos: ${formatarMoeda(resumo.ganhos)}`, margem, y);
      y += 5;
      doc.text(`Gastos: ${formatarMoeda(resumo.gastos)}`, margem, y);
      y += 5;
      doc.text(`Saldo: ${formatarMoeda(resumo.saldo)}`, margem, y);
      y += 10;

      doc.setFontSize(12);
      doc.text("Gastos por categoria", margem, y);
      y += 6;
      doc.setFontSize(10);
      if (porCategoria.length === 0) {
        doc.text("Nenhum gasto no período.", margem, y);
        y += 5;
      } else {
        for (const [categoria, valor] of porCategoria) {
          doc.text(categoria, margem, y);
          doc.text(formatarMoeda(valor), larguraPagina - margem, y, { align: "right" });
          y += 6;
        }
      }

      const elemento = document.getElementById(graficosId);
      if (elemento) {
        const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff" });
        const imagem = canvas.toDataURL("image/png");
        const larguraImagem = larguraPagina - margem * 2;
        const alturaImagem = (canvas.height * larguraImagem) / canvas.width;

        doc.addPage();
        doc.setFontSize(12);
        doc.text("Gráficos", margem, margem);
        doc.addImage(imagem, "PNG", margem, margem + 6, larguraImagem, alturaImagem);
      }

      doc.save(`financeflow-relatorio-${hojeISO()}.pdf`);
    } catch {
      setErro("Não foi possível gerar o PDF.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div>
      <button onClick={exportar} disabled={gerando} className="btn-primary w-full flex items-center justify-center gap-2">
        {gerando ? (
          "Gerando PDF..."
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exportar PDF
          </>
        )}
      </button>
      {erro && <p className="text-sm text-error mt-2">{erro}</p>}
    </div>
  );
}
