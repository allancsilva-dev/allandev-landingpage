import { expect, test } from "@playwright/test";

async function startHome(page: import("@playwright/test").Page) {
  await page.goto("/");
  const skip = page.getByRole("button", { name: "PULAR" });
  if (await skip.isVisible()) await skip.click();
}

test("home carrega com H1, form e navegação", async ({ page }) => {
  await startHome(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "SISTEMAS QUE AGUENTAM PRODUÇÃO",
  );
  await expect(page.getByRole("form")).toBeVisible();
});

test("home tem seções completas", async ({ page }) => {
  await startHome(page);
  await expect(page.locator("#sobre")).toBeVisible();
  await expect(page.locator("#processo")).toBeVisible();
  await expect(page.locator("#projetos")).toBeVisible();
  await expect(page.locator("#servicos")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
  await expect(page.locator("#contato")).toBeVisible();
});

test("home exibe teasers privados sem publicar os cases", async ({ page }) => {
  await startHome(page);
  await expect(page.getByText("Nexos ERP", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Renowa" })).toBeVisible();
  await expect(page.getByText("PEDIR APRESENTAÇÃO")).toHaveCount(2);
  await expect(page.locator(".arcade-project-select")).toHaveCount(0);

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
  await startHome(page);
  await expect(page.getByText(/análise inicial é gratuita/)).toBeVisible();
  const second = page.getByRole("button", { name: /QUAL O PRAZO/ });
  await second.click();
  await expect(page.getByText(/São faixas honestas/)).toBeVisible();
});

test("menu abre com nova anatomia e restaura o foco ao fechar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await startHome(page);
  const menuBtn = page.getByRole("button", { name: /MENU/ });
  await expect(menuBtn).toBeVisible();
  await menuBtn.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("navigation").getByRole("link")).toHaveText([
    "Projetos",
    "Sobre",
    "Processo",
    "Serviços",
    "Contato",
  ]);
  await expect(dialog.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "target",
    "_blank",
  );
  await expect(dialog).not.toContainText(/PAUSE|MAPA|HOME/);
  await expect(
    dialog.getByRole("button", { name: "Fechar menu" }),
  ).toBeFocused();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await dialog.getByRole("button", { name: "Fechar menu" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(menuBtn).toBeFocused();
});

test("menu fecha com Escape e ao escolher um destino", async ({ page }) => {
  await startHome(page);
  const menuBtn = page.getByRole("button", { name: /MENU/ });
  await menuBtn.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(menuBtn).toBeFocused();
  await menuBtn.click();
  await page.getByRole("dialog").getByRole("link", { name: "Sobre" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page).toHaveURL(/#sobre$/);
});

test("menu não cria overflow em viewport de 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await startHome(page);
  await page.getByRole("button", { name: /MENU/ }).click();
  const dimensions = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    dialog: document.querySelector("dialog")?.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.dialog).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test("home não cria overflow horizontal em 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await startHome(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("preferência de movimento reduzido mantém entrada estática", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "PULAR" })).toHaveCount(0);
  await expect(page.locator('[aria-label="Ligar som"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("boot do hero aparece só uma vez por sessão e pode ser pulado", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "PULAR" })).toBeVisible();
  await page.getByRole("button", { name: "PULAR" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "PULAR" })).toHaveCount(0);
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
