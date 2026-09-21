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
//  Fotos (Unsplash, licencia libre para uso comercial)
// ---------------------------------------------------------------------------
const PHOTO_HERO =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=80";
const PHOTO_POTRERO =
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80";
const PHOTO_HATO =
  "https://images.unsplash.com/photo-1560884140-0b62a3d1a46d?auto=format&fit=crop&w=1200&q=80";
const PHOTO_LECHE =
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1200&q=80";
const PHOTO_CAMPO_ATARDECER =
  "https://images.unsplash.com/photo-1566408669057-71b78d76c85b?auto=format&fit=crop&w=1800&q=80";
const PHOTO_GANADERO =
  "https://images.unsplash.com/photo-1601961405399-63d31099ada5?auto=format&fit=crop&w=800&q=80";

/** Hook simple que agrega la clase "in-view" al entrar en pantalla. */
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

export default function LandingPage({ onLogin }: Props) {
  return (
    <div className="min-h-screen relative overflow-x-hidden landing-root">
      <LandingStyles />

      <div className="landing-bg" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <TopNav onLogin={onLogin} />
      <HeroPhoto onLogin={onLogin} />
      <TickerMarquee />
      <BigStats />
      <LiveFeed />
      <FeatureShowcase />
      <SociosHighlight />
      <FieldReady />
      <AIAssistantTeaser />
      <AnimalCedulaTeaser />
      <MockupShowcase />
      <HowItWorks />
      <Pricing onLogin={onLogin} />
      <Testimonials />
      <FAQ />
      <LoginEmbed />
      <FinalCTA onLogin={onLogin} />
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Estilos globales de la landing
// ---------------------------------------------------------------------------
function LandingStyles() {
  return (
    <style jsx global>{`
      .landing-root {
        --serif: var(--font-fraunces), Georgia, serif;
        --serif-italic: var(--font-instrument), Georgia, serif;
      }
      .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .reveal.in-view { opacity: 1; transform: none; }
      .reveal-delay-1 { transition-delay: 0.08s; }
      .reveal-delay-2 { transition-delay: 0.16s; }
      .reveal-delay-3 { transition-delay: 0.24s; }
      .reveal-delay-4 { transition-delay: 0.32s; }

      .display {
        font-family: var(--serif);
        font-weight: 700;
        font-variation-settings: "opsz" 144, "SOFT" 100;
        letter-spacing: -0.03em;
        line-height: 0.98;
      }
      .display-em {
        font-family: var(--serif-italic);
        font-style: italic;
        font-weight: 400;
        background: linear-gradient(120deg, #F8E1C1 0%, #FFF7E6 40%, #D19255 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .h2-display {
        font-family: var(--serif);
        font-weight: 600;
        font-variation-settings: "opsz" 96;
        letter-spacing: -0.025em;
        line-height: 1.02;
      }
      .h2-em {
        font-family: var(--serif-italic);
        font-style: italic;
        font-weight: 400;
        color: var(--accent);
      }

      /* Fondo llamativo: mesh gradient con blobs animados */
      .landing-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }
      .landing-bg::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(1000px 700px at 100% 10%, rgba(209, 146, 85, 0.10), transparent 55%),
          radial-gradient(900px 600px at 30% 110%, rgba(180, 200, 90, 0.10), transparent 55%);
      }
      .landing-bg::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(34, 64, 42, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 64, 42, 0.04) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%);
      }
      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.5;
        mix-blend-mode: multiply;
        animation: float 22s ease-in-out infinite;
      }
      .orb-1 { width: 480px; height: 480px; background: #7CAF6D; top: 40%; left: -120px; animation-delay: 0s; }
      .orb-2 { width: 540px; height: 540px; background: #D19255; top: 60%; right: -180px; animation-delay: -8s; }
      .orb-3 { width: 420px; height: 420px; background: #B8CE7A; bottom: 10%; left: 30%; animation-delay: -14s; opacity: 0.32; }
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, -40px) scale(1.08); }
        66% { transform: translate(-30px, 50px) scale(0.94); }
      }
      @media (prefers-reduced-motion: reduce) {
        .orb { animation: none; }
      }

      /* Hero: foto grande con overlay */
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
        to { transform: scale(1.12); }
      }
      .hero-photo::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(10, 20, 12, 0.45) 0%, rgba(10, 20, 12, 0.35) 45%, rgba(248, 245, 238, 0.98) 100%),
          linear-gradient(90deg, rgba(10, 20, 12, 0.55) 0%, transparent 60%);
      }
      @media (max-width: 767px) {
        .hero-photo::after {
          background:
            linear-gradient(180deg, rgba(10, 20, 12, 0.55) 0%, rgba(10, 20, 12, 0.40) 40%, rgba(248, 245, 238, 0.98) 100%);
        }
      }

      /* Marquee ticker */
      .marquee {
        display: flex;
        overflow: hidden;
        gap: 3rem;
        mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
      }
      .marquee-track {
        display: flex;
        gap: 3rem;
        animation: marquee 40s linear infinite;
        white-space: nowrap;
        flex-shrink: 0;
      }
      @keyframes marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-100%); }
      }

      /* Device / phone frames */
      .device-frame {
        position: relative;
        border-radius: 26px;
        background: linear-gradient(135deg, #f5f2ea 0%, #ffffff 100%);
        border: 1px solid var(--rule);
        box-shadow:
          0 60px 120px -30px rgba(34, 64, 42, 0.30),
          0 20px 40px -12px rgba(0,0,0,0.10),
          inset 0 1px 0 rgba(255,255,255,0.9);
        padding: 14px;
      }
      .device-frame::before {
        content: "";
        position: absolute;
        top: 8px; left: 50%;
        transform: translateX(-50%);
        width: 80px; height: 5px;
        background: var(--rule-strong);
        border-radius: 3px;
      }
      .phone-frame {
        position: relative;
        border-radius: 42px;
        padding: 10px;
        background: linear-gradient(135deg, #1a1a1a 0%, #2b2b2b 100%);
        box-shadow:
          0 40px 80px -20px rgba(0,0,0,0.35),
          0 12px 24px -8px rgba(0,0,0,0.20),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .phone-screen {
        border-radius: 32px;
        background: var(--bg);
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
        font-family: var(--font-geist-mono);
        font-size: 0.68rem;
        font-weight: 600;
      }
      .phone-content {
        padding: 12px 16px 20px;
      }

      /* Feature card */
      .feature-card {
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow:
          0 10px 30px -12px rgba(34, 64, 42, 0.10),
          inset 0 1px 0 rgba(255,255,255,0.6);
        transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
      }
      .feature-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 20px 40px -12px rgba(34, 64, 42, 0.18),
          inset 0 1px 0 rgba(255,255,255,0.8);
      }

      /* Foto-card con marco */
      .photo-card {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid var(--rule);
        box-shadow:
          0 30px 60px -20px rgba(34, 64, 42, 0.25),
          0 10px 20px -8px rgba(0,0,0,0.08);
      }
      .photo-card img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.8s cubic-bezier(0.16,1,0.3,1);
      }
      .photo-card:hover img { transform: scale(1.04); }
      .photo-card .photo-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 40%, rgba(10,20,12,0.85) 100%);
      }
      .photo-card .photo-content {
        position: absolute;
        left: 0; right: 0; bottom: 0;
        padding: 1.25rem 1.25rem 1.15rem;
        color: white;
      }

      /* Chip live */
      .live-chip {
        position: relative;
        overflow: hidden;
      }
      .live-chip::before {
        content: "";
        position: absolute;
        top: 0; left: -100%;
        width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
        animation: shine 3.5s infinite;
      }
      @keyframes shine {
        0% { left: -100%; }
        50%, 100% { left: 100%; }
      }

      /* Grano suave sobre el hero para textura */
      .grain::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.06 0 0 0 0 0.10 0 0 0 0 0.06 0 0 0 0.22 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        opacity: 0.5;
        mix-blend-mode: overlay;
        pointer-events: none;
      }

      /* Chat mockup del asistente IA */
      .chat-bubble {
        max-width: 85%;
        padding: 0.75rem 1rem;
        border-radius: 18px;
        font-size: 0.82rem;
        line-height: 1.4;
      }
      .chat-user {
        background: var(--primary);
        color: white;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }
      .chat-ai {
        background: rgba(34, 64, 42, 0.06);
        color: var(--fg);
        border-bottom-left-radius: 4px;
        border: 1px solid rgba(34, 64, 42, 0.10);
      }
      .typing-dot {
        display: inline-block;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: var(--muted);
        margin: 0 1px;
        animation: bounce 1.2s infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.15s; }
      .typing-dot:nth-child(3) { animation-delay: 0.30s; }
      @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }

      /* QR grid */
      .qr {
        display: grid;
        grid-template-columns: repeat(21, 1fr);
        gap: 2px;
        aspect-ratio: 1/1;
        padding: 8px;
        background: white;
        border-radius: 12px;
      }
      .qr div {
        background: transparent;
      }
      .qr div.on {
        background: #22402A;
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
    { id: "funciones", label: "Funciones" },
    { id: "socios", label: "Socios" },
    { id: "campo", label: "En campo" },
    { id: "ia", label: "IA" },
    { id: "precios", label: "Precios" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b transition-all"
      style={{
        borderColor: scrolled ? "var(--rule)" : "transparent",
        background: scrolled ? "rgba(248, 245, 238, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
            style={{
              background: scrolled ? "var(--surface-solid)" : "rgba(255,255,255,0.92)",
              border: `1px solid ${scrolled ? "var(--rule)" : "rgba(255,255,255,0.4)"}`,
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
          <div className="flex flex-col items-start leading-none">
            <div
              className="text-sm md:text-base font-serif font-semibold tracking-tight"
              style={{ color: scrolled ? "var(--fg)" : "white", textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.4)" }}
            >
              MiFinca
            </div>
            <div
              className="text-[0.55rem] md:text-[0.6rem] font-mono tracking-[0.14em] uppercase mt-0.5"
              style={{ color: scrolled ? "var(--accent)" : "rgba(255, 220, 180, 0.95)", textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.4)" }}
            >
              Gestión ganadera
            </div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              className="text-sm px-3 py-1.5 rounded-lg transition"
              style={{
                color: scrolled ? "var(--muted)" : "rgba(255,255,255,0.85)",
                textShadow: scrolled ? "none" : "0 1px 3px rgba(0,0,0,0.35)",
              }}
              onClick={() => scrollToId(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition"
            style={{
              color: scrolled ? "var(--fg)" : "white",
              background: scrolled ? "transparent" : "rgba(255,255,255,0.15)",
              border: `1px solid ${scrolled ? "var(--rule)" : "rgba(255,255,255,0.25)"}`,
              backdropFilter: "blur(8px)",
            }}
            onClick={() => scrollToId("ingreso")}
          >
            Iniciar sesión
          </button>
          <button className="btn btn-primary" onClick={onLogin}>
            Empieza gratis
          </button>
          <button
            className="lg:hidden ml-1 p-2 rounded-lg"
            style={{
              background: scrolled ? "var(--surface-2)" : "rgba(255,255,255,0.15)",
              color: scrolled ? "var(--fg)" : "white",
              border: `1px solid ${scrolled ? "var(--rule)" : "rgba(255,255,255,0.25)"}`,
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
          className="lg:hidden border-t"
          style={{
            background: "rgba(248, 245, 238, 0.96)",
            backdropFilter: "blur(16px)",
            borderColor: "var(--rule)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                className="text-left text-sm text-muted hover:text-fg px-3 py-2.5 rounded-lg hover:bg-surface-2 transition"
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
//  Hero con foto de fondo
// ---------------------------------------------------------------------------
function HeroPhoto({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="hero-photo grain">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO_HERO} alt="" fetchPriority="high" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-16">
        <div ref={ref} className="reveal grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div className="text-white">
            <div
              className="live-chip inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.68rem] font-mono uppercase tracking-[0.14em] mb-8"
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#F8E1C1", boxShadow: "0 0 8px #F8E1C1" }}
              />
              Nuevo · Ahora multi-finca
            </div>

            <h1
              className="display"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
                color: "white",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              Su finca, en el{" "}
              <span className="display-em" style={{ fontSize: "1.05em", textShadow: "none" }}>
                bolsillo
              </span>
              . Sin cuadernos.
            </h1>

            <p
              className="mt-8 text-base md:text-lg max-w-xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
            >
              Registre animales, sanidad, reproducción y gastos con reparto real
              entre socios — desde el potrero, con o sin señal. Diseñado para el
              ganadero colombiano.
            </p>

            <div className="mt-8 flex gap-3 flex-wrap">
              <button
                className="btn btn-primary"
                onClick={onLogin}
                style={{ padding: "0.95rem 1.9rem", fontSize: "0.95rem" }}
              >
                Empiece gratis
                <IconArrowUp size={13} />
              </button>
              <button
                className="btn"
                onClick={() => scrollToId("funciones")}
                style={{
                  padding: "0.95rem 1.9rem",
                  fontSize: "0.95rem",
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(10px)",
                }}
              >
                Ver funciones
              </button>
            </div>

            <div
              className="mt-6 flex items-center gap-4 text-[0.72rem] flex-wrap"
              style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
            >
              <span className="flex items-center gap-1.5">
                <IconCheck size={12} /> Sin instalación
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck size={12} /> Sin permanencia
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck size={12} /> Sin tarjeta
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* wave transition */}
      <svg
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ height: "60px" }}
      >
        <path
          d="M0,32 C240,80 480,0 720,32 C960,64 1200,16 1440,48 L1440,80 L0,80 Z"
          fill="var(--bg)"
        />
      </svg>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="device-frame">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--rule)",
        }}
      >
        <div
          className="flex items-center gap-1.5 px-4 py-2 border-b border-rule"
          style={{ background: "var(--surface-2)" }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          <span className="mx-auto text-[0.6rem] font-mono text-subtle">mifinca.app · Las Delicias</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <MiniTile label="Actividades" metric="8" sub="2 vencidas" tone={["#F8E1C1", "#E4A46A"]} alert />
          <MiniTile label="Hato" metric="147" sub="animales activos" tone={["#E4EED4", "#A9C177"]} />
          <MiniTile label="Gastos" metric="$3.2M" sub="este mes" tone={["#F6EFC2", "#DFC85E"]} />
          <MiniTile label="Mi operación" metric="25%" sub="participación" tone={["#D9EFD1", "#89C57B"]} />
        </div>
      </div>
    </div>
  );
}

function MiniTile({
  label,
  metric,
  sub,
  tone,
  alert,
}: {
  label: string;
  metric: string;
  sub: string;
  tone: [string, string];
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 relative"
      style={{
        background: `linear-gradient(135deg, ${tone[0]} 0%, ${tone[1]} 100%)`,
        color: "#1D2F10",
      }}
    >
      {alert && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: "#d9534f", boxShadow: "0 0 6px #d9534f" }}
        />
      )}
      <div className="text-2xl font-mono font-bold tabular-nums">{metric}</div>
      <div className="mt-1 text-[0.7rem] font-semibold">{label}</div>
      <div className="text-[0.55rem] opacity-70">{sub}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Marquee ticker
// ---------------------------------------------------------------------------
function TickerMarquee() {
  const items = [
    "Hato completo",
    "Sanidad al día",
    "Reproducción",
    "Reparto entre socios",
    "Gastos y presupuesto",
    "Control de peso",
    "Producción de leche",
    "Inventario de insumos",
    "Tareas y calendario",
    "Multi-finca",
    "Trabajo sin señal",
    "Cédula digital",
  ];
  const track = (
    <div className="marquee-track">
      {items.map((it, i) => (
        <span
          key={i}
          className="text-sm font-serif italic"
          style={{ color: "var(--muted)" }}
        >
          <span style={{ color: "var(--accent)" }}>◆</span>&nbsp;&nbsp;{it}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className="relative z-10 border-y"
      style={{
        borderColor: "var(--rule)",
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="marquee py-3">
        {track}
        {track}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Big stats
// ---------------------------------------------------------------------------
function BigStats() {
  const ref = useReveal<HTMLDivElement>();
  const items = [
    { value: "10", unit: "módulos", label: "Cubre toda la operación" },
    { value: "2 min", unit: "", label: "Crea tu finca y empieza" },
    { value: "24/7", unit: "", label: "Sincronización en tiempo real" },
    { value: "0", unit: "COP", label: "Para arrancar, siempre" },
  ];
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
      <div ref={ref} className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div
            key={it.label}
            className="text-center p-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px -12px rgba(34, 64, 42, 0.10)",
              transitionDelay: `${i * 0.06}s`,
            }}
          >
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="display font-serif"
                style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", color: "var(--primary)" }}
              >
                {it.value}
              </span>
              <span className="text-xs text-muted font-mono">{it.unit}</span>
            </div>
            <div className="text-xs md:text-sm text-muted mt-1.5 leading-snug">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Live feed — actividades reales que verían en la app
// ---------------------------------------------------------------------------
function LiveFeed() {
  const ref = useReveal<HTMLDivElement>();
  const events = [
    { time: "hace 3 min", who: "Camila", action: "registró peso 420 kg de vaca V12", chip: "peso", tone: "moss" },
    { time: "hace 12 min", who: "Rafael", action: "pagó $340.000 de vacunas (reparto entre socios)", chip: "gasto", tone: "citrus" },
    { time: "hace 34 min", who: "Nicolás", action: "cerró tarea Ordeño turno mañana", chip: "tarea", tone: "copper" },
    { time: "hace 1 h", who: "Orlando", action: "reportó preñez confirmada de N4", chip: "reproducción", tone: "moss" },
    { time: "hace 2 h", who: "Sistema", action: "recordatorio: vacuna aftosa vence mañana", chip: "alerta", tone: "danger" },
  ];
  const toneBg: Record<string, string> = {
    moss: "linear-gradient(135deg, #E4EED4, #A9C177)",
    citrus: "linear-gradient(135deg, #F6EFC2, #DFC85E)",
    copper: "linear-gradient(135deg, #F8E1C1, #E4A46A)",
    danger: "linear-gradient(135deg, #FBD5C4, #D97757)",
  };
  const toneInk: Record<string, string> = {
    moss: "#1D2F10",
    citrus: "#2E2306",
    copper: "#3E230C",
    danger: "#4A1B0A",
  };
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <div ref={ref} className="reveal grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ boxShadow: "0 0 8px var(--primary)" }} />
            En vivo
          </div>
          <h2
            className="h2-display mt-4"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            Ve la finca <span className="h2-em">latir</span><br className="hidden md:block" /> en tiempo real
          </h2>
          <p className="mt-4 text-muted leading-relaxed max-w-lg">
            Cuando un socio o trabajador registra algo desde su celular en el
            potrero, todos los demás lo ven al instante. Sin necesidad de
            reunirse, sin planillas de WhatsApp.
          </p>
          <ul className="mt-6 space-y-2.5">
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span>Sincronización realtime vía Supabase</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span>Cada acción queda con autor y fecha</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span>Historial completo por animal y por socio</span>
            </li>
          </ul>
        </div>

        <div className="card" style={{ background: "var(--surface-solid)", padding: "1.25rem" }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rule">
            <div className="text-xs font-mono uppercase tracking-widest text-subtle">Actividad · Las Delicias</div>
            <span className="flex items-center gap-1.5 text-[0.65rem] text-primary font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </span>
          </div>
          <ul className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[0.6rem] font-mono font-bold"
                  style={{ background: toneBg[e.tone], color: toneInk[e.tone] }}
                >
                  {e.who.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{e.who}</span>
                    <span
                      className="text-[0.55rem] font-mono uppercase tracking-widest rounded-full px-1.5 py-0.5"
                      style={{
                        background: toneBg[e.tone],
                        color: toneInk[e.tone],
                      }}
                    >
                      {e.chip}
                    </span>
                    <span className="text-[0.65rem] text-subtle ml-auto shrink-0">{e.time}</span>
                  </div>
                  <div className="text-sm text-muted mt-0.5">{e.action}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Feature Showcase — 3 grandes con foto
// ---------------------------------------------------------------------------
function FeatureShowcase() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="funciones" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-14">
        <div className="eyebrow">Funciones</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          Todo lo que <span className="h2-em">su finca</span> necesita,<br className="hidden md:block" />{" "}
          en un solo lugar
        </h2>
        <p className="mt-5 text-muted max-w-2xl mx-auto text-base md:text-lg">
          Reemplaza el Excel, el cuaderno y el chat de WhatsApp. Diez módulos
          conectados, pensados para el día a día del ganadero.
        </p>
      </div>

      {/* 3 grandes con foto */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6">
        <BigFeature
          photo={PHOTO_HATO}
          eyebrow="Hato"
          title="Cada animal con su hoja de vida"
          desc="Categoría, sexo, raza, padres, potrero, fotos y estado. Todo el historial en un tap."
        />
        <BigFeature
          photo={PHOTO_POTRERO}
          eyebrow="Potreros"
          title="Vea qué potrero está lleno hoy"
          desc="Área, capacidad, ubicación y ocupación en tiempo real."
        />
        <BigFeature
          photo={PHOTO_LECHE}
          eyebrow="Producción"
          title="Ordeño mañana y tarde por vaca"
          desc="Historial, promedios y curva del hato. Sabe qué vaca sube y cuál baja."
        />
      </div>

      {/* Grid pequeño de los otros módulos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SmallFeature Icon={IconHealth} title="Sanidad" desc="Vacunas, tratamientos y alertas del próximo evento." tone="copper" />
        <SmallFeature Icon={IconRepro} title="Reproducción" desc="Servicios, diagnóstico de preñez, partos y crías." tone="moss" />
        <SmallFeature Icon={IconScale} title="Control de peso" desc="Pesajes por animal con curvas de crecimiento." tone="moss" />
        <SmallFeature Icon={IconBox} title="Inventario" desc="Insumos con stock, mínimos y movimientos." tone="copper" />
        <SmallFeature Icon={IconMoney} title="Gastos + reparto socios" desc="Reparte entre socios y ve deudas al instante." tone="citrus" highlight />
        <SmallFeature Icon={IconTask} title="Tareas y calendario" desc="Actividades con prioridad, categoría y multi-asignación." tone="copper" />
        <SmallFeature Icon={IconUser} title="Socios y roles" desc="Propietarios, participación y responsabilidades." tone="moss" />
        <SmallFeature Icon={IconPasture} title="Multi-finca" desc="Administra varias fincas con datos separados." tone="moss" />
      </div>
    </section>
  );
}

function BigFeature({
  photo,
  eyebrow,
  title,
  desc,
}: {
  photo: string;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal photo-card aspect-[4/5]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={title} loading="lazy" />
      <div className="photo-overlay" />
      <div className="photo-content">
        <div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] opacity-80 mb-2">
          {eyebrow}
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-semibold leading-tight tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm opacity-90 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SmallFeature({
  Icon,
  title,
  desc,
  tone,
  highlight,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tone: "moss" | "copper" | "citrus";
  highlight?: boolean;
}) {
  const ref = useReveal<HTMLDivElement>();
  const bg: Record<typeof tone, string> = {
    moss: "linear-gradient(135deg, #E4EED4 0%, #A9C177 100%)",
    copper: "linear-gradient(135deg, #F8E1C1 0%, #E4A46A 100%)",
    citrus: "linear-gradient(135deg, #F6EFC2 0%, #DFC85E 100%)",
  };
  const fg: Record<typeof tone, string> = {
    moss: "#1D2F10",
    copper: "#3E230C",
    citrus: "#2E2306",
  };
  return (
    <div
      ref={ref}
      className="reveal card group hover:-translate-y-1 transition-transform"
      style={{
        background: "var(--surface-solid)",
        ...(highlight && {
          borderColor: "var(--primary)",
          boxShadow: "0 8px 32px -8px var(--primary-glow)",
        }),
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: bg[tone], color: fg[tone] }}
        >
          <Icon size={20} />
        </div>
        {highlight && (
          <span
            className="chip"
            style={{
              background: "var(--primary)",
              color: "white",
              fontSize: "0.55rem",
              padding: "0.2rem 0.5rem",
            }}
          >
            ÚNICO
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Diferenciador — reparto entre socios
// ---------------------------------------------------------------------------
function SociosHighlight() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="socios" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <IconSparkles size={12} /> Solo aquí
          </div>
          <h2
            className="h2-display mt-4"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            Reparto real <span className="h2-em">entre socios</span> de la finca
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            El problema real de las fincas familiares no es la vaca — es{" "}
            <strong className="text-fg">quién puso, cuánto y quién le debe a quién.</strong>{" "}
            Elija el modo de reparto según el gasto:
          </p>
          <div className="mt-6 space-y-3">
            <RepartoBullet tone="primary" title="Por participación (%)" desc="Cada socio paga según su porcentaje de propiedad." />
            <RepartoBullet tone="accent" title="Por cabezas" desc="El gasto se divide entre los propietarios de los animales." />
            <RepartoBullet tone="muted" title="Partes iguales" desc="Entre los participantes que usted elija." />
          </div>
          <p className="mt-6 text-sm text-muted">
            Al final, la app le muestra{" "}
            <strong className="text-fg">quién debe qué a quién</strong> — sin
            calculadoras ni discusiones.
          </p>
        </div>

        <div className="card" style={{ background: "var(--surface-solid)", padding: "1.5rem" }}>
          <div className="eyebrow mb-4">Ejemplo: vacunas $1.200.000</div>
          <div className="space-y-3">
            <DebtRow name="Orlando" pct={25} owes={300000} paid />
            <DebtRow name="Camila" pct={25} owes={300000} paid={false} />
            <DebtRow name="Nicolás" pct={25} owes={300000} paid />
            <DebtRow name="Rafael" pct={25} owes={300000} paid={false} pagador />
          </div>
          <div
            className="mt-4 pt-4 border-t border-rule text-xs font-mono flex items-center justify-between"
            style={{ color: "var(--muted)" }}
          >
            <span>Total pendiente hacia Rafael</span>
            <span className="text-danger font-semibold">$300.000</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RepartoBullet({ tone, title, desc }: { tone: "primary" | "accent" | "muted"; title: string; desc: string }) {
  const colors: Record<typeof tone, string> = {
    primary: "var(--primary)",
    accent: "var(--accent)",
    muted: "var(--muted)",
  };
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-2 h-2 rounded-full mt-2 shrink-0"
        style={{ background: colors[tone], boxShadow: `0 0 8px ${colors[tone]}` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function DebtRow({
  name, pct, owes, paid, pagador,
}: { name: string; pct: number; owes: number; paid: boolean; pagador?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-mono font-semibold shrink-0"
        style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium truncate flex items-center gap-1.5">
            {name}
            {pagador && (
              <span className="chip ghost" style={{ fontSize: "0.55rem", padding: "0.1rem 0.4rem" }}>pagó</span>
            )}
          </span>
          <span className="text-xs font-mono tabular-nums text-muted shrink-0">{pct}%</span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-xs font-mono tabular-nums">${owes.toLocaleString("es-CO")}</span>
          {pagador ? null : paid ? (
            <span className="chip" style={{ background: "var(--primary-soft)", color: "var(--primary)", fontSize: "0.55rem" }}>PAGADO</span>
          ) : (
            <span className="chip" style={{ background: "rgba(217,83,79,0.12)", color: "var(--danger)", fontSize: "0.55rem" }}>DEBE</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Field Ready — diseñada para el potrero (offline)
// ---------------------------------------------------------------------------
function FieldReady() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="campo" className="relative z-10 py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(34, 64, 42, 0.06) 20%, rgba(34, 64, 42, 0.06) 80%, transparent 100%)",
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        <div ref={ref} className="reveal grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div>
            <div className="eyebrow">En campo</div>
            <h2
              className="h2-display mt-4"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
            >
              Hecha para el <span className="h2-em">potrero</span>,<br className="hidden md:block" /> no para la oficina
            </h2>
            <p className="mt-5 text-muted leading-relaxed max-w-lg">
              La app funciona en el celular como si fuera nativa. Diseñada para
              trabajar cuando la señal se cae y sincronizar sola cuando vuelve.
            </p>

            <div className="mt-8 space-y-4">
              <FieldStep n="1" title="Registre en el corral" desc="Peso, vacuna, nacimiento — con un tap." icon={<IconScale size={16} />} />
              <FieldStep n="2" title="Trabaje sin señal" desc="La app guarda todo localmente." icon={<IconLock size={16} />} />
              <FieldStep n="3" title="Sincroniza sola" desc="Cuando vuelve el internet, sube a la nube." icon={<IconArrowUp size={16} />} />
              <FieldStep n="4" title="Todos ven al instante" desc="Los otros socios reciben los cambios en tiempo real." icon={<IconSparkles size={16} />} />
            </div>
          </div>

          <div className="relative">
            <div className="photo-card aspect-[4/5] max-w-md mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTO_GANADERO} alt="Ganadero en el potrero" loading="lazy" />
              <div className="photo-overlay" />
              <div className="photo-content">
                <div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] opacity-80 mb-1.5">
                  Modo campo
                </div>
                <div className="text-lg md:text-xl font-serif font-semibold leading-tight tracking-tight">
                  Registre desde el potrero.<br />
                  Sin instalación, sin señal.
                </div>
              </div>
            </div>

            {/* Badge offline flotante */}
            <div
              className="absolute -top-4 -right-4 md:-right-8 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "white",
                border: "1px solid var(--rule)",
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.20)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l22 22" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-mono text-muted uppercase tracking-widest">Offline</div>
                <div className="text-sm font-semibold">Sigue funcionando</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldStep({ n, title, desc, icon }: { n: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--primary-soft), rgba(255,255,255,0.7))",
          border: "1px solid var(--rule)",
          color: "var(--primary)",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[0.6rem] font-mono text-subtle">{n}</span>
          <span className="text-base font-semibold">{title}</span>
        </div>
        <div className="text-sm text-muted mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Asistente IA — próximamente
// ---------------------------------------------------------------------------
function AIAssistantTeaser() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="ia" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div ref={ref} className="reveal grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <IconSparkles size={12} /> Próximamente
          </div>
          <h2
            className="h2-display mt-4"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            Asistente <span className="h2-em">IA</span> MiFinca
          </h2>
          <p className="mt-4 text-muted leading-relaxed max-w-lg">
            Un cerebro que analiza los datos de su finca sin que usted abra un
            Excel. Pregúntele en español y le responde con datos reales.
          </p>
          <ul className="mt-6 space-y-3">
            <AIBullet>&ldquo;¿Cuáles vacas están próximas a parir este mes?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿En qué me gasté más este trimestre?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿Cuál es la vaca más rentable del hato?&rdquo;</AIBullet>
            <AIBullet>&ldquo;¿Qué animales están perdiendo peso?&rdquo;</AIBullet>
          </ul>
          <div className="mt-8 flex items-center gap-3">
            <span
              className="chip"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
              }}
            >
              <span className="dot" /> Listo Q1 2027
            </span>
            <span className="text-xs text-muted">Incluido en el plan Ganadero y Hacienda</span>
          </div>
        </div>

        <div
          className="card relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, var(--surface-solid) 0%, rgba(255, 247, 230, 0.4) 100%)",
            padding: "1.5rem",
            boxShadow: "0 20px 60px -20px var(--primary-glow)",
          }}
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-rule">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                color: "white",
              }}
            >
              <IconSparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">MiFinca IA</div>
              <div className="text-[0.65rem] text-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Analizando su hato
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="chat-bubble chat-user">
              Hola, ¿cuáles vacas debo revisar esta semana?
            </div>
            <div className="chat-bubble chat-ai">
              Tres cosas urgentes:
              <br />• <strong>V12</strong> lleva 3 meses sin ganar peso.
              <br />• <strong>N4</strong> tiene chequeo de preñez el jueves.
              <br />• <strong>V07</strong> debe recibir refuerzo de aftosa mañana.
            </div>
            <div className="chat-bubble chat-user">¿Cuánto costó la sanidad en junio?</div>
            <div className="chat-bubble chat-ai">
              <strong>$1.840.000</strong> — 32% más que en mayo. El aumento
              viene de dos compras de antiparasitarios. ¿Le hago un desglose por animal?
            </div>
            <div className="chat-bubble chat-ai" style={{ padding: "0.55rem 0.9rem" }}>
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
      <span
        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}
      />
      <span className="text-sm text-muted italic">{children}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
//  Cédula digital / QR por animal
// ---------------------------------------------------------------------------
function AnimalCedulaTeaser() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div
          className="card relative"
          style={{
            background: "var(--surface-solid)",
            padding: "1.5rem",
            boxShadow: "0 20px 60px -20px rgba(34, 64, 42, 0.20)",
          }}
        >
          <div className="grid grid-cols-[1fr_130px] gap-4 items-start">
            <div>
              <div className="text-[0.6rem] font-mono uppercase tracking-widest text-accent">
                Cédula digital · V12
              </div>
              <div className="mt-1 text-xl font-serif font-semibold">Vaca &ldquo;Estrella&rdquo;</div>
              <div className="text-xs text-muted mt-0.5">Girolando · 4 años · Las Delicias</div>

              <dl className="mt-4 space-y-2 text-sm">
                <FieldPair label="Dueño" value="Rafael Rincón" />
                <FieldPair label="Registrada" value="2024-03-14" />
                <FieldPair label="Último peso" value="420 kg · hace 3 días" />
                <FieldPair label="Última vacuna" value="Aftosa · 2026-07-20" />
                <FieldPair label="Preñada" value="Sí · parto FPP 2026-11-08" />
              </dl>
            </div>
            <QRCode />
          </div>
          <div
            className="mt-5 pt-4 border-t border-rule flex items-center justify-between"
          >
            <div className="text-[0.65rem] text-subtle">
              mifinca.app/animal/<span className="font-mono">v12-x9k2</span>
            </div>
            <span
              className="chip"
              style={{
                background: "var(--primary-soft)",
                color: "var(--primary)",
                fontSize: "0.6rem",
              }}
            >
              <span className="dot" /> verificado
            </span>
          </div>
        </div>

        <div>
          <div className="eyebrow flex items-center gap-2">
            <IconSparkles size={12} /> Próximamente
          </div>
          <h2
            className="h2-display mt-4"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            Cédula <span className="h2-em">digital</span> por animal
          </h2>
          <p className="mt-4 text-muted leading-relaxed max-w-lg">
            Cada animal tiene su propio QR único con toda su hoja de vida.
            Muéstrelo al veterinario, al comprador, al inspector — sin papeles,
            sin dudas de identidad.
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span><strong>QR único</strong> por cabeza — imposible falsificar</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span><strong>Historial verificable</strong>: sanidad, peso, reproducción</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span><strong>Ideal para venta</strong> — pásele el QR al comprador</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
              <span><strong>Trazabilidad real</strong> — no en cuaderno</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FieldPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[0.65rem] text-subtle font-mono uppercase tracking-widest">{label}</dt>
      <dd className="text-xs text-fg font-medium text-right truncate">{value}</dd>
    </div>
  );
}

function QRCode() {
  // Patrón QR falso pero visualmente convincente. 21x21.
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
    <div className="qr" style={{ maxWidth: 130 }}>
      {cells.map((c, i) => (
        <div key={i} className={c === "1" ? "on" : ""} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Mockup showcase
// ---------------------------------------------------------------------------
function MockupShowcase() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div ref={ref} className="reveal text-center mb-14">
        <div className="eyebrow">En acción</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)" }}
        >
          Toda la operación,<br className="hidden md:block" />{" "}
          <span className="h2-em">en un tap</span>
        </h2>
        <p className="mt-5 text-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Layouts mobile-first, con swipes, tarjetas grandes y navegación por
          gestos. Todo lo que necesita está en el bolsillo.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <PhoneHato />
        <PhoneGastos />
        <PhoneActividades />
      </div>
    </section>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-frame max-w-[280px] mx-auto md:max-w-none">
      <div className="phone-screen">
        <div className="phone-status text-fg">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1.5 rounded-sm bg-fg/70" />
            <span className="w-3 h-1.5 rounded-sm bg-fg/50" />
            <span className="w-4 h-2 border border-fg/60 rounded-sm relative">
              <span className="absolute inset-0.5 bg-fg/70 rounded-sm" style={{ width: "72%" }} />
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function PhoneHato() {
  return (
    <PhoneShell>
      <div
        className="phone-content"
        style={{ background: "linear-gradient(180deg, #E4EED4 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[0.55rem] font-mono uppercase tracking-widest text-fg/50">Hato</div>
            <div className="display" style={{ fontSize: "1.75rem" }}>147</div>
            <div className="text-[0.6rem] text-fg/60 -mt-1">animales activos</div>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#22402A", color: "white" }}>
            <IconCow size={16} />
          </div>
        </div>
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(34,64,42,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full text-[0.55rem] font-mono font-bold flex items-center justify-center" style={{ background: "#22402A", color: "white" }}>V2</div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.72rem] font-semibold truncate">Vaca #V2</div>
              <div className="text-[0.55rem] text-fg/60">Girolando · Potrero 1</div>
            </div>
            <div className="text-[0.6rem] font-mono text-fg/70">420kg</div>
          </div>
        </div>
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(34,64,42,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full text-[0.55rem] font-mono font-bold flex items-center justify-center" style={{ background: "#A66E3A", color: "white" }}>T7</div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.72rem] font-semibold truncate">Ternero #T7</div>
              <div className="text-[0.55rem] text-fg/60">3 meses · Cebú</div>
            </div>
            <div className="text-[0.6rem] font-mono text-fg/70">85kg</div>
          </div>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(34,64,42,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full text-[0.55rem] font-mono font-bold flex items-center justify-center" style={{ background: "#22402A", color: "white" }}>N4</div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.72rem] font-semibold truncate">Novilla #N4</div>
              <div className="text-[0.55rem] text-fg/60">Holstein · Potrero 3</div>
            </div>
            <div className="text-[0.6rem] font-mono text-fg/70">310kg</div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

function PhoneGastos() {
  return (
    <PhoneShell>
      <div
        className="phone-content"
        style={{ background: "linear-gradient(180deg, #F6EFC2 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[0.55rem] font-mono uppercase tracking-widest text-fg/50">Gastos · Sep</div>
            <div className="display" style={{ fontSize: "1.6rem" }}>$3.2M</div>
            <div className="text-[0.6rem] text-fg/60 -mt-1">de $5M presupuesto</div>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#A66E3A", color: "white" }}>
            <IconMoney size={15} />
          </div>
        </div>
        <div className="flex items-end gap-1.5 mb-3 h-14 px-1">
          {[35, 55, 42, 80, 62, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background: i === 5 ? "#22402A" : "rgba(34, 64, 42, 0.32)",
              }}
            />
          ))}
        </div>
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(34,64,42,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold truncate">Vacunas Q3</div>
              <div className="text-[0.55rem] text-fg/60">Sanidad · Rafael pagó</div>
            </div>
            <div className="text-[0.72rem] font-mono font-semibold shrink-0">$1.2M</div>
          </div>
          <div className="mt-1.5 flex gap-1">
            {["OR","CA","NI","RA"].map((i, ix) => (
              <span key={i} className="text-[0.5rem] font-mono rounded-full px-1.5 py-0.5" style={{ background: ix < 2 ? "rgba(34,64,42,0.15)" : "rgba(181,75,42,0.15)", color: ix < 2 ? "#22402A" : "#B54B2A" }}>{i}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(34,64,42,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold truncate">Sal + concentrado</div>
              <div className="text-[0.55rem] text-fg/60">Alimentación · 4 socios</div>
            </div>
            <div className="text-[0.72rem] font-mono font-semibold shrink-0">$680k</div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

function PhoneActividades() {
  return (
    <PhoneShell>
      <div
        className="phone-content"
        style={{ background: "linear-gradient(180deg, #F8E1C1 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[0.55rem] font-mono uppercase tracking-widest text-fg/50">Actividades</div>
            <div className="display" style={{ fontSize: "1.6rem" }}>8</div>
            <div className="text-[0.6rem] text-fg/60 -mt-1"><span className="text-danger font-semibold">2 vencidas</span></div>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#A66E3A", color: "white" }}>
            <IconTask size={15} />
          </div>
        </div>
        <TaskRow priority="alta" title="Vacuna aftosa" sub="Vencida ayer" done={false} danger />
        <TaskRow priority="media" title="Pesaje mensual" sub="Hoy" done={false} />
        <TaskRow priority="baja" title="Reparación cerca" sub="Mañana" done={true} />
        <TaskRow priority="media" title="Ordeño turno tarde" sub="Hoy · 5pm" done={false} />
        <TaskRow priority="alta" title="Diagnóstico preñez" sub="Jueves" done={false} />
      </div>
    </PhoneShell>
  );
}

function TaskRow({
  title, sub, done, danger,
}: { priority: "alta" | "media" | "baja"; title: string; sub: string; done: boolean; danger?: boolean }) {
  return (
    <div className="rounded-lg px-2.5 py-2 mb-1.5 flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(34,64,42,0.06)" }}>
      <div
        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
        style={{
          background: done ? "#22402A" : "transparent",
          border: done ? "none" : "1.5px solid rgba(34,64,42,0.35)",
        }}
      >
        {done && <IconCheck size={10} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[0.7rem] font-semibold truncate"
          style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}
        >
          {title}
        </div>
        <div className={`text-[0.55rem] ${danger ? "text-danger font-semibold" : "text-fg/55"}`}>{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  How it works
// ---------------------------------------------------------------------------
function HowItWorks() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-12">
        <div className="eyebrow">Cómo empezar</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          Menos de <span className="h2-em">2 minutos</span>
        </h2>
      </div>
      <div className="relative">
        <div
          className="hidden md:block absolute left-[27px] top-8 bottom-8 w-[2px]"
          style={{ background: "var(--rule)" }}
        />
        <div className="space-y-5">
          <StepRow n="1" title="Cree su cuenta" desc="Email y contraseña. Sin instalación." />
          <StepRow n="2" title="Registre su finca" desc="Nombre, zona horaria y listo. Cada finca queda aislada." />
          <StepRow n="3" title="Agregue socios y animales" desc="Invite propietarios, defina su participación y empiece a registrar cabezas." />
          <StepRow n="4" title="Controle su operación" desc="Sanidad, gastos, tareas — todo en un solo lugar, actualizado en tiempo real." />
        </div>
      </div>
    </section>
  );
}

function StepRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center font-mono text-xl font-semibold shrink-0 relative z-10"
        style={{
          background: "var(--primary-soft)",
          color: "var(--primary)",
          border: "2px solid var(--surface-solid)",
          boxShadow: "0 4px 12px -4px var(--primary-glow)",
        }}
      >
        {n}
      </div>
      <div className="flex-1 min-w-0 pt-3">
        <h4 className="text-lg font-semibold tracking-tight">{title}</h4>
        <p className="text-sm text-muted mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Pricing
// ---------------------------------------------------------------------------
function Pricing({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  const tiers = [
    {
      name: "Ranchero",
      badge: "Gratis para siempre",
      price: "0",
      unit: "COP/mes",
      desc: "Ideal para arrancar y probar con una finca pequeña.",
      features: [
        "Hasta 15 animales",
        "1 usuario",
        "Sanidad, gastos y tareas",
        "1 finca",
      ],
      cta: "Empezar gratis",
      featured: false,
    },
    {
      name: "Ganadero",
      badge: "Más popular",
      price: "59.000",
      unit: "COP/mes",
      desc: "Para fincas familiares con socios y actividad regular.",
      features: [
        "Hasta 200 animales",
        "5 usuarios",
        "Reparto entre socios",
        "Asistente IA (próx.)",
        "Alertas por WhatsApp (próx.)",
      ],
      cta: "Empezar prueba",
      featured: true,
    },
    {
      name: "Hacienda",
      badge: "Grandes operaciones",
      price: "149.000",
      unit: "COP/mes",
      desc: "Sin límites, para haciendas y grupos de fincas.",
      features: [
        "Animales ilimitados",
        "Usuarios ilimitados",
        "Múltiples fincas",
        "Cédula digital + API (próx.)",
        "Backups y soporte prioritario",
      ],
      cta: "Hablar con ventas",
      featured: false,
    },
  ];
  return (
    <section id="precios" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-12">
        <div className="eyebrow">Precios</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Simple. <span className="h2-em">Crece</span> con usted.
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Empiece gratis. Solo paga cuando su operación necesita más.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="card relative flex flex-col"
            style={{
              background: "var(--surface-solid)",
              ...(t.featured && {
                borderColor: "var(--primary)",
                boxShadow: "0 12px 40px -12px var(--primary-glow)",
                transform: "scale(1.02)",
              }),
            }}
          >
            {t.featured && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.6rem] font-mono uppercase tracking-[0.14em]"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {t.badge}
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-serif font-semibold">{t.name}</h3>
              {!t.featured && (
                <div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] text-subtle mt-1">
                  {t.badge}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif font-bold">${t.price}</span>
              <span className="text-xs text-muted">{t.unit}</span>
            </div>
            <p className="text-sm text-muted mt-2">{t.desc}</p>
            <ul className="mt-5 space-y-2 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <IconCheck size={14} className="mt-0.5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              className={t.featured ? "btn btn-primary mt-6 justify-center" : "btn btn-ghost mt-6 justify-center"}
              onClick={onLogin}
            >
              {t.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-[0.7rem] font-mono text-subtle mt-6">
        Los planes pagos están en preparación. Por ahora todo el uso es gratuito.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Testimonials
// ---------------------------------------------------------------------------
function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  const items = [
    {
      name: "Orlando R.",
      role: "Propietario · Boyacá",
      quote:
        "El cuaderno se me perdía. Ahora todo queda registrado desde el celular y mis hijos que trabajan la finca ven lo mismo que yo.",
      initials: "OR",
      tone: "moss",
    },
    {
      name: "Camila V.",
      role: "Administradora · Cesar",
      quote:
        "Lo mejor es el reparto entre socios. Antes armábamos discusiones por los gastos. Ahora abrimos la app y se acaba el debate.",
      initials: "CV",
      tone: "citrus",
    },
    {
      name: "Nicolás M.",
      role: "Veterinario · Antioquia",
      quote:
        "Reviso 4 fincas. Tener el historial de sanidad de cada animal a un tap me ahorra dos horas de teléfono al día.",
      initials: "NM",
      tone: "copper",
    },
  ];
  const bg: Record<string, string> = {
    moss: "linear-gradient(135deg, #E4EED4, #A9C177)",
    citrus: "linear-gradient(135deg, #F6EFC2, #DFC85E)",
    copper: "linear-gradient(135deg, #F8E1C1, #E4A46A)",
  };
  const ink: Record<string, string> = {
    moss: "#1D2F10",
    citrus: "#2E2306",
    copper: "#3E230C",
  };
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-12">
        <div className="eyebrow">Lo que dicen</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Ganaderos que ya <span className="h2-em">dejaron el cuaderno</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {items.map((t) => (
          <div
            key={t.name}
            className="card relative"
            style={{ background: "var(--surface-solid)", padding: "1.5rem" }}
          >
            <div
              className="absolute -top-4 -left-2 text-6xl font-serif italic opacity-20 leading-none pointer-events-none"
              style={{ color: "var(--accent)" }}
            >
              &ldquo;
            </div>
            <p className="text-sm leading-relaxed text-fg relative">{t.quote}</p>
            <div className="mt-5 pt-4 border-t border-rule flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[0.65rem] font-mono font-bold"
                style={{ background: bg[t.tone], color: ink[t.tone] }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  FAQ
// ---------------------------------------------------------------------------
function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  const qs = [
    {
      q: "¿Cuánto cuesta usar MiFinca?",
      a: "Nada para arrancar. El plan Ranchero es gratis para siempre (hasta 15 animales). Los planes pagos se activarán próximamente para operaciones más grandes.",
    },
    {
      q: "¿Necesito instalar la app?",
      a: "No. Se abre en cualquier navegador del celular o computador. Funciona igual que una app nativa — hasta puede guardarla en la pantalla de inicio.",
    },
    {
      q: "¿Sirve si no tengo señal en el potrero?",
      a: "Sí. La app está preparada para trabajar con conexión intermitente. Puede consultar información offline y los registros se sincronizan automáticamente al recuperar señal.",
    },
    {
      q: "¿Cuántas fincas puedo tener?",
      a: "En Ranchero y Ganadero, 1 finca. En Hacienda es ilimitado — ideal si administra un grupo de fincas.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Cada finca tiene aislamiento estricto por RLS en Supabase (Postgres). Solo los usuarios miembros pueden ver los datos de esa finca. Backups automáticos diarios.",
    },
    {
      q: "¿Puedo invitar a mis socios y trabajadores?",
      a: "Sí. Registra a cada socio con su email y su porcentaje de participación. Los trabajadores pueden entrar como operarios y registrar desde el potrero.",
    },
    {
      q: "¿Puedo migrar mis datos de Excel?",
      a: "Sí. Escríbanos con su Excel y le ayudamos con la importación inicial sin costo.",
    },
    {
      q: "¿Sirve para ganadería doble propósito?",
      a: "Sí. La app maneja carne, leche o mixto. Cada vaca tiene su historial completo y la producción de leche se registra por ordeño.",
    },
    {
      q: "¿Qué pasa si cancelo?",
      a: "Puede descargar sus datos en cualquier momento. Nunca los perdemos. Al volver, todo queda como lo dejó.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-10">
        <div className="eyebrow">Preguntas frecuentes</div>
        <h2
          className="h2-display mt-4"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          ¿Alguna <span className="h2-em">duda</span>?
        </h2>
      </div>
      <div className="space-y-2">
        {qs.map((item, i) => (
          <div key={item.q} className="card" style={{ background: "var(--surface-solid)", padding: "0" }}>
            <button
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-sm md:text-base font-semibold">{item.q}</span>
              <span
                className="text-lg text-muted transition-transform"
                style={{ transform: open === i ? "rotate(45deg)" : "none" }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm text-muted leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Login embed
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
    if (!email) {
      setError("Escribe tu email.");
      return;
    }
    if (mode !== "reset" && !password) {
      setError("Escribe tu contraseña.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
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
    <section
      id="ingreso"
      className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24"
    >
      <div ref={ref} className="reveal grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="eyebrow">Ingreso</div>
          <h2
            className="h2-display mt-4"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
          >
            {mode === "login"
              ? "Entre a su finca"
              : mode === "signup"
              ? "Cree su cuenta"
              : "Recupere su contraseña"}
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            {mode === "login"
              ? "Acceda a su operación desde cualquier dispositivo."
              : mode === "signup"
              ? "En 2 minutos tiene su finca creada y lista para usar."
              : "Le enviamos un enlace al correo para elegir una nueva."}
          </p>
          <ul className="mt-6 space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted">
              <IconCheck size={14} className="text-primary" /> Cifrado extremo a extremo
            </li>
            <li className="flex items-center gap-2 text-sm text-muted">
              <IconCheck size={14} className="text-primary" /> Sesión persistente
            </li>
            <li className="flex items-center gap-2 text-sm text-muted">
              <IconCheck size={14} className="text-primary" /> Aislamiento estricto por finca
            </li>
          </ul>
        </div>

        <div
          className="card"
          style={{
            background: "var(--surface-solid)",
            boxShadow: "0 20px 60px -20px var(--primary-glow)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow flex items-center gap-1.5">
                <IconUser size={11} /> Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
            {mode !== "reset" && (
              <div className="flex flex-col gap-1">
                <span className="eyebrow flex items-center gap-1.5">
                  <IconLock size={11} /> Contraseña
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Al menos 8 caracteres" : "Tu contraseña"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}
            {error && (
              <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm bg-primary-soft/40 px-3 py-2 rounded-lg">
                {info}
              </div>
            )}
            <button type="submit" className="btn btn-primary justify-center" disabled={loading}>
              <IconUser size={14} />
              {loading
                ? "…"
                : mode === "login"
                ? "Entrar"
                : mode === "signup"
                ? "Crear cuenta"
                : "Enviar enlace"}
            </button>
            {mode === "login" && (
              <button
                type="button"
                className="text-[0.72rem] text-subtle hover:text-fg underline underline-offset-4 self-center"
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setMode("reset");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost justify-center"
              onClick={() => {
                setError(null);
                setInfo(null);
                setMode(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : mode === "signup"
                ? "Ya tengo cuenta"
                : "Volver a iniciar sesión"}
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
//  Final CTA con foto de fondo
// ---------------------------------------------------------------------------
function FinalCTA({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <div
        ref={ref}
        className="reveal relative overflow-hidden rounded-3xl"
        style={{
          boxShadow: "0 40px 100px -20px rgba(34, 64, 42, 0.35)",
        }}
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_CAMPO_ATARDECER}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 60%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 64, 42, 0.85) 0%, rgba(166, 110, 58, 0.65) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 text-center px-6 py-16 md:py-24 text-white">
          <div
            className="live-chip inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.68rem] font-mono uppercase tracking-[0.14em] mb-6"
            style={{
              background: "rgba(255, 255, 255, 0.16)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F8E1C1", boxShadow: "0 0 8px #F8E1C1" }} />
            Sin permanencia · Sin tarjeta
          </div>
          <h3
            className="font-serif tracking-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              textShadow: "0 2px 12px rgba(0,0,0,0.35)",
            }}
          >
            Su finca merece <span className="display-em">control</span>
          </h3>
          <p
            className="mt-4 max-w-xl mx-auto text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Empiece hoy, en menos de 2 minutos. Sin instalación, sin tarjeta de
            crédito y sin costo.
          </p>
          <button
            className="btn mt-8"
            onClick={onLogin}
            style={{
              padding: "1rem 2.2rem",
              fontSize: "1rem",
              background: "white",
              color: "var(--primary)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.35)",
              fontWeight: 700,
            }}
          >
            <IconArrowUp size={14} />
            Crear mi cuenta gratis
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
    <footer className="relative z-10 border-t border-rule/60 mt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="grid md:grid-cols-4 gap-6 md:gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "var(--surface-solid)",
                  border: "1px solid var(--rule)",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="MiFinca"
                  width={40}
                  height={40}
                  sizes="40px"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-base font-serif font-semibold tracking-tight">
                MiFinca
              </div>
            </div>
            <p className="mt-4 text-sm text-muted max-w-md leading-relaxed">
              La plataforma de gestión ganadera para fincas de Colombia y
              Latinoamérica. Hato, sanidad, gastos entre socios — todo en un
              solo lugar.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-3">Producto</div>
            <ul className="space-y-2 text-sm">
              <FooterLink onClick={() => scrollToId("funciones")}>Funciones</FooterLink>
              <FooterLink onClick={() => scrollToId("socios")}>Reparto socios</FooterLink>
              <FooterLink onClick={() => scrollToId("campo")}>En el campo</FooterLink>
              <FooterLink onClick={() => scrollToId("ia")}>Asistente IA</FooterLink>
              <FooterLink onClick={() => scrollToId("precios")}>Precios</FooterLink>
              <FooterLink onClick={() => scrollToId("faq")}>FAQ</FooterLink>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Cuenta</div>
            <ul className="space-y-2 text-sm">
              <FooterLink onClick={() => scrollToId("ingreso")}>Iniciar sesión</FooterLink>
              <FooterLink onClick={() => scrollToId("ingreso")}>Crear cuenta</FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-rule/60 flex items-center justify-between flex-wrap gap-2 text-[0.72rem] text-subtle font-mono">
          <div>MiFinca · {new Date().getFullYear()}</div>
          <div>Hecho en Colombia</div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        className="text-muted hover:text-fg transition text-left"
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}
