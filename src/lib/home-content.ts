const EMAIL = "allan@nexostech.com.br";

export const homeContent = {
  hero: {
    badge: "DISPONÍVEL PARA PROJETOS",
    title: "SISTEMAS QUE AGUENTAM PRODUÇÃO",
    lede: "Desenvolvimento web, mobile e integrações por quem também administra servidores, bancos de dados e redes. Da infraestrutura à interface, com decisões pensadas para desempenho, operação e manutenção.",
    ctaPrimary: { label: "SOLICITAR PROPOSTA", href: "#contato" },
    ctaSecondary: { label: "VER PROJETOS", href: "#projetos" },
    identity: {
      name: "ALLAN CARVALHO",
      line: "Infra & Full Stack · TypeScript · Next.js · PostgreSQL",
    },
    hud: [
      { value: "24h", label: "RETORNO NA PRIMEIRA ANÁLISE" },
      { value: "FULL", label: "DA INFRA À INTERFACE" },
    ] as const,
  },
  marquee: {
    top: [
      "TypeScript",
      "Java",
      "Next.js",
      "React",
      "Node.js",
      "Spring",
      "PostgreSQL",
      "SQL",
      "REST APIs",
      "Docker",
      "Linux",
      "React Native",
      "Git",
      "CI/CD",
    ],
    bottom: [
      "Docker",
      "Linux",
      "React Native",
      "Git",
      "CI/CD",
      "TypeScript",
      "Java",
      "Next.js",
      "React",
      "Node.js",
      "Spring",
      "PostgreSQL",
      "SQL",
      "REST APIs",
    ],
  },
  sobre: {
    eyebrow: "SOBRE ALLAN",
    title: "INFRAESTRUTURA E CÓDIGO NA MESMA CABEÇA",
    abaLabel: "sobre.md",
    prompt: "allan@allandev:~$ cat sobre.md",
    skills: [
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "Docker",
      "Linux",
      "React Native",
    ],
    body: "Administro servidores, bancos e redes há anos — e desenvolvo os sistemas que rodam neles. Isso muda o tipo de decisão que eu tomo: escolho arquitetura pensando em quem vai operar depois, porque normalmente sou eu. Trabalho com TypeScript, Next.js, React Native e PostgreSQL, com atenção fixa em performance, resiliência e manutenção.",
    highlight:
      "✓ 6 princípios não negociáveis: desempenho, escalabilidade, experiência, resiliência, uso eficiente de memória e tolerância a falhas de rede",
  },
  processo: {
    eyebrow: "PROCESSO",
    title: "COMO TRABALHAMOS JUNTOS",
    steps: [
      {
        title: "BRIEFING",
        description:
          "Você descreve o problema, o escopo e o prazo. Em até 24 horas eu devolvo uma análise inicial gratuita com riscos, premissas e uma estimativa honesta.",
      },
      {
        title: "CONSTRUÇÃO",
        description:
          "Entregas incrementais com ambiente de homologação no ar desde cedo. Você acompanha o progresso real, não um relatório de progresso.",
      },
      {
        title: "ENTREGA E OPERAÇÃO",
        description:
          "Deploy, testes, documentação e repasse. O projeto sobe pronto para ser operado — com runbook, não com 'qualquer coisa me chama'.",
      },
    ] as const,
  },
  projetos: {
    eyebrow: "PROJETOS",
    title: "EVIDÊNCIA ANTES DE PROMESSA",
    lede: "Cada case abre problema, arquitetura, decisões e resultado.",
    emptyLabel: "CASES / EM PREPARAÇÃO",
    emptyText: "Nexos ERP e Renowa estão sendo documentados para publicação.",
    emptyBody: "Cases em revisão. Nenhum projeto publicado ainda.",
    viewAll: "VER TODOS →",
  },
  servicos: {
    eyebrow: "CAPACIDADES",
    title: "O QUE VOCÊ PODE CONTRATAR",
    lede: "Entre pelo problema. Stack vem depois.",
    items: [
      {
        title: "APLICAÇÕES WEB",
        description:
          "Sistemas e painéis com Next.js e React — responsivos, acessíveis e rápidos de operar.",
        icon: "Monitor" as const,
      },
      {
        title: "BACKEND E APIS",
        description:
          "APIs REST com Java/Spring e Node.js, regra de negócio sólida e arquitetura que suporta crescer.",
        icon: "Server" as const,
      },
      {
        title: "APLICATIVOS MOBILE",
        description:
          "Android e iOS a partir de uma base só, com React Native e Expo.",
        icon: "Smartphone" as const,
      },
      {
        title: "BANCO DE DADOS",
        description:
          "Modelagem, otimização de query, migração e correção em PostgreSQL e SQL Server.",
        icon: "Database" as const,
      },
      {
        title: "INFRAESTRUTURA E DEPLOY",
        description:
          "Servidores, containers, CI/CD, backup e monitoramento. Sistema no ar é diferente de sistema pronto.",
        icon: "Network" as const,
      },
      {
        title: "CONSULTORIA TÉCNICA",
        description:
          "Auditoria de código, revisão de arquitetura e apoio a time que precisa destravar.",
        icon: "GitBranch" as const,
      },
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    title: "DÚVIDAS QUE APARECEM ANTES DO ORÇAMENTO",
    items: [
      {
        q: "QUANTO CUSTA UM PROJETO?",
        a: "Depende do escopo, e eu não trabalho com tabela fixa porque ela sempre erra para algum dos dois lados. A análise inicial é gratuita e devolve uma faixa de valor com as premissas explícitas — se o escopo mudar, o valor muda junto e você sabe por quê.",
      },
      {
        q: "QUAL O PRAZO MÉDIO?",
        a: "Uma landing page fica entre 3 dias e 1 semana. Um sistema web com backend, entre 3 e 6 semanas. Aplicativo mobile, entre 4 e 8 semanas. São faixas honestas, não promessas — o prazo real sai na análise inicial.",
      },
      {
        q: "VOCÊ TRABALHA COM SISTEMA QUE JÁ EXISTE?",
        a: "Sim, e é boa parte do que eu faço. Assumo manutenção, correção de performance, migração de banco e melhoria de sistema legado — inclusive quando a documentação não existe.",
      },
      {
        q: "COMO FUNCIONA O SUPORTE DEPOIS DA ENTREGA?",
        a: "O projeto é entregue documentado, com runbook de operação. Suporte corretivo por período combinado entra no contrato; manutenção contínua é acordo à parte.",
      },
    ] as const,
  },
  contato: {
    eyebrow: "CONTATO",
    title: "QUAL PROBLEMA PRECISA SAIR DO CAMINHO?",
    lede: "Conte o contexto. Respondo com próximos passos objetivos, sem reunião de descoberta disfarçada de venda.",
    email: EMAIL,
    canaisLabel: "ME ENCONTRE POR AQUI",
    // S11 also asks for LinkedIn and WhatsApp; both are pending real values
    // (commit 05701fb removed a placeholder WhatsApp number on purpose).
    canais: [
      { label: "E-mail", value: EMAIL, href: `mailto:${EMAIL}` },
      {
        label: "GitHub",
        value: "github.com/allancsilva-dev",
        href: "https://github.com/allancsilva-dev",
      },
    ],
  },
  footer: {
    tagline: "Next.js · servidor próprio",
    navLabel: "Rodapé",
    nav: [
      { label: "SOBRE", href: "/#sobre" },
      { label: "PROJETOS", href: "/projetos" },
      { label: "SERVIÇOS", href: "/#servicos" },
      { label: "CONTATO", href: "/#contato" },
      { label: "PRIVACIDADE", href: "/privacidade" },
    ],
  },
} as const;
