"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const navItems = [
  { label: "PROJETOS", href: "/#projetos", code: "02" },
  { label: "SOBRE", href: "/#sobre", code: "03" },
  { label: "PROCESSO", href: "/#processo", code: "04" },
  { label: "SERVIÇOS", href: "/#servicos", code: "05" },
  { label: "CONTATO", href: "/#contato", code: "06" },
] as const;

function getStored(key: string, expected: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(key) === expected;
  } catch {
    return false;
  }
}

function getSoundOn() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("allandev-sound") === "on";
  } catch {
    return false;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [gateVisible, setGateVisible] = useState(pathname === "/");
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    const timer = window.setTimeout(
      () =>
        setGateVisible(pathname === "/" && !getStored("allandev-started", "1")),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [pathname]);

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

  const start = useCallback(() => {
    try {
      window.sessionStorage.setItem("allandev-started", "1");
    } catch {
      // Session storage can be blocked; the current visit still starts.
    }
    setGateVisible(false);
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(".arcade-button-primary")?.focus();
    }, 0);
  }, []);

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
    setMenuOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const syncClose = () => setMenuOpen(false);
    dialog.addEventListener("close", syncClose);
    return () => dialog.removeEventListener("close", syncClose);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <noscript>
        <style>{`.arcade-start-gate{display:none!important}`}</style>
      </noscript>

      {gateVisible && (
        <div
          className="arcade-start-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-title"
        >
          <span className="start-gate-grid" aria-hidden="true" />
          <p>ALLAN CARVALHO / PLAYER 01</p>
          <h2 id="start-title">ALLANDEV</h2>
          <span>SISTEMAS · INFRA · OPERAÇÃO</span>
          <button type="button" onClick={start} autoFocus>
            PRESS START
          </button>
          <small>ENTER OU CLIQUE PARA INICIAR</small>
        </div>
      )}

      <header
        className={`site-header arcade-site-header ${scrolled ? "header-scrolled" : ""}`}
        inert={gateVisible}
      >
        <span
          className="scroll-progress"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
        <Link
          className="wordmark arcade-wordmark"
          href="/"
          aria-label="AllanDev — início"
        >
          <span aria-hidden="true">A</span> ALLANDEV
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
      >
        <div className="arcade-menu-head">
          <span>PAUSE / MAPA</span>
          <button className="close-button" onClick={closeMenu} autoFocus>
            ✕ FECHAR
          </button>
        </div>
        <nav className="mobile-menu-content arcade-menu-content">
          <Link href="/" onClick={closeMenu}>
            <span>01</span> HOME
          </Link>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              <span>{item.code}</span> {item.label}
            </a>
          ))}
        </nav>
      </dialog>

      <div id="main-content" inert={gateVisible}>
        {children}
      </div>
    </>
  );
}
