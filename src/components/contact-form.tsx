"use client";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    const payload = {
      nome: form.get("nome"),
      email: form.get("email"),
      empresa: form.get("empresa"),
      tipoProjeto: form.get("tipoProjeto"),
      mensagem: form.get("mensagem"),
      consentimento: form.get("consentimento") === "on",
      website: form.get("website"),
      turnstileToken: form.get("cf-turnstile-response") || "development-token",
      requestId: crypto.randomUUID(),
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("send failed");
      event.currentTarget.reset();
      setStatus("success");
      setMessage("Mensagem enviada. Retorno assim que possível.");
    } catch {
      if ("turnstile" in window)
        (
          window as Window & { turnstile?: { reset: () => void } }
        ).turnstile?.reset();
      setStatus("error");
      setMessage("Não consegui enviar agora. Use o e-mail ao lado.");
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return (
    <form className="contact-form" aria-label="Nova mensagem" onSubmit={submit}>
      <fieldset disabled={status === "sending"}>
        <legend>Nova mensagem</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              minLength={2}
              maxLength={80}
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="empresa">
              Empresa <span>(opcional)</span>
            </label>
            <input
              id="empresa"
              name="empresa"
              maxLength={80}
              autoComplete="organization"
            />
          </div>
          <div className="field">
            <label htmlFor="tipoProjeto">Tipo de projeto</label>
            <select
              id="tipoProjeto"
              name="tipoProjeto"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="site">Site / landing</option>
              <option value="sistema-web">Sistema web</option>
              <option value="api">API / backend</option>
              <option value="mobile">Aplicativo mobile</option>
              <option value="banco-de-dados">Banco de dados</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="consultoria">Consultoria</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="field field-wide">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea
              id="mensagem"
              name="mensagem"
              minLength={20}
              maxLength={2000}
              placeholder="Contexto, objetivo e prazo esperado"
              required
            />
          </div>
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </div>
        <label className="consent">
          <input name="consentimento" type="checkbox" required />
          <span>
            Autorizo o uso destes dados para responder minha solicitação. Li a{" "}
            <Link href="/privacidade">política de privacidade</Link>.
          </span>
        </label>
        {turnstileKey && (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="lazyOnload"
            />
            <div
              className="cf-turnstile"
              data-sitekey={turnstileKey}
              data-action="contact"
              data-theme="dark"
            />
          </>
        )}
        <button className="button button-primary" type="submit">
          {status === "sending" ? "Enviando…" : "Enviar mensagem"}
        </button>
      </fieldset>
      {message && (
        <p
          className={`form-message ${status}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  );
}
