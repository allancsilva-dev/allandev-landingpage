import type { MetadataRoute } from "next";
import { listPublishedProjects } from "@/lib/content/projects";
import { getSiteUrl } from "@/lib/site-url";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const projects = await listPublishedProjects();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projetos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...projects.map((project) => ({
      url: `${base}/projetos/${project.slug}`,
      lastModified: project.atualizadoEm,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
