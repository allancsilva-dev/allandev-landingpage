import Link from "next/link";
export const metadata = { title: "Privacidade" };
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Allan.Dev</Link>
      <h1>Política de privacidade</h1>
      <p>Última atualização: 30 de agosto de 2026.</p>
      <h2>Dados e finalidade</h2>
      <p>
        O formulário coleta nome, e-mail, empresa opcional, tipo de projeto e
        mensagem somente para responder ao contato profissional solicitado.
      </p>
      <h2>Operadores</h2>
      <p>
        Cloudflare protege e entrega o site. Resend processa o envio do e-mail.
        Para prevenir abuso, o endereço IP também é enviado ao Cloudflare
        Turnstile durante a validação do formulário.
      </p>
      <h2>Segurança e retenção técnica</h2>
      <p>
        O limitador de envios mantém somente um identificador derivado do
        endereço IP, sem guardar o endereço original. Ele fica em memória,
        associado a uma janela de uma hora, e é removido durante a limpeza de
        novos envios ou quando o serviço reinicia.
      </p>
      <h2>Retenção e direitos</h2>
      <p>
        Mensagens são mantidas pelo período necessário à conversa comercial e
        obrigações aplicáveis. Para acesso, correção ou exclusão, escreva para
        allan@nexostech.com.br.
      </p>
      <p>
        Esta política será atualizada se o site ou seus fornecedores mudarem.
      </p>
    </main>
  );
}
