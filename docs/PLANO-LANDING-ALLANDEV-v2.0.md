# Plano de Arquitetura — Landing Page / Portfólio Allan Carvalho

**Versão:** 2.1
**Autor:** Allan Carvalho
**Escopo:** landing page profissional + paginas individuais de projeto + vitrine de codigo de repositorios privados
**Hospedagem:** VPS propria (Hostinger)
**Substitui:** `PLANO-LANDING-ALLANDEV-v1.0.md`

---

## Atualizacao operacional v2.1

- Aplicacao usa porta `4000` em desenvolvimento e no container; Compose publica somente `127.0.0.1:4000`.
- Nginx ja instalado no host substitui Caddy e recebe trafego publico somente em `80/443`, atras da Cloudflare.
- Rate limit v1 usa Cloudflare/Nginx mais mapa local limitado por TTL. Uma interface permite Redis quando houver mais de uma replica.
- Next.js fica na ultima versao corrigida da linha 16; Turbopack atende desenvolvimento e webpack estabiliza o build de producao ate nova validacao.
- `docs/muniz-dev-landing-page-main` permanece apenas referencia local e nao entra no Git, build ou Docker.

---

## Changelog v1.0 → v2.0

| # | Mudanca | Motivo |
|---|---|---|
| 1 | Escopo consolidado como **portfolio pessoal multipagina** | Nexos Tech e Muniz sao referencias, nao produto final |
| 2 | Home + catalogo + template automatico de case | Cada projeto precisa de apresentacao rica propria |
| 3 | V1 fixada em **Nexos ERP e Renowa** | Dois cases completos validam o sistema antes de ampliar catalogo |
| 4 | Paleta passa a vir do logo Nexos Tech presente em `docs/` | Azul, ciano, violeta e magenta tem origem visual objetiva |
| 5 | Tokens renomeados de `--nx-*` para `--allan-*` | Identidade principal e Allan/ALLANDEV |
| 6 | Stack atualizada para Next.js 16, React 19.2, Node 24 LTS e Tailwind v4 | Versoes estaveis e compativeis em agosto de 2026 |
| 7 | Codigo privado passa a ser exibido como **imagem gerada no CI** | Evita enviar fonte como texto, mantendo limite de OCR/download explicito |
| 8 | `410 Gone` removido; conteudo nao publicado retorna 404 | Comportamento simples e previsivel no SSG do App Router |
| 9 | Criados `PRODUCT.md` e `DESIGN.md` | Estrategia e identidade deixam de depender de inferencia |
| 10 | Motion definido como CSS 3D + fallback acessivel | Impacto arcade sem custo de WebGL na v1 |

---

## 1. Objetivo

Construir um site que funcione como **vitrine comercial e tecnica** do Allan Carvalho, resolvendo tres problemas:

1. Apresentar quem e o Allan e como contrata-lo (landing).
2. Dar a cada projeto uma **pagina propria e rica** — texto, imagens, video, arquitetura e imagens de codigo curado — ja que os repositorios sao privados e o GitHub nao cumpre esse papel.
3. Permitir **adicionar novos cases sem tocar em componente**: criar conteudo deve gerar rota, card, metadata, OG, sitemap e navegacao automaticamente.
4. Atender clientes B2B e recrutadores por dois caminhos claros, sem dividir a identidade do site.

### Fora de escopo na v1

- CMS com painel administrativo (conteudo e versionado em arquivo)
- Blog / area de conteudo editorial (previsto no roadmap pos-v1)
- Autenticacao, area logada, comentarios
- Internacionalizacao (estrutura fica preparada, mas v1 e pt-BR)
- Vendor externo de video (self-host resolve na escala da v1 — ver §3.1)

---

## 2. Premissas e decisoes estruturais

Estas decisoes condicionam todo o resto do plano. Se alguma for reprovada, o plano muda.

### 2.1 Codigo vira evidencia visual, nao espelho do repositorio

O site **nao replica os repositorios privados**. Cada projeto expoe ate 3 imagens de fragmentos escolhidos que demonstram decisao de arquitetura, cada uma com um paragrafo de contexto. O CI gera os rasters; fonte textual nao e enviada ao navegador.

**Limite explicito:** imagem pode ser baixada, capturada ou processada por OCR. Bloquear botao direito e falsa seguranca. Protecao real vem de curadoria: fragmentos pequenos, sem segredo, credencial, regra proprietaria critica ou contexto suficiente para reconstruir o sistema.

### 2.2 Conteudo em arquivo, nao em banco

Nada de banco de dados na v1. O conteudo vive em arquivos MDX versionados no Git, validados por schema em tempo de build.

**Justificativa:** volume baixo (dezenas de paginas), autor unico, historico versionado de graca, deploy estatico, zero superficie de ataque, e — decisivo agora que a hospedagem e propria — **nada para operar, atualizar ou fazer backup na VPS**. O repositorio Git *e* o backup do conteudo.

### 2.3 Repositorio do site e privado; a infraestrutura e propria

Se os trechos de codigo ficassem em repositorio publico, o objetivo estaria derrotado no primeiro commit. O repositorio da landing e privado.

O site roda em **VPS Hostinger ja contratada**, atras de Cloudflare. Isso troca conveniencia por controle:

