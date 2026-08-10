import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <p>ERRO 404</p>
      <h1>Rota fora do mapa.</h1>
      <Link className="button button-primary" href="/">
        Voltar ao início
      </Link>
    </main>
  );
}
