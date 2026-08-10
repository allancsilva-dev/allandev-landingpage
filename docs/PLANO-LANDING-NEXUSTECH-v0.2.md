# Plano de Arquitetura — Landing Page / Portfólio Nexus Tech

> **ARQUIVO HISTORICO:** nao implementar. Especificacao ativa em `PLANO-LANDING-ALLANDEV-v2.0.md`.

**Versão:** 0.2 (corrigida após review)
**Autor:** Allan — Nexus Tech
**Escopo:** landing page profissional + páginas individuais de projeto + vitrine de código de repositórios privados
**Hospedagem:** VPS própria (Hostinger)
**Substitui:** v0.1

---

## Changelog v0.1 → v0.2

| # | Mudança | Motivo |
|---|---|---|
| 1 | Hospedagem trocada de Vercel para **VPS própria + Cloudflare na frente** | Hobby proíbe uso comercial; VPS já existe e é domínio técnico do autor |
| 2 | Nova **§3.2 — Infraestrutura de execução** (Docker, Caddy, CI/CD por SSH) | Plataforma gerenciada resolvia isso implicitamente; VPS exige decisão explícita |
| 3 | Fases 3 e 4 **trocadas de ordem**: camada de conteúdo antes da home | A home dependia de uma fase futura e o critério de aceite se contradizia |
| 4 | Snippets passam a exigir **SHA de commit + hash de conferência** | Intervalo de linhas é referência instável — publicava código errado sem quebrar o build |
| 5 | Convenção de commit unificada: **branch → PR → squash merge** | §5 da v0.1 dizia duas coisas incompatíveis |
| 6 | Contraste WCAG AA virou **critério de aceite da fase 1** | Era decidido na fase 1 e só verificado na 9 |
| 7 | Criado **Workstream C — Conteúdo**, com marcos bloqueantes | Era risco Alto sem fase, sem dono e sem critério |
| 8 | `validate:content` cobre **todos** os arquivos, inclusive despublicados | Zod só validava o que era renderizado |
| 9 | **Todas as metas viraram número** (§3.3) | "Meta acordada" e "orçamento definido" não são executáveis |
| 10 | Adicionados **schema do frontmatter (§4.2)** e **tabela de variáveis (§3.4)** | Artefatos centrais existiam só em prosa |
| 11 | Política de despublicação: **410 + saída do sitemap** | Link antigo virava 404 silencioso |
| 12 | Justificativa do FAQ corrigida | Rich result de FAQ foi desativado pelo Google em 07/05/2026 |
| 13 | Vendor de vídeo **removido da v1** | Com VPS + Cloudflare, self-host resolve; bunny.net não tem free tier |
| 14 | Adicionada **LGPD** (política de privacidade + finalidade no formulário) | Ausente na v0.1 |
| 15 | Rate limit em memória **reabilitado**, com ressalva de réplica única | Consequência da VPS: processo único, estado persiste |
| 16 | Analytics trocado para **Cloudflare Web Analytics** | Plausible e Umami self-hosted exigem banco, contradizendo §2.2 |

**Decisão registrada:** entrega linear até `v1.0`, sem release público intermediário. O risco disso está na §8 e a mitigação é o Workstream C.

---

## 1. Objetivo

Construir um site que funcione como **vitrine comercial e técnica** da Nexus Tech, resolvendo três problemas:

1. Apresentar quem é o Allan e como contratá-lo (landing).
2. Dar a cada projeto uma **página própria e rica** — texto, imagens, vídeo e trechos de código — já que os repositórios são privados e o GitHub não cumpre esse papel.
3. Permitir **adicionar novas telas sem tocar em componente**: criar conteúdo deve gerar rota automaticamente.

### Fora de escopo na v1

- CMS com painel administrativo (conteúdo é versionado em arquivo)
- Blog / área de conteúdo editorial (previsto no roadmap pós-v1)
- Autenticação, área logada, comentários
- Internacionalização (estrutura fica preparada, mas v1 é pt-BR)
- Vendor externo de vídeo (self-host resolve na escala da v1 — ver §3.1)

---

## 2. Premissas e decisões estruturais

Estas decisões condicionam todo o resto do plano. Se alguma for reprovada, o plano muda.

### 2.1 Código é curadoria, não espelho do repositório

O site **não replica os repositórios privados**. Cada projeto expõe de 3 a 6 trechos escolhidos que demonstram decisão de arquitetura, cada um com um parágrafo de contexto.

**Justificativa:** todo código que chega ao navegador é copiável — DevTools, view-source, aba Network. Bloquear botão direito e seleção é atrito, não segurança. Curadoria resolve o problema de exposição na origem e, na prática, comunica competência melhor do que uma árvore de arquivos navegável. Proteção efetiva é jurídica (licença proprietária + copyright), não técnica.

### 2.2 Conteúdo em arquivo, não em banco

Nada de banco de dados na v1. O conteúdo vive em arquivos MDX versionados no Git, validados por schema em tempo de build.

**Justificativa:** volume baixo (dezenas de páginas), autor único, histórico versionado de graça, deploy estático, zero superfície de ataque, e — decisivo agora que a hospedagem é própria — **nada para operar, atualizar ou fazer backup na VPS**. O repositório Git *é* o backup do conteúdo.

### 2.3 Repositório do site é privado; a infraestrutura é própria

Se os trechos de código ficassem em repositório público, o objetivo estaria derrotado no primeiro commit. O repositório da landing é privado.

O site roda em **VPS Hostinger já contratada**, atrás de Cloudflare. Isso troca conveniência por controle:

