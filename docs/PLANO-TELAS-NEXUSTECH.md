# Plano de Telas — Landing Page Nexus Tech

> **ARQUIVO HISTORICO:** nao implementar. Especificacao ativa em `PLANO-TELAS-ALLANDEV.md`.

**Versão:** 1.0
**Autor:** Allan — Nexus Tech
**Documento pai:** `PLANO-LANDING-NEXUSTECH-v0.2.md`
**Referência estrutural:** `muniz.dev` (Gabriela Muniz)
**Paleta:** azul Nexus Tech (proposta no Anexo A; formalizada em `PLANO-DESIGN-SYSTEM-NEXUSTECH.md`)

---

## 0. Como usar este documento

Cada seção abaixo é uma unidade fechada. Um agente de IA deve conseguir implementar qualquer uma delas lendo só a sua própria ficha, sem precisar do contexto das outras.

**Formato de cada ficha:**

| Campo | O que traz |
|---|---|
| Âncora / rota | O identificador usado em navegação e links internos |
| Objetivo | Por que a seção existe. Se não der para responder, ela sai |
| Anatomia | Os elementos, na ordem do DOM |
| Conteúdo | Texto real proposto — não lorem ipsum |
| Comportamento | Interação, animação, o que acontece no scroll e no clique |
| Estados | Loading, vazio, erro. Toda seção que busca dado tem os três |
| Responsividade | 320 / 640 / 768 / 1024 / 1280 |
| Acessibilidade | Semântica, teclado, leitor de tela |
| Fase | Onde entra no plano v0.2 |
| Aceite | Como se prova que ficou pronta |

