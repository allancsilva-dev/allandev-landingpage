import { describe, expect, it } from "vitest";
import { codeShotSchema } from "@/lib/content/code-shots";

const validShot = {
  id: "nexos-ordem-dos-guards",
  projeto: "nexos-erp",
  sourceRepo: "nexos-erp",
  path: "backend/src/common/policy/app-guard-order.validator.ts",
  ref: "98088a521efbedbbdad8aec2dda2647f80e55ba0",
  linhas: [13, 47],
  expectedHash: `sha256:${"a".repeat(64)}`,
  language: "ts",
  titulo: "app-guard-order.validator.ts",
  descricao:
    "Trecho curado que mostra a decisão de arquitetura sem transcrever o sistema inteiro, com contexto suficiente para avaliação técnica.",
};

describe("codeShotSchema", () => {
  it("aceita uma entrada válida", () => {
    expect(codeShotSchema.safeParse(validShot).success).toBe(true);
  });

  // A branch would let the published image drift away from the reviewed
  // snippet without anything failing.
  it("recusa ref que não seja SHA de commit", () => {
    for (const ref of ["main", "HEAD", "98088a5"])
      expect(codeShotSchema.safeParse({ ...validShot, ref }).success).toBe(
        false,
      );
  });

  it("recusa sourceRepo com travessia de caminho", () => {
    for (const sourceRepo of ["../segredo", "/etc", "nexos_erp"])
      expect(
        codeShotSchema.safeParse({ ...validShot, sourceRepo }).success,
      ).toBe(false);
  });

  it("exige region ou linhas, nunca os dois", () => {
    const semAncora = { ...validShot, linhas: undefined };
    expect(codeShotSchema.safeParse(semAncora).success).toBe(false);
    expect(
      codeShotSchema.safeParse({ ...validShot, region: "code-shot:x" }).success,
    ).toBe(false);
    expect(
      codeShotSchema.safeParse({ ...semAncora, region: "code-shot:x" }).success,
    ).toBe(true);
  });

  it("recusa intervalo de linhas invertido", () => {
    expect(
      codeShotSchema.safeParse({ ...validShot, linhas: [40, 10] }).success,
    ).toBe(false);
  });

  it("exige descrição com contexto, não um rótulo", () => {
    expect(
      codeShotSchema.safeParse({ ...validShot, descricao: "Um guard." })
        .success,
    ).toBe(false);
  });
});
