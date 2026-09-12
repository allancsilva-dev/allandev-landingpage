# Plano de Telas — Landing Page Allan Carvalho

**Versao:** 2.0
**Autor:** Allan Carvalho
**Documento pai:** `PLANO-LANDING-ALLANDEV-v2.0.md`
**Referencia de linguagem:** Muniz — arcade, scanlines, terminal, som opcional e perspectiva; sem copiar composicao
**Fonte cromatica:** logo Nexos Tech em `ChatGPT Image 7 de mar. de 2026, 20_06_40.png`
**Identidade principal:** Allan Carvalho / ALLANDEV

---

## 0. Como usar este documento

Cada secao abaixo e uma unidade fechada. Um agente de IA deve conseguir implementar qualquer uma delas lendo so a sua propria ficha, sem precisar do contexto das outras.

**Formato de cada ficha:**

| Campo | O que traz |
|---|---|
| Ancora / rota | O identificador usado em navegacao e links internos |
| Objetivo | Por que a secao existe. Se nao der para responder, ela sai |
| Anatomia | Os elementos, na ordem do DOM |
| Conteudo | Texto real proposto — nao lorem ipsum |
| Comportamento | Interacao, animacao, o que acontece no scroll e no clique |
| Estados | Loading, vazio, erro. Toda secao que busca dado tem os tres |
| Responsividade | 320 / 640 / 768 / 1024 / 1280 |
| Acessibilidade | Semantica, teclado, leitor de tela |
| Fase | Onde entra no plano v2.0 |
| Aceite | Como se prova que ficou pronta |