| Ganho | Custo |
|---|---|
| Sem restrição de uso comercial | Você opera SO, TLS, firewall e deploy |
| Custo marginal zero (VPS já existe) | Sem preview automático por branch |
| Banda e CPU previsíveis | Build precisa rodar no CI, não na VPS (§3.2) |
| Vídeo e imagem self-hosted sem vendor | Sem otimização de imagem gerenciada |
| Controle total de logs e headers | Uptime é responsabilidade sua |

### 2.4 Estética herdada, identidade própria

A linguagem visual é retro gamer / arcade dark — tipografia pixelada, moldura de terminal, HUD, CRT. A **paleta é da Nexus Tech**, não a do projeto de referência, e os momentos de assinatura são recombinados. O site precisa ser reconhecível como seu, não como cópia identificável de outro portfólio.

Detalhamento completo em documento separado: **`PLANO-DESIGN-SYSTEM-NEXUSTECH.md`**.

### 2.5 Os 6 princípios se aplicam ao site

Performance, Escalabilidade, UX (loading/feedback/erro), Resiliência, Memory Safe e Network Safe valem aqui como valem em qualquer entrega. Os pontos de aplicação estão marcados fase a fase. Um site de portfólio que trava, não dá feedback no formulário ou vaza listener de scroll é uma contradição ambulante.

### 2.6 Nada é "definido depois"

Toda meta neste plano é um número (§3.3). Todo critério de aceite termina em um comando que prova o aceite. Se uma fase não puder ser verificada por comando, ela não fecha.

---

## 3. Stack e infraestrutura

### 3.1 Stack de aplicação

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15 (App Router)** + React 19, `output: 'standalone'` | Stack que você já domina do Nexos ERP; SSG garante SEO; `standalone` gera bundle autocontido, ideal para container |
| Runtime | **Node 22 LTS**, fixado em `.nvmrc` e no `Dockerfile` | Mesma versão em dev, CI e VPS — elimina a classe inteira de "funciona na minha máquina" |
| Pacotes | **pnpm**, lockfile commitado, `--frozen-lockfile` no CI | Instalação determinística |
| Linguagem | **TypeScript** (`strict: true`) | Schema de conteúdo tipado ponta a ponta; erro de conteúdo quebra no build, não em produção |
| Estilo | **Tailwind CSS v4** + design tokens em CSS variables | Tokens centralizados permitem trocar a paleta inteira num arquivo; Tailwind v4 lê CSS vars nativamente |
| Componentes | Biblioteca própria + **Radix UI primitives** (accordion, dialog, tabs) | A estética é autoral demais para component library pronta; Radix entrega só o comportamento acessível |
| Animação | **Motion** (ex-Framer Motion) | Reveal on scroll, marquee, preloader; respeitando `prefers-reduced-motion` |
| Conteúdo | **MDX** + `next-mdx-remote/rsc` + `gray-matter` + **Zod** | Markdown com componentes React embutidos; Zod valida o frontmatter no build |
| Highlight de código | **Shiki** via `rehype-pretty-code` | Roda em build time, envia HTML pronto; zero JS de highlight no cliente |
| Fontes | `next/font/local` — display pixelada + mono | Self-hosted, sem request externo, sem layout shift |
| Ícones | `lucide-react` (tree-shaken) + SVG autoral para os elementos pixel | Nada de icon font completa |
| Imagem | `next/image` + `sharp` + AVIF/WebP, **cache em volume persistente** | Sem plataforma gerenciada, a otimização consome CPU da VPS — o cache não pode morrer a cada deploy (§3.2) |
| Vídeo | **Self-hosted**, `<video preload="none">` + poster, servido via Cloudflare | 30s de screencast 720p sem áudio fica em 1,5–3 MB. Vendor externo é complexidade sem ganho nesta escala |
| Formulário | Route Handler + **Resend** + Zod + honeypot + rate limit em memória + **Turnstile** | Domínio `nexustech.com.br` já existe; controle total sobre validação e resposta |
| Snippets | Script de build + **Octokit**, ancorado em SHA de commit | Busca os trechos direto dos repositórios privados, congelados no ponto escolhido (fase 6) |
| SEO | Metadata API, `sitemap.ts`, `robots.ts`, JSON-LD, OG dinâmico via `next/og` | Cada projeto com card social próprio, gerado automaticamente |
| Analytics | **Cloudflare Web Analytics** | Sem cookie, sem banner, sem banco, sem container extra. Plausible e Umami self-hosted exigiriam banco e contradizem a §2.2 |
| Erros | **Sentry** (free tier) | Sem plataforma gerenciada, erro em produção some no log do container se ninguém coletar |
| Qualidade | ESLint + Prettier + Husky + lint-staged | Nada entra quebrado no repositório |
| Testes | **Playwright** — smoke visual e de navegação | Cobertura mínima; garante que nenhuma rota de projeto quebrou após publicação |
| CI | **GitHub Actions** — lint, typecheck, `validate:content`, build, Playwright | PR que não passa não faz merge |
| CD | GitHub Actions → build de imagem → **GHCR** → SSH → `docker compose up -d` | Build nunca roda na VPS (§3.2) |

### 3.2 Infraestrutura de execução — VPS

Esta seção não existia na v0.1 porque a plataforma gerenciada resolvia tudo implicitamente. Agora é decisão explícita.

**Topologia**

