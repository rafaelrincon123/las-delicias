"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  loginWithEmail,
  signupWithEmail,
  sendPasswordReset,
} from "@/lib/auth";
import {
  IconCow,
  IconPasture,
  IconHealth,
  IconRepro,
  IconScale,
  IconMoney,
  IconBox,
  IconTask,
  IconUser,
  IconCheck,
  IconArrowUp,
  IconLock,
  IconSparkles,
} from "./icons";

interface Props {
  onLogin: () => void;
}

// ---------------------------------------------------------------------------
//  Fotos (Unsplash, licencia libre)
// ---------------------------------------------------------------------------
const PHOTO_HERO =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=85";
const PHOTO_CAMPO_ATARDECER =
  "https://images.unsplash.com/photo-1471958680802-1345a694ba6d?auto=format&fit=crop&w=1800&q=85";

const PHOTO_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#22402A'/>
          <stop offset='100%' stop-color='#5F8248'/>
        </linearGradient>
      </defs>
      <rect width='800' height='1000' fill='url(#g)'/>
    </svg>`
  );

function handlePhotoError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = PHOTO_FALLBACK;
}

/** Reveal on scroll — sube y aparece. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------------------------------------------------------------------------
//  Root
// ---------------------------------------------------------------------------
export default function LandingPage({ onLogin }: Props) {
  return (
    <div className="min-h-screen relative overflow-x-hidden landing-root">
      <LandingStyles />

      <TopNav onLogin={onLogin} />
      <Hero onLogin={onLogin} />
      <ModulesOverview />
      <ThreePillars />
      <Pricing onLogin={onLogin} />
      <FAQ />
      <LoginEmbed />
      <FinalCTA onLogin={onLogin} />
      <Footer />
      <StickyValueBar />
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Global styles
// ---------------------------------------------------------------------------
function LandingStyles() {
  return (
    <style jsx global>{`
      .landing-root {
        --forest: #14261A;
        --forest-2: #22402A;
        --forest-3: #345A3E;
        --lime: #B8CE7A;
        --lime-bright: #C8DE86;
        --cream: #F8F5EE;
        --sand: #EFE8D8;
        --ink: #0E1B12;
        background: var(--cream);
        color: var(--ink);
      }

      /* Tipografía única: Space Grotesk */
      .landing-root,
      .landing-root button,
      .landing-root input,
      .landing-root select,
      .landing-root textarea {
        font-family: var(--font-space-grotesk), system-ui, sans-serif;
      }

      .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .reveal.in-view { opacity: 1; transform: none; }

      /* Display XXL */
      .display-xxl {
        font-weight: 700;
        letter-spacing: -0.045em;
        line-height: 0.92;
        text-transform: none;
      }
      .display-xxl em {
        font-style: normal;
        color: var(--lime-bright);
      }
      .display-lg {
        font-weight: 700;
        letter-spacing: -0.035em;
        line-height: 0.95;
      }
      .display-md {
        font-weight: 600;
        letter-spacing: -0.025em;
        line-height: 1.05;
      }

      /* Hero: foto grande con overlay verde */
      .hero-photo {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
      }
      .hero-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 60%;
        transform: scale(1.05);
        animation: kenburns 26s ease-in-out infinite alternate;
      }
      @keyframes kenburns {
        from { transform: scale(1.05); }
        to { transform: scale(1.14); }
      }
      .hero-photo::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(14, 27, 18, 0.65) 0%, rgba(14, 27, 18, 0.55) 55%, rgba(20, 38, 26, 0.98) 100%),
          linear-gradient(90deg, rgba(14, 27, 18, 0.65) 0%, rgba(14, 27, 18, 0.3) 60%);
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-photo img { animation: none; }
      }

      /* Badge circular flotante estilo axolotl */
      .badge-circle {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: linear-gradient(160deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 100%);
        border: 1px solid rgba(184, 206, 122, 0.5);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: white;
        text-align: center;
        padding: 8px;
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
      }
      .badge-circle .b-label {
        font-size: 0.58rem;
        letter-spacing: 0.10em;
        line-height: 1.1;
        text-transform: uppercase;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
      }
      .badge-circle .b-icon {
        color: var(--lime-bright);
      }

      /* Ring frame verde (marco estilo axolotl) */
      .ring-card {
        position: relative;
        border-radius: 28px;
        padding: 2px;
        background: linear-gradient(180deg, var(--forest-3) 0%, var(--forest-2) 50%, var(--forest) 100%);
        box-shadow:
          0 24px 60px -18px rgba(20, 38, 26, 0.55),
          0 8px 24px -8px rgba(20, 38, 26, 0.30);
      }
      .ring-card-inner {
        border-radius: 26px;
        background: linear-gradient(180deg, #1D3524 0%, #14261A 100%);
        padding: 1.75rem;
        color: white;
        overflow: hidden;
        position: relative;
      }
      .ring-card-inner::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(184, 206, 122, 0.4) 50%, transparent 100%);
      }

      /* Card feature con marco (versión sobre cream) */
      .feature-frame {
        position: relative;
        border-radius: 24px;
        padding: 2px;
        background: linear-gradient(180deg, rgba(34, 64, 42, 0.20) 0%, rgba(34, 64, 42, 0.08) 100%);
      }
      .feature-frame-inner {
        border-radius: 22px;
        background: white;
        padding: 1.75rem;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Botones */
      .btn-lime {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.95rem 1.75rem;
        border-radius: 999px;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        background: var(--lime);
        color: var(--forest);
        border: 1px solid var(--lime);
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        cursor: pointer;
      }
      .btn-lime:hover {
        background: var(--lime-bright);
        transform: translateY(-2px);
        box-shadow: 0 12px 32px -8px rgba(184, 206, 122, 0.55);
      }
      .btn-ghost-w {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.95rem 1.75rem;
        border-radius: 999px;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(10px);
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        cursor: pointer;
      }
      .btn-ghost-w:hover {
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-2px);
      }
      .btn-forest {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.85rem 1.6rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        background: var(--forest-2);
        color: white;
        border: 1px solid var(--forest-2);
        transition: all 200ms cubic-bezier(0.16,1,0.3,1);
        cursor: pointer;
      }
      .btn-forest:hover {
        background: var(--forest);
        transform: translateY(-2px);
        box-shadow: 0 12px 32px -8px rgba(20, 38, 26, 0.35);
      }

      /* Módulo chip (grid de 10) */
      .mod-chip {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        padding: 1.15rem 0.5rem;
        border-radius: 16px;
        background: rgba(184, 206, 122, 0.05);
        border: 1px solid rgba(184, 206, 122, 0.25);
        transition: all 220ms cubic-bezier(0.16,1,0.3,1);
      }
      .mod-chip:hover {
        background: rgba(184, 206, 122, 0.12);
        border-color: rgba(184, 206, 122, 0.55);
        transform: translateY(-3px);
      }
      .mod-chip-ico {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(184, 206, 122, 0.18);
        color: var(--lime-bright);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mod-chip-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: white;
        letter-spacing: -0.005em;
      }

      /* Sticky bottom bar */
      .sticky-bar {
        position: fixed;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 40;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 999px;
        background: rgba(14, 27, 18, 0.88);
        border: 1px solid rgba(184, 206, 122, 0.3);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: white;
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.35);
        max-width: calc(100% - 32px);
      }
      .sticky-bar .item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.9);
        white-space: nowrap;
      }
      .sticky-bar .dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: var(--lime-bright);
        box-shadow: 0 0 10px var(--lime-bright);
      }
      @media (max-width: 640px) {
        .sticky-bar {
          bottom: 12px;
          padding: 0.6rem 1rem;
          gap: 0.9rem;
        }
        .sticky-bar .item {
          font-size: 0.6rem;
        }
      }

      /* Inputs redondeados */
      .landing-input {
        width: 100%;
        padding: 0.85rem 1.1rem;
        border-radius: 14px;
        border: 1px solid rgba(20, 38, 26, 0.15);
        background: white;
        font-size: 0.95rem;
        font-family: inherit;
        color: var(--ink);
        transition: all 180ms;
      }
      .landing-input:focus {
        outline: none;
        border-color: var(--forest-2);
        box-shadow: 0 0 0 4px rgba(34, 64, 42, 0.10);
      }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
