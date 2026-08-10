import type { Metadata, Viewport } from "next";
import "@fontsource/onest/400.css";
import "@fontsource/onest/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/silkscreen/400.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Allan Carvalho — Infraestrutura e Full-stack",
    template: "%s — AllanDev",
  },
  description:
    "Infraestrutura, sistemas web, mobile e integrações construídos com critério de produção. Da infraestrutura à interface — com código limpo e entrega que não quebra na segunda semana.",
  applicationName: "AllanDev",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Allan Carvalho — Infraestrutura e Full-stack",
    description:
      "Projetos reais, decisões técnicas e entregas prontas para produção.",
    url: "/",
    siteName: "AllanDev",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "oklch(0.105 0.028 260)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
