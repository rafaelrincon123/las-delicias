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
      <AppSummary />
      <ModulesOverview />
      <SociosSection />
      <ThreePillars />
      <PhonesShowcase />
      <AIAssistantSection />
      <AnimalCedulaSection />
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

      /* Badge circular flotante estilo axolotl — grande y protagónico */
      .badge-circle {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 148px;
        height: 148px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 30% 20%, rgba(184, 206, 122, 0.28) 0%, transparent 55%),
          linear-gradient(160deg, rgba(255, 255, 255, 0.22) 0%, rgba(20, 38, 26, 0.20) 100%);
        border: 2px solid rgba(184, 206, 122, 0.55);
        backdrop-filter: blur(18px) saturate(1.2);
        -webkit-backdrop-filter: blur(18px) saturate(1.2);
        color: white;
        text-align: center;
        padding: 10px;
        box-shadow:
          0 24px 48px -14px rgba(0, 0, 0, 0.5),
          0 8px 20px -8px rgba(20, 38, 26, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
        transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
      }
      .badge-circle:hover {
        transform: translateY(-4px) scale(1.03);
        box-shadow:
          0 32px 64px -14px rgba(0, 0, 0, 0.55),
          0 12px 24px -8px rgba(184, 206, 122, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.30);
      }
      .badge-circle .b-icon {
        color: var(--lime-bright);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(184, 206, 122, 0.15);
        border: 1px solid rgba(184, 206, 122, 0.35);
      }
      .badge-circle .b-label {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        line-height: 1.15;
        text-transform: uppercase;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }
      @media (max-width: 767px) {
        .badge-circle {
          width: 118px;
          height: 118px;
          gap: 6px;
          padding: 8px;
        }
        .badge-circle .b-icon {
          width: 28px;
          height: 28px;
        }
        .badge-circle .b-label {
          font-size: 0.6rem;
        }
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

      /* Phone frames */
      .phone-frame {
        position: relative;
        border-radius: 42px;
        padding: 10px;
        background: linear-gradient(135deg, #1a1a1a 0%, #2b2b2b 100%);
        box-shadow:
          0 40px 80px -20px rgba(0,0,0,0.45),
          0 12px 24px -8px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .phone-screen {
        border-radius: 32px;
        background: var(--cream);
        overflow: hidden;
        position: relative;
        aspect-ratio: 9/19.5;
      }
      .phone-frame::before {
        content: "";
        position: absolute;
        top: 14px; left: 50%;
        transform: translateX(-50%);
        width: 90px; height: 22px;
        background: #0a0a0a;
        border-radius: 12px;
        z-index: 10;
      }
      .phone-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 22px 8px;
        font-family: var(--font-geist-mono), monospace;
        font-size: 0.68rem;
        font-weight: 600;
      }
      .phone-content {
        padding: 12px 16px 20px;
      }

      /* Chat bubbles */
      .chat-bubble-user, .chat-bubble-ai {
        max-width: 85%;
        padding: 0.75rem 1rem;
        border-radius: 18px;
        font-size: 0.85rem;
        line-height: 1.45;
        word-wrap: break-word;
      }
      .chat-bubble-user {
        background: var(--forest);
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }
      .chat-bubble-ai {
        background: rgba(20, 38, 26, 0.06);
        color: var(--ink);
        border-bottom-left-radius: 4px;
        border: 1px solid rgba(20, 38, 26, 0.08);
      }
      .typing-dot {
        display: inline-block;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: var(--forest-3);
        margin: 0 1px;
        animation: bounce 1.2s infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.15s; }
      .typing-dot:nth-child(3) { animation-delay: 0.30s; }
      @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }

      /* QR code fake */
      .qr {
        display: grid;
        grid-template-columns: repeat(21, 1fr);
        gap: 2px;
        aspect-ratio: 1/1;
        padding: 8px;
        background: white;
        border-radius: 12px;
        border: 1px solid rgba(20, 38, 26, 0.08);
      }
      .qr div { background: transparent; }
      .qr div.on { background: var(--forest); }
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

          {/* Badges: grid 2x2 con separación */}
          <div className="hidden lg:grid grid-cols-2 gap-5 justify-items-center content-center">
            <FloatingBadge label="Sin instalación" icon={<IconCheck size={20} />} />
            <FloatingBadge label="Sin tarjeta" icon={<IconLock size={18} />} />
            <FloatingBadge label="Multi-finca" icon={<IconPasture size={20} />} />
            <FloatingBadge label="En vivo" icon={<IconSparkles size={18} />} />
          </div>
        </div>

        {/* Móvil / tablet: grid 2x2 centrado */}
        <div className="lg:hidden mt-12 grid grid-cols-2 gap-4 justify-items-center max-w-sm mx-auto">
          <FloatingBadge label="Sin instalación" icon={<IconCheck size={18} />} />
          <FloatingBadge label="Sin tarjeta" icon={<IconLock size={16} />} />
          <FloatingBadge label="Multi-finca" icon={<IconPasture size={18} />} />
          <FloatingBadge label="En vivo" icon={<IconSparkles size={16} />} />
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
//  Resumen — qué puede hacer la app
// ---------------------------------------------------------------------------
function AppSummary() {
  const ref = useReveal<HTMLDivElement>();
  const items = [
    {
      Icon: IconCow,
      verb: "Lleve la hoja de vida",
      desc: "de cada animal: raza, categoría, peso, padres, potrero, fotos y estado (activo, vendido, muerto).",
    },
    {
      Icon: IconHealth,
      verb: "No se le pase una vacuna",
      desc: "programe vacunas, tratamientos y desparasitaciones. La app le avisa qué toca la próxima semana.",
    },
    {
      Icon: IconRepro,
      verb: "Controle preñeces y partos",
      desc: "servicios (monta o inseminación), diagnóstico, fecha probable de parto y registro de crías nuevas.",
    },
    {
      Icon: IconMoney,
      verb: "Reparta gastos entre socios",
      desc: "por porcentaje, por cabezas o partes iguales. Vea al instante quién debe qué a quién.",
    },
    {
      Icon: IconTask,
      verb: "Organice las tareas del día",
      desc: "ordeño, mantenimiento, sanidad — con prioridad, categoría y responsable. En calendario o en lista.",
    },
    {
      Icon: IconSparkles,
      verb: "Trabaje con todo su equipo",
      desc: "invite socios y trabajadores. Cada quien registra desde el potrero y todos ven los cambios al instante.",
    },
  ];
  return (
    <section className="relative py-24 md:py-32" style={{ background: "var(--sand)" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14 md:mb-16 max-w-3xl mx-auto">
          <span
            className="inline-block text-[0.65rem] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-5 font-semibold"
            style={{ background: "var(--forest)", color: "var(--lime-bright)" }}
          >
            QUÉ HACE MIFINCA
          </span>
          <h2 className="display-lg uppercase" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}>
            Todo el control<br />
            de la finca,{" "}
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>en una sola app.</em>
          </h2>
          <p className="mt-5 text-base md:text-lg" style={{ color: "rgba(20, 38, 26, 0.72)" }}>
            Registre, controle y decida — desde el celular, sin cuaderno, sin Excel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {items.map((it) => (
            <SummaryItem key={it.verb} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SummaryItem({
  Icon, verb, desc,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  verb: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-3xl p-6 md:p-7 flex items-start gap-5"
      style={{
        background: "white",
        border: "1px solid rgba(20, 38, 26, 0.08)",
        boxShadow: "0 4px 16px -8px rgba(20, 38, 26, 0.08)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(160deg, var(--lime) 0%, #A3BE6C 100%)",
          color: "var(--forest)",
          boxShadow: "0 8px 20px -6px rgba(184, 206, 122, 0.55)",
        }}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="uppercase font-bold leading-tight tracking-tight"
          style={{ fontSize: "1.1rem", color: "var(--forest)" }}
        >
          {verb}
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(20, 38, 26, 0.68)" }}>
          {desc}
        </p>
      </div>
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
    { icon: <IconSparkles size={20} />, name: "En vivo" },
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
      title: "Datos al instante, sin recargar",
      desc: "Cuando un socio o trabajador registra algo desde el potrero, todos lo ven al instante. Con autor y fecha.",
      icon: <IconSparkles size={22} />,
      badge: "AL INSTANTE",
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
      a: "Sí. Cada finca queda aislada en la base de datos: solo los usuarios que usted invite pueden ver sus animales, gastos y demás. Hacemos copias de respaldo automáticas todos los días.",
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
              <li><FooterLink onClick={() => scrollToId("socios")}>Reparto socios</FooterLink></li>
              <li><FooterLink onClick={() => scrollToId("ia")}>Asistente IA</FooterLink></li>
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
        <span className="dot" /> Colombia &middot; En vivo
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Reparto entre socios — diferenciador con visual
// ---------------------------------------------------------------------------
function SociosSection() {
  const ref = useReveal<HTMLDivElement>();
  const socios = [
    { name: "Orlando", initials: "OR", pct: 25, owes: 300000, paid: true },
    { name: "Camila", initials: "CA", pct: 25, owes: 300000, paid: false },
    { name: "Nicolás", initials: "NI", pct: 25, owes: 300000, paid: true },
    { name: "Rafael", initials: "RA", pct: 25, owes: 300000, paid: false, pagador: true },
  ];
  return (
    <section id="socios" className="relative py-24 md:py-32" style={{ background: "var(--cream)" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        <div>
          <span
            className="inline-block text-[0.65rem] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-6"
            style={{ background: "var(--lime)", color: "var(--forest)" }}
          >
            SOLO AQUÍ
          </span>
          <h2 className="display-lg uppercase" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}>
            Reparto real<br />
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>entre socios</em>
          </h2>
          <p className="mt-6 text-base leading-relaxed max-w-lg" style={{ color: "rgba(20, 38, 26, 0.72)" }}>
            El problema de las fincas familiares no es la vaca — es{" "}
            <strong style={{ color: "var(--forest)" }}>quién puso, cuánto y quién le debe a quién.</strong>{" "}
            Tres modos de reparto según el gasto:
          </p>
          <div className="mt-8 space-y-3">
            <RepartoBullet title="Por participación (%)" desc="Cada socio paga según su porcentaje." />
            <RepartoBullet title="Por cabezas" desc="Divide entre los dueños de los animales." />
            <RepartoBullet title="Partes iguales" desc="Entre los participantes que usted elija." />
          </div>
          <p className="mt-8 text-sm" style={{ color: "rgba(20, 38, 26, 0.72)" }}>
            Al final, la app le muestra{" "}
            <strong style={{ color: "var(--forest)" }}>quién debe qué a quién</strong> — sin
            calculadora, sin discusiones.
          </p>
        </div>

        <div
          className="rounded-3xl p-7 md:p-8"
          style={{
            background: "white",
            border: "2px solid rgba(20, 38, 26, 0.08)",
            boxShadow: "0 30px 60px -20px rgba(20, 38, 26, 0.18)",
          }}
        >
          <div className="flex items-center justify-between pb-5 border-b" style={{ borderColor: "rgba(20, 38, 26, 0.08)" }}>
            <div>
              <div className="text-[0.65rem] font-mono uppercase tracking-widest" style={{ color: "var(--forest-3)", opacity: 0.7 }}>
                Vacunas Q3
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: "var(--forest)" }}>
                $1.200.000
              </div>
            </div>
            <span
              className="text-[0.6rem] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "var(--lime)", color: "var(--forest)" }}
            >
              Sanidad
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {socios.map((s) => (
              <DebtRow key={s.name} {...s} />
            ))}
          </div>

          <div
            className="mt-5 pt-4 border-t flex items-center justify-between text-sm"
            style={{ borderColor: "rgba(20, 38, 26, 0.08)" }}
          >
            <span className="font-mono uppercase text-[0.7rem] tracking-widest" style={{ color: "var(--forest-3)", opacity: 0.7 }}>
              Pendiente hacia Rafael
            </span>
            <span className="font-bold text-lg" style={{ color: "#B54B2A" }}>
              $300.000
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RepartoBullet({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: "var(--lime)", boxShadow: "0 0 10px rgba(184,206,122,0.6)" }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold uppercase tracking-tight" style={{ color: "var(--forest)" }}>
          {title}
        </div>
        <div className="text-sm mt-0.5" style={{ color: "rgba(20, 38, 26, 0.65)" }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function DebtRow({
  initials, name, pct, owes, paid, pagador,
}: { initials: string; name: string; pct: number; owes: number; paid: boolean; pagador?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0"
        style={{ background: pagador ? "var(--forest)" : "rgba(184, 206, 122, 0.25)", color: pagador ? "var(--lime-bright)" : "var(--forest)" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold uppercase tracking-tight flex items-center gap-2" style={{ color: "var(--forest)" }}>
            {name}
            {pagador && (
              <span className="text-[0.55rem] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: "var(--forest)", color: "var(--lime-bright)" }}>
                pagó
              </span>
            )}
          </span>
          <span className="text-xs font-mono" style={{ color: "rgba(20, 38, 26, 0.55)" }}>{pct}%</span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-sm font-mono font-medium" style={{ color: "var(--forest)" }}>
            ${owes.toLocaleString("es-CO")}
          </span>
          {pagador ? null : paid ? (
            <span className="text-[0.55rem] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: "rgba(184, 206, 122, 0.35)", color: "var(--forest)" }}>
              PAGADO
            </span>
          ) : (
            <span className="text-[0.55rem] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: "rgba(181, 75, 42, 0.14)", color: "#B54B2A" }}>
              DEBE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Phones Showcase — 3 devices con UI real
// ---------------------------------------------------------------------------
function PhonesShowcase() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: "var(--forest)", color: "white" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14 md:mb-20">
          <h2 className="display-lg uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Toda la operación,<br />
            <em style={{ color: "var(--lime-bright)", fontStyle: "normal" }}>a un toque.</em>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-base md:text-lg" style={{ color: "rgba(255,255,255,0.72)" }}>
            Pensada para el celular. Con toques, arrastres y tarjetas grandes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          <PhoneHato />
          <PhoneGastos />
          <PhoneActividades />
        </div>
      </div>
    </section>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-frame max-w-[280px] mx-auto">
      <div className="phone-screen">
        <div className="phone-status" style={{ color: "var(--ink)" }}>
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm" style={{ background: "rgba(14,27,18,0.6)" }} />
            <span className="w-3 h-1.5 rounded-sm" style={{ background: "rgba(14,27,18,0.4)" }} />
            <span className="w-4 h-2 rounded-sm relative" style={{ border: "1px solid rgba(14,27,18,0.55)" }}>
              <span className="absolute inset-0.5 rounded-sm" style={{ width: "72%", background: "rgba(14,27,18,0.65)" }} />
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Réplica de la UI real: /hato ---
// Grid 2x3 de tiles-mod coloridos (paleta moss/sea/sand/coral/plum/sky/clay).
function PhoneHato() {
  const tiles = [
    { label: "Animales", sub: "cabezas activas", metric: "11", from: "#E4EED4", to: "#A9C177", ink: "#3E5A24", fg: "#1D2F10", Icon: IconCow },
    { label: "Potreros", sub: "lotes", metric: "4", from: "#D5EBE4", to: "#7EBFA9", ink: "#1E5A48", fg: "#0F2E23", Icon: IconPasture },
    { label: "Peso", sub: "pesajes", from: "#F0EADA", to: "#CBB98D", ink: "#5A4A22", fg: "#2E240F", Icon: IconScale },
    { label: "Sanidad", sub: "cercanos", metric: "3", from: "#FBDACF", to: "#F19277", ink: "#8A3B24", fg: "#4A1B0F", Icon: IconHealth, alert: true },
    { label: "Reprod.", sub: "preñeces", metric: "2", from: "#E9D9E6", to: "#B48AB0", ink: "#5A2C57", fg: "#2E1230", Icon: IconRepro },
    { label: "Inventario", sub: "insumos", from: "#EBE0D1", to: "#B99A7A", ink: "#5A3C20", fg: "#2E1D0C", Icon: IconBox },
  ];
  return (
    <PhoneShell>
      <div className="phone-content" style={{ background: "var(--cream)", height: "100%" }}>
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "rgba(14,27,18,0.5)" }}>
            Las Delicias
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(20,38,26,0.08)" }}>
            <IconUser size={12} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <MiniTile key={t.label} {...t} />
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

function MiniTile({
  label, sub, metric, from, to, ink, fg, Icon, alert,
}: {
  label: string; sub: string; metric?: string; from: string; to: string; ink: string; fg: string;
  Icon: React.ComponentType<{ size?: number }>; alert?: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center aspect-square"
      style={{
        background: `radial-gradient(120% 100% at 100% 0%, color-mix(in oklab, white 30%, ${from}) 0%, transparent 55%), linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
        color: fg,
        border: `1px solid color-mix(in oklab, ${ink} 12%, transparent)`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.55) inset, 0 6px 14px -8px ${ink}44`,
        padding: "0.5rem",
      }}
    >
      {alert && (
        <span
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: "#d9534f", boxShadow: "0 0 4px #d9534f, 0 0 0 2px rgba(255,255,255,0.6)" }}
        />
      )}
      {metric && (
        <span
          className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[0.5rem] font-bold"
          style={{ background: "rgba(255,255,255,0.85)", color: ink }}
        >
          {metric}
        </span>
      )}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
        style={{ background: ink, color: "white" }}
      >
        <Icon size={14} />
      </div>
      <div className="text-[0.55rem] font-bold leading-tight" style={{ color: fg }}>{label}</div>
      <div className="text-[0.42rem]" style={{ color: `${fg}99` }}>{sub}</div>
    </div>
  );
}

// --- Réplica de la UI real: /gastos ---
// 3 HeroStat + lista de gastos con avatares de socios pagados.
function PhoneGastos() {
  return (
    <PhoneShell>
      <div className="phone-content" style={{ background: "var(--cream)", height: "100%" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "rgba(14,27,18,0.5)" }}>
            Gastos e ingresos
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(20,38,26,0.08)" }}>
            <IconMoney size={12} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <HeroStatMini label="Ingresos" value="$4.8M" from="#E4EED4" to="#A9C177" ink="#3E5A24" />
          <HeroStatMini label="Gastos" value="$3.2M" from="#FBDACF" to="#F19277" ink="#8A3B24" />
          <HeroStatMini label="Balance" value="+$1.6M" from="#D5EBE4" to="#7EBFA9" ink="#1E5A48" />
        </div>

        <div className="flex gap-1.5 mb-2">
          <span className="text-[0.55rem] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "var(--forest)", color: "var(--lime-bright)" }}>Gastos</span>
          <span className="text-[0.55rem] uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: "rgba(14,27,18,0.55)" }}>Ingresos</span>
        </div>

        <ExpenseRow titulo="Vacunas Q3" cat="Sanidad" fecha="12 sep" monto="$1.200.000" payer="RA" partners={["OR","CA","NI","RA"]} paidBy={["OR","NI","RA"]} />
        <ExpenseRow titulo="Sal + concentrado" cat="Alimentación" fecha="08 sep" monto="$680.000" payer="CA" partners={["OR","CA","NI","RA"]} paidBy={["OR","CA","NI","RA"]} />
        <ExpenseRow titulo="Diesel" cat="Otros" fecha="05 sep" monto="$320.000" payer="RA" partners={["OR","CA","NI","RA"]} paidBy={["CA","RA"]} />
      </div>
    </PhoneShell>
  );
}

function HeroStatMini({ label, value, from, to, ink }: { label: string; value: string; from: string; to: string; ink: string }) {
  return (
    <div
      className="rounded-lg px-1.5 py-1.5"
      style={{
        background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
        color: ink,
      }}
    >
      <div className="text-[0.45rem] font-mono uppercase tracking-widest" style={{ opacity: 0.7 }}>{label}</div>
      <div className="text-[0.7rem] font-bold leading-tight mt-0.5">{value}</div>
    </div>
  );
}

function ExpenseRow({
  titulo, cat, fecha, monto, payer, partners, paidBy,
}: { titulo: string; cat: string; fecha: string; monto: string; payer: string; partners: string[]; paidBy: string[] }) {
  return (
    <div className="rounded-xl px-2.5 py-2 mb-1.5" style={{ background: "white", border: "1px solid rgba(20,38,26,0.06)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[0.68rem] font-semibold truncate" style={{ color: "var(--forest)" }}>{titulo}</div>
          <div className="text-[0.5rem]" style={{ color: "rgba(14,27,18,0.55)" }}>{cat} · {fecha} · pagó {payer}</div>
        </div>
        <div className="text-[0.68rem] font-mono font-bold shrink-0" style={{ color: "var(--forest)" }}>{monto}</div>
      </div>
      <div className="mt-1 flex gap-0.5">
        {partners.map((p) => {
          const pagado = paidBy.includes(p);
          return (
            <span
              key={p}
              className="text-[0.42rem] font-mono rounded-full w-[18px] h-[14px] flex items-center justify-center font-bold"
              style={{
                background: pagado ? "rgba(184,206,122,0.4)" : "rgba(181,75,42,0.15)",
                color: pagado ? "var(--forest)" : "#8A3B24",
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// --- Réplica de la UI real: /tareas (vista calendario) ---
function PhoneActividades() {
  const dias = ["L","M","M","J","V","S","D"];
  // Simular grid de mes con puntos coloreados en días con actividades.
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - 1; // -1..33
    const inMonth = day > 0 && day <= 30;
    const today = day === 15;
    const eventos = {
      2: ["sanidad"],
      5: ["manejo"],
      8: ["sanidad", "manejo"],
      12: ["reproduccion"],
      14: ["manejo"],
      15: ["sanidad", "reproduccion"],
      18: ["alimentacion"],
      22: ["sanidad"],
      25: ["manejo", "reproduccion"],
      28: ["sanidad"],
    }[day] as string[] | undefined;
    return { day, inMonth, today, eventos };
  });
  const dotColor: Record<string, string> = {
    sanidad: "#D97757",
    manejo: "var(--forest)",
    reproduccion: "#B48AB0",
    alimentacion: "#D19255",
  };
  return (
    <PhoneShell>
      <div className="phone-content" style={{ background: "var(--cream)", height: "100%" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "rgba(14,27,18,0.5)" }}>
            Actividades
          </div>
          <div className="flex gap-1">
            <span className="text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "var(--forest)", color: "var(--lime-bright)" }}>Cal.</span>
            <span className="text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ color: "rgba(14,27,18,0.55)" }}>Lista</span>
          </div>
        </div>

        <div className="text-center mb-2">
          <div className="text-[0.85rem] font-bold uppercase" style={{ color: "var(--forest)" }}>Septiembre 2026</div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {dias.map((d, i) => (
            <div key={i} className="text-[0.5rem] text-center font-mono uppercase" style={{ color: "rgba(14,27,18,0.45)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((c, i) => (
            <div
              key={i}
              className="aspect-square rounded flex flex-col items-center justify-center relative"
              style={{
                background: c.today ? "var(--forest)" : c.inMonth ? "white" : "transparent",
                border: c.inMonth && !c.today ? "1px solid rgba(20,38,26,0.06)" : "none",
              }}
            >
              {c.inMonth && (
                <>
                  <span className="text-[0.5rem] font-semibold" style={{ color: c.today ? "var(--lime-bright)" : "var(--forest)" }}>
                    {c.day}
                  </span>
                  {c.eventos && (
                    <div className="flex gap-0.5 mt-0.5">
                      {c.eventos.slice(0, 3).map((e, idx) => (
                        <span key={idx} className="w-1 h-1 rounded-full" style={{ background: c.today ? "var(--lime-bright)" : dotColor[e] }} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl px-2.5 py-2" style={{ background: "white", border: "1px solid rgba(20,38,26,0.06)" }}>
          <div className="text-[0.5rem] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(14,27,18,0.5)" }}>Hoy · 15 sep</div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D97757" }} />
            <div className="text-[0.6rem] font-semibold" style={{ color: "var(--forest)" }}>Vacuna aftosa · V12</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#B48AB0" }} />
            <div className="text-[0.6rem] font-semibold" style={{ color: "var(--forest)" }}>Diagnóstico preñez · N4</div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

// ---------------------------------------------------------------------------
//  Asistente IA — sección completa con chat mockup
// ---------------------------------------------------------------------------
function AIAssistantSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="ia" className="relative py-24 md:py-32" style={{ background: "var(--cream)" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
        <div>
          <span
            className="inline-block text-[0.65rem] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-6 font-semibold"
            style={{ background: "rgba(184, 206, 122, 0.25)", color: "var(--forest)", border: "1px solid var(--lime)" }}
          >
            PRÓXIMAMENTE · Q1 2027
          </span>
          <h2 className="display-lg uppercase" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--forest)" }}>
            Asistente<br />
            <em style={{ color: "var(--forest-3)", fontStyle: "normal" }}>IA MiFinca.</em>
          </h2>
          <p className="mt-6 text-base leading-relaxed max-w-lg" style={{ color: "rgba(20, 38, 26, 0.72)" }}>
            Un cerebro que analiza los datos de su finca sin que abra un
            Excel. Pregúntele en español y le responde con datos reales.
          </p>
          <ul className="mt-8 space-y-3">
            <AIBullet>&ldquo;¿Cuáles vacas están próximas a parir este mes?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿En qué me gasté más este trimestre?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿Cuál es la vaca más rentable del hato?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿Qué animales están perdiendo peso?&rdquo;</AIBullet>
          </ul>
          <div className="mt-8 text-sm" style={{ color: "rgba(20, 38, 26, 0.65)" }}>
            Incluido en los planes <strong style={{ color: "var(--forest)" }}>Ganadero</strong> y <strong style={{ color: "var(--forest)" }}>Hacienda</strong>.
          </div>
        </div>

        <div
          className="rounded-3xl p-6 md:p-7"
          style={{
            background: "white",
            border: "2px solid rgba(20, 38, 26, 0.08)",
            boxShadow: "0 30px 60px -20px rgba(20, 38, 26, 0.18)",
          }}
        >
          <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "rgba(20, 38, 26, 0.08)" }}>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "var(--forest)", color: "var(--lime-bright)" }}
            >
              <IconSparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-tight" style={{ color: "var(--forest)" }}>MiFinca IA</div>
              <div className="text-[0.65rem] flex items-center gap-1.5" style={{ color: "rgba(20, 38, 26, 0.55)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--lime)" }} /> Analizando su hato
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            <div className="chat-bubble-user">
              Hola, ¿cuáles vacas debo revisar esta semana?
            </div>
            <div className="chat-bubble-ai">
              Tres cosas urgentes:
              <br />• <strong>V12</strong> lleva 3 meses sin ganar peso.
              <br />• <strong>N4</strong> tiene chequeo de preñez el jueves.
              <br />• <strong>V07</strong> debe recibir refuerzo de aftosa mañana.
            </div>
            <div className="chat-bubble-user">¿Cuánto costó la sanidad en junio?</div>
            <div className="chat-bubble-ai">
              <strong>$1.840.000</strong> — 32% más que en mayo. El aumento
              viene de dos compras de antiparasitarios. ¿Le hago un desglose por animal?
            </div>
            <div className="chat-bubble-ai typing" style={{ padding: "0.55rem 0.9rem", display: "inline-block" }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--forest-3)" }} />
      <span className="text-sm italic" style={{ color: "rgba(20, 38, 26, 0.75)" }}>{children}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
//  Cédula digital / QR por animal
// ---------------------------------------------------------------------------
function AnimalCedulaSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 md:py-32" style={{ background: "var(--forest)", color: "white" }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div
          className="rounded-3xl p-6 md:p-7"
          style={{ background: "white", color: "var(--forest)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.35)" }}
        >
          <div className="grid grid-cols-[1fr_140px] gap-4 items-start">
            <div>
              <div className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "var(--forest-3)" }}>
                CÉDULA DIGITAL · V12
              </div>
              <div className="mt-1 text-2xl font-bold uppercase tracking-tight">Vaca &ldquo;Estrella&rdquo;</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(20, 38, 26, 0.55)" }}>Girolando · 4 años · Las Delicias</div>

              <dl className="mt-5 space-y-2 text-sm">
                <FieldPair label="Dueño" value="Rafael Rincón" />
                <FieldPair label="Registrada" value="2024-03-14" />
                <FieldPair label="Último peso" value="420 kg · hace 3 días" />
                <FieldPair label="Última vacuna" value="Aftosa · 2026-07-20" />
                <FieldPair label="Preñada" value="Sí · FPP 2026-11-08" />
              </dl>
            </div>
            <QRCode />
          </div>
          <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(20, 38, 26, 0.08)" }}>
            <div className="text-[0.65rem] font-mono" style={{ color: "rgba(20, 38, 26, 0.55)" }}>
              mifinca.app/animal/<span style={{ color: "var(--forest)" }}>v12-x9k2</span>
            </div>
            <span
              className="text-[0.55rem] font-mono uppercase tracking-widest px-2 py-1 rounded-full font-semibold"
              style={{ background: "var(--lime)", color: "var(--forest)" }}
            >
              ✓ verificado
            </span>
          </div>
        </div>

        <div>
          <span
            className="inline-block text-[0.65rem] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-full mb-6 font-semibold"
            style={{ background: "rgba(184, 206, 122, 0.16)", color: "var(--lime-bright)", border: "1px solid rgba(184, 206, 122, 0.4)" }}
          >
            PRÓXIMAMENTE
          </span>
          <h2 className="display-lg uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Cédula digital<br />
            <em style={{ color: "var(--lime-bright)", fontStyle: "normal" }}>por animal.</em>
          </h2>
          <p className="mt-6 text-base leading-relaxed max-w-lg" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
            Cada animal con su QR único. Muéstrelo al veterinario, al
            comprador o al inspector — sin papeles, sin dudas.
          </p>
          <ul className="mt-8 space-y-3">
            <CedulaBullet><strong>QR único</strong> por cabeza — imposible falsificar</CedulaBullet>
            <CedulaBullet><strong>Historial verificable</strong>: sanidad, peso, reproducción</CedulaBullet>
            <CedulaBullet><strong>Ideal para venta</strong> — pásele el QR al comprador</CedulaBullet>
            <CedulaBullet><strong>Trazabilidad real</strong> — no en cuaderno</CedulaBullet>
          </ul>
        </div>
      </div>
    </section>
  );
}

function CedulaBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "var(--lime)", color: "var(--forest)" }}
      >
        <IconCheck size={11} />
      </span>
      <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.85)" }}>{children}</span>
    </li>
  );
}

function FieldPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "rgba(20, 38, 26, 0.5)" }}>{label}</dt>
      <dd className="text-xs font-medium text-right truncate" style={{ color: "var(--forest)" }}>{value}</dd>
    </div>
  );
}

function QRCode() {
  const pattern =
    "111111101010111111100" +
    "100000101101100000101" +
    "101110100110101110101" +
    "101110101010101110101" +
    "101110101101101110101" +
    "100000101010100000101" +
    "111111101010111111101" +
    "000000001101000000000" +
    "110101110010110110110" +
    "010110011101011010010" +
    "101011100101110110101" +
    "011001010110101011010" +
    "110110101011100101110" +
    "000000001011001010100" +
    "111111100110101101100" +
    "100000101011010101010" +
    "101110101100110110110" +
    "101110101010101010101" +
    "101110100110101101001" +
    "100000101001010101110" +
    "111111100010110101010";
  const cells = pattern.split("");
  return (
    <div className="qr" style={{ maxWidth: 140 }}>
      {cells.map((c, i) => (
        <div key={i} className={c === "1" ? "on" : ""} />
      ))}
    </div>
  );
}
