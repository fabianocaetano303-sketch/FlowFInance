import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS } from "@/lib/types";

export const runtime = "nodejs";

const MEDIA_TYPES_SUPORTADOS = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { imagem, mediaType } = await request.json();

  if (!imagem || typeof imagem !== "string") {
    return NextResponse.json({ erro: "Imagem não enviada." }, { status: 400 });
  }

  const tipoMidia = MEDIA_TYPES_SUPORTADOS.includes(mediaType) ? mediaType : "image/jpeg";

  try {
    const client = new Anthropic();

    const mensagem = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              itens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    descricao: { type: "string" },
                    valor: { type: "number" },
                    categoria: { type: "string", enum: CATEGORIAS },
                  },
                  required: ["descricao", "valor", "categoria"],
                  additionalProperties: false,
                },
              },
            },
            required: ["itens"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: tipoMidia, data: imagem },
            },
            {
              type: "text",
              text: `Esta imagem é uma nota fiscal, recibo ou cupom de compra brasileiro. Extraia cada item comprado como um gasto separado.

Para cada item retorne:
- descricao: nome curto do item (ou do estabelecimento, se não for possível separar por item)
- valor: valor em reais (número, sem "R$")
- categoria: escolha a categoria mais apropriada dentre exatamente estas opções: ${CATEGORIAS.join(", ")}. Use "Alimentação" para itens de mercado, restaurante ou lanche. Use "Higiene" para produtos de higiene pessoal ou limpeza. Use "Gasto Idiota" apenas para itens claramente supérfluos (doces, bebidas alcoólicas avulsas, itens de impulso). Use "Contas" para serviços e contas fixas. Use "Dívida" ou "Emergência" apenas quando explicitamente aplicável.

Se não for possível separar por item individual, retorne um único item com o valor total da nota e a descrição do estabelecimento.`,
            },
          ],
        },
      ],
    });

    const blocoTexto = mensagem.content.find((bloco) => bloco.type === "text");
    if (!blocoTexto || blocoTexto.type !== "text") {
      return NextResponse.json({ erro: "Não foi possível interpretar a nota fiscal." }, { status: 502 });
    }

    const dados = JSON.parse(blocoTexto.text);
    return NextResponse.json({ itens: dados.itens ?? [] });
  } catch (erro) {
    console.error("Erro ao processar nota fiscal:", erro);
    return NextResponse.json({ erro: "Erro ao processar a nota fiscal." }, { status: 500 });
  }
}
