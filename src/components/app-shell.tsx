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
  { label: "SOBRE", href: "/#sobre" },
  { label: "PROCESSO", href: "/#processo" },
  { label: "PROJETOS", href: "/#projetos" },
  { label: "SERVIÇOS", href: "/#servicos" },
  { label: "CONTATO", href: "/#contato" },
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
  const [bootVisible, setBootVisible] = useState(true);
  const [bootFade, setBootFade] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency = 520, duration = 0.055) => {
    const AudioContextClass = window.AudioContext;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.025, context.currentTime);
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
      const soundTimer = window.setTimeout(() => setSoundOn(true), 0);
      return () => window.clearTimeout(soundTimer);
    }
  }, []);

  useEffect(() => {
    const skipBoot =
      pathname !== "/" ||
      getStored("allandev-boot", "1") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skipBoot) {
      const skipTimer = window.setTimeout(() => setBootVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }
    const fadeTimer = window.setTimeout(() => setBootFade(true), 780);
    const doneTimer = window.setTimeout(() => {
      setBootVisible(false);
      window.sessionStorage.setItem("allandev-boot", "1");
    }, 1100);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
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
        // Storage may be unavailable in private browsing; sound still works.
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

  const isHome = pathname === "/";

  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      {bootVisible && (
        <div
          className={`preloader ${bootFade ? "fade-out" : ""}`}
          aria-hidden="true"
        >
          <span className="preloader-kicker">ALLANDEV / BOOT SEQUENCE</span>
          <span className="preloader-logo">SYSTEM ONLINE</span>
          <span className="preloader-status">INFRA · SOFTWARE · OPERAÇÃO</span>
        </div>
      )}

      <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
        <span
          className="scroll-progress"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
        <Link className="wordmark" href="/" aria-label="AllanDev — início">
          ALLAN<span>DEV</span>
        </Link>
        <nav className="nav-desktop" aria-label="Principal">
          {(isHome
            ? navItems
            : navItems.filter(({ label }) => label !== "PROCESSO")
          ).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <button
            className="sound-toggle"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Desligar som" : "Ligar som"}
          >
            SOM {soundOn ? "ON" : "OFF"}
          </button>
          <Link className="button button-primary nav-cta" href="/#contato">
            FALAR COMIGO ↗
          </Link>
        </nav>
        <div className="nav-mobile">
          <button
            className="sound-toggle"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Desligar som" : "Ligar som"}
          >
            {soundOn ? "♫" : "♪"}
          </button>
          <button
            className="menu-button"
            onClick={openMenu}
            aria-expanded={menuOpen}
          >
            MENU
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="mobile-menu-dialog"
        aria-label="Menu principal"
      >
        <button className="close-button" onClick={closeMenu} autoFocus>
          ✕ FECHAR
        </button>
        <div className="mobile-menu-content">
          <Link href="/" onClick={closeMenu}>
            HOME
          </Link>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <Link
            className="button button-primary"
            href="/#contato"
            onClick={closeMenu}
          >
            FALAR COMIGO
          </Link>
        </div>
      </dialog>

      <div id="main-content">{children}</div>
    </>
  );
}
