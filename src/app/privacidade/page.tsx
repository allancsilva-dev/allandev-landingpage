import Link from "next/link";
export const metadata = { title: "Privacidade" };
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Allan.Dev</Link>
      <h1>Política de privacidade</h1>
      <p>Última atualização: 10 de agosto de 2026.</p>
      <h2>Dados e finalidade</h2>
      <p>
        O formulário coleta nome, e-mail, empresa opcional, tipo de projeto e
        mensagem somente para responder ao contato profissional solicitado.
      </p>
      <h2>Operadores</h2>
      <p>
        Cloudflare protege e entrega o site. Resend processa o envio do e-mail.
        Informações técnicas mínimas podem ser tratadas por esses fornecedores
        conforme seus termos.
      </p>
      <h2>Retenção e direitos</h2>
      <p>
        Mensagens são mantidas pelo período necessário à conversa comercial e
        obrigações aplicáveis. Para acesso, correção ou exclusão, escreva para
        allan@nexostech.com.br.
      </p>
      <p>
        Esta página é base operacional e deve receber revisão jurídica antes do
        lançamento comercial.
      </p>
    </main>
  );
}
