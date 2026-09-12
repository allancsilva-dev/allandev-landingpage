import { expect, test, type Page } from "@playwright/test";

/** Seeding the flag beats clicking through the boot, which self-dismisses. */
async function openHome(page: Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("allandev-hero-boot", "1"),
  );
  await page.goto("/");
}

async function fillContactForm(page: Page) {
  await openHome(page);
  await page.getByLabel("Nome").fill("Allan Teste");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Tipo de projeto").selectOption("sistema-web");
  await page
    .getByLabel("Mensagem", { exact: true })
    .fill("Preciso de um sistema web com backend e banco de dados.");
  await page.getByRole("checkbox").check();
}

test("envio bem-sucedido mostra confirmação, não erro", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 200, json: { ok: true } }),
  );
  await fillContactForm(page);
  await page.getByRole("button", { name: "ENVIAR MENSAGEM" }).click();

  await expect(
    page.getByText("MENSAGEM ENVIADA", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".form-message.error")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /ENVIAR OUTRA/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("");
});

test("falha no envio oferece canal alternativo e preserva os dados", async ({
  page,
}) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      json: { ok: false, code: "SERVICE_UNAVAILABLE" },
    }),
  );
  await fillContactForm(page);
  await page.getByRole("button", { name: "ENVIAR MENSAGEM" }).click();

  const alert = page.locator(".form-message.error");
  await expect(alert).toBeVisible();
  await expect(
    alert.getByRole("link", { name: "allan@nexostech.com.br" }),
  ).toBeVisible();
  await expect(page.getByText("MENSAGEM ENVIADA", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Nome")).toHaveValue("Allan Teste");
});

test("campos obrigatórios bloqueiam o envio", async ({ page }) => {
  let posted = false;
  await page.route("**/api/contact", (route) => {
    posted = true;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await openHome(page);
  await page.getByRole("button", { name: "ENVIAR MENSAGEM" }).click();

  expect(posted).toBe(false);
  await expect(page.getByLabel("Nome")).toHaveJSProperty(
    "validity.valid",
    false,
  );
});