```
Internet
   │
   ▼
Cloudflare  ── DNS + CDN + TLS de borda + WAF + Web Analytics
   │            (cacheia HTML estático, imagens, fontes, vídeo)
   ▼
VPS Hostinger
   ├── Caddy          reverse proxy, TLS automático (Let's Encrypt), headers de segurança
   └── Docker
        └── nexustech-site   Next.js standalone, Node 22, porta interna 3000
             └── volume: /app/.next/cache   (persistente — cache de imagem otimizada)
```

**Decisões e justificativas**

| Decisão | Justificativa |
|---|---|
| **Build no CI, nunca na VPS** | Build de Next.js consome 2–4 GB de RAM. Uma VPS de entrada faz OOM no meio e derruba o site que está no ar. O CI constrói a imagem; a VPS só puxa e sobe |
| **Docker + Compose** | Rollback é trocar a tag da imagem e subir de novo. Sem Docker, rollback vira "reverter commit e rezar" |
| **Caddy, não Nginx** | TLS automático e renovação sem cron. Config de ~10 linhas contra ~60 do Nginx + certbot. Menos coisa para lembrar em três meses |
| **Cloudflare na frente** | Cacheia o HTML estático na borda, o que resolve a distância geográfica que a VPS única não resolve. De quebra: TLS de borda, WAF básico, proteção de DDoS e analytics sem cookie — tudo no free tier |
| **Cache de imagem em volume** | `next/image` otimiza sob demanda e grava em `.next/cache/images`. Sem volume, todo deploy zera o cache e a VPS reprocessa tudo na primeira visita |
| **Réplica única (`replicas: 1`)** | Consequência importante: com um processo só, **rate limit em memória funciona**. Se um dia houver mais de uma réplica, ele quebra silenciosamente — está registrado como risco na §8 |
| **Deploy com healthcheck** | `docker compose up -d` com healthcheck causa ~2s de indisponibilidade. Aceitável na v1. Blue/green fica no roadmap |
| **Segredos no GitHub Secrets + `.env` na VPS** | O token do GitHub só existe no ambiente de build. Nunca chega à VPS, nunca chega ao bundle |

**Hardening da VPS** (fase 0): SSH só por chave, root desabilitado, `ufw` liberando apenas 22/80/443, `fail2ban` no SSH, atualizações de segurança automáticas, usuário sem privilégio rodando o Docker, log rotation configurado.

**O que se perde em relação a plataforma gerenciada:** preview automático por branch. Mitigação na fase 0 — um segundo container em `preview.nexustech.com.br`, atualizado manualmente quando você quiser revisar algo antes do merge. Não é automático, e tudo bem.

### 3.3 Metas numéricas

Nenhuma destas é negociável durante a execução. São critério de aceite, não aspiração.

| Métrica | Meta | Onde é verificada |
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
| Peso da página de projeto (sem contar vídeo sob demanda) | ≤ 1,5 MB | Fase 7 |
| Contraste texto/fundo | ≥ 4,5:1 normal, ≥ 3:1 grande e UI | **Fase 1** |
| Build no CI | ≤ 3 min | Fase 0 |
| Uptime | ≥ 99,5 %/mês | Fase 10 |

### 3.4 Variáveis de ambiente

| Variável | Escopo | Obrigatória | Consumidor |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build + runtime | Sim | metadata, sitemap, OG, canonical |
| `GITHUB_SNIPPETS_TOKEN` | **build apenas** | Sim (fase 6) | script de snippets. Fine-grained, escopo `contents: read`, só nos repos listados no manifesto |
| `RESEND_API_KEY` | runtime | Sim (fase 8) | Route Handler de contato |
| `CONTACT_TO_EMAIL` | runtime | Sim (fase 8) | destinatário do formulário |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Sim (fase 8) | widget no cliente |
| `TURNSTILE_SECRET_KEY` | runtime | Sim (fase 8) | validação no servidor |
| `SENTRY_DSN` | runtime | Não | captura de erro |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | build | Não | script do Cloudflare Analytics |

Um módulo `env.ts` valida essa tabela com Zod **no boot**. Variável obrigatória ausente derruba o container com mensagem clara, antes de servir a primeira requisição.

---

## 4. Controle de páginas — o modelo de conteúdo

O ponto central do pedido. O fluxo passa a ser: **criar um arquivo `.mdx` → a tela existe, com rota, SEO, card social e listagem na home.**

### 4.1 Como funciona

1. Cada projeto é um arquivo em `content/projetos/`. O nome do arquivo é o slug da URL.
2. O **frontmatter** carrega os metadados estruturados (§4.2).
3. Um **schema Zod** valida esse frontmatter. A validação roda em duas horas distintas: no build (para o que é renderizado) e no `validate:content` do CI (para **todos** os arquivos, inclusive despublicados). Campo faltando derruba o pipeline — o erro aparece na sua máquina ou no PR, nunca no ar.
4. O **corpo em MDX** é a narrativa livre, onde você intercala componentes prontos do design system: galeria, vídeo, bloco de código, quadro de arquitetura, callout.
5. `generateStaticParams` varre a pasta e registra as rotas sozinho.
6. Um **repositório de conteúdo** (camada única de leitura, com cache) alimenta ao mesmo tempo: a listagem da home, a página do projeto, o sitemap, o feed e a navegação anterior/próximo.

### 4.2 Schema do frontmatter

