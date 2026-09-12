import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectCardMedia } from "@/components/project-card-media";
import { projectStatusLabel, stackChips } from "@/lib/content/projects";
import type { ProjectSummary } from "@/lib/content/schema";

/**
 * One card, shared by the home teaser grid and `/projetos`, so the two can't
 * drift apart. Only the heading holds the link and a pseudo-element stretches it
 * over the card (S7) — wrapping the whole `<article>` would nest links.
 */
export function ProjectCard({
  project,
  sizes,
  priority = false,
}: {
  project: ProjectSummary & { slug: string };
  sizes: string;
  /** Set on the first card of `/projetos`, where the cover is the LCP image. */
  priority?: boolean;
}) {
  const draft = project.status !== "published";
  const href = draft ? "/#contato" : `/projetos/${project.slug}`;
  const chips = stackChips(project.stack);

  return (
    <article className="project-card pixel-corners">
      <div className="project-cover">
        <ProjectCardMedia
          capa={project.capa}
          video={project.videos?.[0]}
          titulo={project.titulo}
          sizes={sizes}
          priority={priority}
        />
        <Badge variant={draft ? "progress" : "delivered"}>
          {draft
            ? (project.homeTeaser?.label ?? "EM PREPARAÇÃO")
            : projectStatusLabel(project)}
        </Badge>
      </div>
      <div className="project-copy">
        <h3>
          <Link href={href}>{project.titulo}</Link>
        </h3>
        <span>{project.resumo}</span>
        <ul>
          {chips.shown.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
          {chips.more && <li aria-label="mais tecnologias">{chips.more}</li>}
        </ul>
        <p className="project-card-action" aria-hidden="true">
          {draft ? "PEDIR APRESENTAÇÃO" : "VER CASE"}
          <ArrowUpRight size={15} />
        </p>
      </div>
    </article>
  );
}