**Breakpoints** (Tailwind padrão): `base` 320px · `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px.

---

## 1. Fidelidade à referência — o que copiar e o que não

Você pediu fidelidade. Vale separar as camadas, porque elas têm naturezas diferentes:

| Camada | Decisão | Motivo |
|---|---|---|
| **Estrutura e ordem das seções** | Copiar | Sequência de landing page é padrão de mercado, não autoria. A referência acertou a ordem |
| **Padrões de interação** (preloader com contador, marquee duplo, moldura de terminal, acordeão, cards de vídeo) | Copiar | São padrões de UI, não obras. A execução é que diferencia |
| **Paleta** | **Trocar** — roxo → azul Nexus Tech | Pedido seu, e é o que mais muda a percepção de identidade |
| **Textos** | **Reescrever inteiro** | Texto é obra protegida. Além disso, o posicionamento dela é "dev freelancer full stack"; o seu é "infra + dev", que é outra proposta e outro cliente |
| **Imagens, foto, ícones, OG** | **Próprios** | Assets são obra protegida, sem exceção |
| **Seção de repositórios** | **Substituir** por vitrine de código curada | Ela lista repos públicos via API. Os seus são privados — a mecânica não existe no seu caso (§4 deste doc, seção S7) |
| **Cards de projeto** | **Estender** para rota própria | Na referência o card é o fim da linha. No seu plano ele leva a uma página completa (fase 5 do v0.2) |

O risco "semelhança excessiva com o portfólio de referência" continua na §8 do plano v0.2 em nível Médio. Com paleta azul, texto próprio, vitrine de código no lugar dos repos públicos e páginas de projeto que a referência não tem, ele cai bastante — mas a foto do hero e os ícones dos serviços são os dois pontos onde a cópia fica visível se você não trocar. Trate-os como obrigatórios.

---

## 2. Mapa de rotas

| Rota | Tipo | Origem | Fase |
|---|---|---|---|
| `/` | Estática | Módulo de conteúdo tipado + camada MDX | 4 |
| `/projetos` | Estática | Camada de conteúdo (fase 3) | 4 |
| `/projetos/[slug]` | SSG por `generateStaticParams` | Um `.mdx` por projeto | 3 (mínima) → 5 (completa) |
| `/privacidade` | Estática | MDX simples | 8 |
| `/404` | Estática | — | 2 |
| `410 Gone` | Runtime | `status: 'despublicado'` no frontmatter | 3 |
| `/_dev/design-system` | Estática, `noindex` | — | 1 |

**Sobre a home:** é single-page com âncoras, exatamente como a referência. As seções S3 a S11 vivem todas em `/`. `/projetos` existe como listagem completa e destino do "ver todos", porque a home mostra só os destaques.

---

## 3. Sequência da home

```
S1  Barra de topo (fixa)
S2  Preloader / boot            [overlay, some após carregar]
S3  Hero
S4  Marquee de tecnologias
S5  Sobre
S6  Processo
S7  Projetos em destaque
S8  Vitrine de código           [substitui "repositórios" da referência]
S9  Serviços
S10 FAQ
S11 Contato
S12 Rodapé
```

---

## S1 — Barra de topo

**Âncora:** — (fixa, presente em todas as rotas)
**Fase:** 2

**Objetivo:** navegação persistente e assinatura da marca, sem competir com o hero.

**Anatomia (ordem do DOM):**
1. `<a>` skip-link "Pular para o conteúdo" (visível só no foco)
2. Toggle de som — ícone, `aria-pressed`
3. Logo `NEXUS TECH` (link para `/`)
4. Botão `≡ MENU` (mobile) / lista de links (desktop)

**Conteúdo:** links `SOBRE · PROCESSO · PROJETOS · SERVIÇOS · CONTATO`. Logo em tipografia display pixelada.

**Comportamento:**
- Barra transparente no topo; ao passar de 40px de scroll ganha fundo `--nx-bg-surface/90`, `backdrop-blur` e borda inferior. Transição de 200ms.
- Listener de scroll com `requestAnimationFrame` throttle e cleanup obrigatório no unmount.
- Link ativo destacado conforme a seção em viewport (`IntersectionObserver`, também com cleanup).
- Menu mobile: overlay em tela cheia, estética de menu de jogo. Trava o scroll do body enquanto aberto e devolve no fechamento.
- **Som:** nasce **desligado**. Clique liga efeitos curtos de UI (hover de botão, abertura de menu). Preferência persistida em `localStorage`. Nunca toca nada antes do opt-in.

**Estados:** topo / scrolled / menu aberto / som ligado / som desligado.

**Responsividade:**
- `base–md`: logo centralizado, som à esquerda, `≡ MENU` à direita.
- `lg+`: logo à esquerda, links no centro, som + CTA `FALAR COMIGO` à direita.

**Acessibilidade:**
- `<header>` + `<nav aria-label="Principal">`
- Menu mobile é `<dialog>` ou Radix Dialog: foco preso dentro, `Esc` fecha, foco volta ao botão que abriu
- Toggle de som com `aria-pressed` e rótulo textual, não só ícone
- Skip-link é o primeiro elemento focável da página

**Aceite:** navegação completa por teclado; menu mobile devolve o foco ao fechar; nenhum áudio dispara sem opt-in; `pnpm analyze` mostra o header sem dependência pesada.

---

## S2 — Preloader / sequência de boot

**Fase:** 2

**Objetivo:** estabelecer a estética "jogo bootando" nos primeiros dois segundos. É a coisa mais memorável do site e também o maior risco de UX do projeto.

**Anatomia:**
1. Overlay full-screen, `--nx-bg-void`
2. Logo `NEXUS TECH` com efeito de glitch sutil
3. Texto `CARREGANDO ASSETS...` em mono
4. Barra de progresso pixelada
5. Contador `0%` → `100%`

**Comportamento:**
- Progresso real de fontes e imagens críticas, **não** número falso animado.
- **Duração máxima de 2,5s.** Passou disso, sai de qualquer jeito. Um preloader que prende o visitante é pior que não ter preloader.
- Fade-out de 400ms revelando o hero, que entra com stagger.
- **Só aparece na primeira visita da sessão.** Flag em `sessionStorage`; navegação interna não reboota.
- `prefers-reduced-motion: reduce` → sem glitch, sem contador animado, fade simples de 150ms.

**Estados:** carregando / timeout atingido / já visto nesta sessão (não renderiza).

**Acessibilidade:** `role="status"` + `aria-live="polite"` no contador; overlay com `aria-busy="true"`; conteúdo da página presente no DOM por baixo (não bloquear indexação nem leitor de tela).

**Aceite:** bloquear um asset no DevTools → o boot ainda sai em ≤ 2,5s. Segunda navegação na mesma aba não mostra preloader.

---

## S3 — Hero

**Âncora:** `#topo`
**Fase:** 4

**Objetivo:** dizer em 3 segundos o que a Nexus Tech faz e para quem, e empurrar para um dos dois caminhos (orçamento ou portfólio).

**Anatomia:**
1. Badge de disponibilidade — ponto pulsante + texto
2. `<h1>` — display pixelada, o maior elemento da página
3. Parágrafo de apoio (2 linhas)
4. Dois CTAs: primário preenchido, secundário contornado
5. Imagem/ilustração à direita, dentro de moldura de terminal
6. Card de identidade sobre a imagem: nome + linha de stack
7. Dois cards HUD com números

**Conteúdo proposto:**