Fonte da verdade do que é um projeto. Este é o artefato mais importante da fase 3.

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `titulo` | `string` | Sim | 3–60 caracteres |
| `resumo` | `string` | Sim | 50–160 caracteres — vira meta description e texto do card |
| `status` | `'publicado' \| 'despublicado' \| 'arquivado'` | Sim | **Default `despublicado`** — publicar é ato deliberado, não esquecimento |
| `destaque` | `number \| null` | Não | Ordem na home. `null` = não aparece em destaque |
| `periodo` | `{ inicio: 'YYYY-MM', fim: 'YYYY-MM' \| null }` | Sim | `fim: null` = em andamento |
| `papel` | `string` | Sim | Ex.: "Desenvolvedor full-stack" |
| `stack` | `string[]` | Sim | Mínimo 1 item |
| `cliente` | `string` | Não | Omitido quando houver NDA |
| `capa` | `{ src: string, alt: string }` | Sim | `alt` obrigatório — acessibilidade por construção, não por lembrança |
| `ogImage` | `string` | Não | Se ausente, é gerado do frontmatter via `next/og` |
| `links` | `{ demo?: string, repo?: string }` | Não | URLs validadas |
| `atualizadoEm` | `date` | Sim | Alimenta `lastmod` no sitemap |

### 4.3 Consequências práticas

- Publicar projeto novo = escrever um markdown, mudar `status` e commitar. Nenhum componente é tocado.
- Despublicar = mudar `status`. O arquivo permanece versionado.
- **Slug despublicado responde `410 Gone`** e sai do `sitemap.xml` automaticamente (fonte única de leitura). O `410` faz o Google desindexar rápido, em vez de manter uma URL morta apontando para 404 por semanas.
- Reordenar destaques = mudar um número.
- Erro de digitação em campo obrigatório = pipeline vermelho, não página quebrada em produção.

### 4.4 Estrutura de pastas

```
nexustech-site/
├── content/
│   ├── projetos/            # um .mdx por projeto — cada arquivo vira uma rota
│   └── snippets.json        # manifesto: repo + arquivo + região + SHA + hash
├── src/
│   ├── app/                 # rotas, layouts, metadata, sitemap, robots, OG
│   ├── components/
│   │   ├── ui/              # primitivos do design system (pixel, terminal, HUD)
│   │   ├── sections/        # blocos da home
│   │   └── mdx/             # componentes disponíveis dentro do MDX
│   ├── lib/                 # leitura de conteúdo, schemas Zod, env, SEO, utilitários
│   └── styles/              # tokens e camadas base do Tailwind
├── scripts/                 # build de snippets, validate:content
├── infra/
│   ├── Dockerfile
│   ├── compose.yml
│   └── Caddyfile
├── public/                  # assets estáticos, fontes, vídeos
└── tests/                   # smoke tests Playwright
```

---

## 5. Convenção de trabalho e rastreamento

O histórico do repositório é o registro de progresso do projeto — sem planilha paralela.

| Elemento | Regra |
|---|---|
| Fluxo | `branch por fase` → `PR` → CI verde → **squash merge** → 1 commit em `main` |
| Padrão | `tipo(escopo): descrição` — Conventional Commits |
| Escopo | O nome da fase (`setup`, `design-system`, `content`, `snippets`, …) |
| Nome da branch | `feat/fase-03-content` |
| Corpo do commit | Lista do que entrou e das decisões tomadas na fase |
| Tag | `v0.1` … `v1.0` ao fim das fases marcadas como marco |
| Bloqueio | Nenhum PR faz merge com lint falhando, erro de tipo, `validate:content` vermelho ou build quebrado |

O squash merge é o que reconcilia as duas intenções: PR obrigatório com CI, e um commit limpo por fase em `main`.

---

## 6. Fases

**Mudança em relação à v0.1:** a camada de conteúdo (antiga fase 4) passou a ser a **fase 3**, e a home passou a ser a **fase 4**. Motivo: na v0.1 a home era construída sem a listagem de projetos e precisava ser revisitada depois — retrabalho garantido, sem commit previsto. Agora a home nasce inteira.

---

### Fase 0 — Fundação, infraestrutura e pipeline

**Objetivo:** ter um projeto que roda, compila, valida e **publica na VPS** — ainda sem nenhuma tela real.

**O que é feito:** projeto Next.js com TypeScript strict, Tailwind v4 e `output: 'standalone'`; `.nvmrc` com Node 22; ESLint, Prettier, Husky, lint-staged; módulo `env.ts` com validação Zod; repositório privado criado; hardening da VPS (SSH por chave, `ufw`, `fail2ban`, usuário sem privilégio, updates automáticos); Docker e Compose instalados; Caddy configurado com TLS automático e headers de segurança; DNS apontado no Cloudflare em modo proxy; `Dockerfile` multi-stage; pipeline de CI (lint, typecheck, build) e de CD (build de imagem → GHCR → SSH → `compose up -d`); ambiente de preview manual em `preview.nexustech.com.br`; verificação da DNS do Resend (SPF/DKIM) iniciada agora, porque propagação leva tempo.

**Como é feito:** a validação de ambiente é resolvida antes de existir código que dependa dela — variável ausente derruba o boot com mensagem clara, em vez de erro obscuro em runtime. O build roda no CI e nunca na VPS: um build de Next.js consome 2–4 GB e faria OOM no meio, derrubando o site que já está no ar. A imagem versionada no GHCR torna rollback uma troca de tag.

**Princípios aplicados:** Resiliência (rollback por tag, healthcheck no container), Network Safe (TLS ponta a ponta, headers restritivos).

