import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { listPublishedProjects } from "@/lib/content/projects";

const disciplines = [
  [
    "Sistemas web",
    "Interfaces rápidas, APIs previsíveis e operações observáveis.",
  ],
  ["Mobile", "Experiências nativas conectadas ao mesmo núcleo de negócio."],
  [
    "Infraestrutura",
    "Containers, CI/CD, dados e servidores tratados como produto.",
  ],
] as const;

export default async function Home() {
  const projects = await listPublishedProjects();
  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="AllanDev — início">
          ALLAN<span>DEV</span>
        </Link>
        <nav aria-label="Principal">
          <a href="#trabalho">Trabalho</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="status">
            <span aria-hidden="true" /> Disponível para novos projetos
          </p>
          <h1 id="hero-title">Código que chega inteiro à produção.</h1>
          <p className="hero-lede">
            Sou Allan Carvalho. Projeto infraestrutura e produtos full-stack com
            o mesmo cuidado: do primeiro fluxo à operação real.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contato">
              Falar sobre um projeto
            </a>
            <a className="button button-secondary" href="#trabalho">
              Ver como trabalho
            </a>
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
      </section>
      <div className="marquee" aria-label="Tecnologias principais">
        <div>
          TypeScript · React · Next.js · Node.js · Java · PostgreSQL · Docker ·
          Linux · CI/CD
        </div>
      </div>
      <section className="work" id="trabalho" aria-labelledby="work-title">
        <div className="section-heading">
          <h2 id="work-title">Produto e operação não vivem separados.</h2>
          <p>
            Arquitetura legível, feedback claro e caminho de recuperação fazem
            parte da entrega.
          </p>
        </div>
        <div className="discipline-list">
          {disciplines.map(([title, description], index) => (
            <article key={title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="projects" aria-labelledby="projects-title">
        <div className="section-heading">
          <h2 id="projects-title">Evidência antes de promessa.</h2>
          <p>
            Cases publicados mostram problema, arquitetura, decisões e
            resultado.
          </p>
        </div>
        {projects.length === 0 ? (
          <div className="empty-projects">
            <span>CASES / EM PREPARAÇÃO</span>
            <p>Nexos ERP e Renowa estão sendo documentados para publicação.</p>
          </div>
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projetos/${project.slug}`}>
                  <span>{project.papel}</span>
                  <strong>{project.titulo}</strong>
                  <p>{project.resumo}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="contact" id="contato" aria-labelledby="contact-title">
        <div className="contact-intro">
          <h2 id="contact-title">Qual problema precisa sair do caminho?</h2>
          <p>
            Conte o contexto. Respondo com próximos passos objetivos, sem
            reunião de descoberta disfarçada de venda.
          </p>
          <a href="mailto:allan@nexostech.com.br">allan@nexostech.com.br</a>
        </div>
        <ContactForm />
      </section>
      <footer>
        <span>© {new Date().getFullYear()} Allan Carvalho</span>
        <Link href="/privacidade">Privacidade</Link>
        <span>Next.js · servidor próprio</span>
      </footer>
    </main>
  );
}
