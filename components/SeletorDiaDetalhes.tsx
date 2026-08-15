"use client";

import { useRouter } from "next/navigation";

export default function SeletorDiaDetalhes({ data }: { data: string }) {
  const router = useRouter();

  return (
    <div className="card !p-4">
      <label className="label-field" htmlFor="dia-detalhes">
        Qual dia você quer ver?
      </label>
      <input
        id="dia-detalhes"
        type="date"
        value={data}
        onChange={(e) => e.target.value && router.push(`/detalhes-dia?data=${e.target.value}`)}
        className="input-field"
      />
    </div>
  );
}