**Critério de aceite:**
- `pnpm build` limpo localmente e no CI, em ≤ 3 min
- página placeholder no ar em `nexustech.com.br` com HTTPS válido (nota A em SSL Labs)
- PR com erro proposital de lint é bloqueado pelo CI
- `docker compose up -d` com a tag anterior derruba e restaura o site em < 30 s

**Commit:** `chore(setup): scaffold, hardening da VPS, containerização e pipeline de CI/CD`

---

### Fase 1 — Design system e tokens

**Objetivo:** transformar a estética em código reutilizável, antes de montar qualquer página.

**O que é feito:** paleta da Nexus Tech como CSS variables; fontes display e mono via `next/font/local`; escala tipográfica, espaçamento e bordas; primitivos visuais — botão pixel, moldura de terminal, card HUD, badge de status, marquee, divisor, overlay CRT, wrapper de reveal on scroll; **teste automatizado de contraste** percorrendo todos os pares texto/fundo dos tokens.

**Como é feito:** nenhum componente carrega cor literal — tudo consome token. Trocar a paleta inteira do site é editar um arquivo. O wrapper de animação centraliza o respeito a `prefers-reduced-motion`, de modo que acessibilidade não vira decisão a ser lembrada em cada uso. Cada primitivo nasce responsivo e navegável por teclado.

**Correção em relação à v0.1:** o contraste era decidido aqui e só auditado na fase 9. Se reprovasse, oito fases de componentes precisariam ser revalidadas. Agora ele **bloqueia esta fase**: neon sobre escuro é bonito e reprova com facilidade, e descobrir isso agora custa uma tarde — descobrir na fase 9 custa a paleta inteira.

**Princípios aplicados:** UX (foco visível, estados de hover e disabled), Memory Safe (observers de scroll com cleanup obrigatório no wrapper de reveal).

**Critério de aceite:**
- rota `/_dev/design-system` exibindo todos os primitivos
- `pnpm test:contrast` verde — todo par ≥ 4,5:1 (normal) e ≥ 3:1 (grande/UI)
- troca de paleta validada alterando apenas o arquivo de tokens

**Commit:** `feat(design-system): tokens, tipografia, primitivos visuais e teste de contraste`

---

### Fase 2 — Shell da aplicação

**Objetivo:** a casca que envolve todas as páginas — o que dá a sensação de "jogo bootando".

**O que é feito:** layout raiz com metadata base; sequência de boot (preloader com contador); navegação com estado de scroll e menu mobile; rodapé; toggle de som com preferência persistida; páginas de erro e de rota não encontrada dentro da estética.

**Como é feito:** o preloader tem duração máxima de 2,5 s e sai sozinho se algum asset falhar — nunca prende o visitante numa tela de carregamento infinita. O som nasce desligado e é opt-in explícito. Listeners de scroll e resize são registrados com cleanup e throttling. A 404 é tratada como tela do jogo, e é também o destino de link antigo — mas projeto despublicado responde `410`, não `404` (§4.3).

**Princípios aplicados:** UX (feedback de carregamento, erro tratado), Resiliência (timeout do preloader), Memory Safe (cleanup de listeners e áudio).

**Critério de aceite:**
- navegação funcional em desktop e mobile
- boot sai em ≤ 2,5 s mesmo com asset bloqueado no DevTools
- JS inicial ≤ 150 KB gzip (`pnpm analyze`)
- 404 e 500 estilizadas

**Commit:** `feat(shell): layout raiz, navegação, sequência de boot e páginas de erro`

---

### Fase 3 — Camada de conteúdo e controle de páginas

*(era fase 4 na v0.1)*

**Objetivo:** o coração do projeto. Depois desta fase, criar arquivo passa a criar tela.

**O que é feito:** schema Zod do frontmatter (§4.2); camada de leitura de conteúdo com cache; pipeline MDX configurado; rota dinâmica com `generateStaticParams`; **página de projeto em versão mínima** (título + corpo renderizado, sem estética ainda — isso é a fase 5); ordenação, filtro por status e navegação anterior/próximo derivados do conteúdo; script `validate:content`; política de `410` para despublicado; `sitemap.ts` e `robots.ts`.

**Como é feito:** existe **uma única** função de leitura de conteúdo, usada por listagem, página, sitemap e metadata — nenhuma leitura de arquivo espalhada pelo código. O `validate:content` lê **todos** os arquivos, ignorando `status`, e roda no CI: sem isso, um rascunho apodrece em silêncio e explode no dia em que você o publica, seis meses depois e com pressa. Rotas são pré-renderizadas: a página vira HTML estático servido pelo Cloudflare.

**Princípios aplicados:** Escalabilidade (a arquitetura é indiferente a 5 ou 200 projetos), Performance (leitura em build, cache em memória).

**Critério de aceite:**
- adicionar um `.mdx` de teste faz aparecer entrada no sitemap, rota acessível e navegação anterior/próximo — **sem editar nenhum componente**
- `pnpm validate:content` falha com mensagem clara ao remover um campo obrigatório de um arquivo **despublicado**
- slug com `status: 'despublicado'` responde `410` e não aparece no sitemap

**Commit:** `feat(content): schema de projetos, pipeline MDX, rotas dinâmicas e validação`
**Marco:** `v0.3` — controle de páginas funcionando

---

### Fase 4 — Home

*(era fase 3 na v0.1, agora completa)*

**Objetivo:** a landing inteira, com conteúdo real e a listagem de projetos consumindo a fase 3.

**O que é feito:** hero com badge de disponibilidade, título, CTAs e cards de HUD; marquee duplo de tecnologias; seção "sobre" na moldura de terminal; processo em passos numerados; grade de serviços; **grid de projetos com estado vazio e skeleton**; FAQ em acordeão acessível.