**Breakpoints** (Tailwind padrao): `base` 320px · `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px.

---

## 1. Relacao com as referencias

Muniz e logo Nexos Tech cumprem funcoes diferentes. Nenhum deles define sozinho o portfolio:

| Camada | Decisao | Motivo |
|---|---|---|
| **Estrutura e ordem das secoes** | Criar para Allan | Projetos aparecem cedo; navegacao multipagina diferencia o produto |
| **Padroes arcade** | Reinterpretar | Scanlines, terminal, som e perspectiva sao vocabulario, nao layout para clonar |
| **Paleta** | Extrair do logo Nexos Tech | Azul, ciano, violeta e magenta possuem fonte oficial no proprio `docs` |
| **Textos** | **Reescrever inteiro** | Texto e obra protegida. Alem disso, o posicionamento dela e "dev freelancer full stack"; o seu e "infra + dev", que e outra proposta e outro cliente |
| **Imagens, foto, icones, OG** | **Proprios** | Assets sao obra protegida, sem excecao |
| **Secao de repositorios** | Substituir por imagens de codigo curado | Repos privados sao lidos apenas no CI; navegador recebe raster e contexto |
| **Cards de projeto** | **Estender** para rota propria | Na referencia o card e o fim da linha; aqui leva ao case completo da fase 5 |

Assinatura ALLANDEV, composicao propria, paleta do logo, textos originais e cases multipagina precisam tornar Allan reconhecivel sem explicacao. Assets da Muniz nunca entram na implementacao.

---

## 2. Mapa de rotas

| Rota | Tipo | Origem | Fase |
|---|---|---|---|
| `/` | Estatica | Modulo de conteudo tipado + camada MDX | 4 |
| `/projetos` | Estatica | Camada de conteudo (fase 3) | 4 |
| `/projetos/[slug]` | SSG por `generateStaticParams` | Um `.mdx` por projeto | 3 (minima) → 5 (completa) |
| `/projetos/nexos-erp` | SSG | `content/projetos/nexos-erp.mdx` | 5 |
| `/projetos/renowa` | SSG | `content/projetos/renowa.mdx` | 5 |
| `/privacidade` | Estatica | MDX simples | 8 |
| `/404` | Estatica | — | 2 |
| `/_dev/design-system` | Estatica, `noindex` | — | 1 |

**Sobre a home:** landing com ancoras, mas parte de um portfolio multipagina. `/projetos` lista catalogo; cada slug abre case independente. V1 publica Nexos ERP e Renowa.

---

## 3. Sequencia da home

```
S1  Barra de topo (fixa)
S2  Preloader / boot            [overlay, some apos carregar]
S3  Hero
S4  Marquee de tecnologias
S5  Sobre e trajetoria
S6  Processo
S7  Projetos em destaque
S8  Vitrine de codigo           [substitui "repositorios" da referencia]
S9  Servicos
S10 FAQ
S11 Contato
S12 Rodape
```

---

## S1 — Barra de topo

**Ancora:** — (fixa, presente em todas as rotas)
**Fase:** 2

**Objetivo:** navegacao persistente e assinatura da marca, sem competir com o hero.

**Anatomia (ordem do DOM):**
1. `<a>` skip-link "Pular para o conteudo" (visivel so no foco)
2. Toggle de som — icone, `aria-pressed`
3. Logo `ALLANDEV` (link para `/`)
4. Botao `≡ MENU` (mobile) / lista de links (desktop)

**Conteudo:** links `SOBRE · PROCESSO · PROJETOS · SERVICOS · CONTATO`. Logo em tipografia display pixelada.

**Comportamento:**
- Barra transparente no topo; ao passar de 40px de scroll ganha fundo `--allan-bg-surface/90`, backdrop discreto e borda inferior. Transicao de 200ms.
- Listener de scroll com `requestAnimationFrame` throttle e cleanup obrigatorio no unmount.
- Link ativo destacado conforme a secao em viewport (`IntersectionObserver`, tambem com cleanup).
- Menu mobile: overlay em tela cheia, estetica de menu de jogo. Trava o scroll do body enquanto aberto e devolve no fechamento.
- **Som:** nasce **desligado**. Clique liga efeitos curtos de UI (hover de botao, abertura de menu). Preferencia persistida em `localStorage`. Nunca toca nada antes do opt-in.

**Estados:** topo / scrolled / menu aberto / som ligado / som desligado.

**Responsividade:**
- `base–md`: logo centralizado, som a esquerda, `≡ MENU` a direita.
- `lg+`: logo a esquerda, links no centro, som + CTA `FALAR COMIGO` a direita.

**Acessibilidade:**
- `<header>` + `<nav aria-label="Principal">`
- Menu mobile e `<dialog>` ou Radix Dialog: foco preso dentro, `Esc` fecha, foco volta ao botao que abriu
- Toggle de som com `aria-pressed` e rotulo textual, nao so icone
- Skip-link e o primeiro elemento focavel da pagina

**Aceite:** navegacao completa por teclado; menu mobile devolve o foco ao fechar; nenhum audio dispara sem opt-in; `pnpm analyze` mostra o header sem dependencia pesada.

---

## S2 — Boot do hero

**Fase:** 2 · **Implementado em** `src/components/hero-stage.tsx`

> **Correcao (2026-08-12):** esta tela pedia overlay full-screen com contador `0% → 100%` e teto de
> 1,2s, o que contradiz `DESIGN.md` ("boot curto dentro do hero", teto de 2,5s, "sem progresso falso").
> `DESIGN.md` venceu: um contador sobre pagina estatica seria progresso ficticio. O texto abaixo
> descreve o que existe no codigo.

**Objetivo:** estabelecer a estetica "jogo bootando" nos primeiros dois segundos, sem atrasar leitura.

**Anatomia:**
1. Camada sobre o hero inteiro (nao full-screen), quase opaca
2. Marca `ALLAN.DEV OS` em display pixelado
3. Status curto em mono, trocando a cada 620ms: `MONTANDO AMBIENTE` → `ABRINDO CONEXOES` → `PRONTO`
4. Barra pixelada de 6px animada por CSS (`scaleX`), sem numero de porcentagem
5. Botao `▸ PRESS START`, que encerra o boot na hora

**Comportamento:**
- Duracao total de 1,86s (3 × 620ms), abaixo do teto de 2,5s do `DESIGN.md`.
- **Sem contador e sem barra rotulada como carregamento**: a pagina e estatica, entao progresso seria
  ficcao. A barra e ornamento temporal, nao medicao.
- **So na primeira visita da sessao.** Flag em `sessionStorage`; navegacao interna nao reboota.
- `prefers-reduced-motion: reduce` → a camada nunca e montada.
- O hero fica no DOM e no HTML servido por baixo da camada, com `inert`, entao a imagem LCP carrega
  em paralelo e o conteudo existe sem JavaScript.

**Estados:** bootando / encerrado por tempo / encerrado por `PRESS START` / ja visto na sessao / reduced motion.

**Acessibilidade:** `role="status"` + `aria-live="polite"` + `aria-busy="true"` na camada; hero coberto
recebe `inert` em vez de `display: none`, preservando indexacao e leitor de tela.

**Aceite:** boot sai em ≤ 2,5s; segunda navegacao na mesma aba nao reboota; `curl` da home mostra o
`<h1>` e o paragrafo do hero mesmo durante o boot; teste e2e cobre sessao unica e `PRESS START`.

---

## S3 — Hero

**Ancora:** `#topo`
**Fase:** 4

**Objetivo:** dizer em 3 segundos o que o Allan faz e para quem, e empurrar para um dos dois caminhos (orcamento ou portfolio).

**Anatomia:**
1. Badge de disponibilidade — ponto pulsante + texto
2. `<h1>` — display pixelada, o maior elemento da pagina
3. Paragrafo de apoio (2 linhas)
4. Dois CTAs: primario preenchido, secundario contornado
5. Imagem/ilustracao a direita, dentro de moldura de terminal
6. Card de identidade sobre a imagem: nome + linha de stack
7. Dois cards HUD com numeros

**Conteudo proposto:**

