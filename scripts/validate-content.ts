import { access } from "node:fs/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { listAllProjects } from "../src/lib/content/projects";

const projects = await listAllProjects();
for (const project of projects) {
  await access(path.join(process.cwd(), "public", project.capa.src.slice(1)));
  if (project.ogImage)
    await access(path.join(process.cwd(), "public", project.ogImage.slice(1)));
  const mdx = await readFile(
    path.join(process.cwd(), "content", "projetos", `${project.slug}.mdx`),
    "utf8",
  );
  if (
    /^(import|export)\s/m.test(mdx) ||
    /<(script|style)\b/i.test(mdx) ||
    /dangerouslySetInnerHTML/.test(mdx)
  )
    throw new Error(`MDX inseguro em ${project.slug}`);
}
console.log(`Conteúdo válido: ${projects.length} projeto(s).`);