**Como é feito:** todo texto da home vem de um módulo de conteúdo tipado, não fica espalhado em JSX — editar a home é editar dados. O marquee é animação CSS, não loop de JavaScript.

**Correção em relação à v0.1:** a v0.1 justificava o FAQ como *"a seção com maior potencial de rich snippet no Google"*. Isso não vale mais: o Google restringiu FAQ rich results a sites de governo e saúde em agosto de 2023 e **desativou o recurso para todos em 7 de maio de 2026**. O `FAQPage` JSON-LD continua na fase 9, mas por outro motivo — segue sendo tipo válido de schema.org, parseado por Bing e pelos crawlers que alimentam busca com IA. O acordeão continua usando primitivo acessível, agora porque é a coisa certa a fazer, não por SERP.

**Princípios aplicados:** Performance (animação em CSS, sem reflow por frame), UX (navegação por teclado no acordeão, estado vazio tratado).

**Critério de aceite:**
- home completa e responsiva de 320 px a 2560 px
- grid de projetos alimentado pela fase 3, com estado vazio funcional
- peso da home ≤ 1,2 MB
- conteúdo textual editável sem tocar em componente

**Commit:** `feat(home): seções institucionais, marquee, serviços, vitrine de projetos e FAQ`

---

### Fase 5 — Template da página de projeto

**Objetivo:** a versão "tela de fase" da estética, e os componentes que o MDX pode usar.

**O que é feito:** header do projeto com HUD de metadados (stack, papel, período, status); sumário lateral gerado a partir dos títulos; componentes disponíveis no MDX — galeria, vídeo, callout, quadro de arquitetura, tabela de decisões técnicas; rodapé com navegação entre projetos e CTA de contato.

**Como é feito:** os componentes MDX são fechados e opinativos: recebem dados, aplicam a estética, não aceitam estilo arbitrário. Isso garante que uma página escrita daqui a seis meses saia visualmente idêntica às atuais. O sumário é derivado da árvore de títulos, não escrito à mão.

**Princípios aplicados:** UX (leitura confortável em textos longos, âncoras estáveis), Escalabilidade (consistência garantida por construção).

**Critério de aceite:**
- **dois projetos reais** publicados ponta a ponta usando todos os componentes (bloqueado por **C2** do Workstream C)
- sumário navegável por teclado com âncoras estáveis

**Commit:** `feat(projeto): template de página, HUD de metadados e componentes MDX`

---

### Fase 6 — Vitrine de código

**Objetivo:** mostrar código dos repositórios privados de forma curada, versionada e sem duplicação.

**O que é feito:** manifesto de snippets; script de build que busca os trechos via GitHub API; highlight em build time com Shiki; componente de bloco de código na moldura de terminal, com título, linguagem, marca de copyright e comentário de contexto; cache local dos trechos.

**Como é feito — correção crítica em relação à v0.1:** a v0.1 ancorava cada trecho em "arquivo + intervalo de linhas". Isso é referência instável: bastava adicionar três imports no repositório de origem para o build puxar as linhas erradas, **passar no CI e publicar um fragmento sem sentido**. Falha silenciosa é a pior classe de falha. Agora:

| Regra | Efeito |
|---|---|
| Cada entrada exige `ref` = **SHA de commit**, nunca `main` | O trecho fica congelado no ponto em que você o escolheu |
| Cada entrada guarda `expectedHash` (SHA-256 do trecho resolvido) | Divergência **derruba o build** com "snippet X mudou na origem — revalide" |
| Âncora preferencial por marcador (`// #region snippet:auth-guard`) | Sobrevive a refactor; custa um comentário no repo de origem |
| Fallback para cache é **anunciado**, não silencioso | Usa cache, registra no log e falha o CI se o cache tiver mais de 30 dias |

O código-fonte não é duplicado no repositório do site — o manifesto aponta para a origem e o build resolve. O bloco não tem botão de copiar nem endpoint bruto; o atrito é deliberado, mas a proteção real continua sendo a curadoria (§2.1) e o aviso de licença proprietária.

**Princípios aplicados:** Resiliência (fallback anunciado, retry com backoff), Network Safe (timeout explícito na API), Performance (highlight em build, zero JS no cliente).

**Critério de aceite:**
- trechos renderizados a partir de repositório privado
- alterar o arquivo de origem **não** muda o site (SHA congelado)
- alterar o `expectedHash` manualmente derruba o build com mensagem clara
- API indisponível → build usa cache e avisa
- `grep -r "$GITHUB_SNIPPETS_TOKEN" .next/` não retorna nada

**Commit:** `feat(snippets): pipeline de código curado, ancorado em commit e verificado por hash`

---

### Fase 7 — Mídia

**Objetivo:** imagem e vídeo com peso controlado, porque é aqui que portfólio costuma morrer.

**O que é feito:** pipeline de vídeo self-hosted (encode padronizado: 720p, H.264 + AV1, sem áudio, CRF alvo para ≤ 3 MB por demo de 30 s); player leve com poster, sem autoplay com áudio e com overlay de play na estética arcade; galeria com lightbox acessível; padronização de dimensões, formatos modernos e placeholder de carregamento; cache de imagem em volume validado; regras de cache do Cloudflare para `/public`.