| Ganho | Custo |
|---|---|
| Sem restricao de uso comercial | Voce opera SO, TLS, firewall e deploy |
| Custo marginal zero (VPS ja existe) | Sem preview automatico por branch |
| Banda e CPU previsiveis | Build precisa rodar no CI, nao na VPS (§3.2) |
| Video e imagem self-hosted sem vendor | Sem otimizacao de imagem gerenciada |
| Controle total de logs e headers | Uptime e responsabilidade sua |

### 2.4 Arcade como linguagem; Allan como identidade

A linguagem visual e arcade retro 3D, tecnica e sofisticada. Muniz inspira mecanicas como scanlines, terminal, som opcional e perspectiva; nao determina composicao, texto, assets ou ordem integral das secoes. Allan/ALLANDEV e assinatura principal.

O logo Nexos Tech em `docs/ChatGPT Image 7 de mar. de 2026, 20_06_40.png` e fonte oficial da paleta azul/ciano/violeta/magenta. Nexos Tech aparece como empresa, credencial e contexto do Nexos ERP, nunca como dona do portfolio. Estrategia em `PRODUCT.md`; sistema visual em `DESIGN.md`.

### 2.5 Os 6 principios se aplicam ao site

Performance, Escalabilidade, UX (loading/feedback/erro), Resiliencia, Memory Safe e Network Safe valem aqui como valem em qualquer entrega. Os pontos de aplicacao estao marcados fase a fase. Um site de portfolio que trava, nao da feedback no formulario ou vaza listener de scroll e uma contradicao ambulante.

### 2.6 Nada e "definido depois"

Toda meta neste plano e um numero (§3.3). Todo criterio de aceite termina em um comando que prova o aceite. Se uma fase nao puder ser verificada por comando, ela nao fecha.

---

## 3. Stack e infraestrutura

### 3.1 Stack de aplicacao

| Camada | Escolha | Por que |
|---|---|---|
| Framework | **Next.js 16 (App Router)** + React 19.2, `output: 'standalone'` | SSG garante SEO; `standalone` gera bundle autocontido para container; Turbopack e padrao |
| Runtime | **Node 24 LTS**, fixado em `.nvmrc` e no `Dockerfile` | LTS atual em agosto de 2026; mesma versao em dev, CI e VPS |
| Pacotes | **pnpm**, lockfile commitado, `--frozen-lockfile` no CI | Instalacao deterministica |
| Linguagem | **TypeScript** (`strict: true`) | Schema de conteudo tipado ponta a ponta; erro de conteudo quebra no build, nao em producao |
| Estilo | **Tailwind CSS v4** + design tokens em CSS variables | Tokens centralizados permitem trocar a paleta inteira num arquivo; Tailwind v4 le CSS vars nativamente |
| Componentes | Biblioteca propria + **Radix UI primitives** (accordion, dialog, tabs) | A estetica e autoral demais para component library pronta; Radix entrega so o comportamento acessivel |
| Animacao | **Motion** + CSS 3D | Coreografia, tilt e profundidade sem Three.js/WebGL na v1; `prefers-reduced-motion` obrigatorio |
| Conteudo | **MDX** + `next-mdx-remote/rsc` + `gray-matter` + **Zod** | Markdown com componentes React embutidos; Zod valida o frontmatter no build |
| Imagens de codigo | **Shiki + Satori/Resvg** no CI | Gera raster com highlight; fonte textual nao entra no bundle |
| Fontes | `next/font/local` — Silkscreen + Onest + JetBrains Mono | Display arcade curto, leitura confortavel e contexto tecnico |
| Icones | `lucide-react` (tree-shaken) + SVG autoral para os elementos pixel | Nada de icon font completa |
| Imagem | `next/image` + `sharp` + AVIF/WebP, **cache em volume persistente** | Sem plataforma gerenciada, a otimizacao consome CPU da VPS — o cache nao pode morrer a cada deploy (§3.2) |
| Video | **Self-hosted**, `<video preload="none">` + poster, servido via Cloudflare | 30s de screencast 720p sem audio fica em 1,5–3 MB. Vendor externo e complexidade sem ganho nesta escala |
| Formulario | Route Handler + **Resend** + Zod + honeypot + rate limit em camadas + **Turnstile** | Cloudflare/Nginx absorvem abuso grosso; limite local e segunda camada |
| Snippets | Script build-only + **Octokit**, SHA e hash | Busca fragmento privado aprovado e gera imagem; somente raster chega ao site |
| SEO | Metadata API, `sitemap.ts`, `robots.ts`, JSON-LD, OG dinamico via `next/og` | Cada projeto com card social proprio, gerado automaticamente |
| Analytics | **Cloudflare Web Analytics** | Sem cookie, sem banner, sem banco, sem container extra. Plausible e Umami self-hosted exigiriam banco e contradizem a §2.2 |
| Erros | **Sentry** (free tier) | Sem plataforma gerenciada, erro em producao some no log do container se ninguem coletar |
| Qualidade | ESLint CLI + Prettier + Husky + lint-staged | Next.js 16 nao executa lint dentro de `next build`; CI chama lint explicitamente |
| Testes | **Playwright** — smoke visual e de navegacao | Cobertura minima; garante que nenhuma rota de projeto quebrou apos publicacao |
| CI | **GitHub Actions** — lint, typecheck, `validate:content`, build, Playwright | PR que nao passa nao faz merge |
| CD | GitHub Actions → build de imagem → **GHCR** → SSH → `docker compose up -d` | Build nunca roda na VPS (§3.2) |

