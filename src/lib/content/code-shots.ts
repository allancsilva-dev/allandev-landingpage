import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const manifestPath = path.join(process.cwd(), "content", "code-shots.json");
const generatedPath = path.join(
  process.cwd(),
  "content",
  "code-shots.generated.json",
);

export const codeShotSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    projeto: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    // Folder name under CODE_SHOTS_ROOT — never a path, so a manifest edit
    // can't reach outside the projects directory.
    sourceRepo: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    path: z.string().regex(/^(?!\/|.*\.\.)[\w./-]+$/),
    // A branch name would let the snippet drift under the published image.
    ref: z.string().regex(/^[0-9a-f]{40}$/),
    region: z.string().min(3).max(80).optional(),
    linhas: z
      .tuple([z.number().int().positive(), z.number().int().positive()])
      .optional(),
    expectedHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    language: z.string().min(1).max(20),
    titulo: z.string().min(3).max(60),
    descricao: z.string().min(60).max(400),
  })
  .refine((shot) => Boolean(shot.region) !== Boolean(shot.linhas), {
    message: "informe `region` ou `linhas`, nunca os dois",
  })
  .refine((shot) => !shot.linhas || shot.linhas[0] <= shot.linhas[1], {
    message: "`linhas` fora de ordem",
  });

export type CodeShot = z.infer<typeof codeShotSchema>;

export const generatedCodeShotSchema = z.object({
  id: z.string(),
  file: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sourceHash: z.string(),
});

export type GeneratedCodeShot = z.infer<typeof generatedCodeShotSchema>;
export type ResolvedCodeShot = CodeShot & GeneratedCodeShot;

async function readJson(file: string) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export const listCodeShots = cache(async (): Promise<CodeShot[]> => {
  const raw = await readJson(manifestPath);
  if (raw == null) return [];
  const parsed = z.array(codeShotSchema).safeParse(raw);
  if (!parsed.success)
    throw new Error(
      `code-shots.json inválido: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
    );
  const ids = parsed.data.map((shot) => shot.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("IDs de code-shot duplicados");
  for (const projeto of new Set(parsed.data.map((shot) => shot.projeto)))
    if (parsed.data.filter((shot) => shot.projeto === projeto).length > 3)
      throw new Error(`Mais de 3 code-shots em ${projeto}`);
  return parsed.data;
});

export const listGeneratedCodeShots = cache(
  async (): Promise<GeneratedCodeShot[]> => {
    const raw = await readJson(generatedPath);
    if (raw == null) return [];
    return z.array(generatedCodeShotSchema).parse(raw);
  },
);

/**
 * The manifest describes the snippet; the generated file describes the raster
 * that was actually produced from it. A page only ever renders the pair, so a
 * manifest edited without re-running `pnpm code-shots` fails loudly instead of
 * publishing an image that no longer matches its own description.
 */
export const listResolvedCodeShots = cache(
  async (): Promise<ResolvedCodeShot[]> => {
    const [shots, generated] = await Promise.all([
      listCodeShots(),
      listGeneratedCodeShots(),
    ]);
    return shots.map((shot) => {
      const raster = generated.find((item) => item.id === shot.id);
      if (!raster)
        throw new Error(
          `code-shot "${shot.id}" sem imagem — rode \`pnpm code-shots\``,
        );
      if (raster.sourceHash !== shot.expectedHash)
        throw new Error(
          `code-shot "${shot.id}": manifesto e imagem divergem — rode \`pnpm code-shots\``,
        );
      return { ...shot, ...raster };
    });
  },
);

export async function getCodeShot(id: string) {
  return (await listResolvedCodeShots()).find((shot) => shot.id === id) ?? null;
}

export async function listCodeShotsForProject(slug: string) {
  return (await listResolvedCodeShots()).filter(
    (shot) => shot.projeto === slug,
  );
}