| Elemento | Texto |
|---|---|
| Badge | `● DISPONIVEL PARA PROJETOS` |
| H1 | `SISTEMAS QUE AGUENTAM PRODUCAO` |
| Paragrafo | Desenvolvimento web, mobile e integracoes por quem tambem administra servidor, banco e rede. Da infraestrutura a interface — com codigo limpo e entrega que nao quebra na segunda semana. |
| CTA primario | `SOLICITAR PROPOSTA` → `#contato` |
| CTA secundario | `VER PROJETOS` → `#projetos` |
| Card de identidade | `ALLAN CARVALHO` · `Infra & Full Stack · Java · TypeScript · Next.js · PostgreSQL` |
| HUD 1 | `24h` / `RETORNO NA PRIMEIRA ANALISE` |
| HUD 2 | `FULL` / `DA INFRA A INTERFACE` |

> O H1 e o ponto onde seu posicionamento se separa da referencia. Ela vende "dev full stack"; voce vende "dev que tambem e infra" — que e raro, verificavel pelo seu historico e vale mais para cliente com sistema em producao. Nao abra mao disso.

**Comportamento:**
- Ponto do badge: cor solida com glow (CSS). Pulso animado ainda **nao** implementado.
- Overlay CRT (scanlines) sobre o retrato e sobre a midia de projeto, em `::after`,
  `pointer-events: none` — **implementado**. Nunca sobre corpo de texto: `pnpm test:contrast` nao
  modela overlay e o risco de AA nao seria medido.
- Pixel corners no card de identidade e nos cards de projeto, visiveis em `:hover`/`:focus-within`.
- Tilt 3D leve no card de identidade, desligado em `pointer: coarse` e em reduced motion.
- Parallax na imagem ao scroll: **nao** implementado (fora de escopo).

**Responsividade:**
- `base–md`: coluna unica. Ordem: badge → H1 → paragrafo → CTAs → imagem → HUDs. H1 em `clamp(2rem, 9vw, 3.5rem)`. CTAs empilhados, largura total.
- `lg+`: grid 2 colunas **1.2fr / 0.9fr** (valor do `DESIGN.md` e do codigo; a versao anterior desta
  linha dizia 7fr/5fr e nunca foi implementada). HUDs dentro do card de identidade, nao sobrepostos.
  H1 ate `2.15rem` — Press Start 2P ocupa muito mais largura por caractere que uma sans.

**Acessibilidade:** um `<h1>` so na pagina. Imagem com `alt` descritivo. CTAs sao `<a>`, nao `<button>` — navegam. Contraste do texto do badge verificado contra o fundo do badge, nao contra o fundo da pagina (erro comum).

**Performance:** a imagem do hero e o LCP. `priority`, dimensoes declaradas, AVIF + WebP, `sizes` correto. Nada de animacao que mexa em `width`/`height` — so `transform` e `opacity`.

**Aceite:** LCP ≤ 2,5s no mobile; sem CLS ao carregar a imagem; hero legivel em 320px sem scroll horizontal.

---

## S4 — Marquee de tecnologias

**Fase:** 4

**Objetivo:** comunicar amplitude de stack sem exigir leitura. Funciona como respiro visual entre hero e conteudo.

**Anatomia:** duas faixas horizontais sobrepostas, correndo em direcoes opostas, com bordas superior e inferior.

**Conteudo:** `TYPESCRIPT · JAVA · NEXT.JS · REACT · NODE.JS · SPRING · POSTGRESQL · SQL · REST APIS · DOCKER · LINUX · REACT NATIVE · GIT · CI/CD`

**Comportamento:**
- **Animacao 100% CSS** (`transform: translateX`), nunca loop de JavaScript. Conteudo duplicado no DOM para o loop ser continuo.
- Faixa de cima corre para a esquerda, a de baixo para a direita. Velocidades levemente diferentes (40s / 55s) — igual demais fica hipnotico.
- `prefers-reduced-motion: reduce` → animacao parada, faixa vira lista estatica.
- `will-change: transform` so nas duas faixas, nunca herdado.

**Acessibilidade:** **decisao tomada — a faixa inteira e decorativa** (`aria-hidden="true"` em cada
faixa). A stack legivel vive nos chips da secao Sobre, que saem de `sobre.skills`. Velocidades reais:
42s na faixa de cima (esquerda) e 55s na de baixo (direita).

**Responsividade:** altura reduzida em `base–sm`; fonte menor; velocidade proporcional para a percepcao nao mudar.

**Aceite:** zero JS de animacao; sem reflow por frame no Performance do DevTools; nada se move com reduced-motion.

---

## S5 — Sobre

**Ancora:** `#sobre`
**Fase:** 4

**Objetivo:** transformar competencia tecnica em confianca comercial. E onde o cliente decide se voce entende o problema dele.

**Anatomia:**
1. Eyebrow `SOBRE`
2. `<h2>`
3. Moldura de terminal com aba de arquivo e prompt
4. Corpo de texto dentro do terminal
5. Lista de destaques em formato de saida de comando

**Conteudo proposto:**