### 3.2 Infraestrutura de execucao — VPS

**Topologia**

```
Internet
   │
   ▼
Cloudflare  ── DNS + CDN + TLS de borda + WAF + Web Analytics
   │            (cacheia HTML estatico, imagens, fontes, video)
   ▼
VPS Hostinger
   ├── Nginx          reverse proxy ja existente, TLS e headers de seguranca
   └── Docker
        └── allandev-site      Next.js standalone, Node 24, porta interna 4000
             └── bind: 127.0.0.1:4000 (nunca publico)
```

**Decisoes e justificativas**

| Decisao | Justificativa |
|---|---|
| **Build no CI, nunca na VPS** | Build de Next.js consome 2–4 GB de RAM. Uma VPS de entrada faz OOM no meio e derruba o site que esta no ar. O CI constroi a imagem; a VPS so puxa e sobe |
| **Docker + Compose** | Rollback e trocar a tag da imagem e subir de novo. Sem Docker, rollback vira "reverter commit e rezar" |
| **Nginx no host** | Ja existe na VPS; encaminha para `127.0.0.1:4000`, limita payload/timeouts e restaura IP somente de ranges Cloudflare |
| **Cloudflare na frente** | Cacheia o HTML estatico na borda, o que resolve a distancia geografica que a VPS unica nao resolve. De quebra: TLS de borda, WAF basico, protecao de DDoS e analytics sem cookie — tudo no free tier |
| **Midia otimizada no build** | Assets locais recebem variantes responsivas antes do deploy; reduz CPU, disco mutavel e abuso do otimizador em runtime |
| **Replica unica (`replicas: 1`)** | Rate limit local funciona como segunda camada e usa armazenamento limitado; migrar a interface para Redis antes de escalar |
| **Deploy com healthcheck** | `docker compose up -d` com healthcheck causa ~2s de indisponibilidade. Aceitavel na v1. Blue/green fica no roadmap |
| **Segredos no GitHub Secrets + `.env` na VPS** | O token do GitHub so existe no ambiente de build. Nunca chega a VPS, nunca chega ao bundle |

**Hardening da VPS** (fase 0): SSH so por chave, root desabilitado, `ufw` liberando apenas 22/80/443, `fail2ban` no SSH, atualizacoes de seguranca automaticas, usuario sem privilegio rodando o Docker, log rotation configurado.

**O que se perde em relacao a plataforma gerenciada:** preview automatico por branch. Mitigacao na fase 0 — um segundo container em `preview.allandev.nexostech.com.br`, atualizado manualmente quando voce quiser revisar algo antes do merge. Nao e automatico, e tudo bem.

### 3.3 Metas numericas

Nenhuma destas e negociavel durante a execucao. Sao criterio de aceite, nao aspiracao.

| Metrica | Meta | Onde e verificada |
|---|---|---|
| LCP (p75, mobile) | ≤ 2,5 s | Fase 9 |
| INP (p75, mobile) | ≤ 200 ms | Fase 9 |
| CLS (p75, mobile) | ≤ 0,1 | Fase 9 |
| TTFB (Brasil, HTML cacheado) | ≤ 400 ms | Fase 9 |
| Lighthouse mobile — Performance | ≥ 90 | Fases 7 e 9 |
| Lighthouse mobile — Acessibilidade | ≥ 95 | Fase 9 |
| Lighthouse mobile — Best Practices | 100 | Fase 9 |
| Lighthouse mobile — SEO | 100 | Fase 9 |
| JS inicial (gzip) | ≤ 150 KB | Fase 2 em diante, a cada PR |
| Peso da home | ≤ 1,2 MB | Fase 4 |
| Peso da pagina de projeto (sem contar video sob demanda) | ≤ 1,5 MB | Fase 7 |
| Contraste texto/fundo | ≥ 4,5:1 normal, ≥ 3:1 grande e UI | **Fase 1** |
| Build no CI | ≤ 3 min | Fase 0 |
| Uptime | ≥ 99,5 %/mes | Fase 10 |

### 3.4 Variaveis de ambiente

| Variavel | Escopo | Obrigatoria | Consumidor |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build + runtime | Sim | metadata, sitemap, OG, canonical |
| `GITHUB_CODE_SHOTS_TOKEN` | **build apenas** | Sim (fase 6) | Fine-grained `contents: read`, somente repositorios do manifesto |
| `RESEND_API_KEY` | runtime | Sim (fase 8) | Route Handler de contato |
| `CONTACT_TO_EMAIL` | runtime | Sim (fase 8) | destinatario do formulario |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Sim (fase 8) | widget no cliente |
| `TURNSTILE_SECRET_KEY` | runtime | Sim (fase 8) | validacao no servidor |
| `SENTRY_DSN` | runtime | Nao | captura de erro |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | build | Nao | script do Cloudflare Analytics |