| Elemento | Texto |
|---|---|
| Badge | `● DISPONÍVEL PARA PROJETOS` |
| H1 | `SISTEMAS QUE AGUENTAM PRODUÇÃO` |
| Parágrafo | Desenvolvimento web, mobile e integrações por quem também administra servidor, banco e rede. Da infraestrutura à interface — com código limpo e entrega que não quebra na segunda semana. |
| CTA primário | `SOLICITAR PROPOSTA` → `#contato` |
| CTA secundário | `VER PROJETOS` → `#projetos` |
| Card de identidade | `ALLAN` · `Infra & Full Stack · Java · TypeScript · Next.js · PostgreSQL` |
| HUD 1 | `24h` / `RETORNO NA PRIMEIRA ANÁLISE` |
| HUD 2 | `FULL` / `DA INFRA À INTERFACE` |

> O H1 é o ponto onde seu posicionamento se separa da referência. Ela vende "dev full stack"; você vende "dev que também é infra" — que é raro, verificável pelo seu histórico e vale mais para cliente com sistema em produção. Não abra mão disso.

**Comportamento:**
- Entrada com stagger de 80ms entre os elementos, após o fade do preloader.
- Ponto do badge pulsa (CSS `@keyframes`, não JS).
- Overlay CRT sutil (scanlines) sobre a imagem, em `::after`, `pointer-events: none`.
- Parallax leve na imagem ao scroll — **desabilitado** em `prefers-reduced-motion` e em telas `< md`.

**Responsividade:**
- `base–md`: coluna única. Ordem: badge → H1 → parágrafo → CTAs → imagem → HUDs. H1 em `clamp(2rem, 9vw, 3.5rem)`. CTAs empilhados, largura total.
- `lg+`: grid 2 colunas (7fr / 5fr). HUDs sobrepostos nos cantos da imagem. H1 até `4.5rem`.

**Acessibilidade:** um `<h1>` só na página. Imagem com `alt` descritivo. CTAs são `<a>`, não `<button>` — navegam. Contraste do texto do badge verificado contra o fundo do badge, não contra o fundo da página (erro comum).

**Performance:** a imagem do hero é o LCP. `priority`, dimensões declaradas, AVIF + WebP, `sizes` correto. Nada de animação que mexa em `width`/`height` — só `transform` e `opacity`.

**Aceite:** LCP ≤ 2,5s no mobile; sem CLS ao carregar a imagem; hero legível em 320px sem scroll horizontal.

---

## S4 — Marquee de tecnologias

**Fase:** 4

**Objetivo:** comunicar amplitude de stack sem exigir leitura. Funciona como respiro visual entre hero e conteúdo.

**Anatomia:** duas faixas horizontais sobrepostas, correndo em direções opostas, com bordas superior e inferior.

**Conteúdo:** `TYPESCRIPT · JAVA · NEXT.JS · REACT · NODE.JS · SPRING · POSTGRESQL · SQL · REST APIS · DOCKER · LINUX · REACT NATIVE · GIT · CI/CD`

> Incluí `LINUX` e `CI/CD`, que a referência não tem e que são seus de verdade.

**Comportamento:**
- **Animação 100% CSS** (`transform: translateX`), nunca loop de JavaScript. Conteúdo duplicado no DOM para o loop ser contínuo.
- Faixa de cima corre para a esquerda, a de baixo para a direita. Velocidades levemente diferentes (40s / 55s) — igual demais fica hipnótico.
- `prefers-reduced-motion: reduce` → animação parada, faixa vira lista estática.
- `will-change: transform` só nas duas faixas, nunca herdado.

**Acessibilidade:** `aria-hidden="true"` no conteúdo duplicado; a faixa real tem `role="list"`. Alternativa: marcar a seção inteira como decorativa e garantir que a stack apareça em texto na seção Sobre (recomendado — é mais simples e igualmente honesto).

**Responsividade:** altura reduzida em `base–sm`; fonte menor; velocidade proporcional para a percepção não mudar.

**Aceite:** zero JS de animação; sem reflow por frame no Performance do DevTools; nada se move com reduced-motion.

---

## S5 — Sobre

**Âncora:** `#sobre`
**Fase:** 4

**Objetivo:** transformar competência técnica em confiança comercial. É onde o cliente decide se você entende o problema dele.

**Anatomia:**
1. Eyebrow `SOBRE`
2. `<h2>`
3. Moldura de terminal com aba de arquivo e prompt
4. Corpo de texto dentro do terminal
5. Lista de destaques em formato de saída de comando

**Conteúdo proposto:**

