import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getPublishedProject,
  listPublishedProjects,
} from "@/lib/content/projects";
import {
  Gallery,
  VideoPlayer,
  Callout,
  Architecture,
  DecisionsTable,
  Metrics,
} from "@/components/mdx";
import { CodeShot } from "@/components/code-shot";
import { getSiteUrl } from "@/lib/site-url";

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listPublishedProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublishedProject((await params).slug);
  if (!item) return {};
  const base = getSiteUrl().origin;
  return {
    title: item.project.titulo,
    description: item.project.resumo,
    openGraph: {
      title: `${item.project.titulo} — Allan.Dev`,
      description: item.project.resumo,
      url: `${base}/projetos/${item.project.slug}`,
      type: "article",
      ...(item.project.ogImage
        ? {
            images: [{ url: item.project.ogImage, alt: item.project.capa.alt }],
          }
        : {}),
    },
  };
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractHeadings(source: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = source.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1]!.length;
      const text = match[2]!.trim();
      headings.push({ id: slugifyHeading(text), text, level });
    }
  }
  return headings;
}

// The TOC links to the same ids extractHeadings derives, so the rendered
// headings have to carry them \u2014 no rehype plugin does it for us here.
function headingWithId(level: 2 | 3) {
  const Tag = `h${level}` as const;
  return function Heading({ children }: { children?: React.ReactNode }) {
    const text = typeof children === "string" ? children : String(children);
    return <Tag id={slugifyHeading(text)}>{children}</Tag>;
  };
}

export default async function ProjectPage({ params }: Props) {
  const all = await listPublishedProjects();
  const item = await getPublishedProject((await params).slug);
  if (!item) notFound();

  const headings = extractHeadings(item.source);

  const idx = all.findIndex((p) => p.slug === item.project.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const { content } = await compileMDX({
    source: item.source,
    options: {
      // next-mdx-remote v6 strips every `{...}` expression by default, and that
      // includes JSX attribute values — `<Metrics resultados={[...]} />` would
      // arrive with no props at all. The MDX here is authored in this repo and
      // gated by `validate:content`, not user input, so the expression block is
      // off; `blockDangerousJS` stays on and still refuses eval, Function,
      // process and friends.
      blockJS: false,
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [] },
    },
    components: {
      a: ({ href = "", ...props }) => (
        <a
          href={href}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          {...props}
        />
      ),
      h2: headingWithId(2),
      h3: headingWithId(3),
      Gallery,
      VideoPlayer,
      Callout,
      Architecture,
      DecisionsTable,
      Metrics,
      CodeShot,
    },
  });

  return (
    <main className="project-page">
      <div className="project-header">
        <Link className="project-breadcrumb" href="/projetos">
          ← PROJETOS
        </Link>
        <h1>{item.project.titulo}</h1>
        <p className="section-lede">{item.project.resumo}</p>
        <div style={{ margin: "1.5rem 0" }}>
          <Image
            src={item.project.capa.src}
            alt={item.project.capa.alt}
            width={1920}
            height={1080}
            sizes="(max-width: 800px) 100vw, 1180px"
            priority
            style={{ borderRadius: "10px", width: "100%", height: "auto" }}
          />
        </div>
        <div className="project-hud">
          <span className="project-hud-tag">
            <strong>Papel:</strong> {item.project.papel}
          </span>
          <span className="project-hud-tag">
            <strong>Período:</strong> {item.project.periodo.inicio}
            {item.project.periodo.fim
              ? ` — ${item.project.periodo.fim}`
              : " — presente"}
          </span>
          <span className="project-hud-tag">
            <strong>Status:</strong>{" "}
            {item.project.periodo.fim ? "CONCLUÍDO" : "EM ANDAMENTO"}
          </span>
          {item.project.cliente && (
            <span className="project-hud-tag">
              <strong>Cliente:</strong> {item.project.cliente}
            </span>
          )}
        </div>
        <div className="project-hud">
          {item.project.stack.map((tech) => (
            <span key={tech} className="project-hud-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="project-body">
        {headings.length > 0 && (
          <aside className="project-toc" aria-label="Índice da página">
            <p className="project-toc-label">ÍNDICE</p>
            <nav>
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  style={{ paddingLeft: h.level === 3 ? "1rem" : 0 }}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
        <article className="project-article">{content}</article>
      </div>

      {(prev || next) && (
        <nav className="project-nav" aria-label="Navegação entre projetos">
          {prev ? (
            <Link className="project-nav-prev" href={`/projetos/${prev.slug}`}>
              ← {prev.titulo}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="project-nav-next" href={`/projetos/${next.slug}`}>
              {next.titulo} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
