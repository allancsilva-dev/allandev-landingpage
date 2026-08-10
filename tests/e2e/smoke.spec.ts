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

test("home exibe teasers privados sem publicar os cases", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Nexos ERP", { exact: true })).toBeVisible();
  await expect(page.getByText("Renowa", { exact: true })).toBeVisible();
  await expect(page.getByText("PEDIR APRESENTAÇÃO")).toHaveCount(2);

  await page.goto("/projetos/nexos-erp");
  await expect(page.getByText("ERRO 404")).toBeVisible();
});

test("conteúdo principal permanece disponível sem JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Nexos ERP", { exact: true })).toBeVisible();
  await context.close();
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

test("home não cria overflow horizontal em 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("preferência de movimento reduzido pula intro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".preloader")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ligar som" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
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