| Elemento | Texto |
|---|---|
| Eyebrow | `SOBRE` |
| H2 | `INFRAESTRUTURA E CÓDIGO NA MESMA CABEÇA` |
| Aba do terminal | `sobre.md` |
| Prompt | `allan@nexustech:~$ cat sobre.md` |
| Corpo | Administro servidores, bancos e redes há anos — e desenvolvo os sistemas que rodam neles. Isso muda o tipo de decisão que eu tomo: escolho arquitetura pensando em quem vai operar depois, porque normalmente sou eu. Trabalho com Java, TypeScript, Next.js, React Native e PostgreSQL, com atenção fixa em performance, resiliência e manutenção. |
| Saída de comando | `✓ 6 princípios não-negociáveis: performance, escalabilidade, UX, resiliência, memory safe, network safe` |

**Comportamento:**
- Cursor de bloco piscando ao fim do prompt (CSS).
- Texto revelado com efeito de digitação **opcional** — se usar, precisa de: velocidade ≥ 40 chars/s, botão de pular, texto completo no DOM desde o início (para SEO e leitor de tela) e desligado em reduced-motion. Se algum desses for inviável, corta o efeito. Digitação lenta em texto que o cliente precisa ler é atrito puro.
- Reveal on scroll com o wrapper padrão da fase 1.

**Responsividade:** terminal com padding reduzido em mobile; `font-size` mono nunca abaixo de 14px; largura de linha máxima de ~70ch em `lg+`.

**Acessibilidade:** o terminal é decoração — o conteúdo é `<p>` normal por dentro. Aba e prompt com `aria-hidden="true"`. Contraste do texto mono verificado (é o menor da página).

**Aceite:** texto completo presente no HTML servido (`curl` da rota mostra o parágrafo inteiro); legível em 320px.

---

## S6 — Processo

**Âncora:** `#processo`
**Fase:** 4

**Objetivo:** remover a incerteza de "como é trabalhar com ele". Reduz objeção antes do formulário.

**Anatomia:** eyebrow → `<h2>` → 3 cards numerados, cada um com número grande, `<h3>` e parágrafo. Linha conectora entre eles no desktop.

**Conteúdo proposto:**

| # | Título | Texto |
|---|---|---|
| 01 | `BRIEFING` | Você descreve o problema, o escopo e o prazo. Em até 24 horas eu devolvo uma análise inicial gratuita com riscos, premissas e uma estimativa honesta. |
| 02 | `CONSTRUÇÃO` | Entregas incrementais com ambiente de homologação no ar desde cedo. Você acompanha o progresso real, não um relatório de progresso. |
| 03 | `ENTREGA E OPERAÇÃO` | Deploy, testes, documentação e repasse. O projeto sobe pronto para ser operado — com runbook, não com "qualquer coisa me chama". |

**Comportamento:** reveal on scroll com stagger de 120ms. Número grande em `--nx-blue-glow` com baixa opacidade, atrás do título. Linha conectora desenhada por `border` em pseudo-elemento, escondida em `< lg`.

**Responsividade:** `base–md` coluna única; `lg+` três colunas iguais.

**Acessibilidade:** `<ol>` — os passos têm ordem semântica. Números decorativos com `aria-hidden`, já que o `<ol>` numera.

**Aceite:** ordem correta anunciada pelo leitor de tela; sem linha conectora quebrada no tablet.

---

## S7 — Projetos em destaque

**Âncora:** `#projetos`
**Fase:** 4 (a listagem) + 3 (a fonte de dados)

**Objetivo:** provar entrega. É a seção que fecha ou perde o cliente.

**Diferença estrutural em relação à referência:** lá o card é o destino final. **Aqui ele leva a uma página de projeto completa** (`/projetos/[slug]`, fase 5). Isso é o motivo do site existir (§1 do plano pai) e não pode ser perdido na cópia da estética.

**Anatomia:**
1. Eyebrow `PROJETOS`
2. `<h2>` + link `VER TODOS →` para `/projetos`
3. Grid de cards. Cada card:
   - Mídia (poster estático; vídeo carrega sob demanda)
   - Botão `▶ REPRODUZIR` sobre a mídia
   - `<h3>` título
   - Resumo (vem de `resumo` do frontmatter)
   - Chips de stack (3 primeiros + `+N`)
   - Badge de status (`EM ANDAMENTO` / `ENTREGUE`)
   - Card inteiro é clicável → `/projetos/[slug]`

**Fonte dos dados:** exclusivamente a camada de conteúdo da fase 3. Ordenados por `destaque`, filtrando `status: 'publicado'`. Máximo de 4 na home.

**Comportamento:**
- Hover: borda ganha `--nx-blue-glow`, leve elevação, scanline se intensifica. Nada que mexa em layout.
- `▶ REPRODUZIR` troca o poster pelo `<video>` e dá play. `preload="none"` até o clique — o vídeo só é baixado quando pedido.
- Só um vídeo toca por vez: iniciar um pausa o anterior.
- Vídeo pausa ao sair do viewport e é liberado no unmount (Memory Safe).

