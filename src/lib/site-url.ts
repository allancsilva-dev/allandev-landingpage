import "server-only";

const DEVELOPMENT_URL = "http://localhost:4000";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(configured || DEVELOPMENT_URL);

  if (
    process.env.NODE_ENV === "production" &&
    process.env.APP_ENV !== "development" &&
    (!configured || ["localhost", "127.0.0.1"].includes(url.hostname))
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL deve apontar para o domínio público em produção",
    );
  }

  return url;
}
