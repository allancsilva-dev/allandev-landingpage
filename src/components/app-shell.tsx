"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const navItems = [
  { label: "SOBRE", href: "/#sobre" },
  { label: "PROCESSO", href: "/#processo" },
  { label: "PROJETOS", href: "/#projetos" },
  { label: "SERVIÇOS", href: "/#servicos" },
  { label: "CONTATO", href: "/#contato" },
] as const;

function getBootSeen() {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem("allandev-boot") === "1";
}

function getSoundOn() {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem("allandev-sound") === "on";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(getSoundOn);
  const [bootDone, setBootDone] = useState(getBootSeen);
  const [bootVisible, setBootVisible] = useState(!getBootSeen());
  const [bootFade, setBootFade] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (bootDone) return;
    const max = 1200;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= max) {
        finishBoot();
      } else {
        requestAnimationFrame(tick);
      }
    };
    const finishBoot = () => {
      setBootFade(true);
      setTimeout(() => {
        setBootVisible(false);
        setBootDone(true);
        if (typeof sessionStorage !== "undefined")
          sessionStorage.setItem("allandev-boot", "1");
      }, 400);
      const pre = document.getElementById("preloader-progress");
      if (pre) pre.style.width = "100%";
    };
    requestAnimationFrame(tick);
  }, [bootDone]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      if (typeof localStorage !== "undefined")
        localStorage.setItem("allandev-sound", next ? "on" : "off");
      return next;
    });
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => closeMenu();
    dialog.addEventListener("close", handler);
    return () => dialog.removeEventListener("close", handler);
  }, [menuOpen, closeMenu]);

  const isHome = pathname === "/";

  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>

      {bootVisible && (
        <div
          className={`preloader ${bootFade ? "fade-out" : ""}`}
          role="status"
          aria-live="polite"
          aria-busy={!bootDone}
        >
          <span className="preloader-logo">ALLANDEV</span>
          <span className="preloader-status">CARREGANDO ASSETS...</span>
          <div className="preloader-bar">
            <div
              id="preloader-progress"
              className="preloader-fill"
              style={{ width: "0%" }}
            />
          </div>
          <span className="preloader-counter">INICIALIZANDO</span>
        </div>
      )}

      {(bootDone || !isHome) && (
        <>
          <header
            className={`site-header ${scrolled ? "header-scrolled" : ""}`}
          >
            <Link className="wordmark" href="/" aria-label="AllanDev — início">
              ALLAN<span>DEV</span>
            </Link>
            <nav className="nav-desktop" aria-label="Principal">
              {isHome ? (
                <>
                  <Link href="/#sobre">SOBRE</Link>
                  <Link href="/#processo">PROCESSO</Link>
                  <Link href="/#projetos">PROJETOS</Link>
                  <Link href="/#servicos">SERVIÇOS</Link>
                  <Link href="/#contato">CONTATO</Link>
                </>
              ) : (
                <>
                  <Link href="/">HOME</Link>
                  <Link href="/projetos">PROJETOS</Link>
                  <Link href="/#contato">CONTATO</Link>
                </>
              )}
              <button
                className="sound-toggle"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Desligar som" : "Ligar som"}
              >
                {soundOn ? "♫" : "♪"}
              </button>
              <Link className="button button-primary nav-cta" href="/#contato">
                FALAR COMIGO
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
                className="button button-secondary"
                onClick={openMenu}
                aria-expanded={menuOpen}
                style={{ minHeight: "2.5rem", fontSize: "0.72rem" }}
              >
                ≡ MENU
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
              {isHome &&
                navItems.map((item) => (
                  <a key={item.href} href={item.href} onClick={closeMenu}>
                    {item.label}
                  </a>
                ))}
              {!isHome && (
                <>
                  <Link href="/projetos" onClick={closeMenu}>
                    PROJETOS
                  </Link>
                  <Link href="/#contato" onClick={closeMenu}>
                    CONTATO
                  </Link>
                </>
              )}
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
      )}
    </>
  );
}