**Estados:**
- **Loading:** não existe — é SSG, o HTML já vem pronto.
- **Vazio:** nenhum projeto publicado → card de placeholder na estética: `NENHUM PROJETO PUBLICADO AINDA` + CTA para contato. Nunca uma grade vazia.
- **Erro de mídia:** vídeo falha → mantém o poster e esconde o botão de play. Não mostra erro ao visitante.

**Responsividade:** `base` 1 coluna · `md` 2 · `xl` 2 com cards maiores (4 projetos = 2×2 fica melhor que 4×1).

**Acessibilidade:**
- Card é `<article>` com um único link envolvendo o `<h3>` (padrão "link no título com pseudo-elemento cobrindo o card") — evita link aninhado dentro de link, que quebra leitor de tela
- Botão de play é `<button>` separado, com `stopPropagation` para não navegar
- `aria-label` do play inclui o nome do projeto: `Reproduzir demonstração de Nexos ERP`
- Chips de stack são `<ul>`

**Aceite:** adicionar um `.mdx` com `destaque: 1` faz o card aparecer sem tocar em componente; estado vazio renderiza; nenhum vídeo é baixado antes do clique (aba Network limpa no load).

---

## S8 — Vitrine de código

**Âncora:** `#codigo`
**Fase:** 6

**Substitui** a seção "Últimos repositórios" da referência.

**Por que muda:** a referência lista repositórios públicos via API do GitHub, no cliente. **Os seus são privados** — a mecânica simplesmente não existe no seu caso, e expor a árvore contradiz a §2.1 do plano pai. A estética de terminal fica; o conteúdo passa a ser trechos curados, resolvidos em build time (fase 6, com SHA congelado e hash de conferência).

**Objetivo:** provar competência técnica com evidência, não com adjetivo. É o diferencial que o GitHub privado te tira.

**Anatomia:**
1. Eyebrow `CÓDIGO`
2. `<h2>` `DECISÕES DE ARQUITETURA, NÃO ARQUIVOS`
3. Parágrafo curto explicando a curadoria
4. Navegação por abas (Radix Tabs) — uma por trecho
5. Painel ativo: moldura de terminal com barra de título (`arquivo.ts` · linguagem · projeto), código com highlight Shiki, e **parágrafo de contexto abaixo** explicando a decisão
6. Rodapé do bloco: `© Nexus Tech · código proprietário, exibido para avaliação técnica`

**Conteúdo proposto (parágrafo introdutório):** Os repositórios são privados. Em vez de uma árvore de arquivos, aqui estão trechos escolhidos — cada um com o problema que resolvia e por que foi resolvido assim.

**Comportamento:**
- Highlight gerado no build. **Zero JavaScript de highlight no cliente.**
- Sem botão de copiar e sem endpoint bruto — atrito deliberado (§2.1 do plano pai).
- Scroll horizontal dentro do bloco em telas pequenas, com sombra indicando que há mais conteúdo.
- Troca de aba sem layout shift: altura mínima fixada pelo maior trecho.

**Estados:** todos resolvidos em build. Se um trecho falhar na resolução, o **build quebra** — nada renderiza parcialmente em produção.

**Responsividade:** `base–md` abas viram select ou carrossel horizontal de chips; código com `font-size: 12px` e scroll horizontal. `lg+` abas verticais à esquerda, painel à direita.

**Acessibilidade:** Radix Tabs entrega o padrão ARIA correto (setas navegam, `Tab` sai do grupo). O `<pre>` recebe `tabindex="0"` para ser rolável por teclado. Contraste do tema Shiki verificado contra `--nx-bg-elevated` — temas prontos frequentemente reprovam.

**Aceite:** alterar o arquivo no repositório de origem não altera o site; `grep` no bundle não encontra o token; navegação entre abas por teclado.

---

## S9 — Serviços

**Âncora:** `#servicos`
**Fase:** 4

**Objetivo:** dar nome ao que o cliente pode comprar. Sem isso ele não sabe se o problema dele cabe.

**Anatomia:** eyebrow → `<h2>` → parágrafo → grid de 6 cards (ícone, `<h3>`, descrição).

**Conteúdo proposto:**

