import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { RevealGroup } from "@/components/ui/reveal";
import { listPublishedProjects } from "@/lib/content/projects";
import { homeContent } from "@/lib/home-content";

export const metadata = {
  title: "Projetos",
  description:
    "Cases técnicos de Allan Carvalho — infraestrutura e desenvolvimento full-stack.",
};

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <main className="project-page">
      <Link className="project-breadcrumb" href="/">
        ← HOME
      </Link>
      <h1>PROJETOS</h1>
      {projects.length === 0 ? (
        <div className="empty-projects">
          <span>{homeContent.projetos.emptyLabel}</span>
          <p>{homeContent.projetos.emptyBody}</p>
          <Link href="/#contato">FALAR SOBRE UM PROJETO →</Link>
        </div>
      ) : (
        // Same card as the home grid, so the two listings cannot drift apart.
        <RevealGroup className="project-grid" stagger={80}>
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              sizes="(max-width: 767px) 100vw, 50vw"
              priority={index === 0}
            />
          ))}
        </RevealGroup>
      )}
    </main>
  );
}
