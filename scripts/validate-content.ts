import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { listAllProjects } from "../src/lib/content/projects";
import {
  listCodeShots,
  listGeneratedCodeShots,
  listResolvedCodeShots,
} from "../src/lib/content/code-shots";

const publicFile = (src: string) =>
  access(path.join(process.cwd(), "public", src.slice(1)));

// Resolving pairs the manifest with the generated rasters and throws when the
// two disagree, so CI catches a manifest edited without `pnpm code-shots`
// without needing access to the private repositories.
const shots = await listResolvedCodeShots();
const generated = await listGeneratedCodeShots();
const manifestIds = new Set((await listCodeShots()).map((shot) => shot.id));

for (const raster of generated)
  if (!manifestIds.has(raster.id))
    throw new Error(
      `code-shot "${raster.id}" foi gerado mas não está no manifesto`,
    );

for (const shot of shots) await publicFile(shot.file);

const projects = await listAllProjects();
const slugs = new Set(projects.map((project) => project.slug));
const referencedProjectImages = new Set<string>();

for (const shot of shots)
  if (!slugs.has(shot.projeto))
    throw new Error(
      `code-shot "${shot.id}" aponta para o projeto inexistente "${shot.projeto}"`,
    );

for (const project of projects) {
  await publicFile(project.capa.src);
  if (project.ogImage) await publicFile(project.ogImage);
  for (const image of project.galeria ?? []) await publicFile(image.src);
  for (const video of project.videos ?? []) {
    await publicFile(video.src);
    await publicFile(video.poster);
  }

  for (const id of project.codeShots ?? []) {
    const shot = shots.find((item) => item.id === id);
    if (!shot)
      throw new Error(
        `${project.slug}: code-shot "${id}" não existe no manifesto`,
      );
    if (shot.projeto !== project.slug)
      throw new Error(
        `${project.slug}: code-shot "${id}" pertence a "${shot.projeto}"`,
      );
  }

  for (const resultado of project.resultados ?? [])
    if (
      /\bTODO\b/.test(
        `${resultado.valor} ${resultado.rotulo} ${resultado.contexto}`,
      )
    )
      throw new Error(`${project.slug}: resultado com TODO pendente`);

  const mdx = await readFile(
    path.join(process.cwd(), "content", "projetos", `${project.slug}.mdx`),
    "utf8",
  );
  for (const match of mdx.matchAll(/\/images\/projects\/[a-z0-9/_-]+\.webp/g))
    referencedProjectImages.add(match[0]);
  if (
    /^(import|export)\s/m.test(mdx) ||
    /<(script|style)\b/i.test(mdx) ||
    /dangerouslySetInnerHTML/.test(mdx)
  )
    throw new Error(`MDX inseguro em ${project.slug}`);
}

const projectImagesRoot = path.join(
  process.cwd(),
  "public",
  "images",
  "projects",
);
for (const entry of await readdir(projectImagesRoot, {
  recursive: true,
  withFileTypes: true,
})) {
  if (!entry.isFile()) continue;
  const absolute = path.join(entry.parentPath, entry.name);
  const publicPath = absolute.slice(path.join(process.cwd(), "public").length);
  if (!referencedProjectImages.has(publicPath))
    throw new Error(`asset público sem referência: ${publicPath}`);
}

console.log(
  `Conteúdo válido: ${projects.length} projeto(s), ${shots.length} code-shot(s).`,
);