**Como é feito — correção em relação à v0.1:** a v0.1 escolhia vendor externo justificando que *"demo de 30s em `/public` vira 20 MB"*. Isso vale para export cru de OBS a 60 fps; um screencast 720p sem áudio, encodado direito, fica entre 1,5 e 3 MB. Com VPS própria e Cloudflare cacheando na borda, um vendor de vídeo é conta nova, SDK novo e chave nova para resolver um problema que não existe nesta escala. (De quebra: a bunny.net, cotada na v0.1 como "tier gratuito", não tem plano gratuito — é pay-as-you-go com mínimo de US$ 1/mês.) Vendor entra no roadmap se houver vídeo longo, múltiplas resoluções ou catálogo crescendo.

Vídeo só carrega quando entra em viewport, com poster estático antes. Toda imagem tem dimensão declarada para eliminar layout shift.

**Princípios aplicados:** Performance (lazy load, formatos modernos, orçamento explícito), UX (placeholder, sem salto de layout), Memory Safe (observers e elementos de mídia liberados ao desmontar).

**Critério de aceite:**
- página de projeto com vídeo ≤ 1,5 MB sem contar o vídeo sob demanda
- Lighthouse mobile Performance ≥ 90 nessa página
- deploy novo não zera o cache de imagem (volume persistente validado)

**Commit:** `feat(midia): pipeline de imagem, vídeo self-hosted otimizado e galeria`

---

### Fase 8 — Contato

**Objetivo:** o caminho de conversão. Precisa ser o trecho mais confiável do site.

**O que é feito:** formulário na estética de caixa de diálogo, com validação no cliente e no servidor pelo mesmo schema; Route Handler de envio; disparo via Resend; **Turnstile + honeypot + rate limit em memória**; estados explícitos de envio, sucesso e erro; links diretos de e-mail, LinkedIn, GitHub e WhatsApp; **página de política de privacidade e finalidade declarada no formulário (LGPD)**.

**Como é feito:** o schema de validação é único e compartilhado entre cliente e servidor — nunca duas verdades. O botão bloqueia durante o envio para impedir duplo disparo. Se o Resend cair, a mensagem de erro oferece o canal alternativo em vez de sumir com o lead. O envio tem timeout e `AbortController`.

**Nota sobre rate limit — reversão de um achado do review:** em plataforma serverless, contador em memória não funciona (cada invocação pode cair em instância nova) e ainda viraria estado global mutável. **Com VPS de réplica única, isso deixa de ser verdade**: o processo é um só e o contador persiste. O rate limit em memória volta a ser legítimo aqui. A ressalva está registrada na §8: se um dia houver mais de uma réplica, ele quebra em silêncio.

**LGPD — ausente na v0.1:** o formulário coleta dado pessoal e o site é de pessoa jurídica brasileira. Exige, no mínimo, política de privacidade acessível a partir do formulário e finalidade declarada no ponto de coleta. O Cloudflare Web Analytics não usa cookie, então não há banner de consentimento a construir — essa parte a §2.2 já resolveu por consequência.

**Princípios aplicados:** UX (três estados sempre visíveis, erro acionável), Escalabilidade (rate limit), Resiliência (retry e canal alternativo), Network Safe (timeout e `AbortController`).

**Critério de aceite:**
- envio real recebido na caixa de entrada
- comportamento correto simulando falha do Resend (canal alternativo oferecido)
- 6 envios seguidos do mesmo IP → o 6º é barrado
- envio automatizado sem token Turnstile → rejeitado
- política de privacidade linkada e acessível

**Commit:** `feat(contato): formulário validado, envio transacional, anti-spam e LGPD`

---

### Fase 9 — SEO, acessibilidade e performance

**Objetivo:** ser encontrado e ser usável. Fase de fechamento, não de detalhe.

**O que é feito:** metadata por rota com título, descrição e canonical; imagens Open Graph geradas dinamicamente por projeto; JSON-LD de `Person`, `Organization` e `FAQPage`; auditoria de navegação por teclado, foco visível e leitor de tela; ajuste final de Core Web Vitals; verificação no Search Console.

**Como é feito:** o card social de cada projeto é gerado a partir do frontmatter — projeto novo já nasce com imagem própria, sem trabalho manual. O `FAQPage` entra por legibilidade de máquina (Bing e crawlers de busca com IA), não por rich snippet no Google, que foi desativado em maio de 2026. **O contraste não é auditado aqui** — foi resolvido na fase 1, que é onde ele é decidido.

**Princípios aplicados:** UX (acessibilidade real), Performance (Core Web Vitals dentro da meta da §3.3).

**Critério de aceite:**
- Lighthouse mobile: ≥ 90 / ≥ 95 / 100 / 100
- LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1
- navegação completa por teclado, sem armadilha de foco
- todas as rotas publicadas indexáveis; despublicadas retornando `410`

**Commit:** `feat(seo): metadata, OG dinâmico, dados estruturados e auditoria de acessibilidade`

---

### Fase 10 — Lançamento

**Objetivo:** no ar, no domínio próprio, com rede de segurança.

**O que é feito:** variáveis de produção conferidas; smoke tests Playwright cobrindo home, listagem, página de projeto, 404, 410 e envio de formulário; Cloudflare Web Analytics; Sentry; monitoramento de uptime externo; rotina de snapshot da VPS; runbook de operação; conteúdo real de todos os projetos publicado (**bloqueado por C3**).

**Como é feito:** o smoke test roda no CI e cobre exatamente o cenário mais provável de quebra silenciosa — publicar um `.mdx` malformado e derrubar a rota. O **runbook** substitui o que uma plataforma gerenciada fazia por você: como publicar, como fazer rollback, onde ficam os logs, o que fazer se o container não subir, como renovar o token de snippets. Daqui a três meses você não vai lembrar, e a VPS não tem botão de "redeploy".