Schemas separados validam ambiente de build, servidor e cliente no momento em que cada escopo existe. `GITHUB_CODE_SHOTS_TOKEN` nunca e exigido nem carregado no runtime; segredos de servidor nunca usam prefixo `NEXT_PUBLIC_`.

---

## 4. Controle de paginas — o modelo de conteudo

O ponto central do pedido. O fluxo passa a ser: **criar um arquivo `.mdx` → a tela existe, com rota, SEO, card social e listagem na home.**

### 4.1 Como funciona

1. Cada projeto e um arquivo em `content/projetos/`. O nome do arquivo e o slug da URL.
2. O **frontmatter** carrega os metadados estruturados (§4.2).
3. Um **schema Zod** valida esse frontmatter. A validacao roda no build e no `validate:content` do CI para **todos** os arquivos, inclusive drafts e arquivados.
4. O **corpo em MDX** e a narrativa livre, onde voce intercala componentes fechados: galeria, video, imagem de codigo, quadro de arquitetura, tabela de decisoes, metricas e callout.
5. `generateStaticParams` varre a pasta e registra as rotas sozinho.
6. Um **repositorio de conteudo** (camada unica de leitura, com cache) alimenta ao mesmo tempo: a listagem da home, a pagina do projeto, o sitemap e a navegacao anterior/proximo.

### 4.2 Schema do frontmatter

Fonte da verdade do que e um projeto. Este e o artefato mais importante da fase 3.

| Campo | Tipo | Obrigatorio | Regra |
|---|---|---|---|
| `titulo` | `string` | Sim | 3–60 caracteres |
| `resumo` | `string` | Sim | 50–160 caracteres — vira meta description e texto do card |
| `status` | `'draft' \| 'published' \| 'archived'` | Sim | Valor explicito obrigatorio; somente `published` gera rota publica |
| `destaque` | `number \| null` | Nao | Ordem na home. `null` = nao aparece em destaque |
| `periodo` | `{ inicio: 'YYYY-MM', fim: 'YYYY-MM' \| null }` | Sim | `fim: null` = em andamento |
| `papel` | `string` | Sim | Ex.: "Desenvolvedor full-stack" |
| `stack` | `string[]` | Sim | Minimo 1 item |
| `cliente` | `string` | Nao | Omitido quando houver NDA |
| `capa` | `{ src: string, alt: string }` | Sim | `alt` obrigatorio — acessibilidade por construcao, nao por lembranca |
| `ogImage` | `string` | Nao | Se ausente, e gerado do frontmatter via `next/og` |
| `links` | `{ demo?: string, repo?: string }` | Nao | URLs validadas |
| `atualizadoEm` | `date` | Sim | Alimenta `lastmod` no sitemap |
| `galeria` | `{ src: string, alt: string, legenda?: string }[]` | Nao | Midia real, com dimensoes conhecidas |
| `videos` | `{ src: string, poster: string, titulo: string }[]` | Nao | Sem autoplay ou preload do arquivo |
| `resultados` | `{ valor: string, rotulo: string, contexto: string }[]` | Nao | So metricas verificaveis |
| `codeShots` | `string[]` | Nao | IDs do manifesto build-only; maximo 3 por case |

### 4.3 Consequencias praticas

- Publicar projeto novo = escrever um markdown, mudar `status` e commitar. Nenhum componente e tocado.
- Retirar do ar = mudar `status` para `archived`. O arquivo permanece versionado.
- `draft` e `archived` nao entram em `generateStaticParams`, listagens ou sitemap; acesso responde 404.
- Reordenar destaques = mudar um numero.
- Erro de digitacao em campo obrigatorio = pipeline vermelho, nao pagina quebrada em producao.

### 4.4 Estrutura de pastas

```
allandev-site/
├── content/
│   ├── projetos/            # um .mdx por projeto — cada arquivo vira uma rota
│   └── code-shots.json      # manifesto build-only: repo + arquivo + regiao + SHA + hash
├── src/
│   ├── app/                 # rotas, layouts, metadata, sitemap, robots, OG
│   ├── components/
│   │   ├── ui/              # primitivos do design system (pixel, terminal, HUD)
│   │   ├── sections/        # blocos da home
│   │   └── mdx/             # componentes disponiveis dentro do MDX
│   ├── lib/                 # leitura de conteudo, schemas Zod, env, SEO, utilitarios
│   └── styles/              # tokens e camadas base do Tailwind
├── scripts/                 # geracao de code-shots, validate:content
├── infra/
│   ├── Dockerfile
│   ├── compose.yml
│   └── nginx/                # snippets para o Nginx existente no host
├── public/                  # assets estaticos, fontes, videos
└── tests/                   # smoke tests Playwright
```

---

## 5. Convencao de trabalho e rastreamento

O historico do repositorio e o registro de progresso do projeto — sem planilha paralela.

