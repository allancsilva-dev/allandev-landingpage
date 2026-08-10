import Link from "next/link";
import { listPublishedProjects } from "@/lib/content/projects";

export const metadata = {
  title: "Projetos",
  description:
    "Cases técnicos de Allan Carvalho — infraestrutura e desenvolvimento full-stack.",
};

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <main className="project-page">
      <Link href="/">← HOME</Link>
      <h1>PROJETOS</h1>
      {projects.length === 0 ? (
        <div className="empty-projects" style={{ marginTop: "2rem" }}>
          <span>CASES / EM PREPARAÇÃO</span>
          <p>Cases em revisão. Nenhum projeto publicado ainda.</p>
        </div>
      ) : (
        <ul className="project-list" style={{ marginTop: "2rem" }}>
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/projetos/${project.slug}`}>
                <span>{project.papel}</span>
                <strong>{project.titulo}</strong>
                <p>{project.resumo}</p>
                <span className="project-stack">
                  {project.stack.slice(0, 3).join(", ")}
                  {project.stack.length > 3 && ` +${project.stack.length - 3}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