**Princípios aplicados:** Resiliência (rollback documentado e testado, monitoramento externo).

**Critério de aceite:**
- site no ar no domínio, testes verdes no CI
- `pnpm test:e2e` cobrindo os 6 cenários
- rollback executado de verdade e cronometrado (< 30 s)
- alerta de uptime dispara ao derrubar o container de propósito
- publicação de projeto novo validada de ponta a ponta pelo runbook

**Commit:** `chore(release): produção, smoke tests, monitoramento e runbook`
**Marco:** `v1.0`

---

### Workstream C — Conteúdo (paralelo às fases 3 a 10)

*Novo na v0.2.* A v0.1 identificava "conteúdo atrasar o lançamento" como risco **Alto** e mitigava com *"escrever os `.mdx` em paralelo"* — mas isso não era fase, não tinha dono, não tinha critério e não bloqueava nada. Na prática, tudo que não tem critério não acontece. Esta é a causa número um de portfólio de dev que fica 90% pronto por dois anos.

Com a decisão de ir linear até `v1.0`, sem release intermediário, este workstream passa a ser **a principal mitigação de risco do projeto**.

| Marco | Entrega | Bloqueia |
|---|---|---|
| **C1** | Lista definitiva dos projetos da v1 + resumo de 1 parágrafo de cada | **Fase 3** — o schema depende de saber quais campos os projetos reais precisam |
| **C2** | 2 projetos escritos por inteiro, com capa e mídia | **Fase 5** |
| **C3** | Todos os projetos da v1 escritos e revisados | **Fase 10** |

**Critério:** cada `.mdx` passa no `pnpm validate:content` e renderiza sem componente faltando.

---

## 7. Roadmap pós-v1

- Seção de conteúdo editorial / blog, reaproveitando integralmente a camada MDX
- Versão em inglês, com a estrutura de rotas já preparada
- Modo de leitura para as páginas de projeto (alternativa de baixo contraste à estética CRT)
- Estudos de caso com métricas de resultado
- Página dedicada a serviços com proposta comercial
- Deploy blue/green sem indisponibilidade
- Vendor de vídeo, se o catálogo crescer

---

## 8. Riscos identificados

| Risco | Impacto | Mitigação |
|---|---|---|
| **Projeto não lança por falta de release intermediário** *(novo)* | Alto | Workstream C com marcos bloqueantes; C1 antes da fase 3 |
| Conteúdo dos projetos atrasar o lançamento | Alto | Workstream C — deixou de ser boa intenção e virou bloqueio de fase |
| **Build de Next.js fazer OOM na VPS** *(novo)* | Alto | Build só no CI; a VPS apenas puxa imagem pronta |
| **Rate limit em memória quebrar ao escalar réplicas** *(novo)* | Médio | Réplica fixada em 1 no Compose, com comentário explícito; migrar para Redis se um dia escalar |
| Snippet errado publicado por deriva de linha | Alto | SHA de commit + `expectedHash` com falha ruidosa (fase 6) |
| Token do GitHub vazar no bundle | Alto | Escopo mínimo, uso restrito ao build, verificação por `grep` no critério de aceite da fase 6 |
| Contraste neon reprovar em acessibilidade | Médio | Teste automatizado como critério de aceite da **fase 1**, não da 9 |
| **VPS cair sem ninguém perceber** *(novo)* | Médio | Monitoramento externo de uptime na fase 10, com alerta testado |
| **Cache de imagem zerar a cada deploy** *(novo)* | Baixo | Volume persistente, validado no critério de aceite da fase 7 |
| Peso de vídeo destruir o carregamento | Médio | Encode padronizado, lazy load e orçamento verificado na fase 7 |
| Semelhança excessiva com o portfólio de referência | Médio | Paleta e momentos de assinatura próprios, definidos na fase 1 |

---

## 9. Pendências para validação

Itens que dependem de decisão sua antes da fase 1:

1. **Paleta da Nexus Tech** — direção de cor definitiva (ciano/magenta, verde-fósforo, âmbar de terminal ou outra). *Bloqueia a fase 1 e o documento de design system.*
2. **Domínio** — subdomínio ou raiz de `nexustech.com.br`.
3. **Quais projetos entram na v1** — nomes e quantidade. *É o marco C1 e bloqueia a fase 3.*
4. **Idioma da v1** — confirmar pt-BR apenas.
5. **Especificação da VPS** — vCPU, RAM e banda, para dimensionar `sharp`, cache de imagem e o encode de vídeo.

Resolvidas nesta versão: hospedagem (VPS própria), estratégia de lançamento (linear até `v1.0`), provedor de vídeo (self-hosted).

---

## 10. Documentos relacionados

| Documento | Conteúdo | Status |
|---|---|---|
| `PLANO-LANDING-NEXUSTECH.md` (este) | Arquitetura, infraestrutura, fases e critérios | v0.2 |
| `REVIEW-PLANO-LANDING-NEXUSTECH.md` | Review crítico da v0.1 e origem destas correções | Concluído |
| `PLANO-DESIGN-SYSTEM-NEXUSTECH.md` | Tokens, paleta, tipografia, primitivos, animação, regras de acessibilidade | A produzir — bloqueado pela pendência 1 |
| `PLANO-TELAS-NEXUSTECH.md` | Especificação tela a tela: seções, conteúdo, comportamento, responsividade, estados | A produzir |