| Elemento | Regra |
|---|---|
| Fluxo | `branch por fase` → `PR` → CI verde → **squash merge** → 1 commit em `main` |
| Padrao | `tipo(escopo): descricao` — Conventional Commits |
| Escopo | O nome da fase (`setup`, `design-system`, `content`, `snippets`, …) |
| Nome da branch | `feat/fase-03-content` |
| Corpo do commit | Lista do que entrou e das decisoes tomadas na fase |
| Tag | `v0.1` … `v1.0` ao fim das fases marcadas como marco |
| Bloqueio | Nenhum PR faz merge com lint falhando, erro de tipo, `validate:content` vermelho ou build quebrado |

O squash merge e o que reconcilia as duas intencoes: PR obrigatorio com CI, e um commit limpo por fase em `main`.

---

## 6. Fases

### Fase 0 — Fundacao, infraestrutura e pipeline

**Objetivo:** ter um projeto que roda, compila, valida e **publica na VPS** — ainda sem nenhuma tela real.

**O que e feito:** projeto Next.js 16 com React 19.2, TypeScript strict, Tailwind v4, Turbopack no desenvolvimento, webpack no build validado e `output: 'standalone'`; `.nvmrc` com Node 24; ESLint CLI e Prettier; schemas separados para env de build, servidor e cliente; repositorio privado; hardening da VPS; Docker/Nginx; DNS Cloudflare; imagem multi-stage; CI explicito (`lint`, `typecheck`, `validate:content`, build e testes) e CD via GHCR/SSH; verificacao SPF/DKIM do Resend.

**Como e feito:** a validacao de ambiente e resolvida antes de existir codigo que dependa dela — variavel ausente derruba o boot com mensagem clara, em vez de erro obscuro em runtime. O build roda no CI e nunca na VPS: um build de Next.js consome 2–4 GB e faria OOM no meio, derrubando o site que ja esta no ar. A imagem versionada no GHCR torna rollback uma troca de tag.

**Principios aplicados:** Resiliencia (rollback por tag, healthcheck no container), Network Safe (TLS ponta a ponta, headers restritivos).

**Criterio de aceite:**
- `pnpm build` limpo localmente e no CI, em ≤ 3 min
- pagina placeholder no ar em `allandev.nexostech.com.br` com HTTPS valido (nota A em SSL Labs)
- PR com erro proposital de lint e bloqueado pelo CI
- `docker compose up -d` com a tag anterior derruba e restaura o site em < 30 s

**Commit:** `chore(setup): scaffold, hardening da VPS, containerizacao e pipeline de CI/CD`

---

### Fase 1 — Design system e tokens

**Objetivo:** transformar a estetica em codigo reutilizavel, antes de montar qualquer pagina.

**O que e feito:** paleta amostrada do logo Nexos Tech e convertida para tokens OKLCH `--allan-*`; Silkscreen, Onest e JetBrains Mono via `next/font/local`; escala tipografica e espacial; botao arcade, moldura de terminal, HUD, badge, marquee, divisores, cena CSS 3D e motion primitives; teste automatizado de contraste.

**Como e feito:** nenhum componente carrega cor literal — tudo consome token. Trocar a paleta inteira do site e editar um arquivo. O wrapper de animacao centraliza o respeito a `prefers-reduced-motion`, de modo que acessibilidade nao vira decisao a ser lembrada em cada uso. Cada primitivo nasce responsivo e navegavel por teclado.

**Principios aplicados:** UX (foco visivel, estados de hover e disabled), Memory Safe (observers de scroll com cleanup obrigatorio no wrapper de reveal).

**Criterio de aceite:**
- rota `/_dev/design-system` exibindo todos os primitivos
- `pnpm test:contrast` verde — todo par ≥ 4,5:1 (normal) e ≥ 3:1 (grande/UI)
- troca de paleta validada alterando apenas o arquivo de tokens

**Commit:** `feat(design-system): tokens, tipografia, primitivos visuais e teste de contraste`

---

### Fase 2 — Shell da aplicacao

**Objetivo:** a casca que envolve todas as paginas — o que da a sensacao de "jogo bootando".

**O que e feito:** layout raiz com metadata base; sequencia de boot (preloader com contador); navegacao com estado de scroll e menu mobile; rodape; toggle de som com preferencia persistida; paginas de erro e de rota nao encontrada dentro da estetica.

**Como e feito:** o preloader opcional tem duracao maxima de 1,2 s, aparece so na primeira visita da sessao e nunca simula progresso. O som nasce desligado e exige opt-in. Listeners possuem cleanup e throttling. Todo projeto nao publicado usa a mesma 404 tematica.

**Principios aplicados:** UX (feedback de carregamento, erro tratado), Resiliencia (timeout do preloader), Memory Safe (cleanup de listeners e audio).

**Criterio de aceite:**
- navegacao funcional em desktop e mobile
- boot sai em ≤ 1,2 s mesmo com asset bloqueado no DevTools
- JS inicial ≤ 150 KB gzip (`pnpm analyze`)
- 404 e 500 estilizadas

**Commit:** `feat(shell): layout raiz, navegacao, sequencia de boot e paginas de erro`

---

### Fase 3 — Camada de conteudo e controle de paginas

**Objetivo:** o coracao do projeto. Depois desta fase, criar arquivo passa a criar tela.