| Elemento | Texto |
|---|---|
| Eyebrow | `SOBRE` |
| H2 | `INFRAESTRUTURA E CODIGO NA MESMA CABECA` |
| Aba do terminal | `sobre.md` |
| Prompt | `allan@allandev:~$ cat sobre.md` |
| Corpo | Administro servidores, bancos e redes ha anos — e desenvolvo os sistemas que rodam neles. Isso muda o tipo de decisao que eu tomo: escolho arquitetura pensando em quem vai operar depois, porque normalmente sou eu. Trabalho com Java, TypeScript, Next.js, React Native e PostgreSQL, com atencao fixa em performance, resiliencia e manutencao. |
| Saida de comando | `✓ 6 principios nao-negociaveis: performance, escalabilidade, UX, resiliencia, memory safe, network safe` |

**Comportamento:**
- Cursor de bloco piscando ao fim do prompt (CSS).
- Texto revelado com efeito de digitacao **opcional** — se usar, precisa de: velocidade ≥ 40 chars/s, botao de pular, texto completo no DOM desde o inicio (para SEO e leitor de tela) e desligado em reduced-motion. Se algum desses for inviavel, corta o efeito. Digitacao lenta em texto que o cliente precisa ler e atrito puro.
- Reveal on scroll com o wrapper padrao da fase 1.

**Responsividade:** terminal com padding reduzido em mobile; `font-size` mono nunca abaixo de 14px; largura de linha maxima de ~70ch em `lg+`.

**Acessibilidade:** o terminal e decoracao — o conteudo e `<p>` normal por dentro. Aba e prompt com `aria-hidden="true"`. Contraste do texto mono verificado (e o menor da pagina).

**Aceite:** texto completo presente no HTML servido (`curl` da rota mostra o paragrafo inteiro); legivel em 320px.

---

## S6 — Processo

**Ancora:** `#processo`
**Fase:** 4

**Objetivo:** remover a incerteza de "como e trabalhar com ele". Reduz objecao antes do formulario.

**Anatomia:** eyebrow → `<h2>` → 3 cards numerados, cada um com numero grande, `<h3>` e paragrafo. Linha conectora entre eles no desktop.

**Conteudo proposto:**

| # | Titulo | Texto |
|---|---|---|
| 01 | `BRIEFING` | Voce descreve o problema, o escopo e o prazo. Em ate 24 horas eu devolvo uma analise inicial gratuita com riscos, premissas e uma estimativa honesta. |
| 02 | `CONSTRUCAO` | Entregas incrementais com ambiente de homologacao no ar desde cedo. Voce acompanha o progresso real, nao um relatorio de progresso. |
| 03 | `ENTREGA E OPERACAO` | Deploy, testes, documentacao e repasse. O projeto sobe pronto para ser operado — com runbook, nao com "qualquer coisa me chama". |

**Comportamento:** reveal on scroll com stagger de 120ms. Numero grande em `--allan-cyan` com baixa opacidade, atras do titulo. Linha conectora escondida em `< lg`.

**Responsividade:** `base–md` coluna unica; `lg+` tres colunas iguais.

**Acessibilidade:** `<ol>` — os passos tem ordem semantica. Numeros decorativos com `aria-hidden`, ja que o `<ol>` numera.

**Aceite:** ordem correta anunciada pelo leitor de tela; sem linha conectora quebrada no tablet.

---

## S7 — Projetos em destaque

**Ancora:** `#projetos`
**Fase:** 4 (a listagem) + 3 (a fonte de dados)

**Objetivo:** provar entrega. E a secao que fecha ou perde o cliente.

**Diferenca estrutural em relacao a referencia:** la o card e o destino final. **Aqui ele leva a uma pagina de projeto completa** (`/projetos/[slug]`, fase 5). Isso e o motivo do site existir (§1 do plano pai) e nao pode ser perdido na copia da estetica.

**Anatomia:**
1. Eyebrow `PROJETOS`
2. `<h2>` + link `VER TODOS →` para `/projetos`
3. Grid de cards. Cada card:
   - Midia (poster estatico; video carrega sob demanda)
   - Botao `▶ REPRODUZIR` sobre a midia
   - `<h3>` titulo
   - Resumo (vem de `resumo` do frontmatter)
   - Chips de stack (3 primeiros + `+N`)
   - Badge de status (`EM ANDAMENTO` / `ENTREGUE`)
   - Card inteiro e clicavel → `/projetos/[slug]`

**Fonte dos dados:** exclusivamente a camada de conteudo da fase 3. Ordenados por `destaque`, filtrando `status: 'published'`. V1 mostra Nexos ERP e Renowa; maximo de 4 na home.

**Comportamento:**
- Hover: luz usa `--allan-cyan`, com tilt CSS 3D leve e sem mudanca de layout.
- `▶ REPRODUZIR` troca o poster pelo `<video>` e da play. `preload="none"` ate o clique — o video so e baixado quando pedido.
- So um video toca por vez: iniciar um pausa o anterior.
- Video pausa ao sair do viewport e e liberado no unmount (Memory Safe).

