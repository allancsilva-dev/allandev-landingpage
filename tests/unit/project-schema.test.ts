import { describe, expect, it } from "vitest";
import { projectFrontmatterSchema } from "@/lib/content/schema";

const validProject = {
  titulo: "Projeto válido",
  resumo:
    "Resumo público suficientemente detalhado para validar o teaser sem expor informações sensíveis.",
  status: "draft",
  destaque: null,
  periodo: { inicio: "2026-01", fim: null },
  papel: "Desenvolvedor full-stack",
  stack: ["TypeScript"],
  capa: {
    src: "/images/project-placeholder.svg",
    alt: "Capa abstrata do projeto",
  },
  atualizadoEm: "2026-08-10",
};

describe("projectFrontmatterSchema homeTeaser", () => {
  it("aceita teaser de draft com variante conhecida", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...validProject,
      homeTeaser: {
        order: 1,
        label: "Case em preparação",
        visualVariant: "nexos",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejeita variante visual desconhecida", () => {
    const result = projectFrontmatterSchema.safeParse({
      ...validProject,
      homeTeaser: {
        order: 1,
        label: "Case em preparação",
        visualVariant: "generico",
      },
    });
    expect(result.success).toBe(false);
  });
});
