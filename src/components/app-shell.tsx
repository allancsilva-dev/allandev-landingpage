"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const navItems = [
  { label: "Projetos", href: "/#projetos" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Processo", href: "/#processo" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Contato", href: "/#contato" },
] as const;

function getSoundOn() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("allandev-sound") === "on";
  } catch {
    return false;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency = 520, duration = 0.055) => {
    const context = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.022, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration,
    );
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, []);

  useEffect(() => {
    if (getSoundOn()) {
      const timer = window.setTimeout(() => setSoundOn(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!soundOn) return;
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest("a, button")) playTone();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [playTone, soundOn]);

  const toggleSound = useCallback(() => {
    setSoundOn((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("allandev-sound", next ? "on" : "off");
      } catch {
        // Preference remains active for this visit.
      }
      if (next) playTone(680, 0.08);
      return next;
    });
  }, [playTone]);

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setMenuOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    closeTimerRef.current = window.setTimeout(
      () => {
        dialogRef.current?.close();
        closeTimerRef.current = null;
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 130,
    );
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const syncClose = () => setMenuOpen(false);
    const animateCancel = (event: Event) => {
      event.preventDefault();
      closeMenu();
    };
    dialog.addEventListener("close", syncClose);
    dialog.addEventListener("cancel", animateCancel);
    return () => {
      dialog.removeEventListener("close", syncClose);
      dialog.removeEventListener("cancel", animateCancel);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header
        className={`site-header arcade-site-header ${scrolled ? "header-scrolled" : ""}`}
      >
        <span
          className="scroll-progress"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
        <Link
          className="wordmark arcade-wordmark"
          href="/"
          aria-label="Allan.Dev — início"
        >
          <span aria-hidden="true">A</span> Allan.Dev
        </Link>
        <div className="arcade-header-actions">
          <span className="arcade-player-mini">PLAYER 01</span>
          <button
            className="sound-toggle arcade-sound-toggle"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Desligar som" : "Ligar som"}
          >
            SOM {soundOn ? "ON" : "OFF"}
          </button>
          <button
            className="menu-button arcade-menu-button"
            onClick={openMenu}
            aria-expanded={menuOpen}
          >
            MENU <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="mobile-menu-dialog arcade-menu-dialog"
        aria-label="Menu principal"
        data-closing={!menuOpen ? "true" : undefined}
      >
        <div className="arcade-menu-head">
          <Link
            className="wordmark arcade-wordmark arcade-menu-wordmark"
            href="/"
            aria-label="Allan.Dev — início"
            onClick={closeMenu}
          >
            <span aria-hidden="true">A</span> Allan.Dev
          </Link>
          <button
            className="close-button"
            onClick={closeMenu}
            aria-label="Fechar menu"
            autoFocus
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <nav className="mobile-menu-content arcade-menu-content">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>
        <footer className="arcade-menu-footer">
          <a
            href="https://github.com/allancsilva-dev"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <p>
            <span>Disponível para projetos</span>
            <span>Next.js · TypeScript · Infra</span>
            <span>
              <i aria-hidden="true" /> Sistemas operacionais
            </span>
          </p>
        </footer>
      </dialog>

      <div id="main-content">{children}</div>
    </>
  );
}