**Estados:**
- **Loading:** nao existe — e SSG, o HTML ja vem pronto.
- **Vazio:** nenhum projeto publicado → card de placeholder na estetica: `NENHUM PROJETO PUBLICADO AINDA` + CTA para contato. Nunca uma grade vazia.
- **Erro de midia:** video falha → mantem o poster e esconde o botao de play. Nao mostra erro ao visitante.

**Responsividade:** `base` 1 coluna · `md` 2 · `xl` 2 com cards maiores (4 projetos = 2×2 fica melhor que 4×1).

**Acessibilidade:**
- Card e `<article>` com um unico link envolvendo o `<h3>` (padrao "link no titulo com pseudo-elemento cobrindo o card") — evita link aninhado dentro de link, que quebra leitor de tela
- Botao de play e `<button>` separado, com `stopPropagation` para nao navegar
- `aria-label` do play inclui o nome do projeto: `Reproduzir demonstracao de Nexos ERP`
- Chips de stack sao `<ul>`

**Aceite:** Nexos ERP e Renowa aparecem por MDX; adicionar terceiro `published` com `destaque: 3` nao toca em React; nenhum video baixa antes do clique.

---

## S8 — Vitrine de codigo

**Ancora:** `#codigo`
**Fase:** 6

**Substitui** a secao "Ultimos repositorios" da referencia.

**Por que muda:** repositorios sao privados. CI acessa somente regioes aprovadas, congela SHA/hash e gera imagens. Navegador nunca recebe fonte textual ou token.

**Objetivo:** provar competencia tecnica com evidencia, nao com adjetivo. E o diferencial que o GitHub privado te tira.

**Anatomia:**
1. Eyebrow `CODIGO`
2. `<h2>` `DECISOES DE ARQUITETURA, NAO ARQUIVOS`
3. Paragrafo curto explicando a curadoria
4. Navegacao por abas — uma por imagem, maximo 3 por case
5. Painel ativo: moldura com titulo (`arquivo.ts` · linguagem · projeto), raster WebP/PNG em 2x e paragrafo explicando problema e decisao
6. Rodape do bloco: `© Allan Carvalho · codigo proprietario, exibido para avaliacao tecnica`

**Conteudo proposto:** Os repositorios sao privados. Estas imagens mostram fragmentos pequenos e revisados, acompanhados do problema e da decisao tecnica. Nao representam o codigo completo.

**Comportamento:**
- Highlight e raster gerados no CI. Zero highlighter ou fonte textual no cliente.
- Sem botao de copiar e sem endpoint bruto. Isso nao impede download, screenshot ou OCR.
- Clique abre zoom acessivel; imagem responsiva preserva nitidez sem criar scroll na pagina.
- Troca de aba sem layout shift: altura minima fixada pelo maior trecho.

**Estados:** todos resolvidos em build. Se um trecho falhar na resolucao, o **build quebra** — nada renderiza parcialmente em producao.

**Responsividade:** `base–md` tabs viram chips horizontais e imagem abre zoom; `lg+` tabs verticais a esquerda, painel a direita.

**Acessibilidade:** seletor segue padrao ARIA de tabs. Cada imagem possui descricao do problema e decisao; nao transcreve fonte. Zoom abre Dialog navegavel por teclado.

**Aceite:** SHA congelado impede deriva; `grep` por token e texto-sentinela nao encontra fonte no bundle/container; tabs e zoom funcionam por teclado.

---

## S9 — Servicos

**Ancora:** `#servicos`
**Fase:** 4

**Objetivo:** dar nome ao que o cliente pode comprar. Sem isso ele nao sabe se o problema dele cabe.

**Anatomia:** eyebrow → `<h2>` → paragrafo → grid de 6 cards (icone, `<h3>`, descricao).

**Conteudo proposto:**

| Icone | Titulo | Descricao |
|---|---|---|
| Monitor | `APLICACOES WEB` | Sistemas e paineis com Next.js e React — responsivos, acessiveis e rapidos de operar. |
| Server | `BACKEND E APIS` | APIs REST com Java/Spring e Node.js, regra de negocio solida e arquitetura que suporta crescer. |
| Smartphone | `APLICATIVOS MOBILE` | Android e iOS a partir de uma base so, com React Native e Expo. |
| Database | `BANCO DE DADOS` | Modelagem, otimizacao de query, migracao e correcao em PostgreSQL e SQL Server. |
| Network | `INFRAESTRUTURA E DEPLOY` | Servidores, containers, CI/CD, backup e monitoramento. Sistema no ar e diferente de sistema pronto. |
| GitBranch | `CONSULTORIA TECNICA` | Auditoria de codigo, revisao de arquitetura e apoio a time que precisa destravar. |

> Dois desses cards — infraestrutura e banco — a referencia nao tem. Sao exatamente onde voce e mais forte e menos substituivel. Nao troque por algo mais generico.

