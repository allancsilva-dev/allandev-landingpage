import Link from "next/link";
import { homeContent } from "@/lib/home-content";

const { footer } = homeContent;

/**
 * Rendered by the shell, outside `<main>` — inside it the element loses its
 * `contentinfo` role and the page ends up with no footer landmark at all.
 */
export function SiteFooter() {
  return (
    <footer className="home-footer">
      <strong>Allan.Dev</strong>
      <nav aria-label={footer.navLabel}>
        {footer.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <span>© {new Date().getFullYear()} Allan Carvalho</span>
      <span>{footer.tagline}</span>
    </footer>
  );
}