//  Nav
// ---------------------------------------------------------------------------
function TopNav({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "modulos", label: "Módulos" },
    { id: "pilares", label: "Pilares" },
    { id: "precios", label: "Precios" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        background: scrolled ? "rgba(248, 245, 238, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(20, 38, 26, 0.10)" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0"
            style={{
              background: scrolled ? "white" : "rgba(255,255,255,0.95)",
              border: `1px solid ${scrolled ? "rgba(20,38,26,0.10)" : "rgba(255,255,255,0.4)"}`,
              boxShadow: "0 4px 12px -4px rgba(0,0,0,0.15)",
            }}
          >
            <Image
              src="/logo.png"
              alt="MiFinca"
              width={40}
              height={40}
              sizes="40px"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div
            className="text-base md:text-lg font-bold tracking-tight"
            style={{
              color: scrolled ? "var(--forest)" : "white",
              textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            MiFinca
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              className="text-[0.8rem] px-3.5 py-1.5 rounded-full transition font-medium uppercase tracking-wider"
              style={{
                color: scrolled ? "rgba(20, 38, 26, 0.7)" : "rgba(255,255,255,0.90)",
                textShadow: scrolled ? "none" : "0 1px 3px rgba(0,0,0,0.35)",
                letterSpacing: "0.06em",
              }}
              onClick={() => scrollToId(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-[0.75rem] font-semibold uppercase tracking-wider transition"
            style={{
              color: scrolled ? "var(--forest)" : "white",
              background: scrolled ? "transparent" : "rgba(255,255,255,0.15)",
              border: `1px solid ${scrolled ? "rgba(20,38,26,0.15)" : "rgba(255,255,255,0.25)"}`,
              backdropFilter: "blur(8px)",
              letterSpacing: "0.08em",
            }}
            onClick={() => scrollToId("ingreso")}
          >
            Ingresar
          </button>
          <button className="btn-lime" style={{ padding: "0.55rem 1.15rem", fontSize: "0.72rem" }} onClick={onLogin}>
            Empieza gratis
          </button>
          <button
            className="lg:hidden ml-1 p-2 rounded-full"
            style={{
              background: scrolled ? "rgba(20,38,26,0.06)" : "rgba(255,255,255,0.15)",
              color: scrolled ? "var(--forest)" : "white",
              border: `1px solid ${scrolled ? "rgba(20,38,26,0.10)" : "rgba(255,255,255,0.25)"}`,
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="lg:hidden"
          style={{
            background: "rgba(248, 245, 238, 0.98)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(20,38,26,0.10)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                className="text-left text-sm font-medium px-3 py-2.5 rounded-lg"
                style={{ color: "var(--forest)" }}
                onClick={() => {
                  scrollToId(l.id);
                  setMenuOpen(false);
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
//  Hero
// ---------------------------------------------------------------------------
function Hero({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative min-h-[96vh] flex items-center overflow-hidden">
      <div className="hero-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_HERO} alt="" onError={handlePhotoError} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pt-32 md:pt-36 pb-24">
        <div ref={ref} className="reveal grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div className="text-white">
            <h1
              className="display-xxl uppercase text-white"
              style={{
                fontSize: "clamp(2.8rem, 7.5vw, 5.75rem)",
                textShadow: "0 2px 20px rgba(0,0,0,0.35)",
              }}
            >
              Ganadería<br />
              directa <em>desde</em><br />
              el potrero.
            </h1>

            <p
              className="mt-8 text-base md:text-lg max-w-xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.90)", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
            >
              Registre animales, sanidad, reproducción y gastos con reparto real
              entre socios. Todo desde el celular, con o sin señal.
            </p>

            <div className="mt-10 flex gap-3 flex-wrap items-center">
              <button className="btn-lime" onClick={onLogin}>
                Empieza gratis <IconArrowUp size={13} />
              </button>
              <button className="btn-ghost-w" onClick={() => scrollToId("modulos")}>
                Ver módulos
              </button>
            </div>
          </div>

          {/* Badges flotantes columna derecha */}
          <div className="hidden lg:flex flex-col items-end gap-4 justify-center">
            <FloatingBadge label="Sin instalación" icon={<IconCheck size={18} />} />
            <FloatingBadge label="Sin tarjeta" icon={<IconLock size={16} />} />
            <FloatingBadge label="Multi-finca" icon={<IconPasture size={18} />} />
            <FloatingBadge label="Realtime" icon={<IconSparkles size={16} />} />
          </div>
        </div>

        {/* Móvil: badges en fila */}
        <div className="lg:hidden mt-10 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          <FloatingBadge label="Sin instalación" icon={<IconCheck size={16} />} />
          <FloatingBadge label="Sin tarjeta" icon={<IconLock size={14} />} />
          <FloatingBadge label="Multi-finca" icon={<IconPasture size={16} />} />
          <FloatingBadge label="Realtime" icon={<IconSparkles size={14} />} />
        </div>
      </div>
    </section>
  );
}

function FloatingBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="badge-circle shrink-0">
      <span className="b-icon">{icon}</span>
      <span className="b-label">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  [02] MÓDULOS — grid 10 módulos sobre fondo forest oscuro
// ---------------------------------------------------------------------------
function ModulesOverview() {
  const ref = useReveal<HTMLDivElement>();
  const mods = [
    { icon: <IconCow size={20} />, name: "Hato" },
    { icon: <IconPasture size={20} />, name: "Potreros" },
    { icon: <IconHealth size={20} />, name: "Sanidad" },
    { icon: <IconRepro size={20} />, name: "Reproducción" },
    { icon: <IconScale size={20} />, name: "Peso" },
    { icon: <IconMoney size={20} />, name: "Gastos" },
    { icon: <IconTask size={20} />, name: "Tareas" },
    { icon: <IconBox size={20} />, name: "Inventario" },
    { icon: <IconUser size={20} />, name: "Socios" },
    { icon: <IconSparkles size={20} />, name: "Realtime" },
  ];
  return (
    <section
      id="modulos"
      className="relative"
      style={{ background: "var(--forest)", color: "white" }}
    >
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">
          <div>
            <h2
              className="display-lg uppercase text-white"
              style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.75rem)" }}
            >
              Todo lo de<br />
              su finca, en<br />
              <em style={{ color: "var(--lime-bright)", fontStyle: "normal" }}>un solo lugar.</em>
            </h2>
            <p className="mt-6 max-w-md" style={{ color: "rgba(255,255,255,0.75)" }}>
              Diez módulos conectados. Reemplaza el Excel, el cuaderno y el chat
              de WhatsApp con una sola plataforma.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {mods.map((m) => (
              <div key={m.name} className="mod-chip">
                <div className="mod-chip-ico">{m.icon}</div>
                <div className="mod-chip-label">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave inferior hacia cream */}
      <svg
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{ height: "50px" }}
      >
        <path d="M0,20 C360,60 720,0 1080,30 C1260,45 1350,20 1440,35 L1440,60 L0,60 Z" fill="var(--cream)" />
      </svg>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  [03] 3 PILARES
// ---------------------------------------------------------------------------
function ThreePillars() {
  const ref = useReveal<HTMLDivElement>();
  const pillars = [
    {
      eyebrow: "Tiempo real",
      title: "Datos en vivo, sin refresh",
      desc: "Cuando un socio o trabajador registra algo desde el potrero, todos lo ven al instante. Con autor y fecha.",
      icon: <IconSparkles size={22} />,
      badge: "REALTIME",
    },
    {
      eyebrow: "Solo aquí",
      title: "Reparto real entre socios",
      desc: "Por %, por cabezas o partes iguales. La app le muestra quién debe qué a quién — sin calculadora, sin discusiones.",
      icon: <IconMoney size={22} />,
      badge: "ÚNICO",
      featured: true,
    },
    {
      eyebrow: "Próximamente",
      title: "Cédula digital por animal",
      desc: "Cada cabeza con su propio QR. Muéstrelo al veterinario o al comprador — historial completo, imposible falsificar.",
      icon: <IconCow size={22} />,
      badge: "PRÓX.",
    },
  ];
  return (
    <section id="pilares" className="relative max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-32">
      <div ref={ref} className="reveal">
        <div className="text-center mb-14 md:mb-20">
          <h2
            className="display-lg uppercase"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}
          >
            Tres razones que<br />
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>nadie más ofrece.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="feature-frame"
              style={
                p.featured
                  ? {
                      background:
                        "linear-gradient(180deg, var(--forest-2) 0%, var(--forest) 100%)",
                    }
                  : {}
              }
            >
              <div className="feature-frame-inner">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: p.featured ? "var(--forest-2)" : "rgba(184, 206, 122, 0.18)",
                      color: p.featured ? "var(--lime-bright)" : "var(--forest-2)",
                    }}
                  >
                    {p.icon}
                  </div>
                  <span
                    className="text-[0.6rem] font-mono uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                    style={{
                      background: p.featured ? "var(--lime)" : "rgba(20, 38, 26, 0.06)",
                      color: p.featured ? "var(--forest)" : "var(--forest-2)",
                    }}
                  >
                    {p.badge}
                  </span>
                </div>
                <div className="text-[0.65rem] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--forest-3)", opacity: 0.7 }}>
                  {p.eyebrow}
                </div>
                <h3
                  className="mt-2 uppercase font-bold"
                  style={{
                    fontSize: "1.35rem",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                    color: "var(--forest)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="mt-4 text-[0.95rem] leading-relaxed flex-1"
                  style={{ color: "rgba(20, 38, 26, 0.68)" }}
                >
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  [04] PRECIOS
// ---------------------------------------------------------------------------
function Pricing({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  const tiers = [
    {
      name: "Ranchero",
      price: "0",
      unit: "COP · siempre",
      desc: "Para probar con una finca pequeña.",
      features: [
        "Hasta 15 animales",
        "1 usuario",
        "Sanidad, gastos y tareas",
        "1 finca",
      ],
      cta: "Empezar gratis",
    },
    {
      name: "Ganadero",
      price: "59.000",
      unit: "COP / mes",
      desc: "Para fincas familiares con socios.",
      features: [
        "Hasta 200 animales",
        "5 usuarios",
        "Reparto entre socios",
        "Alertas y reportes",
      ],
      cta: "Empezar prueba",
      featured: true,
    },
    {
      name: "Hacienda",
      price: "149.000",
      unit: "COP / mes",
      desc: "Sin límites, para grupos de fincas.",
      features: [
        "Animales ilimitados",
        "Usuarios ilimitados",
        "Múltiples fincas",
        "Soporte prioritario",
      ],
      cta: "Hablar con ventas",
    },
  ];
  return (
    <section id="precios" className="relative py-24 md:py-32" style={{ background: "var(--sand)" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14 md:mb-20">
          <h2
            className="display-lg uppercase"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}
          >
            Simple.<br />
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>Crece con usted.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl p-8 flex flex-col relative"
              style={{
                background: t.featured ? "var(--forest)" : "white",
                color: t.featured ? "white" : "var(--forest)",
                border: t.featured ? "2px solid var(--lime)" : "2px solid rgba(20,38,26,0.08)",
                boxShadow: t.featured
                  ? "0 30px 60px -20px rgba(20, 38, 26, 0.35)"
                  : "0 10px 30px -12px rgba(20, 38, 26, 0.10)",
              }}
            >
              {t.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.62rem] font-mono uppercase tracking-[0.14em] font-semibold"
                  style={{ background: "var(--lime)", color: "var(--forest)" }}
                >
                  Más popular
                </div>
              )}
              <div className="text-[0.62rem] font-mono uppercase tracking-[0.14em] mb-3" style={{ opacity: 0.7 }}>
                Plan
              </div>
              <h3 className="uppercase font-bold text-2xl tracking-tight">{t.name}</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight">${t.price}</span>
              </div>
              <div className="text-[0.75rem] font-mono uppercase tracking-widest mt-2" style={{ opacity: 0.6 }}>
                {t.unit}
              </div>
              <p className="text-sm mt-4" style={{ opacity: 0.75 }}>{t.desc}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: t.featured ? "var(--lime)" : "var(--forest-2)",
                        color: t.featured ? "var(--forest)" : "white",
                      }}
                    >
                      <IconCheck size={10} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={t.featured ? "btn-lime mt-8 justify-center w-full" : "btn-forest mt-8 justify-center w-full"}
                onClick={onLogin}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[0.7rem] font-mono uppercase tracking-widest mt-8" style={{ color: "var(--forest-3)", opacity: 0.65 }}>
          Los planes pagos entran en producción pronto. Por ahora todo es gratuito.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  [05] FAQ
// ---------------------------------------------------------------------------
function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  const qs = [
    {
      q: "¿Cuánto cuesta usar MiFinca?",
      a: "Nada para arrancar. El plan Ranchero es gratis para siempre (hasta 15 animales). Los planes pagos son para operaciones más grandes.",
    },
    {
      q: "¿Necesito instalar la app?",
      a: "No. Se abre en cualquier navegador del celular o computador. Funciona como app nativa — puede guardarla en la pantalla de inicio.",
    },
    {
      q: "¿Sirve sin señal en el potrero?",
      a: "Sí. Consulta datos offline. Los registros se sincronizan cuando vuelve la conexión.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Cada finca tiene aislamiento estricto por RLS en Supabase (Postgres). Solo los usuarios miembros ven los datos. Backups diarios automáticos.",
    },
    {
      q: "¿Puedo invitar a mis socios y trabajadores?",
      a: "Sí. Cada socio con su email y su porcentaje. Los trabajadores entran como operarios y registran desde el potrero.",
    },
    {
      q: "¿Puedo migrar mis datos de Excel?",
      a: "Sí. Escríbanos con su Excel y le ayudamos con la importación inicial sin costo.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative max-w-3xl mx-auto px-4 md:px-6 py-24 md:py-32">
      <div ref={ref} className="reveal">
        <div className="text-center mb-14">
          <h2
            className="display-lg uppercase"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}
          >
            ¿Alguna<br />
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>duda?</em>
          </h2>
        </div>
        <div className="space-y-3">
          {qs.map((item, i) => (
            <div
              key={item.q}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "white",
                border: "1px solid rgba(20, 38, 26, 0.08)",
                boxShadow: "0 4px 16px -8px rgba(20, 38, 26, 0.08)",
              }}
            >
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm md:text-base font-semibold uppercase tracking-tight" style={{ color: "var(--forest)" }}>
                  {item.q}
                </span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-mono transition-transform shrink-0"
                  style={{
                    background: "var(--forest-2)",
                    color: "white",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "rgba(20, 38, 26, 0.72)" }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  [06] Login embed
// ---------------------------------------------------------------------------
type EmbedMode = "login" | "signup" | "reset";
function LoginEmbed() {
  const ref = useReveal<HTMLDivElement>();
  const [mode, setMode] = useState<EmbedMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email) return setError("Escribe tu email.");
    if (mode !== "reset" && !password) return setError("Escribe tu contraseña.");
    if (mode === "signup" && password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await loginWithEmail(email.trim(), password);
        if (!res.ok) setError(traducirError(res.error));
      } else if (mode === "signup") {
        const res = await signupWithEmail(email.trim(), password);
        if (!res.ok) setError(traducirError(res.error));
        else if (res.needsConfirmation) {
          setInfo("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
          setMode("login");
        }
      } else {
        const res = await sendPasswordReset(email.trim());
        if (!res.ok) setError(traducirError(res.error));
        else setInfo("Si el email existe, te llegará un enlace para nueva contraseña.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="ingreso" className="relative max-w-4xl mx-auto px-4 md:px-6 py-24 md:py-32">
      <div ref={ref} className="reveal grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="display-lg uppercase" style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)", color: "var(--forest)" }}>
            {mode === "login" ? <>Entre a<br /><em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>su finca.</em></>
              : mode === "signup" ? <>Cree<br /><em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>su cuenta.</em></>
              : <>Recupere<br /><em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>el acceso.</em></>}
          </h2>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(20, 38, 26, 0.68)" }}>
            {mode === "login" ? "Acceda a su operación desde cualquier dispositivo."
              : mode === "signup" ? "En 2 minutos tiene su finca creada y lista para usar."
              : "Le enviamos un enlace al correo para elegir una nueva."}
          </p>
        </div>

        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "white",
            border: "2px solid rgba(20, 38, 26, 0.08)",
            boxShadow: "0 30px 60px -20px rgba(20, 38, 26, 0.15)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-mono uppercase tracking-widest" style={{ color: "var(--forest-2)" }}>
                Email
              </label>
              <input
                className="landing-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
            {mode !== "reset" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-mono uppercase tracking-widest" style={{ color: "var(--forest-2)" }}>
                  Contraseña
                </label>
                <input
                  className="landing-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Al menos 8 caracteres" : "Tu contraseña"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}
            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(217, 83, 79, 0.10)", color: "#B54B2A" }}>
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(184, 206, 122, 0.20)", color: "var(--forest)" }}>
                {info}
              </div>
            )}
            <button type="submit" className="btn-forest justify-center w-full" disabled={loading} style={{ padding: "0.95rem 1.6rem" }}>
              {loading ? "…" : mode === "login" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Enviar enlace"}
            </button>
            {mode === "login" && (
              <button
                type="button"
                className="text-[0.72rem] uppercase tracking-widest self-center hover:underline"
                style={{ color: "var(--forest-3)" }}
                onClick={() => { setError(null); setInfo(null); setMode("reset"); }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <button
              type="button"
              className="text-[0.75rem] uppercase tracking-widest font-semibold py-3 rounded-full"
              style={{ color: "var(--forest-2)", border: "1px solid rgba(20,38,26,0.15)" }}
              onClick={() => { setError(null); setInfo(null); setMode(mode === "login" ? "signup" : "login"); }}
            >
              {mode === "login" ? "¿No tienes cuenta? Regístrate" : mode === "signup" ? "Ya tengo cuenta" : "Volver a iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "El email todavía no está confirmado.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ese email ya está registrado. Inicia sesión.";
  return msg;
}

// ---------------------------------------------------------------------------
//  Final CTA con foto
// ---------------------------------------------------------------------------
function FinalCTA({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative max-w-6xl mx-auto px-4 md:px-6 pb-24 md:pb-32">
      <div
        ref={ref}
        className="reveal relative overflow-hidden rounded-[36px]"
        style={{ boxShadow: "0 50px 100px -20px rgba(20, 38, 26, 0.45)" }}
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_CAMPO_ATARDECER}
            alt=""
            loading="lazy"
            onError={handlePhotoError}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 55%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(14, 27, 18, 0.85) 0%, rgba(34, 64, 42, 0.75) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 text-center px-6 py-20 md:py-28 text-white">
          <h3
            className="display-xxl uppercase"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Su finca<br />
            <em style={{ color: "var(--lime-bright)", fontStyle: "normal" }}>merece control.</em>
          </h3>
          <p
            className="mt-6 max-w-xl mx-auto text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.90)", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Sin instalación, sin tarjeta de crédito. En 2 minutos ya está
            registrando animales.
          </p>
          <button className="btn-lime mt-10" onClick={onLogin} style={{ padding: "1.1rem 2.4rem" }}>
            Crear mi cuenta gratis <IconArrowUp size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="relative" style={{ background: "var(--forest)", color: "white" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="MiFinca" width={44} height={44} sizes="44px" className="w-full h-full object-contain" />
              </div>
              <div className="text-xl font-bold uppercase tracking-tight">MiFinca</div>
            </div>
            <p className="mt-5 text-sm max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              La plataforma de gestión ganadera para fincas de Colombia y
              Latinoamérica. Hato, sanidad, gastos entre socios &mdash; todo en
              un solo lugar.
            </p>
          </div>
          <div>
            <div className="text-[0.65rem] font-mono uppercase tracking-widest mb-4" style={{ color: "var(--lime)" }}>
              Producto
            </div>
            <ul className="space-y-2.5 text-sm">
              <li><FooterLink onClick={() => scrollToId("modulos")}>Módulos</FooterLink></li>
              <li><FooterLink onClick={() => scrollToId("pilares")}>Pilares</FooterLink></li>
              <li><FooterLink onClick={() => scrollToId("precios")}>Precios</FooterLink></li>
              <li><FooterLink onClick={() => scrollToId("faq")}>FAQ</FooterLink></li>
            </ul>
          </div>
          <div>
            <div className="text-[0.65rem] font-mono uppercase tracking-widest mb-4" style={{ color: "var(--lime)" }}>
              Cuenta
            </div>
            <ul className="space-y-2.5 text-sm">
              <li><FooterLink onClick={() => scrollToId("ingreso")}>Iniciar sesión</FooterLink></li>
              <li><FooterLink onClick={() => scrollToId("ingreso")}>Crear cuenta</FooterLink></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t flex items-center justify-between flex-wrap gap-3 text-[0.72rem] font-mono uppercase tracking-widest"
          style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}
        >
          <div>MiFinca &middot; {new Date().getFullYear()}</div>
          <div>Hecho en Colombia</div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="text-left transition"
      style={{ color: "rgba(255,255,255,0.75)" }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
//  Sticky bottom bar — 3 valores clave (siempre visible)
// ---------------------------------------------------------------------------
function StickyValueBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <div className="sticky-bar">
      <span className="item">
        <span className="dot" /> Offline &middot; Funciona sin señal
      </span>
      <span className="item hidden sm:inline-flex">
        <span className="dot" /> Cifrado &middot; RLS por finca
      </span>
      <span className="item hidden md:inline-flex">
        <span className="dot" /> Colombia &middot; Realtime
      </span>
    </div>
  );
}