| Ícone | Título | Descrição |
|---|---|---|
| Monitor | `APLICAÇÕES WEB` | Sistemas e painéis com Next.js e React — responsivos, acessíveis e rápidos de operar. |
| Server | `BACKEND E APIS` | APIs REST com Java/Spring e Node.js, regra de negócio sólida e arquitetura que suporta crescer. |
| Smartphone | `APLICATIVOS MOBILE` | Android e iOS a partir de uma base só, com React Native e Expo. |
| Database | `BANCO DE DADOS` | Modelagem, otimização de query, migração e correção em PostgreSQL e SQL Server. |
| Network | `INFRAESTRUTURA E DEPLOY` | Servidores, containers, CI/CD, backup e monitoramento. Sistema no ar é diferente de sistema pronto. |
| GitBranch | `CONSULTORIA TÉCNICA` | Auditoria de código, revisão de arquitetura e apoio a time que precisa destravar. |

> Dois desses cards — infraestrutura e banco — a referência não tem. São exatamente onde você é mais forte e menos substituível. Não troque por algo mais genérico.

**Comportamento:** ícones `lucide-react`, tree-shaken, **nunca emoji** (a referência usa emoji; renderiza diferente em cada SO e não aceita token de cor). Hover: borda ganha glow, ícone muda para `--nx-blue-glow`.

**Responsividade:** `base` 1 col · `sm` 2 · `lg` 3.

**Acessibilidade:** `<ul>` de `<li>`. Ícones com `aria-hidden="true"` — o título já diz. Cards não são clicáveis (não levam a lugar nenhum), então não recebem `role="button"` nem `tabindex`.

**Aceite:** 6 cards alinhados em altura sem `height` fixo (grid + `align-items: stretch`); ícones somam ≤ 6 KB no bundle.

---

## S10 — FAQ

**Âncora:** `#faq`
**Fase:** 4 (marcação JSON-LD na fase 9)

**Objetivo:** derrubar as quatro objeções que aparecem antes de todo orçamento.

**Nota factual:** a referência trata FAQ como aposta de rich snippet. Isso não vale mais — o Google restringiu FAQ rich results a sites de governo e saúde em agosto de 2023 e desativou o recurso para todos em maio de 2026. A seção continua, e o `FAQPage` JSON-LD também, mas o motivo agora é outro: reduzir objeção do visitante e ser legível por Bing e pelos crawlers que alimentam busca com IA.

**Conteúdo proposto:**

| Pergunta | Resposta |
|---|---|
| `QUANTO CUSTA UM PROJETO?` | Depende do escopo, e eu não trabalho com tabela fixa porque ela sempre erra para algum dos dois lados. A análise inicial é gratuita e devolve uma faixa de valor com as premissas explícitas — se o escopo mudar, o valor muda junto e você sabe por quê. |
| `QUAL O PRAZO MÉDIO?` | Uma landing page fica entre 1 e 3 semanas. Um sistema web com backend, entre 6 e 12. Aplicativo mobile, entre 8 e 16. São faixas honestas, não promessas — o prazo real sai na análise inicial. |
| `VOCÊ TRABALHA COM SISTEMA QUE JÁ EXISTE?` | Sim, e é boa parte do que eu faço. Assumo manutenção, correção de performance, migração de banco e melhoria de sistema legado — inclusive quando a documentação não existe. |
| `COMO FUNCIONA O SUPORTE DEPOIS DA ENTREGA?` | O projeto é entregue documentado, com runbook de operação. Suporte corretivo por período combinado entra no contrato; manutenção contínua é acordo à parte. |

**Comportamento:** Radix Accordion. Um item aberto por vez. Ícone `+` gira 45° ao abrir. Transição de altura em `grid-template-rows: 0fr → 1fr` (não `max-height` chutado). Primeiro item aberto por padrão — sinaliza que é clicável.

**Acessibilidade:** Radix cuida de `aria-expanded`, `aria-controls` e navegação por seta. O botão contém a pergunta inteira, não só o ícone. Conteúdo permanece no DOM quando fechado (indexação e leitor de tela).

**Aceite:** navegação completa por teclado; sem CLS ao abrir/fechar; JSON-LD válido no Rich Results Test (fase 9).

---

## S11 — Contato

**Âncora:** `#contato`
**Fase:** 8

**Objetivo:** converter. Esta é a seção mais importante do site e a que mais precisa funcionar.

**Anatomia:**
1. Eyebrow `CONTATO`
2. `<h2>` `VAMOS RESOLVER O SEU PROBLEMA?`
3. Parágrafo
4. **Coluna esquerda** — `ME ENCONTRE POR AQUI`: e-mail, LinkedIn, GitHub, WhatsApp
5. **Coluna direita** — formulário na moldura de caixa de diálogo, título `NOVA MENSAGEM`

**Campos do formulário:**