**O que e feito:** schema Zod do frontmatter (§4.2); camada unica de leitura; pipeline MDX; rota com `generateStaticParams` e `dynamicParams = false`; pagina minima de projeto; ordenacao, publicacao e navegacao derivadas do conteudo; `validate:content`, `sitemap.ts` e `robots.ts`.

**Como e feito:** existe **uma unica** funcao de leitura de conteudo, usada por listagem, pagina, sitemap e metadata — nenhuma leitura de arquivo espalhada pelo codigo. O `validate:content` le **todos** os arquivos, ignorando `status`, e roda no CI: sem isso, um rascunho apodrece em silencio e explode no dia em que voce o publica, seis meses depois e com pressa. Rotas sao pre-renderizadas: a pagina vira HTML estatico servido pelo Cloudflare.

**Principios aplicados:** Escalabilidade (a arquitetura e indiferente a 5 ou 200 projetos), Performance (leitura em build, cache em memoria).

**Criterio de aceite:**
- adicionar um `.mdx` de teste faz aparecer entrada no sitemap, rota acessivel e navegacao anterior/proximo — **sem editar nenhum componente**
- `pnpm validate:content` falha com mensagem clara ao remover campo de um `draft`
- slug `draft` ou `archived` responde 404 e nao aparece no sitemap

**Commit:** `feat(content): schema de projetos, pipeline MDX, rotas dinamicas e validacao`
**Marco:** `v0.3` — controle de paginas funcionando

---

### Fase 4 — Home

**Objetivo:** a landing inteira, com conteudo real e a listagem de projetos consumindo a fase 3.

**O que e feito:** hero com badge de disponibilidade, titulo, CTAs e cards de HUD; marquee duplo de tecnologias; secao "sobre" na moldura de terminal; processo em passos numerados; grade de servicos; **grid de projetos com estado vazio e skeleton**; FAQ em acordeao acessivel.

**Como e feito:** todo texto da home vem de um modulo de conteudo tipado, nao fica espalhado em JSX — editar a home e editar dados. O marquee e animacao CSS, nao loop de JavaScript.

**Principios aplicados:** Performance (animacao em CSS, sem reflow por frame), UX (navegacao por teclado no acordeao, estado vazio tratado).

**Criterio de aceite:**
- home completa e responsiva de 320 px a 2560 px
- grid de projetos alimentado pela fase 3, com estado vazio funcional
- peso da home ≤ 1,2 MB
- conteudo textual editavel sem tocar em componente

**Commit:** `feat(home): secoes institucionais, marquee, servicos, vitrine de projetos e FAQ`

---

### Fase 5 — Template da pagina de projeto

**Objetivo:** a versao "tela de fase" da estetica, e os componentes que o MDX pode usar.

**O que e feito:** header do projeto com HUD de metadados (stack, papel, periodo, status); sumario lateral gerado a partir dos titulos; componentes disponiveis no MDX — galeria, video, callout, quadro de arquitetura, tabela de decisoes tecnicas; rodape com navegacao entre projetos e CTA de contato.

**Como e feito:** os componentes MDX sao fechados e opinativos: recebem dados, aplicam a estetica, nao aceitam estilo arbitrario. Isso garante que uma pagina escrita daqui a seis meses saia visualmente identica as atuais. O sumario e derivado da arvore de titulos, nao escrito a mao.

**Principios aplicados:** UX (leitura confortavel em textos longos, ancoras estaveis), Escalabilidade (consistencia garantida por construcao).

**Criterio de aceite:**
- **dois projetos reais** publicados ponta a ponta usando todos os componentes (bloqueado por **C2** do Workstream C)
- sumario navegavel por teclado com ancoras estaveis

**Commit:** `feat(projeto): template de pagina, HUD de metadados e componentes MDX`

---

### Fase 6 — Imagens de codigo curado

**Objetivo:** mostrar evidencias tecnicas de repositorios privados sem enviar fonte textual ao navegador.

**O que e feito:** manifesto de `code-shots`; script build-only busca fragmentos pela GitHub API; Shiki tokeniza; Satori/Resvg gera PNG/WebP em 2x; componente exibe imagem, titulo, linguagem, copyright e explicacao acessivel. Texto-fonte e cache intermediario nao entram no Git, `.next`, imagem Docker ou artefato publico.

**Como e feito:**

| Regra | Efeito |
|---|---|
| Cada entrada exige `ref` = **SHA de commit**, nunca `main` | O trecho fica congelado no ponto em que voce o escolheu |
| Cada entrada guarda `expectedHash` (SHA-256 do trecho resolvido) | Divergencia **derruba o build** com "snippet X mudou na origem — revalide" |
| Ancora preferencial por marcador (`// #region code-shot:auth-guard`) | Sobrevive a refactor; custa um comentario na origem |
| Maximo de 3 imagens por case | Curadoria vence volume e limita exposicao |
| API indisponivel | Build falha; nunca publicar artefato antigo silenciosamente |

O manifesto aponta para origem privada e o CI resolve. Nao existe botao de copiar, endpoint bruto ou HTML contendo fonte. Ainda assim, raster permite download, screenshot e OCR; todo fragmento passa por revisao manual de segredo e propriedade intelectual.

**Principios aplicados:** Network Safe (token minimo, timeout e zero fonte no runtime), Performance (raster responsivo, zero highlighter no cliente), Acessibilidade (descricao explica comportamento sem transcrever codigo).

