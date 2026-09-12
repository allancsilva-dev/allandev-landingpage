import { execFile, spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const elementKey = "element-6066-11e4-a52e-4f735466cecf";
type Capture = {
  file: string;
  path: string;
  viewport: Size;
  canvas?: Size;
  actions?: readonly string[];
};
type Size = { width: number; height: number };
type ProjectCapture = {
  baseUrl: string;
  demoMarker: string;
  captures: readonly Capture[];
  redactions?: readonly (readonly [string, string])[];
  cookieBootstrap?: boolean;
  publicOnly?: boolean;
};
const desktop = { width: 1600, height: 900 } as const;
const cover = { width: 1920, height: 1080 } as const;
const narrow = { width: 768, height: 900 } as const;

const projects = {
  "nexos-erp": {
    baseUrl: "http://localhost:3010",
    demoMarker: "Matriz",
    redactions: [
      [
        "Smoke fan-out notificacoes vencidas SMOKE-FAN...",
        "Licença mensal de software",
      ],
      ["VISTORIA-20260729 Vencida", "Serviço de infraestrutura"],
      ["Validacao modal Claude - editado", "Manutenção de equipamentos"],
      ["E2E-CSV-2019-20260727 Fornecedor 01", "Fornecedor Horizonte Demo"],
      ["VISTORIA-20260729 Contato", "Fornecedor Aurora Demo"],
      ["VISTORIA-20260729 Desp...", "Operações"],
      ["VISTORIA-20260729 Rec...", "Receita de serviços"],
      [
        "SMOKE-EA003-014-016-00.000.000/0001-00-01",
        "Despesa operacional demo 01",
      ],
      [
        "SMOKE-EA003-014-016-00.000.000/0001-00-02",
        "Despesa operacional demo 02",
      ],
      [
        "SMOKE-EA003-014-016-00.000.000/0001-00-03",
        "Despesa operacional demo 03",
      ],
    ],
    captures: [
      { file: "cover.webp", path: "/dashboard", viewport: cover },
      {
        file: "cash-flow.webp",
        path: "/financeiro/fluxo-caixa",
        viewport: desktop,
      },
      {
        file: "payables.webp",
        path: "/financeiro/contas-pagar",
        viewport: desktop,
      },
      {
        file: "approvals.webp",
        path: "/financeiro/aprovacoes",
        viewport: desktop,
      },
      {
        file: "reports-responsive.webp",
        path: "/financeiro/relatorios/dre",
        viewport: narrow,
        canvas: desktop,
      },
    ],
  },
  renowa: {
    baseUrl: "http://localhost:5173",
    demoMarker: "portfolio-demo@example.test",
    redactions: [
      ["1001 COISAS COMERCIO LTDA", "Horizonte Comércio Demo"],
      ["Cliente Smoke Test LTDA", "Cliente Aurora Demo"],
      ["Cliente Smoke Test", "Cliente Aurora Demo"],
      ["Cliente Teste LTDA", "Cliente Oficina Demo"],
      ["ROBERIO JOSE DOS SANTOS", "Fornecedor Demo"],
      [
        "VIC IMPORT, COMERCIO, IMPORTACAO E EXPORTACAO DE BRINQUEDOS E UTILIDADES EM GERAL LTDA",
        "Fornecedor Horizonte Demo",
      ],
      [
        "CAIXA ESCOLAR DA ESCOLA ESTADUAL DE ENSINO FUNDAMENTAL JOSEFINA JACQUES NORONHA",
        "Fornecedor Escola Demo",
      ],
    ],
    captures: [
      { file: "cover.webp", path: "/dashboard", viewport: cover },
      { file: "orders.webp", path: "/pedidos", viewport: desktop },
      { file: "billing.webp", path: "/faturamento", viewport: desktop },
      { file: "products.webp", path: "/produtos", viewport: desktop },
      {
        file: "orders-responsive.webp",
        path: "/pedidos/novo",
        viewport: narrow,
        canvas: desktop,
      },
    ],
  },
  "nexos-booking": {
    baseUrl: "http://localhost:3000",
    demoMarker: "Studio Demo",
    publicOnly: true,
    captures: [
      { file: "cover.webp", path: "/studio-demo", viewport: cover },
      {
        file: "booking-services.webp",
        path: "/studio-demo/agendar",
        viewport: desktop,
      },
      {
        file: "booking-professionals.webp",
        path: "/studio-demo/agendar",
        viewport: desktop,
        actions: ["Corte assinatura"],
      },
      {
        file: "booking-calendar.webp",
        path: "/studio-demo/agendar",
        viewport: desktop,
        actions: ["Corte assinatura", "Alex Demo"],
      },
      {
        file: "booking-responsive.webp",
        path: "/studio-demo/agendar",
        viewport: narrow,
        canvas: desktop,
      },
    ],
  },
  "gestor-financeiro": {
    baseUrl: "http://localhost:5173",
    demoMarker: "Portfólio Demo",
    captures: [
      { file: "cover.webp", path: "/dashboard", viewport: cover },
      { file: "dashboard.webp", path: "/dashboard", viewport: desktop },
    ],
  },
} as const satisfies Record<string, ProjectCapture>;
type ProjectSlug = keyof typeof projects;

function usage(message?: string): never {
  if (message) console.error(message);
  console.error(
    "Uso: pnpm capture:projects -- --project <nexos-erp|renowa|nexos-booking|gestor-financeiro> [--check]",
  );
  process.exit(1);
}
function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
async function command(file: string, args: string[]) {
  return (await exec(file, args, { maxBuffer: 1024 * 1024 })).stdout.trim();
}

class SafariDriver {
  private sessionId?: string;
  private process?: ChildProcess;
  constructor(private readonly endpoint: string) {}

  private async request(method: string, route: string, body?: unknown) {
    const response = await fetch(`${this.endpoint}${route}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json()) as {
      value?: unknown;
      sessionId?: string;
    };
    if (!response.ok)
      throw new Error(
        `SafariDriver ${method} ${route}: ${JSON.stringify(result.value)}`,
      );
    return result;
  }
  async start() {
    try {
      await this.request("GET", "/status");
    } catch {
      const port = new URL(this.endpoint).port || "4444";
      this.process = spawn("/usr/bin/safaridriver", ["-p", port], {
        stdio: "ignore",
      });
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        try {
          await this.request("GET", "/status");
          break;
        } catch {
          if (attempt === 39) throw new Error("SafariDriver não iniciou.");
        }
      }
    }
    const result = await this.request("POST", "/session", {
      capabilities: { alwaysMatch: { browserName: "safari" } },
    });
    const value = result.value as { sessionId?: string } | undefined;
    this.sessionId = result.sessionId ?? value?.sessionId;
    if (!this.sessionId)
      throw new Error("SafariDriver não devolveu sessionId.");
  }
  private route(suffix: string) {
    if (!this.sessionId) throw new Error("SafariDriver sem sessão.");
    return `/session/${this.sessionId}${suffix}`;
  }
  async navigate(url: string) {
    await this.request("POST", this.route("/url"), { url });
  }
  async execute<T>(script: string) {
    const result = await this.request("POST", this.route("/execute/sync"), {
      script,
      args: [],
    });
    return result.value as T;
  }
  async executeAsync<T>(script: string) {
    const result = await this.request("POST", this.route("/execute/async"), {
      script,
      args: [],
    });
    return result.value as T;
  }
  async currentUrl() {
    return String((await this.request("GET", this.route("/url"))).value);
  }
  async find(selector: string) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const result = await this.request("POST", this.route("/element"), {
          using: "css selector",
          value: selector,
        });
        const id = (result.value as Record<string, string>)[elementKey];
        if (id) return id;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    throw new Error(`Elemento não encontrado: ${selector}`);
  }
  async type(element: string, text: string) {
    await this.request("POST", this.route(`/element/${element}/value`), {
      text,
      value: [...text],
    });
  }
  async click(element: string) {
    await this.request("POST", this.route(`/element/${element}/click`), {});
  }
  async addCookie(cookie: {
    name: string;
    value: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
  }) {
    await this.request("POST", this.route("/cookie"), { cookie });
  }
  async viewport(width: number, height: number) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const size = await this.execute<{
        innerWidth: number;
        innerHeight: number;
        outerWidth: number;
        outerHeight: number;
      }>("return {innerWidth,innerHeight,outerWidth,outerHeight}");
      await this.request("POST", this.route("/window/rect"), {
        x: 0,
        y: 40,
        width: size.outerWidth + width - size.innerWidth,
        height: size.outerHeight + height - size.innerHeight,
      });
    }
  }
  async screenshot(file: string) {
    const result = await this.request("GET", this.route("/screenshot"));
    await writeFile(file, Buffer.from(String(result.value), "base64"));
  }
  async close() {
    if (this.sessionId)
      await this.request("DELETE", `/session/${this.sessionId}`).catch(
        () => undefined,
      );
    this.process?.kill("SIGTERM");
  }
}

async function waitForPage(driver: SafariDriver, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await driver.execute<{ ready: string; text: string }>(
      "return {ready:document.readyState,text:(document.body?.innerText||'').slice(0,10000)}",
    );
    if (state.ready === "complete") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return state;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Página não ficou pronta.");
}

async function waitForMarker(driver: SafariDriver, marker: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const text = await driver.execute<string>(
      "return (document.body?.innerText||'').slice(0,10000)",
    );
    if (text.includes(marker)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await driver.screenshot("/private/tmp/allandev-capture-debug.png");
  throw new Error(
    `Marcador demo "${marker}" ausente em ${await driver.currentUrl()}. Captura recusada.`,
  );
}

async function authenticate(
  driver: SafariDriver,
  baseUrl: string,
  cookieBootstrap = false,
) {
  await driver.navigate(baseUrl);
  await waitForPage(driver);
  if (!/\/login(?:[/?#]|$)/.test(await driver.currentUrl())) return;
  const email = process.env.CAPTURE_EMAIL;
  const password = process.env.CAPTURE_PASSWORD;
  if (email && password) {
    if (cookieBootstrap) {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok)
        throw new Error(`Login HTTP demo falhou: ${response.status}`);
      for (const header of response.headers.getSetCookie()) {
        const [pair, ...attributes] = header
          .split(";")
          .map((part) => part.trim());
        const separator = pair?.indexOf("=") ?? -1;
        if (!pair || separator < 1) continue;
        const pathAttribute = attributes.find((item) => /^path=/i.test(item));
        await driver.addCookie({
          name: pair.slice(0, separator),
          value: pair.slice(separator + 1),
          path: pathAttribute?.slice(5) ?? "/",
          httpOnly: attributes.some((item) => /^httponly$/i.test(item)),
          secure: attributes.some((item) => /^secure$/i.test(item)),
        });
      }
      const refreshStatus = await driver.executeAsync<number>(
        "const done=arguments[arguments.length-1];fetch('/api/v1/auth/refresh',{method:'POST',credentials:'include',headers:{'X-CSRF':'1','X-Request-Id':crypto.randomUUID()}}).then(r=>done(r.status)).catch(()=>done(0))",
      );
      if (refreshStatus !== 200) {
        throw new Error(`Bootstrap HTTP demo falhou: ${refreshStatus}`);
      }
      await driver.navigate(`${baseUrl}/dashboard`);
      await waitForPage(driver);
    } else {
      await driver.type(await driver.find('input[type="email"]'), email);
      await driver.click(await driver.find('button[type="submit"]'));
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const state = await driver.execute<{
          password: boolean;
          context: boolean;
        }>(
          "return {password:!!document.querySelector('input[type=password]'),context:document.body.innerText.includes('Selecione o contexto de acesso')}",
        );
        if (state.password) break;
        if (state.context) {
          await driver.click(await driver.find('button[type="submit"]'));
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      await driver.type(await driver.find('input[type="password"]'), password);
      await driver.click(await driver.find('button[type="submit"]'));
    }
  } else {
    console.log(
      "Faça login na janela de automação do Safari; aguardando até 2 minutos.",
    );
  }
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (!/\/login(?:[/?#]|$)/.test(await driver.currentUrl())) {
      await waitForPage(driver);
      const expired = await driver.execute<boolean>(
        "return document.body.innerText.includes('Session expired') || document.body.innerText.includes('Sessão expirada')",
      );
      if (expired) {
        await driver.click(await driver.find("button"));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Login demo não concluído.");
}

async function renderCapture(
  driver: SafariDriver,
  capture: Capture,
  output: string,
  scratch: string,
  redactions: readonly (readonly [string, string])[] = [],
) {
  await driver.viewport(capture.viewport.width, capture.viewport.height);
  await driver.execute(
    "let s=document.getElementById('__portfolio_capture');if(!s){s=document.createElement('style');s.id='__portfolio_capture';s.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}.tsqd-parent-container{display:none!important}';document.head.append(s)}window.scrollTo(0,0);return true",
  );
  await driver.execute(
    `const replacements=${JSON.stringify(redactions)};const sanitize=(value)=>{let next=value;for(const [from,to] of replacements)next=next.replaceAll(from,to);next=next.replace(/[\\w.+-]+@(?!example\\.test)[\\w.-]+\\.[A-Za-z]{2,}/g,'demo@allandev.test').replace(/\\b\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}\\b/g,'00.000.000/0001-00').replace(/\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b/g,'000.000.000-00').replace(/\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}/g,'(11) 00000-0000');return next};const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.nodeValue=sanitize(walker.currentNode.nodeValue||'');for(const input of document.querySelectorAll('input,textarea'))input.value=sanitize(input.value);return true`,
  );
  const remainingPrivateText = await driver.execute<string[]>(
    `const originals=${JSON.stringify(redactions.map(([from]) => from))};const text=document.body?.innerText||'';const unsafe=originals.filter(value=>text.includes(value));for(const match of text.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)){if(!match[0].endsWith('@example.test')&&!match[0].endsWith('@allandev.test'))unsafe.push(match[0])}return [...new Set(unsafe)]`,
  );
  if (remainingPrivateText.length)
    throw new Error(
      `Captura recusada; texto privado ainda visível: ${remainingPrivateText.join(", ")}`,
    );
  await new Promise((resolve) => setTimeout(resolve, 250));
  const raw = path.join(scratch, "raw.png");
  const sized = path.join(scratch, "sized.png");
  await driver.screenshot(raw);
  await command("/usr/bin/sips", [
    "--resampleHeightWidth",
    String(capture.viewport.height),
    String(capture.viewport.width),
    raw,
    "--out",
    sized,
  ]);
  if (capture.canvas) {
    await command("/usr/bin/sips", [
      "--padToHeightWidth",
      String(capture.canvas.height),
      String(capture.canvas.width),
      "--padColor",
      "0A0F1A",
      sized,
      "--out",
      sized,
    ]);
  }
  await command("/opt/homebrew/bin/cwebp", [
    "-quiet",
    "-mt",
    "-q",
    "88",
    "-metadata",
    "none",
    sized,
    "-o",
    output,
  ]);
  if ((await readFile(output)).byteLength < 10_000)
    throw new Error(`Captura pequena demais: ${capture.file}`);
}

async function main() {
  const slug = argument("--project") as ProjectSlug | undefined;
  if (!slug || !(slug in projects)) usage("Projeto inválido ou ausente.");
  const project = projects[slug];
  const baseUrl = process.env.CAPTURE_BASE_URL ?? project.baseUrl;
  const marker = process.env.CAPTURE_DEMO_MARKER ?? project.demoMarker;
  await command("/opt/homebrew/bin/cwebp", ["-version"]);
  const driver = new SafariDriver(
    process.env.SAFARIDRIVER_URL ?? "http://127.0.0.1:4444",
  );
  await driver.start();
  try {
    if ("publicOnly" in project && project.publicOnly) {
      await driver.navigate(
        new URL(project.captures[0].path, baseUrl).toString(),
      );
    } else {
      await authenticate(
        driver,
        baseUrl,
        "cookieBootstrap" in project && project.cookieBootstrap === true,
      );
    }
    await waitForPage(driver);
    await waitForMarker(driver, marker);
    if (process.argv.includes("--check")) {
      console.log(`${slug}: Safari, sessão demo e ferramentas prontos.`);
      return;
    }
    const outputDirectory = path.join(
      process.cwd(),
      "public",
      "images",
      "projects",
      slug,
    );
    await mkdir(outputDirectory, { recursive: true });
    const scratch = await mkdtemp(path.join(tmpdir(), `allandev-${slug}-`));
    try {
      for (const item of project.captures) {
        await driver.navigate(new URL(item.path, baseUrl).toString());
        await waitForPage(driver);
        if (
          !("publicOnly" in project) &&
          /\/login(?:[/?#]|$)/.test(await driver.currentUrl())
        )
          throw new Error(`Sessão expirou em ${item.path}.`);
        for (const label of "actions" in item ? item.actions : []) {
          const clicked = await driver.execute<boolean>(
            `const label=${JSON.stringify(label)};const target=[...document.querySelectorAll('button,a')].find(el=>el.textContent?.includes(label));if(!target)return false;target.click();return true`,
          );
          if (!clicked)
            throw new Error(`Ação pública não encontrada: ${label}`);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
        await renderCapture(
          driver,
          item,
          path.join(outputDirectory, item.file),
          scratch,
          "redactions" in project ? project.redactions : [],
        );
        console.log(`${slug}: ${item.file}`);
      }
    } finally {
      await rm(scratch, { recursive: true, force: true });
    }
  } finally {
    await driver.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