| Campo | Tipo | Validação | Obrigatório |
|---|---|---|---|
| Nome | text | 2–80 caracteres | Sim |
| E-mail | email | formato válido | Sim |
| Empresa | text | ≤ 80 | Não |
| Tipo de projeto | select | Site / Landing · Sistema Web · API / Backend · Aplicativo Mobile · Banco de Dados · Infraestrutura · Consultoria · Outro | Sim |
| Mensagem | textarea | 20–2000, contador visível | Sim |
| Consentimento LGPD | checkbox | precisa estar marcado | Sim |
| `website` | honeypot | escondido; preenchido = descarta silenciosamente | — |
| Turnstile | widget | token válido no servidor | — |

**Texto do consentimento:** Autorizo o contato por e-mail ou WhatsApp para responder esta mensagem. Os dados não são compartilhados com terceiros. [Política de privacidade](/privacidade)

**Comportamento:**
- **Mesmo schema Zod no cliente e no servidor.** Nunca duas verdades.
- Validação no `blur`, não a cada tecla. Reexibida em tempo real depois do primeiro erro.
- Botão desabilita durante o envio e mostra `ENVIANDO...`.
- `AbortController` com timeout de 10s; abortado no unmount.
- **Sucesso:** formulário vira painel de confirmação na estética — `MENSAGEM ENVIADA` + "retorno em até 24h" + botão de enviar outra.
- **Erro:** mensagem acionável **com canal alternativo visível**: "Não consegui enviar agora. Me chama direto no WhatsApp ou em allan@nexustech.com.br." O lead nunca é perdido em silêncio.
- Rate limit: 5 envios por IP por hora (em memória — válido porque a VPS roda réplica única; ver §3.2 do plano pai).

**Estados:** idle · validando · enviando · sucesso · erro de rede · erro de validação · bloqueado por rate limit.

**Responsividade:** `base–md` coluna única, links acima do formulário (contato direto tem mais conversão em mobile). `lg+` duas colunas 5fr/7fr.

**Acessibilidade:**
- `<label>` real em todo campo — placeholder não é rótulo
- Erro ligado ao campo por `aria-describedby` + `aria-invalid`
- Resumo de erros em `role="alert"` no topo do formulário, com foco movido para lá no submit inválido
- Sucesso anunciado por `aria-live="polite"`
- Ordem de tabulação segue a ordem visual

**Aceite:** envio real recebido; falha simulada do Resend oferece canal alternativo; 6º envio do mesmo IP barrado; envio sem token Turnstile rejeitado; submit com campo vazio move o foco para o resumo de erros.

---

## S12 — Rodapé

**Fase:** 2

**Anatomia:** logo → links de navegação → links sociais → linha de copyright → link para `/privacidade`.

**Conteúdo:** `© 2026 NEXUS TECH · CNPJ 00.000.000/0001-00` · `Política de privacidade` · `Feito em Next.js, hospedado em servidor próprio`

> A última linha é assinatura técnica discreta e, no seu caso, é verdade — reforça o posicionamento de infra sem parecer ostentação.

**Acessibilidade:** `<footer>` com `<nav aria-label="Rodapé">`.

---

## S13 — `/projetos` (listagem completa)

**Fase:** 4

**Objetivo:** destino do "ver todos". Mostra tudo que está publicado, não só os destaques.

**Anatomia:** cabeçalho de página (`<h1>` `PROJETOS`) → filtros por stack (chips, opcional na v1) → grid do mesmo card da S7 → estado vazio.

**Comportamento:** filtro por stack é client-side sobre dado já presente (nada de request). Estado da URL via query param, para o link ser compartilhável.

**Estados:** com resultado / filtro sem resultado (`NENHUM PROJETO COM ESSA STACK` + botão limpar) / nenhum projeto publicado.

**Aceite:** filtro reflete na URL e sobrevive a refresh; estado vazio renderiza nos dois casos.

---

## S14 — `/projetos/[slug]` (página de projeto)

**Fase:** 3 (versão mínima) → 5 (completa)

**Objetivo:** o motivo do site existir. É aqui que o cliente decide contratar.

**Anatomia:**
1. Breadcrumb `PROJETOS / NOME`
2. `<h1>` título + resumo
3. **HUD de metadados** — stack, papel, período, status, cliente (do frontmatter)
4. Capa
5. Sumário lateral (`lg+`) gerado da árvore de títulos
6. Corpo MDX com os componentes: galeria, vídeo, callout, quadro de arquitetura, tabela de decisões, bloco de código
7. Navegação anterior / próximo
8. CTA de contato

**Comportamento:** sumário com scroll-spy (`IntersectionObserver`, com cleanup). Âncoras estáveis derivadas dos títulos — slug determinístico, para que link compartilhado não quebre quando você editar o texto ao redor.

**Responsividade:** `base–md` sumário vira acordeão colapsado no topo. `lg+` sumário fixo à esquerda (`position: sticky`).

