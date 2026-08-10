---
target: menu Allan.Dev comparado ao Muniz
total_score: 28
p0_count: 0
p1_count: 3
timestamp: 2026-08-10T22-42-20Z
slug: src-components-app-shell-tsx
---

#### Design Health Score

| #         | Heuristic                       |     Score | Key issue                                                                               |
| --------- | ------------------------------- | --------: | --------------------------------------------------------------------------------------- |
| 1         | Visibility of system status     |         3 | Overlay e estado aberto são claros.                                                     |
| 2         | Match system / real world       |         2 | “PAUSE / MAPA” e códigos 01–06 transformam navegação simples em metáfora desnecessária. |
| 3         | User control and freedom        |         4 | Fechar, Escape e backdrop nativo são fortes.                                            |
| 4         | Consistency and standards       |         3 | Dialog nativo e links previsvis; tratamento visual destoa do restante mais editorial.   |
| 5         | Error prevention                |         4 | Pouco risco e links explícitos.                                                         |
| 6         | Recognition rather than recall  |         4 | Destinos são nomeados diretamente.                                                      |
| 7         | Flexibility and efficiency      |         3 | Acesso direto funciona, mas a lista longa e espaçada aumenta deslocamento ocular.       |
| 8         | Aesthetic and minimalist design |         1 | Moldura, título, números e seis regras competem com os destinos.                        |
| 9         | Error recovery                  |         2 | Não há erro relevante; Escape cobre saída.                                              |
| 10        | Help and documentation          |         2 | Não aplicável; a metáfora “mapa” não ajuda.                                             |
| **Total** |                                 | **28/40** | **Funcional, visualmente sobreconstruído**                                              |

#### Anti-Patterns Verdict

O menu Allan.Dev parece um painel arcade montado a partir de componentes; o da Muniz parece uma composição única. O detector não encontrou padrões determinísticos em `app-shell.tsx`, portanto o problema é de direção e hierarquia, não de uma infração sintática detectável.

#### Overall Impression

A Muniz vence por subtração. Ela preserva contexto, escurece a página e faz os cinco links virarem o único foco. Allan.Dev adiciona uma caixa dentro do overlay e depois subdivide essa caixa, reduzindo escala e presença.

#### What's Working

- Dialog nativo oferece foco, Escape e semântica melhores.
- Contraste ciano/branco é forte.
- Os destinos são claros e completos.

#### Priority Issues

- **[P1] Menu tratado como painel** — a borda externa e o fundo sólido isolam demais a navegação. Remover a caixa e usar overlay full viewport translúcido.
- **[P1] Hierarquia fragmentada** — “PAUSE / MAPA”, números e divisórias competem com os links. Remover os três e aumentar os nomes.
- **[P1] Movimento sem dramaturgia** — o estado surge como modal utilitário. Usar entrada curta do backdrop e stagger leve dos links, respeitando reduced motion.
- **[P2] Fechar compete com navegar** — o botão ciano contornado tem peso de CTA. Reduzir para ícone/label discreto no canto.
- **[P2] Falta de assinatura Allan.Dev** — o menu não usa wordmark, retrato ou uma microinformação própria. Uma assinatura pequena basta; não adicionar outro painel.

#### Persona Red Flags

- **Cliente B2B pela primeira vez:** interpreta “PAUSE / MAPA” e 01–06 antes de encontrar Contato; a metáfora adiciona carga sem valor.
- **Recrutador técnico:** consegue navegar por teclado, mas o modal parece mais pesado e lento que o conteúdo que organiza.
- **Usuário mobile:** seis linhas altas dentro de um painel criam sensação de lista administrativa e podem exigir rolagem desnecessária.

#### Minor Observations

- “HOME” é redundante quando o wordmark já leva ao início.
- FAQ não aparece no menu atual, embora seja uma seção importante.
- GitHub pode entrar como link secundário no rodapé do overlay, sem competir com a navegação principal.

#### Questions to Consider

- O menu precisa representar um “mapa de jogo” ou só carregar a energia arcade na tipografia e no motion?
- Se todos os ornamentos sumirem, quais cinco destinos realmente merecem ocupar a tela?