**Comportamento:** icones `lucide-react`, tree-shaken, nunca emoji. Hover usa `--allan-cyan`; cards nao recebem tilt repetitivo.

**Responsividade:** `base` 1 col · `sm` 2 · `lg` 3.

**Acessibilidade:** `<ul>` de `<li>`. Icones com `aria-hidden="true"` — o titulo ja diz. Cards nao sao clicaveis (nao levam a lugar nenhum), entao nao recebem `role="button"` nem `tabindex`.

**Aceite:** 6 cards alinhados em altura sem `height` fixo (grid + `align-items: stretch`); icones somam ≤ 6 KB no bundle.

---

## S10 — FAQ

**Ancora:** `#faq`
**Fase:** 4 (marcacao JSON-LD na fase 9)

**Objetivo:** derrubar as quatro objecoes que aparecem antes de todo orcamento.

**Nota factual:** a referencia trata FAQ como aposta de rich snippet. O Google restringiu FAQ rich results a sites de governo e saude em agosto de 2023 e desativou o recurso para todos em maio de 2026. A secao continua, e o `FAQPage` JSON-LD tambem, mas o motivo agora e outro: reduzir objecao do visitante e ser legivel por Bing e pelos crawlers que alimentam busca com IA.

**Conteudo proposto:**

| Pergunta | Resposta |
|---|---|
| `QUANTO CUSTA UM PROJETO?` | Depende do escopo, e eu nao trabalho com tabela fixa porque ela sempre erra para algum dos dois lados. A analise inicial e gratuita e devolve uma faixa de valor com as premissas explicitas — se o escopo mudar, o valor muda junto e voce sabe por que. |
| `QUAL O PRAZO MEDIO?` | Uma landing page fica entre 3 dias e 1 semana. Um sistema web com backend, entre 3 e 6 semanas. Aplicativo mobile, entre 4 e 8 semanas. Sao faixas honestas, nao promessas — o prazo real sai na analise inicial. |
| `VOCE TRABALHA COM SISTEMA QUE JA EXISTE?` | Sim, e e boa parte do que eu faco. Assumo manutencao, correcao de performance, migracao de banco e melhoria de sistema legado — inclusive quando a documentacao nao existe. |
| `COMO FUNCIONA O SUPORTE DEPOIS DA ENTREGA?` | O projeto e entregue documentado, com runbook de operacao. Suporte corretivo por periodo combinado entra no contrato; manutencao continua e acordo a parte. |

**Comportamento:** Radix Accordion. Um item aberto por vez. Icone `+` gira 45° ao abrir. Transicao de altura em `grid-template-rows: 0fr → 1fr` (nao `max-height` chutado). Primeiro item aberto por padrao — sinaliza que e clicavel.

**Acessibilidade:** Radix cuida de `aria-expanded`, `aria-controls` e navegacao por seta. O botao contem a pergunta inteira, nao so o icone. Conteudo permanece no DOM quando fechado (indexacao e leitor de tela).

**Aceite:** navegacao completa por teclado; sem CLS ao abrir/fechar; JSON-LD valido no Rich Results Test (fase 9).

---

## S11 — Contato

**Ancora:** `#contato`
**Fase:** 8

**Objetivo:** converter. Esta e a secao mais importante do site e a que mais precisa funcionar.

**Anatomia:**
1. Eyebrow `CONTATO`
2. `<h2>` `VAMOS RESOLVER O SEU PROBLEMA?`
3. Paragrafo
4. **Coluna esquerda** — `ME ENCONTRE POR AQUI`: e-mail, LinkedIn, GitHub, WhatsApp
5. **Coluna direita** — formulario na moldura de caixa de dialogo, titulo `NOVA MENSAGEM`

**Campos do formulario:**

| Campo | Tipo | Validacao | Obrigatorio |
|---|---|---|---|
| Nome | text | 2–80 caracteres | Sim |
| E-mail | email | formato valido | Sim |
| Empresa | text | ≤ 80 | Nao |
| Tipo de projeto | select | Site / Landing · Sistema Web · API / Backend · Aplicativo Mobile · Banco de Dados · Infraestrutura · Consultoria · Outro | Sim |
| Mensagem | textarea | 20–2000, contador visivel | Sim |
| Consentimento LGPD | checkbox | precisa estar marcado | Sim |
| `website` | honeypot | escondido; preenchido = descarta silenciosamente | — |
| Turnstile | widget | token valido no servidor | — |

**Texto do consentimento:** Autorizo o contato por e-mail ou WhatsApp para responder esta mensagem. Os dados nao sao compartilhados com terceiros. [Politica de privacidade](/privacidade)