**Acessibilidade:** um `<h1>` só; hierarquia de títulos sem pular nível (o MDX precisa ser validado nisso); sumário é `<nav aria-label="Nesta página">`.

**Aceite:** um projeto real renderiza usando todos os componentes MDX; sumário navega e destaca a seção correta; anterior/próximo derivado do conteúdo, sem lista manual.

---

## S15 — Erro e indisponibilidade

**Fase:** 2 (404 e 500) · 3 (410)

| Rota | Tela | Conteúdo |
|---|---|---|
| `404` | `GAME OVER` | `ERRO 404 · ROTA NÃO ENCONTRADA` + `CONTINUE?` com contagem regressiva decorativa + botões `VOLTAR AO INÍCIO` e `VER PROJETOS` |
| `410` | Projeto retirado | `PROJETO FORA DE EXIBIÇÃO` + explicação de uma linha + link para a listagem |
| `500` | Falha do servidor | `FALHA CRÍTICA` + botão de recarregar + e-mail de contato. **Sem stack trace.** |

**Comportamento:** a contagem regressiva do 404 é decoração — nunca redireciona sozinha, porque redirect automático quebra o botão voltar e desorienta leitor de tela.

**Acessibilidade:** `<h1>` real em cada uma; `role="alert"` na mensagem principal; nunca comunicar o erro só por cor.

**Aceite:** as três telas dentro da estética; 410 retornando o status HTTP correto (`curl -I`); 500 sem vazar detalhe interno.

---

## Anexo A — Paleta azul Nexus Tech (proposta)

Formalização e teste completo ficam em `PLANO-DESIGN-SYSTEM-NEXUSTECH.md`. Isto é a direção para você aprovar ou ajustar.

| Token | Hex | Uso |
|---|---|---|
| `--nx-bg-void` | `#05070D` | Fundo da página, preloader |
| `--nx-bg-surface` | `#0A0F1C` | Seções alternadas, header com scroll |
| `--nx-bg-elevated` | `#101728` | Cards, molduras de terminal |
| `--nx-border` | `#1C2740` | Bordas padrão |
| `--nx-blue-core` | `#1F6FEB` | Preenchimento de botão primário, barras, bordas ativas |
| `--nx-blue-glow` | `#4DA3FF` | Texto de destaque, hover, glow, números do HUD |
| `--nx-cyan-accent` | `#22D3EE` | Assinatura — badge de disponibilidade, cursor do terminal. **Uso escasso** |
| `--nx-text-primary` | `#E6EDF7` | Corpo e títulos |
| `--nx-text-muted` | `#8FA3BF` | Legendas, eyebrows, texto secundário |
| `--nx-success` | `#3FB950` | Status "entregue", sucesso do formulário |
| `--nx-danger` | `#F85149` | Erro de validação |

**Regra que evita o problema de contraste da fase 1:** `--nx-blue-core` **não é cor de texto** sobre fundo escuro — ele fica perto de 4,5:1 e reprova em corpo de texto pequeno. Use-o para preenchimento, borda e barra. Para texto azul, sempre `--nx-blue-glow`. Isso está no critério de aceite da fase 1 e o teste automatizado vai cobrar.

**Onde o azul substitui o roxo da referência:** glow de hover, número do HUD, cursor do terminal, borda ativa de card, gradiente do botão primário e as scanlines do overlay CRT.

---

## Anexo B — Rastreamento por fase

| Fase (plano v0.2) | Telas entregues |
|---|---|
| 2 — Shell | S1, S2, S12, S15 (404/500) |
| 3 — Conteúdo | S14 mínima, S15 (410) |
| 4 — Home | S3, S4, S5, S6, S7, S9, S10, S13 |
| 5 — Template de projeto | S14 completa |
| 6 — Vitrine de código | S8 |
| 7 — Mídia | Vídeo em S7 e S14, galeria em S14 |
| 8 — Contato | S11, `/privacidade` |
| 9 — SEO/A11y | JSON-LD da S10, OG de S14, auditoria de todas |

---

## Anexo C — Checklist por tela

Antes de fechar qualquer ficha:

- [ ] Estados de loading, vazio e erro definidos (ou justificado por que não existem)
- [ ] Comportamento em 320px verificado, sem scroll horizontal
- [ ] Navegável inteiramente por teclado, com foco visível
- [ ] Contraste verificado — inclusive texto sobre badge, chip e mídia
- [ ] `prefers-reduced-motion` respeitado
- [ ] Listeners e observers com cleanup
- [ ] Nenhuma cor literal — só token
- [ ] Texto vem de módulo tipado ou de frontmatter, nunca solto no JSX
- [ ] Sem CLS ao carregar