**Criterio de aceite:**
- imagens geradas a partir de repositorio privado
- alterar o arquivo de origem **nao** muda o site (SHA congelado)
- alterar o `expectedHash` manualmente derruba o build com mensagem clara
- API indisponivel → build falha de forma acionavel
- busca por token e texto-sentinela nao encontra fonte privada em `.next/` ou container
- imagem possui descricao contextual; nenhuma alegacao de impedir OCR ou captura

**Commit:** `feat(code-shots): gerar imagens de codigo privado no CI`

---

### Fase 7 — Midia

**Objetivo:** imagem e video com peso controlado, porque e aqui que portfolio costuma morrer.

**O que e feito:** pipeline de video self-hosted (encode padronizado: 720p, H.264 + AV1, sem audio, CRF alvo para ≤ 3 MB por demo de 30 s); player leve com poster, sem autoplay com audio e com overlay de play na estetica arcade; galeria com lightbox acessivel; padronizacao de dimensoes, formatos modernos e placeholder de carregamento; cache de imagem em volume validado; regras de cache do Cloudflare para `/public`.

**Principios aplicados:** Performance (lazy load, formatos modernos, orcamento explicito), UX (placeholder, sem salto de layout), Memory Safe (observers e elementos de midia liberados ao desmontar).

**Criterio de aceite:**
- pagina de projeto com video ≤ 1,5 MB sem contar o video sob demanda
- Lighthouse mobile Performance ≥ 90 nessa pagina
- deploy novo nao zera o cache de imagem (volume persistente validado)

**Commit:** `feat(midia): pipeline de imagem, video self-hosted otimizado e galeria`

---

### Fase 8 — Contato

**Objetivo:** o caminho de conversao. Precisa ser o trecho mais confiavel do site.

**O que e feito:** formulario na estetica de caixa de dialogo, com validacao no cliente e no servidor pelo mesmo schema; Route Handler de envio; disparo via Resend; **Turnstile + honeypot + rate limit Cloudflare/Nginx/local**; estados explicitos de envio, sucesso e erro; links diretos de e-mail, LinkedIn, GitHub e WhatsApp; **pagina de politica de privacidade e finalidade declarada no formulario (LGPD)**.

**Como e feito:** o schema de validacao e unico e compartilhado entre cliente e servidor — nunca duas verdades. O botao bloqueia durante o envio para impedir duplo disparo. Se o Resend cair, a mensagem de erro oferece o canal alternativo em vez de sumir com o lead. O envio tem timeout e `AbortController`.

**LGPD:** o formulario coleta dado pessoal e o site e de pessoa fisica brasileira processando dado de terceiros. Exige, no minimo, politica de privacidade acessivel a partir do formulario e finalidade declarada no ponto de coleta. O Cloudflare Web Analytics nao usa cookie, entao nao ha banner de consentimento a construir — essa parte a §2.2 ja resolveu por consequencia.

**Principios aplicados:** UX (tres estados sempre visiveis, erro acionavel), Escalabilidade (rate limit), Resiliencia (retry e canal alternativo), Network Safe (timeout e `AbortController`).

**Criterio de aceite:**
- envio real recebido na caixa de entrada
- comportamento correto simulando falha do Resend (canal alternativo oferecido)
- 6 envios seguidos do mesmo IP → o 6º e barrado
- envio automatizado sem token Turnstile → rejeitado
- politica de privacidade linkada e acessivel

**Commit:** `feat(contato): formulario validado, envio transacional, anti-spam e LGPD`

---

### Fase 9 — SEO, acessibilidade e performance

**Objetivo:** ser encontrado e ser usavel. Fase de fechamento, nao de detalhe.

**O que e feito:** metadata por rota com titulo, descricao e canonical; imagens Open Graph geradas dinamicamente por projeto; JSON-LD de `Person` e `FAQPage`; auditoria de navegacao por teclado, foco visivel e leitor de tela; ajuste final de Core Web Vitals; verificacao no Search Console.

**Como e feito:** o card social de cada projeto e gerado a partir do frontmatter — projeto novo ja nasce com imagem propria, sem trabalho manual. O `FAQPage` entra por legibilidade de maquina (Bing e crawlers de busca com IA), nao por rich snippet no Google, que foi desativado em maio de 2026.

**Principios aplicados:** UX (acessibilidade real), Performance (Core Web Vitals dentro da meta da §3.3).

**Criterio de aceite:**
- Lighthouse mobile: ≥ 90 / ≥ 95 / 100 / 100
- LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1
- navegacao completa por teclado, sem armadilha de foco
- todas as rotas `published` indexaveis; `draft` e `archived` retornando 404

**Commit:** `feat(seo): metadata, OG dinamico, dados estruturados e auditoria de acessibilidade`

---

### Fase 10 — Lancamento

**Objetivo:** no ar, no dominio proprio, com rede de seguranca.

**O que e feito:** variaveis de producao conferidas; smoke tests Playwright cobrindo home, listagem, Nexos ERP, Renowa, 404 e formulario; Cloudflare Web Analytics; Sentry; monitoramento externo; snapshot da VPS; runbook; dois cases reais publicados (**bloqueado por C3**).

