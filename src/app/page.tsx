import Link from "next/link";
import {
  Accordion as AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import {
  Monitor,
  Server,
  Smartphone,
  Database,
  Network,
  GitBranch,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { listPublishedProjects } from "@/lib/content/projects";
import { homeContent } from "@/lib/home-content";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/components/ui/terminal";
import { HUDCard } from "@/components/ui/hud-card";
import { Marquee } from "@/components/ui/marquee";
import { Section, SectionHeading } from "@/components/ui/section";

const iconMap = {
  Monitor,
  Server,
  Smartphone,
  Database,
  Network,
  GitBranch,
};

export default async function Home() {
  const projects = await listPublishedProjects();
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* S3 — Hero */}
      <section className="hero" id="topo" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Badge variant="available">{hero.badge}</Badge>
          <h1 id="hero-title">{hero.title}</h1>
          <p className="hero-lede">{hero.lede}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={hero.ctaPrimary.href}>
              {hero.ctaPrimary.label}
            </a>
            <a
              className="button button-secondary"
              href={hero.ctaSecondary.href}
            >
              {hero.ctaSecondary.label}
            </a>
          </div>
          <div className="hero-huds">
            <HUDCard {...hero.hud[0]} />
            <HUDCard {...hero.hud[1]} />
          </div>
        </div>
        <div className="cabinet" aria-label="Painel técnico AllanDev">
          <div className="cabinet-screen">
            <p>ALLANDEV / SYSTEM</p>
            <strong>READY</strong>
            <dl>
              <div>
                <dt>STACK</dt>
                <dd>FULL</dd>
              </div>
              <div>
                <dt>DEPLOY</dt>
                <dd>OWNED</dd>
              </div>
              <div>
                <dt>FOCUS</dt>
                <dd>RESULT</dd>
              </div>
            </dl>
          </div>
          <div className="cabinet-controls" aria-hidden="true">
            <span className="joystick" />
            <span className="control cyan" />
            <span className="control violet" />
          </div>
        </div>
        <div className="hero-identity">
          <strong>{hero.identity.name}</strong>
          <span>{hero.identity.line}</span>
        </div>
      </section>

      {/* S4 — Marquee duplo */}
      <Marquee items={marquee.top} direction="left" speed={40} />
      <Marquee items={marquee.bottom} direction="right" speed={55} />

      {/* S5 — Sobre */}
      <Section id="sobre" aria-labelledby="sobre-title">
        <SectionHeading eyebrow={sobre.eyebrow} title={sobre.title} />
        <Terminal abaLable={sobre.abaLable} prompt={sobre.prompt}>
          <p>{sobre.body}</p>
          <p className="terminal-highlight">{sobre.highlight}</p>
        </Terminal>
      </Section>

      {/* S6 — Processo */}
      <Section id="processo" aria-labelledby="processo-title">
        <SectionHeading eyebrow={processo.eyebrow} title={processo.title} />
        <ol className="processo-list">
          {processo.steps.map((step, i) => (
            <li key={step.title}>
              <span className="processo-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* S7 — Projetos em destaque */}
      <Section id="projetos" aria-labelledby="projetos-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{projetos.eyebrow}</p>
            <h2 id="projetos-title">{projetos.title}</h2>
          </div>
          <div>
            {projects.length > 0 && (
              <Link className="section-link" href="/projetos">
                {projetos.viewAll}
              </Link>
            )}
          </div>
        </div>
        <p className="section-lede">{projetos.lede}</p>
        {projects.length === 0 ? (
          <div className="empty-projects">
            <span>{projetos.emptyLabel}</span>
            <p>{projetos.emptyText}</p>
          </div>
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projetos/${project.slug}`}>
                  <span>{project.papel}</span>
                  <strong>{project.titulo}</strong>
                  <p>{project.resumo}</p>
                  <span className="project-stack">
                    {project.stack.slice(0, 3).join(", ")}
                    {project.stack.length > 3 &&
                      ` +${project.stack.length - 3}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* S9 — Serviços */}
      <Section id="servicos" aria-labelledby="servicos-title">
        <SectionHeading eyebrow={servicos.eyebrow} title={servicos.title} />
        <ul className="servicos-grid">
          {servicos.items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.title}>
                <Icon aria-hidden="true" size={28} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* S10 — FAQ */}
      <Section id="faq" aria-labelledby="faq-title">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} />
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
      </Section>

      {/* S11 — Contato */}
      <Section id="contato" aria-labelledby="contato-title">
        <div className="contato-grid">
          <div className="contato-intro">
            <h2 id="contato-title">{contato.title}</h2>
            <p>{contato.lede}</p>
            <a href={`mailto:${contato.email}`}>{contato.email}</a>
          </div>
          <ContactForm />
        </div>
      </Section>

      {/* S12 — Footer */}
      <footer>
        <span>© {new Date().getFullYear()} Allan Carvalho</span>
        <Link href="/privacidade">Privacidade</Link>
        <span>{footer.tagline}</span>
      </footer>
    </main>
  );
}
