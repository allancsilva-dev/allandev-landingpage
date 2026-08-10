import Link from "next/link";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  ArrowUpRight,
  Braces,
  Database,
  GitBranch,
  Monitor,
  Network,
  Server,
  Smartphone,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { HomeStage } from "@/components/home-stage";
import { Marquee } from "@/components/ui/marquee";
import { Terminal } from "@/components/ui/terminal";
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
    <main className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="home-hero" id="topo" aria-labelledby="hero-title">
        <div className="home-cockpit-frame" aria-hidden="true" />
        <aside className="home-command-rail" aria-label="Status profissional">
          <div className="rail-identity">
            <span className="rail-mark" aria-hidden="true">
              A
            </span>
            <div>
              <strong>ALLAN CARVALHO</strong>
              <span>INFRA &amp; FULL STACK</span>
            </div>
          </div>
          <div className="rail-status">
            <span className="status-light" aria-hidden="true" />
            <div>
              <strong>{hero.badge}</strong>
              <span>RETORNO EM ATÉ 24H</span>
            </div>
          </div>
        </aside>

        <div className="home-hero-copy">
          <p className="hero-system-label">
            <Braces size={17} aria-hidden="true" /> MISSÃO / 01
          </p>
          <h1 id="hero-title">{hero.title}</h1>
          <p className="hero-lede">{hero.lede}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={hero.ctaPrimary.href}>
              {hero.ctaPrimary.label}{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a
              className="button button-secondary"
              href={hero.ctaSecondary.href}
            >
              {hero.ctaSecondary.label}
            </a>
          </div>
        </div>

        <HomeStage />
      </section>

      <div className="home-marquee-wrap">
        <Marquee items={marquee.top} direction="left" speed={44} />
        <span className="marquee-status" aria-hidden="true">
          SYSTEM ONLINE
        </span>
      </div>

      <section
        className="home-projects"
        id="projetos"
        aria-labelledby="projetos-title"
      >
        <div className="projects-intro">
          <p>PROJETOS EM DESTAQUE</p>
          <h2 id="projetos-title">{projetos.title}</h2>
          <span>{projetos.lede}</span>
        </div>
        <div className="project-teaser-grid">
          {projectTeasers.map((project) => {
            const content = (
              <>
                <span className="project-art" aria-hidden="true">
                  <span />
                </span>
                <span className="project-status">
                  {project.homeTeaser?.label}
                </span>
                <strong>{project.titulo}</strong>
                <p>{project.resumo}</p>
                <span className="project-meta">
                  <span>{project.papel}</span>
                  <span>{project.stack.slice(0, 4).join(" · ")}</span>
                </span>
                <span className="project-action">
                  {project.status === "published"
                    ? "VER CASE"
                    : "PEDIR APRESENTAÇÃO"}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </>
            );

            return project.status === "published" ? (
              <Link
                className={`project-teaser project-${project.homeTeaser?.visualVariant}`}
                href={`/projetos/${project.slug}`}
                key={project.slug}
              >
                {content}
              </Link>
            ) : (
              <a
                className={`project-teaser project-${project.homeTeaser?.visualVariant}`}
                href="#contato"
                key={project.slug}
                aria-label={`Pedir apresentação do projeto ${project.titulo}`}
              >
                {content}
              </a>
            );
          })}
        </div>
      </section>

      <section className="home-about" id="sobre" aria-labelledby="sobre-title">
        <div className="about-copy">
          <h2 id="sobre-title">{sobre.title}</h2>
          <p>
            O mesmo profissional que desenha interface também pensa em deploy,
            observabilidade, banco e operação. Menos repasse. Mais contexto.
          </p>
          <dl className="about-principles">
            <div>
              <dt>VISÃO</dt>
              <dd>Da rede à experiência final</dd>
            </div>
            <div>
              <dt>CRITÉRIO</dt>
              <dd>Arquitetura pronta para operar</dd>
            </div>
          </dl>
        </div>
        <Terminal abaLable={sobre.abaLable} prompt={sobre.prompt}>
          <p>{sobre.body}</p>
          <p className="terminal-highlight">{sobre.highlight}</p>
        </Terminal>
      </section>

      <section
        className="home-process"
        id="processo"
        aria-labelledby="processo-title"
      >
        <div className="process-heading">
          <span>BRIEFING → PRODUÇÃO</span>
          <h2 id="processo-title">{processo.title}</h2>
        </div>
        <ol className="process-timeline">
          {processo.steps.map((step, index) => (
            <li key={step.title}>
              <span className="process-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="home-services"
        id="servicos"
        aria-labelledby="servicos-title"
      >
        <div className="services-heading">
          <h2 id="servicos-title">{servicos.title}</h2>
          <p>
            Construção, modernização e operação no mesmo contexto técnico. Entre
            pelo problema; stack vem depois.
          </p>
        </div>
        <ul className="services-list">
          {servicos.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.title}>
                <span className="service-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon aria-hidden="true" size={24} strokeWidth={1.6} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="home-faq" id="faq" aria-labelledby="faq-title">
        <div className="faq-heading">
          <h2 id="faq-title">{faq.title}</h2>
          <p>Respostas diretas antes de abrir canal.</p>
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
        className="home-contact"
        id="contato"
        aria-labelledby="contato-title"
      >
        <div className="contact-orbit" aria-hidden="true" />
        <div className="contato-intro">
          <p>ABRIR NOVA MISSÃO</p>
          <h2 id="contato-title">{contato.title}</h2>
          <span>{contato.lede}</span>
          <a href={`mailto:${contato.email}`}>{contato.email} ↗</a>
        </div>
        <ContactForm />
      </section>

      <footer className="home-footer">
        <strong>ALLANDEV</strong>
        <span>© {new Date().getFullYear()} Allan Carvalho</span>
        <span>{footer.tagline}</span>
        <Link href="/privacidade">Privacidade</Link>
      </footer>
    </main>
  );
}
