import Image from "next/image";
import Link from "next/link";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  ArrowDown,
  ArrowUpRight,
  Database,
  GitBranch,
  Monitor,
  Network,
  Server,
  Smartphone,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import {
  ProjectSelect,
  type ProjectMission,
} from "@/components/project-select";
import { Marquee } from "@/components/ui/marquee";
import { listHomeProjectTeasers } from "@/lib/content/projects";
import { homeContent } from "@/lib/home-content";

const iconMap = {
  Monitor,
  Server,
  Smartphone,
  Database,
  Network,
  GitBranch,
};

export default async function Home() {
  const projectTeasers = await listHomeProjectTeasers();
  const {
    hero,
    marquee,
    sobre,
    processo,
    projetos,
    servicos,
    faq,
    contato,
    footer,
  } = homeContent;
  const missions: ProjectMission[] = projectTeasers.map((project) => ({
    slug: project.slug,
    title: project.titulo,
    summary: project.resumo,
    label: project.homeTeaser?.label ?? "Case em preparação",
    role: project.papel,
    stack: project.stack,
    variant: project.homeTeaser?.visualVariant ?? "nexos",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Allan Carvalho",
    jobTitle: "Desenvolvedor full-stack e infraestrutura",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000",
    sameAs: ["https://github.com/allancsilva-dev"],
    knowsAbout: [
      "TypeScript",
      "Next.js",
      "React",
      "Java",
      "Spring",
      "PostgreSQL",
      "Docker",
      "Linux",
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="arcade-home home-page" id="conteudo">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <span className="arcade-scanlines" aria-hidden="true" />

      <section className="arcade-hero" id="topo" aria-labelledby="hero-title">
        <div className="arcade-hero-copy">
          <p className="arcade-hero-badge">
            <i aria-hidden="true" /> {hero.badge}
          </p>
          <h1 id="hero-title">{hero.title}</h1>
          <p className="arcade-hero-lede">{hero.lede}</p>
          <div className="arcade-actions">
            <a
              className="arcade-button arcade-button-primary"
              href={hero.ctaPrimary.href}
            >
              {hero.ctaPrimary.label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a
              className="arcade-button arcade-button-secondary"
              href={hero.ctaSecondary.href}
            >
              {hero.ctaSecondary.label}
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside
          className="arcade-player-card"
          aria-label="Allan Carvalho e credencial Nexos Tech"
        >
          <div className="arcade-player-art">
            <Image
              src="/images/nexos-tech-logo.png"
              width={1024}
              height={1024}
              sizes="(max-width: 767px) 42vw, 220px"
              priority
              alt="Logo Nexos Tech, empresa fundada por Allan Carvalho"
            />
          </div>
          <strong>ALLAN CARVALHO</strong>
          <p>Full Stack Developer · Infraestrutura · Nexos Tech</p>
          <dl>
            <div>
              <dt>FULL</dt>
              <dd>DA INFRA À INTERFACE</dd>
            </div>
            <div>
              <dt>24H</dt>
              <dd>RETORNO INICIAL</dd>
            </div>
          </dl>
        </aside>
      </section>

      <div className="arcade-marquee-wrap">
        <Marquee items={marquee.top} direction="left" speed={42} />
      </div>

      <section
        className="arcade-section arcade-projects"
        id="projetos"
        aria-labelledby="projetos-title"
      >
        <div className="arcade-section-head">
          <p>FASE 02 / PORTFÓLIO</p>
          <h2 id="projetos-title">SELECIONE UMA MISSÃO</h2>
          <span>{projetos.emptyText}</span>
        </div>
        <ProjectSelect projects={missions} />
      </section>

      <section
        className="arcade-section arcade-about"
        id="sobre"
        aria-labelledby="sobre-title"
      >
        <div className="arcade-character-title">
          <p>PLAYER PROFILE</p>
          <h2 id="sobre-title">{sobre.title}</h2>
        </div>
        <div className="arcade-character-sheet">
          <div className="arcade-avatar" aria-hidden="true">
            <span>A</span>
          </div>
          <div className="arcade-bio">
            <p>{sobre.body}</p>
            <strong>{sobre.highlight}</strong>
          </div>
          <dl className="arcade-stats">
            <div>
              <dt>VISÃO</dt>
              <dd>Da rede à experiência final</dd>
            </div>
            <div>
              <dt>CRITÉRIO</dt>
              <dd>Arquitetura pronta para operar</dd>
            </div>
            <div>
              <dt>FOCO</dt>
              <dd>Performance, resiliência e manutenção</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="arcade-section arcade-process"
        id="processo"
        aria-labelledby="processo-title"
      >
        <div className="arcade-section-head">
          <p>FASE 03 / CO-OP</p>
          <h2 id="processo-title">{processo.title}</h2>
          <span>Três fases. Visibilidade do primeiro briefing ao deploy.</span>
        </div>
        <ol className="arcade-levels">
          {processo.steps.map((step, index) => (
            <li key={step.title}>
              <span>LVL {String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="arcade-section arcade-services"
        id="servicos"
        aria-labelledby="servicos-title"
      >
        <div className="arcade-services-intro">
          <p>LOADOUT / CAPACIDADES</p>
          <h2 id="servicos-title">{servicos.title}</h2>
          <span>
            Entre pelo problema. Stack vem depois. Cada opção inclui construção,
            entrega e contexto de operação.
          </span>
        </div>
        <ul className="arcade-service-menu">
          {servicos.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="arcade-section arcade-faq"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="arcade-faq-intro">
          <p>HELP / PERGUNTAS FREQUENTES</p>
          <h2 id="faq-title">{faq.title}</h2>
          <span>Respostas diretas antes de abrir canal.</span>
        </div>
        <AccordionRoot type="single" collapsible defaultValue={faq.items[0].q}>
          {faq.items.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="faq-item">
              <AccordionTrigger className="faq-trigger">
                {item.q}
                <span className="faq-icon" aria-hidden="true" />
              </AccordionTrigger>
              <AccordionContent className="faq-content">
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </AccordionRoot>
      </section>

      <section
        className="arcade-section arcade-contact"
        id="contato"
        aria-labelledby="contato-title"
      >
        <div className="arcade-contact-copy">
          <p>NOVA MISSÃO / CONTATO</p>
          <h2 id="contato-title">{contato.title}</h2>
          <span>{contato.lede}</span>
          <a href={`mailto:${contato.email}`}>{contato.email} ↗</a>
        </div>
        <ContactForm />
      </section>

      <footer className="arcade-footer">
        <strong>ALLANDEV</strong>
        <span>© {new Date().getFullYear()} Allan Carvalho</span>
        <span>{footer.tagline}</span>
        <Link href="/privacidade">PRIVACIDADE</Link>
      </footer>
    </main>
  );
}
