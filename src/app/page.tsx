import Link from "next/link";
import {
  Root as Accordion,
  Content as AccordionContent,
  Item as AccordionItem,
  Trigger as AccordionTrigger,
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
import { ProjectCard } from "@/components/project-card";
import { HeroPlayerCard } from "@/components/hero-player-card";
import { HeroStage } from "@/components/hero-stage";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { Terminal } from "@/components/ui/terminal";
import { listHomeProjectTeasers } from "@/lib/content/projects";
import { homeContent } from "@/lib/home-content";
import { getSiteUrl } from "@/lib/site-url";

const iconMap = { Monitor, Server, Smartphone, Database, Network, GitBranch };

export default async function Home() {
  const projects = await listHomeProjectTeasers();
  const { hero, marquee, sobre, processo, projetos, servicos, faq, contato } =
    homeContent;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Allan Carvalho",
    jobTitle: "Desenvolvedor full-stack e infraestrutura",
    url: getSiteUrl().toString(),
    sameAs: ["https://github.com/allancsilva-dev"],
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
    <main className="arcade-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="home-hero" id="topo" aria-labelledby="hero-title">
        <HeroStage>
          <div className="hero-copy">
            <p className="hero-badge">
              <i aria-hidden="true" />
              {hero.badge}
            </p>
            <h1 id="hero-title">{hero.title}</h1>
            <p className="hero-lede">{hero.lede}</p>
            <div className="hero-actions">
              <Button href={hero.ctaPrimary.href}>
                {hero.ctaPrimary.label}
                <ArrowUpRight size={16} />
              </Button>
              <Button variant="secondary" href={hero.ctaSecondary.href}>
                {hero.ctaSecondary.label}
                <ArrowDown size={16} />
              </Button>
            </div>
          </div>
          <HeroPlayerCard />
        </HeroStage>
      </section>

      {/* Two bands, opposite directions, different speeds: identical speeds
          read as hypnotic rather than as texture. */}
      <div className="home-marquee">
        <Marquee items={marquee.top} speed={42} />
        <Marquee items={marquee.bottom} direction="right" speed={55} />
      </div>

      <Section
        className="home-section home-about"
        id="sobre"
        labelledBy="sobre-title"
      >
        <SectionHeading
          eyebrow={sobre.eyebrow}
          title={sobre.title}
          titleId="sobre-title"
        />
        <Reveal className="about-copy">
          <Terminal abaLabel={sobre.abaLabel} prompt={sobre.prompt}>
            <p>{sobre.body}</p>
            <strong>{sobre.highlight}</strong>
          </Terminal>
          <ul aria-label="Especialidades">
            {sobre.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section
        className="home-section home-process"
        id="processo"
        labelledBy="processo-title"
      >
        <SectionHeading
          eyebrow={processo.eyebrow}
          title={processo.title}
          titleId="processo-title"
        />
        <RevealGroup as="ol" stagger={70}>
          {processo.steps.map((step, index) => (
            <li key={step.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </RevealGroup>
      </Section>

      <Section
        className="home-section home-projects"
        id="projetos"
        labelledBy="projetos-title"
      >
        <SectionHeading
          eyebrow={projetos.eyebrow}
          title={projetos.title}
          titleId="projetos-title"
          lede={projects.length ? projetos.lede : projetos.emptyText}
          action={
            <Link className="section-action" href="/projetos">
              {projetos.viewAll}
            </Link>
          }
        />
        <RevealGroup className="project-grid" stagger={80}>
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          ))}
        </RevealGroup>
      </Section>

      <Section
        className="home-section home-services"
        id="servicos"
        labelledBy="servicos-title"
      >
        <SectionHeading
          className="services-intro"
          eyebrow={servicos.eyebrow}
          title={servicos.title}
          titleId="servicos-title"
          lede={servicos.lede}
        />
        <RevealGroup as="ul" className="service-list" stagger={55}>
          {servicos.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <li
                key={item.title}
                className={index < 2 ? "service-featured" : ""}
              >
                <Icon size={22} aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            );
          })}
        </RevealGroup>
      </Section>

      <Section
        className="home-section home-faq"
        id="faq"
        labelledBy="faq-title"
      >
        <SectionHeading
          eyebrow={faq.eyebrow}
          title={faq.title}
          titleId="faq-title"
        />
        <Accordion type="single" collapsible defaultValue={faq.items[0].q}>
          {faq.items.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="faq-item">
              <AccordionTrigger className="faq-trigger">
                {item.q}
                <span aria-hidden="true">+</span>
              </AccordionTrigger>
              <AccordionContent className="faq-content">
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section
        className="home-section home-contact"
        id="contato"
        labelledBy="contato-title"
      >
        <SectionHeading
          className="contact-copy"
          eyebrow={contato.eyebrow}
          title={contato.title}
          titleId="contato-title"
          lede={contato.lede}
        />
        <div className="contact-side">
          <p className="contact-channels-label">{contato.canaisLabel}</p>
          <ul className="contact-channels">
            {contato.canais.map((canal) => (
              <li key={canal.href}>
                <a
                  href={canal.href}
                  {...(canal.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  <span>{canal.label}</span>
                  <strong>{canal.value}</strong>
                </a>
              </li>
            ))}
          </ul>
          <ContactForm />
        </div>
      </Section>
    </main>
  );
}
