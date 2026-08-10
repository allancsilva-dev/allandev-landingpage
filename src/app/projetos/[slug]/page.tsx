import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getPublishedProject,
  listPublishedProjects,
} from "@/lib/content/projects";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await listPublishedProjects()).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublishedProject((await params).slug);
  return item
    ? { title: item.project.titulo, description: item.project.resumo }
    : {};
}
export default async function ProjectPage({ params }: Props) {
  const item = await getPublishedProject((await params).slug);
  if (!item) notFound();
  const { content } = await compileMDX({
    source: item.source,
    options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [] } },
    components: {
      a: ({ href = "", ...props }) => (
        <a
          href={href}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          {...props}
        />
      ),
    },
  });
  return (
    <main className="legal-page">
      <Link href="/projetos">← Projetos</Link>
      <h1>{item.project.titulo}</h1>
      <p>{item.project.resumo}</p>
      <article>{content}</article>
    </main>
  );
}
