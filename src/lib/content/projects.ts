import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type ProjectSummary } from "./schema";

const contentDirectory = path.join(process.cwd(), "content", "projetos");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const listAllProjects = cache(async () => {
  const files = (await fs.readdir(contentDirectory))
    .filter((file) => file.endsWith(".mdx"))
    .sort();
  const projects = await Promise.all(
    files.map(async (file): Promise<ProjectSummary> => {
      const slug = file.slice(0, -4);
      if (!slugPattern.test(slug)) throw new Error(`Slug inválido: ${slug}`);
      const source = await fs.readFile(
        path.join(contentDirectory, file),
        "utf8",
      );
      const parsed = projectFrontmatterSchema.safeParse(matter(source).data);
      if (!parsed.success)
        throw new Error(
          `Frontmatter inválido em ${file}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
        );
      return { ...parsed.data, slug };
    }),
  );
  const highlights = projects
    .map((project) => project.destaque)
    .filter((value): value is number => value != null);
  if (new Set(highlights).size !== highlights.length)
    throw new Error("Valores de destaque duplicados");
  return projects;
});

export async function listPublishedProjects() {
  return (await listAllProjects())
    .filter((project) => project.status === "published")
    .sort((a, b) => (a.destaque ?? 999) - (b.destaque ?? 999));
}

export async function getPublishedProject(slug: string) {
  if (!slugPattern.test(slug)) return null;
  const project = (await listAllProjects()).find(
    (item) => item.slug === slug && item.status === "published",
  );
  if (!project) return null;
  const source = await fs.readFile(
    path.join(contentDirectory, `${slug}.mdx`),
    "utf8",
  );
  return { project, source: matter(source).content };
}
