import Image from "next/image";
import Link from "next/link";
import { Root as Accordion, Content as AccordionContent, Item as AccordionItem, Trigger as AccordionTrigger } from "@radix-ui/react-accordion";
import { ArrowDown, ArrowUpRight, Database, GitBranch, Monitor, Network, Server, Smartphone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { HeroPlayerCard } from "@/components/hero-player-card";
import { Marquee } from "@/components/ui/marquee";
import { listHomeProjectTeasers } from "@/lib/content/projects";
import { homeContent } from "@/lib/home-content";

const iconMap = { Monitor, Server, Smartphone, Database, Network, GitBranch };

export default async function Home() {
  const projects = await listHomeProjectTeasers();
  const { hero, marquee, sobre, processo, projetos, servicos, faq, contato, footer } = homeContent;
  const jsonLd = { "@context": "https://schema.org", "@type": "Person", name: "Allan Carvalho", jobTitle: "Desenvolvedor full-stack e infraestrutura", url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000", sameAs: ["https://github.com/allancsilva-dev"] };
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };

  return <main className="arcade-home" id="conteudo">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

    <section className="home-hero" id="topo" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-badge"><i aria-hidden="true" />{hero.badge}</p>
        <h1 id="hero-title">{hero.title}</h1>
        <p className="hero-lede">{hero.lede}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}<ArrowUpRight size={16} /></a>
          <a className="button button-secondary" href={hero.ctaSecondary.href}>{hero.ctaSecondary.label}<ArrowDown size={16} /></a>
        </div>
      </div>
      <HeroPlayerCard />
    </section>

    <div className="home-marquee"><Marquee items={marquee.top} speed={42} /></div>

    <section className="home-section home-about" id="sobre" aria-labelledby="sobre-title">
      <div><p className="section-label">SOBRE ALLAN</p><h2 id="sobre-title">{sobre.title}</h2></div>
      <div className="about-copy"><p>{sobre.body}</p><strong>{sobre.highlight}</strong><ul aria-label="Especialidades"><li>TypeScript</li><li>Next.js</li><li>PostgreSQL</li><li>Docker</li><li>Linux</li><li>React Native</li></ul></div>
    </section>

    <section className="home-section home-process" id="processo" aria-labelledby="processo-title">
      <div className="section-heading"><p>PROCESSO</p><h2 id="processo-title">{processo.title}</h2></div>
      <ol>{processo.steps.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
    </section>

    <section className="home-section home-projects" id="projetos" aria-labelledby="projetos-title">
      <div className="section-heading"><p>TRABALHOS RECENTES</p><h2 id="projetos-title">{projetos.title}</h2><span>{projetos.emptyText}</span></div>
      <div className="project-grid">{projects.map((project) => {
        const draft = project.status !== "published";
        return <article className="project-card" key={project.slug}>
          <div className="project-cover"><Image src={project.capa.src} alt={project.capa.alt} width={960} height={540} sizes="(max-width: 767px) 100vw, 50vw" /></div>
          <div className="project-copy"><p>{project.homeTeaser?.label}</p><h3>{project.titulo}</h3><span>{project.resumo}</span><ul>{project.stack.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>
            <Link href={draft ? "/#contato" : `/projetos/${project.slug}`}>{draft ? "PEDIR APRESENTAÇÃO" : "VER CASE"}<ArrowUpRight size={15} /></Link>
          </div>
        </article>;
      })}</div>
    </section>

    <section className="home-section home-services" id="servicos" aria-labelledby="servicos-title">
      <div className="services-intro"><p>CAPACIDADES</p><h2 id="servicos-title">{servicos.title}</h2><span>Entre pelo problema. Stack vem depois.</span></div>
      <ul className="service-list">{servicos.items.map((item, index) => { const Icon = iconMap[item.icon]; return <li key={item.title} className={index < 2 ? "service-featured" : ""}><Icon size={22} aria-hidden="true"/><div><h3>{item.title}</h3><p>{item.description}</p></div></li>; })}</ul>
    </section>

    <section className="home-section home-faq" id="faq" aria-labelledby="faq-title">
      <div className="section-heading"><p>FAQ</p><h2 id="faq-title">{faq.title}</h2></div>
      <Accordion type="single" collapsible defaultValue={faq.items[0].q}>{faq.items.map((item) => <AccordionItem key={item.q} value={item.q} className="faq-item"><AccordionTrigger className="faq-trigger">{item.q}<span aria-hidden="true">+</span></AccordionTrigger><AccordionContent className="faq-content"><p>{item.a}</p></AccordionContent></AccordionItem>)}</Accordion>
    </section>

    <section className="home-section home-contact" id="contato" aria-labelledby="contato-title">
      <div className="contact-copy"><p>VAMOS CONSTRUIR</p><h2 id="contato-title">{contato.title}</h2><span>{contato.lede}</span><a href={`mailto:${contato.email}`}>{contato.email} ↗</a></div><ContactForm />
    </section>
    <footer className="home-footer"><strong>Allan.Dev</strong><span>© {new Date().getFullYear()} Allan Carvalho</span><span>{footer.tagline}</span><Link href="/privacidade">PRIVACIDADE</Link></footer>
  </main>;
}
