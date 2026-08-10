import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact/schema";

const valid = {
  nome: "Allan",
  email: "allan@example.com",
  empresa: "",
  tipoProjeto: "site",
  mensagem: "Mensagem suficientemente completa.",
  consentimento: true,
  website: "",
  turnstileToken: "token",
  requestId: "9b2c1b91-1f54-4c73-a61f-685ae16f90c7",
};
describe("contactSchema", () => {
  it("aceita payload válido", () =>
    expect(contactSchema.safeParse(valid).success).toBe(true));
  it("rejeita mensagem curta", () =>
    expect(
      contactSchema.safeParse({ ...valid, mensagem: "curta" }).success,
    ).toBe(false));
  it("rejeita consentimento ausente", () =>
    expect(
      contactSchema.safeParse({ ...valid, consentimento: false }).success,
    ).toBe(false));
});