**Comportamento:**
- **Mesmo schema Zod no cliente e no servidor.** Nunca duas verdades.
- Validacao no `blur`, nao a cada tecla. Reexibida em tempo real depois do primeiro erro.
- Botao desabilita durante o envio e mostra `ENVIANDO...`.
- `AbortController` com timeout de 10s; abortado no unmount.
- **Sucesso:** formulario vira painel de confirmacao na estetica — `MENSAGEM ENVIADA` + "retorno em ate 24h" + botao de enviar outra.
- **Erro:** mensagem acionavel **com canal alternativo visivel**: "Nao consegui enviar agora. Me chama direto no WhatsApp ou em allan@nexostech.com.br." O lead nunca e perdido em silencio.
- Rate limit: 5 envios por IP por hora (em memoria — valido porque a VPS roda replica unica; ver §3.2 do plano pai).

**Estados:** idle · validando · enviando · sucesso · erro de rede · erro de validacao · bloqueado por rate limit.

**Responsividade:** `base–md` coluna unica, links acima do formulario (contato direto tem mais conversao em mobile). `lg+` duas colunas 5fr/7fr.

**Acessibilidade:**
- `<label>` real em todo campo — placeholder nao e rotulo
- Erro ligado ao campo por `aria-describedby` + `aria-invalid`
- Resumo de erros em `role="alert"` no topo do formulario, com foco movido para la no submit invalido
- Sucesso anunciado por `aria-live="polite"`
- Ordem de tabulacao segue a ordem visual

**Aceite:** envio real recebido; falha simulada do Resend oferece canal alternativo; 6º envio do mesmo IP barrado; envio sem token Turnstile rejeitado; submit com campo vazio move o foco para o resumo de erros.

---

## S12 — Rodape

**Fase:** 2

**Anatomia:** logo → links de navegacao → links sociais → linha de copyright → link para `/privacidade`.

**Conteudo:** `© 2026 Allan Carvalho` · `Politica de privacidade` · `Feito em Next.js, hospedado em servidor proprio`

> A ultima linha e assinatura tecnica discreta e, no seu caso, e verdade — reforca o posicionamento de infra sem parecer ostentacao.

**Acessibilidade:** `<footer>` com `<nav aria-label="Rodape">`.

---

## S13 — `/projetos` (listagem completa)

**Fase:** 4

**Objetivo:** destino do "ver todos". Mostra tudo que esta publicado, nao so os destaques.

**Anatomia:** cabecalho de pagina (`<h1>` `PROJETOS`) → filtros por stack (chips, opcional na v1) → grid do mesmo card da S7 → estado vazio.

**Comportamento v1:** sem filtro enquanto existem somente dois cases. Filtro client-side com estado na URL entra quando o catalogo tiver pelo menos cinco projetos publicados.

**Estados:** com resultado / filtro sem resultado (`NENHUM PROJETO COM ESSA STACK` + botao limpar) / nenhum projeto publicado.

**Aceite v1:** lista todos os cases publicados e renderiza estado vazio. Ao atingir cinco cases, filtro reflete na URL e sobrevive a refresh.

---

## S14 — `/projetos/[slug]` (pagina de projeto)

**Fase:** 3 (versao minima) → 5 (completa)

**Objetivo:** o motivo do site existir. E aqui que o cliente decide contratar.

**Anatomia:**
1. Breadcrumb `PROJETOS / NOME`
2. `<h1>` titulo + resumo
3. **HUD de metadados** — stack, papel, periodo, status, cliente (do frontmatter)
4. Capa
5. Sumario lateral (`lg+`) gerado da arvore de titulos
6. Corpo MDX com galeria, video, callout, arquitetura, decisoes, metricas e imagem de codigo
7. Navegacao anterior / proximo
8. CTA de contato

**Comportamento:** sumario com scroll-spy (`IntersectionObserver`, com cleanup). Ancoras estaveis derivadas dos titulos — slug deterministico, para que link compartilhado nao quebre quando voce editar o texto ao redor.

**Responsividade:** `base–md` sumario vira acordeao colapsado no topo. `lg+` sumario fixo a esquerda (`position: sticky`).

**Acessibilidade:** um `<h1>` so; hierarquia de titulos sem pular nivel (o MDX precisa ser validado nisso); sumario e `<nav aria-label="Nesta pagina">`.

**Aceite:** Nexos ERP e Renowa renderizam pelo mesmo template; novo MDX gera rota/card/SEO sem React; sumario e anterior/proximo sao derivados.

---

## S15 — Erro e indisponibilidade

**Fase:** 2 (404 e 500)

| Rota | Tela | Conteudo |
|---|---|---|
| `404` | `GAME OVER` | `ERRO 404 · ROTA NAO ENCONTRADA` + `CONTINUE?` com contagem regressiva decorativa + botoes `VOLTAR AO INICIO` e `VER PROJETOS` |
| `500` | Falha do servidor | `FALHA CRITICA` + botao de recarregar + e-mail de contato. **Sem stack trace.** |

**Comportamento:** a contagem regressiva do 404 e decoracao — nunca redireciona sozinha, porque redirect automatico quebra o botao voltar e desorienta leitor de tela.

**Acessibilidade:** `<h1>` real em cada uma; `role="alert"` na mensagem principal; nunca comunicar o erro so por cor.

