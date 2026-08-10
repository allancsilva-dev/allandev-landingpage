# Design — Allan.Dev

## Direcao

Portfolio arcade retro com acabamento técnico. Fundo cósmico azul profundo e luz elétrica. A referência Muniz orienta estrutura, proporções, densidade, ordem, hero, projetos, menu e motion; paleta, conteúdo, identidade e assets permanecem próprios.

Allan/Allan.Dev domina a assinatura. Nexos Tech entra como credencial e origem cromática.

## Fonte cromatica

Imagem oficial: `ChatGPT Image 7 de mar. de 2026, 20_06_40.png`.

Antes da implementacao, amostrar cores diretamente do logo, converter para OKLCH e validar contraste. Papeis obrigatorios:

| Papel | Direcao | Uso |
|---|---|---|
| `--allan-bg-void` | azul-marinho quase preto | fundo principal e boot |
| `--allan-bg-surface` | navy elevado | secoes e paineis |
| `--allan-bg-elevated` | azul escuro | controles e midia |
| `--allan-ink` | branco azulado | titulos e corpo |
| `--allan-ink-muted` | azul acinzentado claro | texto secundario aprovado em AA |
| `--allan-blue` | azul eletrico do logo | cor dominante, molduras e profundidade |
| `--allan-cyan` | ciano luminoso do logo | CTA, foco e estado ativo |
| `--allan-violet` | violeta do logo | profundidade e luz secundaria |
| `--allan-magenta` | magenta do logo | detalhe raro, nunca texto corrido |
| `--allan-success` / `--allan-danger` | cores semanticas | feedback, sempre com icone/texto |

Gradientes podem iluminar superficies e cenas 3D; gradient text e proibido. Nenhum token `--nx-*` entra na aplicacao.

## Tipografia

- **Press Start 2P:** display curto, logo textual, placares, CTAs e rotulos arcade.
- **Onest:** corpo, navegacao, formularios e textos longos.
- **JetBrains Mono:** caminhos, metadados e contexto tecnico.

Titulos usam `text-wrap: balance`, tracking nunca menor que `-0.04em`; corpo fica entre 65 e 75 caracteres por linha. Fontes self-hosted via `next/font/local`.

## Layout

- Conteiner fluido com limites de leitura, espacamento por `clamp()` e ritmo variado.
- Container principal de 1200px, com 40px de respiro lateral no desktop e 24px no mobile.
- Hero em grid 1.2fr / 0.9fr: proposta e CTAs no eixo principal; retrato de Allan em card pessoal como segundo foco.
- Ordem da home: Hero → marquee → Sobre → Processo → Projetos → Serviços → FAQ → Contato → Footer.
- Cards so quando representam objetos acionaveis: projeto, etapa ou opcao real.
- Case usa narrativa vertical com midia ampla; sumario sticky somente em desktop.

## Componentes de assinatura

- logotipo textual Allan.Dev;
- tela inicial PRESS START obrigatoria apenas na primeira visita da sessao;
- cena hero em camadas CSS com scanlines, pixel corners e profundidade retangular;
- moldura de terminal para contexto tecnico, nao para todo conteudo;
- grade estática de projetos em duas colunas; drafts apontam para contato e nunca para rota pública inexistente;
- galeria, video, diagrama de arquitetura, tabela de decisoes e imagem de codigo;
- marquee de tecnologias como transicao curta;
- easter eggs discretos e som desligado por padrao.

Evitar nested cards, glassmorphism padrao, bordas laterais decorativas, cantos acima de 16px em cards e sombra ampla junto de borda fina.

## Movimento

- Motion coordena entrada do hero, troca de projeto e dialogos.
- CSS `perspective`/`transform-style: preserve-3d` cria tilt e profundidade; sem Three.js/WebGL na v1.
- Animar `transform`, `opacity`, `clip-path`, blur e luz; nao animar layout continuamente.
- Conteudo nasce visivel; animacao apenas melhora apresentacao.
- Boot curto dentro do hero: primeira visita da sessão, duração máxima de 2,5s, pulável e sem progresso falso. Conteúdo permanece acessível sem JavaScript; som continua desligado até escolha explícita.
- Touch/mobile reduz parallax. `prefers-reduced-motion` troca tudo por corte ou crossfade curto.

## Responsividade e qualidade

- Verificar 320, 640, 768, 1024, 1280, 1440 e 2560px.
- Nenhum heading, codigo ou midia cria scroll horizontal na pagina.
- Imagens reservam dimensoes; videos usam poster, `preload="none"` e play deliberado.
- Metas: LCP <= 2,5s; INP <= 200ms; CLS <= 0,1; Lighthouse mobile 90/95/100/100.

## Uso do logo Nexos Tech

Logo aparece como imagem/credencial no case Nexos ERP e na história profissional de Allan. Preservar proporção, cores e área de respiro. Allan.Dev continua sendo o wordmark do portfólio; o logo Nexos Tech não vira favicon pessoal nem marca d'água global.
