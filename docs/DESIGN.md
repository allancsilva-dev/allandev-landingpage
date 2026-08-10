# Design — AllanDev

## Direcao

Portfolio arcade retro 3D com acabamento tecnico. Fundo profundo, luz eletrica e superficies inspiradas em gabinete de fliperama e interfaces de jogo, sem transformar leitura em simulacao de terminal.

Allan/ALLANDEV domina assinatura. Nexos Tech entra como credencial e origem cromatica.

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
| `--allan-blue` | azul eletrico do logo | CTA e foco |
| `--allan-cyan` | ciano luminoso do logo | estado ativo e assinatura |
| `--allan-violet` | violeta do logo | profundidade e luz secundaria |
| `--allan-magenta` | magenta do logo | detalhe raro, nunca texto corrido |
| `--allan-success` / `--allan-danger` | cores semanticas | feedback, sempre com icone/texto |

Gradientes podem iluminar superficies e cenas 3D; gradient text e proibido. Nenhum token `--nx-*` entra na aplicacao.

## Tipografia

- **Silkscreen:** display curto, logo textual, placares e rotulos arcade.
- **Onest:** corpo, navegacao, formularios e textos longos.
- **JetBrains Mono:** caminhos, metadados e contexto tecnico.

Titulos usam `text-wrap: balance`, tracking nunca menor que `-0.04em`; corpo fica entre 65 e 75 caracteres por linha. Fontes self-hosted via `next/font/local`.

## Layout

- Conteiner fluido com limites de leitura, espacamento por `clamp()` e ritmo variado.
- Hero assimetrico: mensagem/CTAs de um lado, assinatura visual 3D do outro.
- Projetos destacados aparecem cedo, antes de secoes institucionais longas.
- Cards so quando representam objetos acionaveis: projeto, etapa ou opcao real.
- Case usa narrativa vertical com midia ampla; sumario sticky somente em desktop.

## Componentes de assinatura

- logotipo textual ALLANDEV;
- cena hero em camadas CSS 3D;
- moldura de terminal para contexto tecnico, nao para todo conteudo;
- seletor de projetos inspirado em tela de jogo;
- galeria, video, diagrama de arquitetura, tabela de decisoes e imagem de codigo;
- marquee de tecnologias como transicao curta;
- easter eggs discretos e som desligado por padrao.

Evitar nested cards, glassmorphism padrao, bordas laterais decorativas, cantos acima de 16px em cards e sombra ampla junto de borda fina.

## Movimento

- Motion coordena entrada do hero, troca de projeto e dialogos.
- CSS `perspective`/`transform-style: preserve-3d` cria tilt e profundidade; sem Three.js/WebGL na v1.
- Animar `transform`, `opacity`, `clip-path`, blur e luz; nao animar layout continuamente.
- Conteudo nasce visivel; animacao apenas melhora apresentacao.
- Preloader opcional: primeira visita da sessao, maximo 1,2s, sem progresso falso.
- Touch/mobile reduz parallax. `prefers-reduced-motion` troca tudo por corte ou crossfade curto.

## Responsividade e qualidade

- Verificar 320, 640, 768, 1024, 1280, 1440 e 2560px.
- Nenhum heading, codigo ou midia cria scroll horizontal na pagina.
- Imagens reservam dimensoes; videos usam poster, `preload="none"` e play deliberado.
- Metas: LCP <= 2,5s; INP <= 200ms; CLS <= 0,1; Lighthouse mobile 90/95/100/100.

## Uso do logo Nexos Tech

Logo pode aparecer no case Nexos ERP e na historia profissional de Allan. Preservar proporcao, cores e area de respiro. Nunca usar como logo principal do portfolio, favicon pessoal ou marca d'agua global.
