import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false },
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
