import { getCodeShot, type ResolvedCodeShot } from "@/lib/content/code-shots";
import { listAllProjects } from "@/lib/content/projects";
import { CodeShotFrame, type CodeShotView } from "@/components/code-shot-frame";

const languageLabels: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  js: "JavaScript",
  sql: "SQL",
  py: "Python",
  python: "Python",
  go: "Go",
  yaml: "YAML",
  bash: "Shell",
};

/**
 * The `alt` describes the problem and the decision — it never transcribes the
 * code. A screen reader user gets the point of the snippet, which is what the
 * section is actually claiming.
 */
export async function toCodeShotView(
  shot: ResolvedCodeShot,
  projectTitle: string,
): Promise<CodeShotView> {
  return {
    src: shot.file,
    alt: `Trecho de ${shot.titulo} do projeto ${projectTitle}. ${shot.descricao}`,
    width: shot.width,
    height: shot.height,
    titulo: shot.titulo,
    linguagem: languageLabels[shot.language] ?? shot.language,
    projeto: projectTitle,
    descricao: shot.descricao,
  };
}

export async function projectTitleFor(slug: string) {
  const project = (await listAllProjects()).find((item) => item.slug === slug);
  return project?.titulo ?? slug;
}

/** Used inside MDX as `<CodeShot id="..." />`. */
export async function CodeShot({ id }: { id: string }) {
  const shot = await getCodeShot(id);
  if (!shot) throw new Error(`code-shot "${id}" não existe no manifesto`);
  const view = await toCodeShotView(shot, await projectTitleFor(shot.projeto));
  return <CodeShotFrame shot={view} />;
}
