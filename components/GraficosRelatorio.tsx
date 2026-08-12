"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarMoeda } from "@/lib/financas";
import type { PontoDiario } from "@/lib/financas";

const CORES = ["#06B6D4", "#10B981", "#F97316", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899"];
const COR_GRADE = "#334155";
const COR_TEXTO = "#94A3B8";
const TOOLTIP_STYLE = { backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" };

export default function GraficosRelatorio({
  porCategoria,
  serie,
}: {
  porCategoria: [string, number][];
  serie: PontoDiario[];
}) {
  const dadosPizza = porCategoria.map(([categoria, valor]) => ({ name: categoria, value: valor }));
  const dadosBarra = serie.map((p) => ({ dia: p.dia, Ganhos: p.ganhos, Gastos: p.gastos }));
  const dadosLinha = serie.map((p) => ({ dia: p.dia, Saldo: p.saldoAcumulado }));

  return (
    <div className="space-y-4">
      <div className="card !p-5 space-y-3">
        <p className="text-sm font-semibold text-on-surface">Gastos por categoria</p>
        {dadosPizza.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Nenhum gasto no período.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(d) => d.name}
                  stroke="#0F172A"
                >
                  {dadosPizza.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatarMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card !p-5 space-y-3">
        <p className="text-sm font-semibold text-on-surface">Ganhos vs Gastos por dia</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosBarra}>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_GRADE} />
              <XAxis dataKey="dia" fontSize={11} stroke={COR_TEXTO} tick={{ fill: COR_TEXTO }} />
              <YAxis fontSize={11} stroke={COR_TEXTO} tick={{ fill: COR_TEXTO }} />
              <Tooltip formatter={(v: any) => formatarMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: COR_TEXTO, fontSize: 12 }} />
              <Bar dataKey="Ganhos" fill="#10B981" />
              <Bar dataKey="Gastos" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card !p-5 space-y-3">
        <p className="text-sm font-semibold text-on-surface">Evolução do saldo no mês</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_GRADE} />
              <XAxis dataKey="dia" fontSize={11} stroke={COR_TEXTO} tick={{ fill: COR_TEXTO }} />
              <YAxis fontSize={11} stroke={COR_TEXTO} tick={{ fill: COR_TEXTO }} />
              <Tooltip formatter={(v: any) => formatarMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="Saldo" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
