import Link from "next/link";
import { listPublishedProjects } from "@/lib/content/projects";

export const metadata = {
  title: "Projetos",
  description: "Cases técnicos de Allan Carvalho.",
};
export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <main className="legal-page">
      <Link href="/">← AllanDev</Link>
      <h1>Projetos</h1>
      {projects.length === 0 ? (
        <p>Cases em revisão. Nenhum projeto publicado ainda.</p>
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
    </main>
  );
}
