import { expect, test } from "@playwright/test";

async function startHome(page: import("@playwright/test").Page) {
  await page.goto("/");
  const skip = page.getByRole("button", { name: /PRESS START/ });
  if (await skip.isVisible()) await skip.click();
}

test("home carrega com H1, form e navegação", async ({ page }) => {
  await startHome(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "SISTEMAS QUE AGUENTAM PRODUÇÃO",
  );
  await expect(page.getByRole("form")).toBeVisible();
});

test("nav desktop aparece em 1280 e marca a seção ativa", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await startHome(page);
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeVisible();
  await expect(page.getByRole("button", { name: /MENU/ })).toBeHidden();
  await expect(page.getByRole("link", { name: "FALAR COMIGO" })).toBeVisible();

  await page.locator("#servicos").scrollIntoViewIfNeeded();
  await expect(nav.getByRole("link", { name: "Serviços" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test("rodapé é landmark fora do main", async ({ page }) => {
  await startHome(page);
  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();
  await expect(
    footer.getByRole("navigation", { name: "Rodapé" }),
  ).toBeVisible();
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

test("home lista os cases publicados e leva à página de cada um", async ({
  page,
}) => {
  await startHome(page);
  await expect(page.getByRole("heading", { name: "Nexos ERP" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Renowa" })).toBeVisible();

  // A published case links to its own route; a draft would fall back to
  // `/#contato`, because generateStaticParams never emits it.
  const teaserLinks = page.locator(".project-card a");
  await expect(teaserLinks).toHaveCount(2);
  expect(
    await teaserLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    ),
  ).toEqual(["/projetos/nexos-erp", "/projetos/renowa"]);

  await page.goto("/projetos/nao-existe");
  await expect(page.getByText("ERRO 404")).toBeVisible();
});

test("conteúdo principal permanece disponível sem JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nexos ERP" })).toBeVisible();
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
    "Código",
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
  // Below 1024px the overlay *is* the navigation; above it the desktop nav
  // takes over and the MENU button is intentionally gone.
  await page.setViewportSize({ width: 480, height: 800 });
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
  await expect(page.getByRole("button", { name: /PRESS START/ })).toHaveCount(
    0,
  );
  await expect(page.locator('[aria-label="Ligar som"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  // Nothing may be hidden waiting for a scroll that reduced motion suppresses.
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(page.locator("#faq h2")).toBeVisible();
});

test("reveal esconde só o que está abaixo da dobra e revela ao rolar", async ({
  page,
}) => {
  await page.goto("/");
  const skip = page.getByRole("button", { name: /PRESS START/ });
  if (await skip.isVisible()) await skip.click();

  // Retries until hydration has run, then checks what it chose to hide.
  await expect(page.locator('[data-reveal="pending"]').first()).toBeAttached();
  // The hero is on screen at load, so it must never be in the hidden state.
  await expect(page.locator(".home-hero [data-reveal]")).toHaveCount(0);

  const faqHeading = page.locator("#faq .section-heading");
  await faqHeading.scrollIntoViewIfNeeded();
  await expect(faqHeading).toHaveAttribute("data-reveal", "in");
  await expect(faqHeading).toHaveCSS("opacity", "1");
});

test("HTML servido não esconde conteúdo esperando animação", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toContain("data-reveal");
  expect(html).not.toContain("opacity:0");
});

test("boot do hero aparece só uma vez por sessão e pode ser pulado", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /PRESS START/ })).toBeVisible();
  await page.getByRole("button", { name: /PRESS START/ }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /PRESS START/ })).toHaveCount(
    0,
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
  await expect(page.getByText("Paleta")).toBeVisible();
  // Every listed pair must report a passing ratio, whatever the numbers are.
  await expect(page.locator(".ds-ratio-fail")).toHaveCount(0);
  expect(await page.locator(".ds-ratio-pass").count()).toBeGreaterThan(0);
});

test("privacidade publica apenas texto destinado ao visitante", async ({
  page,
}) => {
  await page.goto("/privacidade");
  await expect(
    page.getByRole("heading", { name: "Política de privacidade" }),
  ).toBeVisible();
  await expect(page.getByText(/identificador derivado/)).toBeVisible();
  await expect(page.getByText(/revisão jurídica/i)).toHaveCount(0);
});

test("healthcheck não vaza detalhes", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(await response.json()).toEqual({ status: "ok" });
});

test("projetos page lista os cases publicados", async ({ page }) => {
  await page.goto("/projetos");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PROJETOS");
  await expect(page.locator(".project-card")).toHaveCount(4);
  await expect(page.locator(".empty-projects")).toHaveCount(0);
});