**Como e feito:** o smoke test roda no CI e cobre exatamente o cenario mais provavel de quebra silenciosa — publicar um `.mdx` malformado e derrubar a rota. O **runbook** substitui o que uma plataforma gerenciada fazia por voce: como publicar, como fazer rollback, onde ficam os logs, o que fazer se o container nao subir, como renovar o token de snippets.

**Principios aplicados:** Resiliencia (rollback documentado e testado, monitoramento externo).

**Criterio de aceite:**
- site no ar no dominio, testes verdes no CI
- `pnpm test:e2e` cobrindo os 6 cenarios
- rollback executado de verdade e cronometrado (< 30 s)
- alerta de uptime dispara ao derrubar o container de proposito
- publicacao de projeto novo validada de ponta a ponta pelo runbook

**Commit:** `chore(release): producao, smoke tests, monitoramento e runbook`
**Marco:** `v1.0`

---

### Workstream C — Conteudo (paralelo as fases 3 a 10)

Com a decisao de ir linear ate `v1.0`, sem release intermediario, este workstream passa a ser **a principal mitigacao de risco do projeto**.

| Marco | Entrega | Bloqueia |
|---|---|---|
| **C1** | Briefs de Nexos ERP e Renowa + inventario de midia | **Fase 3** |
| **C2** | Nexos ERP e Renowa escritos, com capa, galeria, video e resultados verificaveis | **Fase 5** |
| **C3** | Dois cases revisados, acessiveis e aprovados para publicacao | **Fase 10** |

**Criterio:** cada `.mdx` passa no `pnpm validate:content` e renderiza sem componente faltando.

---

## 7. Roadmap pos-v1

- Secao de conteudo editorial / blog, reaproveitando integralmente a camada MDX
- Versao em ingles, com a estrutura de rotas ja preparada
- Modo de leitura para as paginas de projeto (alternativa de baixo contraste a estetica CRT)
- Estudos de caso com metricas de resultado
- Pagina dedicada a servicos com proposta comercial
- Deploy blue/green sem indisponibilidade
- Vendor de video, se o catalogo crescer

---

## 8. Riscos identificados

| Risco | Impacto | Mitigacao |
|---|---|---|
| **Projeto nao lanca por falta de release intermediario** | Alto | Workstream C com marcos bloqueantes; C1 antes da fase 3 |
| Conteudo dos projetos atrasar o lancamento | Alto | Workstream C — deixou de ser boa intencao e virou bloqueio de fase |
| **Build de Next.js fazer OOM na VPS** | Alto | Build so no CI; a VPS apenas puxa imagem pronta |
| **Rate limit local zerar ou divergir ao escalar** | Medio | Cloudflare/Nginx na borda, mapa TTL limitado e interface pronta para Redis antes da segunda replica |
| Imagem de codigo expor segredo ou regra critica | Alto | SHA/hash, limite de 3, revisao humana e busca por sentinela antes do deploy |
| Token do GitHub vazar no bundle | Alto | Escopo minimo, uso restrito ao build, verificacao por `grep` no criterio de aceite da fase 6 |
| Contraste neon reprovar em acessibilidade | Medio | Teste automatizado como criterio de aceite da **fase 1**, nao da 9 |
| **VPS cair sem ninguem perceber** | Medio | Monitoramento externo de uptime na fase 10, com alerta testado |
| **Midia gerar custo de CPU em runtime** | Baixo | Variantes responsivas geradas no build e cache imutavel na borda |
| Peso de video destruir o carregamento | Medio | Encode padronizado, lazy load e orcamento verificado na fase 7 |
| Semelhanca excessiva com Muniz | Medio | Copiar apenas mecanicas; composicao, textos, assets e rotas sao autorais |

---

## 9. Pendencias para validacao

Itens que dependem de decisao sua antes da fase 1:

1. **Paleta** — fonte confirmada: logo Nexos Tech em `docs/`; valores finais saem da amostragem e do teste WCAG na fase 1.
2. **Dominio** — confirmado `allandev.nexostech.com.br`.
3. **Projetos da v1** — confirmados: Nexos ERP e Renowa.
4. **Idioma da v1** — confirmado: pt-BR.
5. **Especificacao da VPS** — vCPU, RAM e banda; bloqueia dimensionamento de imagem/video.

Resolvidas nesta versao: hospedagem (VPS propria), estrategia de lancamento (linear ate `v1.0`), provedor de video (self-hosted), dominio e branding.

---

## 10. Documentos relacionados

| Documento | Conteudo | Status |
|---|---|---|
| `PLANO-LANDING-ALLANDEV-v2.0.md` (este) | Arquitetura, infraestrutura, fases e criterios | v2.0 |
| `PLANO-TELAS-ALLANDEV.md` | Telas, conteudo, comportamento, responsividade e estados | v2.0 |
| `PRODUCT.md` | Publico, proposito, personalidade e principios | v1.0 |
| `DESIGN.md` | Paleta do logo, tipografia, layout, componentes e motion | v1.0 |
| Planos `NEXUSTECH` e fonte Muniz | Referencias historicas; nao implementar diretamente | Arquivo |
