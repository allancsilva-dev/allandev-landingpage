import { z } from "zod";

const yearMonth = /^\d{4}-(0[1-9]|1[0-2])$/;
const localAsset =
  /^\/(?!\/|.*\.\.)[a-zA-Z0-9/_-]+\.(avif|webp|png|jpg|jpeg|svg)$/;
const localVideo = /^\/(?!\/|.*\.\.)[a-zA-Z0-9/_-]+\.(mp4|webm)$/;

export const projectFrontmatterSchema = z.object({
  titulo: z.string().min(3).max(60),
  resumo: z.string().min(50).max(160),
  status: z.enum(["draft", "published", "archived"]),
  destaque: z.number().int().positive().nullable().optional(),
  periodo: z.object({
    inicio: z.string().regex(yearMonth),
    fim: z.string().regex(yearMonth).nullable(),
  }),
  papel: z.string().min(3).max(80),
  stack: z.array(z.string().min(1).max(40)).min(1),
  cliente: z.string().max(80).optional(),
  capa: z.object({
    src: z.string().regex(localAsset),
    alt: z.string().min(5).max(180),
  }),
  ogImage: z.string().regex(localAsset).optional(),
  links: z
    .object({
      demo: z.url({ protocol: /^https$/ }).optional(),
      repo: z.url({ protocol: /^https$/ }).optional(),
    })
    .optional(),
  atualizadoEm: z.coerce.date(),
  galeria: z
    .array(
      z.object({
        src: z.string().regex(localAsset),
        alt: z.string().min(5).max(180),
        legenda: z.string().max(200).optional(),
      }),
    )
    .max(12)
    .optional(),
  videos: z
    .array(
      z.object({
        src: z.string().regex(localVideo),
        poster: z.string().regex(localAsset),
        titulo: z.string().min(3).max(120),
      }),
    )
    .max(4)
    .optional(),
  resultados: z
    .array(
      z.object({
        valor: z.string().min(1).max(30),
        rotulo: z.string().min(2).max(80),
        contexto: z.string().min(10).max(200),
      }),
    )
    .max(8)
    .optional(),
  codeShots: z
    .array(z.string().regex(/^[a-z0-9-]+$/))
    .max(3)
    .optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type ProjectSummary = ProjectFrontmatter & { slug: string };
