import { expect, test } from "@playwright/test";

test("home carrega com H1, form e navegação", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "SISTEMAS QUE AGUENTAM",
  );
  await expect(page.getByRole("form")).toBeVisible();
});

test("home tem seções completas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#sobre")).toBeVisible();
  await expect(page.locator("#processo")).toBeVisible();
  await expect(page.locator("#projetos")).toBeVisible();
  await expect(page.locator("#servicos")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
  await expect(page.locator("#contato")).toBeVisible();
});

test("faq accordion alterna itens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/análise inicial é gratuita/)).toBeVisible();
  const second = page.getByRole("button", { name: /QUAL O PRAZO/ });
  await second.click();
  await expect(page.getByText(/São faixas honestas/)).toBeVisible();
});

test("menu mobile abre e fecha", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await page.goto("/");
  const menuBtn = page.getByRole("button", { name: /MENU/ });
  await expect(menuBtn).toBeVisible();
  await menuBtn.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /FECHAR/ }).click();
  await expect(dialog).not.toBeVisible();
});

test("rotas públicas e erro", async ({ page }) => {
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Política de privacidade",
  );
  await page.goto("/nao-existe");
  await expect(page.getByText("ERRO 404")).toBeVisible();
});

test("design system page carrega", async ({ page }) => {
  await page.goto("/dev-design-system");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Design System",
  );
  await expect(page.getByText("18.1:1")).toBeVisible();
  await expect(page.getByText("Paleta")).toBeVisible();
});

test("healthcheck não vaza detalhes", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(await response.json()).toEqual({ status: "ok" });
});

test("projetos page mostra estado vazio", async ({ page }) => {
  await page.goto("/projetos");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PROJETOS");
});