**Aceite:** 404 e 500 dentro da estetica; projeto draft/archived usa 404; 500 nao vaza detalhe interno.

---

## Anexo A — Paleta derivada do logo

Fonte: `ChatGPT Image 7 de mar. de 2026, 20_06_40.png`. Valores finais devem ser amostrados do arquivo, convertidos para OKLCH e testados conforme `DESIGN.md`.

| Token | Origem | Uso |
|---|---|---|
| `--allan-bg-void` | fundo navy do logo | Fundo e boot |
| `--allan-bg-surface` | navy elevado derivado | Secoes e header |
| `--allan-bg-elevated` | azul escuro derivado | Paineis e midia |
| `--allan-border` | mistura navy/ciano com baixo chroma | Bordas |
| `--allan-blue` | azul eletrico do logo | CTA e foco |
| `--allan-cyan` | ciano luminoso do logo | Ativo, cursor e assinatura |
| `--allan-violet` | violeta do logo | Profundidade 3D |
| `--allan-magenta` | magenta do logo | Detalhe raro e luz secundaria |
| `--allan-ink` | branco azulado | Titulos e corpo |
| `--allan-ink-muted` | azul acinzentado claro | Texto secundario em AA |
| `--allan-success` / `--allan-danger` | semanticas | Feedback com texto/icone |

Nenhuma cor eletrica vira texto corrido antes do teste WCAG. Gradientes podem iluminar superficies; gradient text e proibido.

---

## Anexo B — Rastreamento por fase (status real em 2026-08-10)

| Fase (plano v2.0) | Telas | Status |
|---|---|---|
| 2 — Shell | S1, S2, S12, S15 (404/500) | ✅ Todas implementadas |
| 3 — Conteúdo | S14 mínima e 404 para não publicados | ✅ Schema, `generateStaticParams`, draft/archived = 404 |
| 4 — Home | S3, S4, S5, S6, S7, S9, S10, S13 | ✅ Todas implementadas |
| 5 — Template de projeto | S14 completa | ✅ HUD, TOC, MDX components, OG image, prev/next |
| 6 — Vitrine de código | S8 | ✅ Manifesto + `pnpm code-shots` lendo os repos locais por `git show <SHA>` |
| 7 — Mídia | Vídeo em S7 e S14, galeria em S14 | 🟡 Play no card, galeria com lightbox e placeholders prontos; sem assets reais |
| 8 — Contato | S11, `/privacidade` | ✅ Form, rate limit, Turnstile, LGPD; sem envio real |
| 9 — SEO/A11y | JSON-LD S10, OG S14, auditoria | 🟡 JSON-LD e OG ok; sem Lighthouse prod |

### Telas por seção

| Seção | Âncora | Status |
|---|---|---|
| S1 Barra de topo | fixa | ✅ Skip-link, scroll-aware, menu mobile `<dialog>`, sound toggle |
| S2 Preloader / boot | overlay | ✅ 1.2s max, só 1ª visita, sem progresso falso |
| S3 Hero | `#topo` | ✅ Badge, H1, CTAs, HUD cards, cabinet 3D, identity card |
| S4 Marquee | — | ✅ Duplo CSS (direções opostas), reduced-motion |
| S5 Sobre | `#sobre` | ✅ Terminal frame, cursor blink, prompt, highlight |
| S6 Processo | `#processo` | ✅ 3 steps numerados em `<ol>` |
| S7 Projetos destaque | `#projetos` | ✅ Grid de cards + estado vazio; dados do MDX |
| S8 Vitrine código | `#codigo` | ✅ Abas ARIA, painel com moldura de terminal e zoom por teclado |
| S9 Serviços | `#servicos` | ✅ 6 cards com ícones Lucide |
| S10 FAQ | `#faq` | ✅ Radix Accordion, 4 itens, JSON-LD FAQPage |
| S11 Contato | `#contato` | ✅ Form, Turnstile, honeypot, rate limit, LGPD, alt channel |
| S12 Rodapé | — | ✅ Logo, links, copyright, "servidor próprio" |
| S13 `/projetos` | rota | ✅ Listagem, estado vazio |
| S14 `/projetos/[slug]` | rota | ✅ HUD, capa `next/image`, TOC, MDX, prev/next, OG |
| S15 Erro | 404/500 | ✅ "ERRO 404" + "FALHA CRÍTICA" estilizados |

---

## Anexo C — Checklist por tela

Antes de fechar qualquer ficha:

- [ ] Estados de loading, vazio e erro definidos (ou justificado por que nao existem)
- [ ] Comportamento em 320px verificado, sem scroll horizontal
- [ ] Navegavel inteiramente por teclado, com foco visivel
- [ ] Contraste verificado — inclusive texto sobre badge, chip e midia
- [ ] `prefers-reduced-motion` respeitado
- [ ] Listeners e observers com cleanup
- [ ] Nenhuma cor literal — so token
- [ ] Texto vem de modulo tipado ou de frontmatter, nunca solto no JSX
- [ ] Sem CLS ao carregar
