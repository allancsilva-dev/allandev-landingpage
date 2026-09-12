"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { homeContent } from "@/lib/home-content";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Captured before the first await: React clears currentTarget once the
    // handler returns, so reading it later throws and hides a real success.
    const formElement = event.currentTarget;
    setStatus("sending");
    setMessage("");
    setTimedOut(false);
    const form = new FormData(formElement);
    const controller = new AbortController();
    controllerRef.current = controller;
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
      formElement.reset();
      setStatus("success");
      setMessage("Mensagem enviada. Retorno em até 24 horas.");
    } catch (error) {
      if ("turnstile" in window)
        (
          window as Window & { turnstile?: { reset: () => void } }
        ).turnstile?.reset();
      setTimedOut(error instanceof DOMException && error.name === "AbortError");
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      controllerRef.current = null;
    }
  }

  return (
    <form className="contact-form" aria-label="Nova mensagem" onSubmit={submit}>
      <fieldset disabled={status === "sending"}>
        <legend>NOVA MENSAGEM</legend>
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
              <option value="site">Site / Landing</option>
              <option value="sistema-web">Sistema Web</option>
              <option value="api">API / Backend</option>
              <option value="mobile">Aplicativo Mobile</option>
              <option value="banco-de-dados">Banco de Dados</option>
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
        {status !== "success" && (
          <button className="button button-primary" type="submit">
            {status === "sending" ? "ENVIANDO..." : "ENVIAR MENSAGEM"}
          </button>
        )}
      </fieldset>

      {status === "success" && (
        <div className="form-message success" role="status" aria-live="polite">
          <p>
            <strong>MENSAGEM ENVIADA</strong>
          </p>
          <p>{message}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setStatus("idle")}
          >
            ENVIAR OUTRA MENSAGEM
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="form-message error" role="alert">
          <p>
            {timedOut
              ? "O envio passou de 10 segundos e foi interrompido."
              : "Não consegui enviar agora."}{" "}
            Seus dados continuam no formulário. Tente novamente ou escreva para{" "}
            <a href={`mailto:${homeContent.contato.email}`}>
              {homeContent.contato.email}
            </a>
            .
          </p>
        </div>
      )}
    </form>
  );
}
