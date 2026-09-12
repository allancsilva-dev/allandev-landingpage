import type { Metadata, Viewport } from "next";
import "@fontsource/onest/400.css";
import "@fontsource/onest/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/press-start-2p/400.css";
import "./globals.css";
import "./arcade.css";
import { AppShell } from "@/components/app-shell";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Allan Carvalho — Infraestrutura e Full-stack",
    template: "%s — Allan.Dev",
  },
  description:
    "Infraestrutura, sistemas web, mobile e integrações construídos com decisões pensadas para desempenho, operação e manutenção.",
  applicationName: "Allan.Dev",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230a0f1a'/><text y='.9em' font-size='65' font-family='monospace' font-weight='bold' fill='%2338e0d0' text-anchor='middle' x='50'>A</text></svg>",
        type: "image/svg+xml",
      },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Allan Carvalho — Infraestrutura e Full-stack",
    description:
      "Projetos reais, decisões técnicas e entregas prontas para produção.",
    url: "/",
    siteName: "Allan.Dev",
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
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
