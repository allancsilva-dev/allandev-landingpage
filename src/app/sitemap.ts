import type { MetadataRoute } from "next";
import { listPublishedProjects } from "@/lib/content/projects";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
  const projects = await listPublishedProjects();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...projects.map((project) => ({
      url: `${base}/projetos/${project.slug}`,
      lastModified: project.atualizadoEm,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
