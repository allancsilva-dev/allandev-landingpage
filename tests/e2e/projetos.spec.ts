import { expect, test, type Page } from "@playwright/test";

/** Seeding the flag beats clicking through the boot, which self-dismisses. */
async function openHome(page: Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("allandev-hero-boot", "1"),
  );
  await page.goto("/");
}

test("card de projeto leva ao case", async ({ page }) => {
  await openHome(page);
  await page.getByRole("link", { name: "Nexos ERP" }).first().click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Nexos ERP" }),
  ).toBeVisible();
});

test("índice publica os quatro cases e a home mantém dois destaques", async ({
  page,
}) => {
  await page.goto("/projetos");
  for (const title of [
    "Nexos ERP",
    "Renowa",
    "Nexos Booking",
    "Gestor Financeiro",
  ]) {
    await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
  }

  await openHome(page);
  const projects = page.locator("#projetos");
  await expect(projects.getByRole("link", { name: "Nexos ERP" })).toBeVisible();
  await expect(projects.getByRole("link", { name: "Renowa" })).toBeVisible();
  await expect(
    projects.getByRole("link", { name: "Nexos Booking" }),
  ).toHaveCount(0);
  await expect(
    projects.getByRole("link", { name: "Gestor Financeiro" }),
  ).toHaveCount(0);
});

// The whole point of `preload="none"` plus a play button: a visitor who never
// asks for the demo never pays for it.
test("nenhum vídeo é baixado antes do clique em reproduzir", async ({
  page,
}) => {
  const mediaRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(request.url()))
      mediaRequests.push(request.url());
  });

  await openHome(page);
  await page.locator("#projetos").scrollIntoViewIfNeeded();
  expect(mediaRequests).toEqual([]);

  const play = page.getByRole("button", { name: /^Reproduzir demonstração/ });
  // Skips itself the day a case ships with real media, without a code change.
  test.skip(
    (await play.count()) === 0,
    "nenhum case publicado tem vídeo ainda",
  );

  await play.first().click();
  await expect
    .poll(() => mediaRequests.length, { timeout: 5000 })
    .toBeGreaterThan(0);
});

test("vitrine de código navega por teclado e abre zoom", async ({ page }) => {
  await openHome(page);

  const tabs = page.getByRole("tab");
  await expect(tabs.first()).toBeVisible();
  const total = await tabs.count();
  expect(total).toBeGreaterThan(1);

  await tabs.first().focus();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(total - 1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

  await page
    .getByRole("button", { name: /^Ampliar imagem de código/ })
    .first()
    .click();
  const zoom = page.getByRole("dialog", { name: "Visualização ampliada" });
  await expect(zoom).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(zoom).toBeHidden();
});

test("galeria do case abre e fecha por teclado", async ({ page }) => {
  await page.goto("/projetos/nexos-erp");
  const firstImage = page.getByRole("button", { name: /^Ampliar:/ }).first();
  await firstImage.scrollIntoViewIfNeeded();
  await firstImage.click();

  const zoom = page.getByRole("dialog", { name: "Visualização ampliada" });
  await expect(zoom).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(zoom.getByText("2 / 4")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(zoom).toBeHidden();
});

test("case mostra imagem de código com moldura e direitos", async ({
  page,
}) => {
  await page.goto("/projetos/nexos-erp");
  await expect(
    page.getByRole("img", { name: /app-guard-order\.validator\.ts/ }),
  ).toBeVisible();
  await expect(
    page
      .getByText(/código proprietário, exibido para avaliação técnica/)
      .first(),
  ).toBeVisible();
});
