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
  IconMilk,
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
import {
  ArtActividades,
  ArtHato,
  ArtGastos,
} from "./HomeArt";

interface Props {
  onLogin: () => void;
}

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
    <div className="min-h-screen relative overflow-x-hidden">
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .reveal.in-view { opacity: 1; transform: none; }
        .reveal-delay-1 { transition-delay: 0.08s; }
        .reveal-delay-2 { transition-delay: 0.16s; }
        .reveal-delay-3 { transition-delay: 0.24s; }
        .device-frame {
          position: relative;
          border-radius: 22px;
          background: var(--surface-solid);
          border: 1px solid var(--rule);
          box-shadow: 0 40px 100px -20px var(--primary-glow), 0 8px 32px -12px rgba(0,0,0,0.12);
          padding: 14px;
        }
        .device-frame::before {
          content: "";
          position: absolute;
          top: 8px; left: 50%;
          transform: translateX(-50%);
          width: 60px; height: 5px;
          background: var(--rule);
          border-radius: 3px;
        }
        .kbd {
          font-family: var(--font-geist-mono), monospace;
          font-size: 0.65rem;
          background: var(--surface-2);
          border: 1px solid var(--rule);
          border-radius: 4px;
          padding: 2px 6px;
        }
      `}</style>

      <div className="app-bg" aria-hidden />
      <div className="app-glow-1" aria-hidden />
      <div className="app-glow-2" aria-hidden />

      <TopNav onLogin={onLogin} />
      <Hero onLogin={onLogin} />
      <Stats />
      <FeaturesGrid />
      <SociosHighlight />
      <MockupShowcase />
      <HowItWorks />
      <Pricing onLogin={onLogin} />
      <FAQ />
      <LoginEmbed />
      <FinalCTA onLogin={onLogin} />
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Nav
// ---------------------------------------------------------------------------
function TopNav({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "funciones", label: "Funciones" },
    { id: "socios", label: "Reparto entre socios" },
    { id: "precios", label: "Precios" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b transition-all"
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
            className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
            style={{
              background: "var(--surface-solid)",
              border: "1px solid var(--rule)",
            }}
          >
            <Image
              src="/logo.png"
              alt="MiFinca"
              width={36}
              height={36}
              sizes="36px"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-start leading-none">
            <div className="text-sm md:text-base font-serif font-semibold tracking-tight">
              MiFinca
            </div>
            <div className="text-[0.55rem] md:text-[0.6rem] text-accent font-mono tracking-[0.14em] uppercase mt-0.5">
              Gestión ganadera
            </div>
          </div>
        </button>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              className="text-sm text-muted hover:text-fg px-3 py-1.5 rounded-lg hover:bg-surface-2 transition"
              onClick={() => scrollToId(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost hidden sm:inline-flex"
            onClick={() => scrollToId("ingreso")}
          >
            Iniciar sesión
          </button>
          <button className="btn btn-primary" onClick={onLogin}>
            Empieza gratis
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
//  Hero
// ---------------------------------------------------------------------------
function Hero({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-24">
      <div ref={ref} className="reveal grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.68rem] font-mono uppercase tracking-[0.14em] mb-6"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
              border: "1px solid var(--rule)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Nuevo · Ahora multi-finca
          </div>
          <h1
            className="font-serif tracking-tight leading-[1.05]"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
          >
            La forma más{" "}
            <span
              style={{
                background: "linear-gradient(120deg, var(--primary), var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              elegante
            </span>{" "}
            de controlar tu ganadería
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted max-w-xl leading-relaxed">
            Registra tu finca, controla tu hato, tu sanidad y tus gastos con
            reparto real entre socios. Todo desde el celular. Diseñado para
            ganaderos de Colombia y Latinoamérica.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <button
              className="btn btn-primary"
              onClick={onLogin}
              style={{ padding: "0.9rem 1.75rem", fontSize: "0.95rem" }}
            >
              Empieza gratis
              <IconArrowUp size={13} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => scrollToId("funciones")}
              style={{ padding: "0.9rem 1.75rem", fontSize: "0.95rem" }}
            >
              Ver funciones
            </button>
          </div>
          <div className="mt-6 flex items-center gap-4 text-[0.72rem] text-subtle flex-wrap">
            <span className="flex items-center gap-1.5">
              <IconCheck size={12} /> Sin instalación
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={12} /> Sin permanencia
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={12} /> En 2 minutos
            </span>
          </div>
        </div>

        <DashboardMockup />
      </div>
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
//  Stats
// ---------------------------------------------------------------------------
function Stats() {
  const ref = useReveal<HTMLDivElement>();
  const items = [
    { label: "Modelo", value: "Multi-finca" },
    { label: "Uptime", value: "99.9%" },
    { label: "Región", value: "LATAM" },
    { label: "Enfoque", value: "Ganadería" },
  ];
  return (
    <section className="relative z-10 border-y border-rule/60 backdrop-blur-sm">
      <div ref={ref} className="reveal max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="eyebrow">{it.label}</div>
            <div className="text-lg md:text-xl font-serif font-semibold mt-1">{it.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
//  Features grid
// ---------------------------------------------------------------------------
function FeaturesGrid() {
  const ref = useReveal<HTMLDivElement>();
  const features = [
    { Icon: IconCow, title: "Hato completo", desc: "Animales por categoría, sexo, raza. Fotos, padres, historial y estado (activo, vendido, muerto).", tone: "moss" as const },
    { Icon: IconPasture, title: "Potreros", desc: "Área, capacidad, ubicación y ocupación en tiempo real. Ve cuántas cabezas hay en cada uno.", tone: "moss" as const },
    { Icon: IconHealth, title: "Sanidad al día", desc: "Vacunas, tratamientos, desparasitación y revisiones. Alertas del próximo evento y calendario.", tone: "copper" as const },
    { Icon: IconRepro, title: "Reproducción", desc: "Servicios (monta o inseminación), diagnóstico de preñez, fecha probable de parto y registro de partos.", tone: "copper" as const },
    { Icon: IconScale, title: "Control de peso", desc: "Pesajes de nacimiento, destete y periódicos. Curvas de crecimiento por animal.", tone: "moss" as const },
    { Icon: IconMilk, title: "Producción de leche", desc: "Ordeño diario (mañana y tarde) por vaca. Historial y promedio.", tone: "moss" as const },
    { Icon: IconMoney, title: "Gastos con reparto entre socios", desc: "Registra gastos y reparte entre socios (por %, cabezas o iguales). Ve deudas entre socios al instante.", tone: "citrus" as const, highlight: true },
    { Icon: IconBox, title: "Inventario", desc: "Insumos con stock, unidades, mínimos y proveedor. Movimientos de entrada y salida.", tone: "copper" as const },
    { Icon: IconTask, title: "Tareas y calendario", desc: "Actividades con prioridad, categoría y multi-asignación. Ve vencidas, próximas y hechas.", tone: "copper" as const },
    { Icon: IconUser, title: "Socios y roles", desc: "Manejo de propietarios con participación, cabezas y responsabilidades por finca.", tone: "moss" as const },
  ];
  return (
    <section id="funciones" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-12">
        <div className="eyebrow">Funciones</div>
        <h2
          className="font-serif tracking-tight mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Todo lo que necesitas para operar tu finca
        </h2>
        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Sin planillas, sin apps sueltas, sin cuadernos. Una plataforma que
          reemplaza el Excel y el WhatsApp para el control diario.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={(i % 3) + 1} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  Icon,
  title,
  desc,
  tone,
  highlight,
  delay,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tone: "moss" | "copper" | "citrus";
  highlight?: boolean;
  delay: number;
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
      className={`reveal card group hover:-translate-y-1 transition-transform ${
        delay === 1 ? "reveal-delay-1" : delay === 2 ? "reveal-delay-2" : "reveal-delay-3"
      }`}
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
            EXCLUSIVO
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Reparto entre socios (diferenciador)
// ---------------------------------------------------------------------------
function SociosHighlight() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="socios" className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <IconSparkles size={12} /> Diferenciador
          </div>
          <h2
            className="font-serif tracking-tight mt-3"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
          >
            Reparto real entre socios de finca
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            La única plataforma que resuelve el problema real de las fincas familiares:
            <strong className="text-fg"> quién puso, cuánto, y quién le debe a quién.</strong> Elige el
            modo de reparto según el gasto:
          </p>
          <div className="mt-6 space-y-3">
            <RepartoBullet
              tone="primary"
              title="Por participación (%)"
              desc="Cada socio paga según su porcentaje de propiedad de la finca."
            />
            <RepartoBullet
              tone="accent"
              title="Por cabezas"
              desc="El gasto se divide entre los propietarios de los animales involucrados."
            />
            <RepartoBullet
              tone="muted"
              title="Partes iguales"
              desc="Se divide entre los participantes que tú elijas para ese gasto."
            />
          </div>
          <p className="mt-6 text-sm text-muted">
            Al final, la app te muestra{" "}
            <strong className="text-fg">quién debe qué a quién</strong> — sin
            calculadoras ni discusiones.
          </p>
        </div>

        <div className="card" style={{ background: "var(--surface-solid)", padding: "1.5rem" }}>
          <div className="eyebrow mb-4">Ejemplo: gasto de $1.200.000 vacunas</div>
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

function RepartoBullet({
  tone,
  title,
  desc,
}: {
  tone: "primary" | "accent" | "muted";
  title: string;
  desc: string;
}) {
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
  name,
  pct,
  owes,
  paid,
  pagador,
}: {
  name: string;
  pct: number;
  owes: number;
  paid: boolean;
  pagador?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-mono font-semibold shrink-0"
        style={{
          background: "var(--primary-soft)",
          color: "var(--primary)",
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium truncate flex items-center gap-1.5">
            {name}
            {pagador && (
              <span className="chip ghost" style={{ fontSize: "0.55rem", padding: "0.1rem 0.4rem" }}>
                pagó
              </span>
            )}
          </span>
          <span className="text-xs font-mono tabular-nums text-muted shrink-0">
            {pct}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-xs font-mono tabular-nums">
            ${owes.toLocaleString("es-CO")}
          </span>
          {pagador ? null : paid ? (
            <span className="chip" style={{ background: "var(--primary-soft)", color: "var(--primary)", fontSize: "0.55rem" }}>
              PAGADO
            </span>
          ) : (
            <span className="chip" style={{ background: "rgba(217,83,79,0.12)", color: "var(--danger)", fontSize: "0.55rem" }}>
              DEBE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Mockup showcase (galería visual)
// ---------------------------------------------------------------------------
function MockupShowcase() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-12">
        <div className="eyebrow">En acción</div>
        <h2
          className="font-serif tracking-tight mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          Diseño hecho para el celular, en el potrero
        </h2>
        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Layouts mobile-first, con swipes, tarjetas grandes y navegación por
          gestos. Todo lo que necesitas está a un tap.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <PhoneMockup
          Art={ArtHato}
          title="Hato"
          value="147 activos"
          bg="linear-gradient(135deg, #E4EED4 0%, #A9C177 100%)"
        />
        <PhoneMockup
          Art={ArtGastos}
          title="Gastos"
          value="$3.2M este mes"
          bg="linear-gradient(135deg, #F6EFC2 0%, #DFC85E 100%)"
        />
        <PhoneMockup
          Art={ArtActividades}
          title="Actividades"
          value="8 pendientes"
          bg="linear-gradient(135deg, #F8E1C1 0%, #E4A46A 100%)"
        />
      </div>
    </section>
  );
}

function PhoneMockup({
  Art,
  title,
  value,
  bg,
}: {
  Art: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-3xl p-5 aspect-[9/16] flex flex-col justify-between relative overflow-hidden"
      style={{
        background: bg,
        color: "#1D2F10",
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.2)",
      }}
    >
      <div>
        <div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] opacity-70">
          MiFinca · {title}
        </div>
        <div className="mt-2 font-mono text-3xl font-bold">{value}</div>
      </div>
      <div className="flex justify-center items-end">
        <div className="w-32 h-32 md:w-40 md:h-40 opacity-90">
          <Art />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="h-1 w-20 rounded-full bg-fg/20" />
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
          className="font-serif tracking-tight mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          Menos de 2 minutos
        </h2>
      </div>
      <div className="relative">
        <div
          className="hidden md:block absolute left-[27px] top-8 bottom-8 w-[2px]"
          style={{ background: "var(--rule)" }}
        />
        <div className="space-y-5">
          <StepRow n="1" title="Crea tu cuenta" desc="Email y contraseña. Sin instalación." />
          <StepRow n="2" title="Registra tu finca" desc="Nombre, zona horaria y listo. Cada finca queda aislada." />
          <StepRow n="3" title="Agrega socios y animales" desc="Invita propietarios, define su participación y empieza a registrar cabezas." />
          <StepRow n="4" title="Controla tu operación" desc="Sanidad, gastos, tareas — todo en un solo lugar, actualizado en tiempo real." />
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
        "Reportes mensuales",
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
        "API (próx.)",
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
          className="font-serif tracking-tight mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          Simple. Crece contigo.
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Empieza gratis. Solo pagas cuando tu operación necesita más.
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
                style={{
                  background: "var(--primary)",
                  color: "white",
                }}
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
//  FAQ
// ---------------------------------------------------------------------------
function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  const qs = [
    {
      q: "¿Cuántas fincas puedo tener?",
      a: "En el plan Ranchero, 1. En Ganadero también 1 (con múltiples socios). En Hacienda es ilimitado — ideal si administras un grupo de fincas.",
    },
    {
      q: "¿Se puede usar en el celular?",
      a: "Sí. La app está diseñada mobile-first. Se abre en cualquier navegador del celular sin instalar nada. Funciona igual que un app nativo.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Cada finca tiene aislamiento estricto por RLS en Supabase (Postgres). Solo los usuarios miembros pueden ver los datos de esa finca. Backups automáticos diarios.",
    },
    {
      q: "¿Necesito conexión a internet?",
      a: "Para registrar cambios sí. Para consultar, la app cachea localmente los datos y funciona con conexión intermitente típica del campo.",
    },
    {
      q: "¿Puedo migrar mis datos de Excel?",
      a: "Sí. Podemos ayudarte con la migración inicial: mándanos tu Excel y hacemos la importación. Contáctanos por email.",
    },
    {
      q: "¿Qué pasa si cancelo?",
      a: "Puedes descargar tus datos en cualquier momento. Nunca los perdemos. Al volver, todo queda como lo dejaste.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div ref={ref} className="reveal text-center mb-10">
        <div className="eyebrow">Preguntas frecuentes</div>
        <h2
          className="font-serif tracking-tight mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
        >
          ¿Alguna duda?
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
            className="font-serif tracking-tight mt-3"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)" }}
          >
            {mode === "login"
              ? "Entra a tu finca"
              : mode === "signup"
              ? "Crea tu cuenta"
              : "Restablece tu contraseña"}
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            {mode === "login"
              ? "Accede a tu operación desde cualquier dispositivo."
              : mode === "signup"
              ? "En 2 minutos tienes tu finca creada y lista para usar."
              : "Te enviamos un enlace al correo para elegir una nueva."}
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
//  Final CTA
// ---------------------------------------------------------------------------
function FinalCTA({ onLogin }: { onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <div
        ref={ref}
        className="reveal card text-center"
        style={{
          padding: "clamp(1.75rem, 5vw, 3rem)",
          background:
            "linear-gradient(135deg, var(--surface-solid) 0%, var(--primary-soft) 100%)",
          border: "1px solid var(--primary)",
          boxShadow: "0 30px 80px -20px var(--primary-glow)",
        }}
      >
        <h3
          className="font-serif tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
        >
          Empieza a controlar tu finca hoy
        </h3>
        <p className="text-muted mt-3 max-w-xl mx-auto text-sm md:text-base">
          Sin instalación, sin permanencia, sin tarjeta de crédito. En 2
          minutos ya estás registrando animales.
        </p>
        <button
          className="btn btn-primary mt-6"
          onClick={onLogin}
          style={{ padding: "0.9rem 2rem", fontSize: "0.95rem" }}
        >
          <IconArrowUp size={14} />
          Crear mi cuenta gratis
        </button>
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
                className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  background: "var(--surface-solid)",
                  border: "1px solid var(--rule)",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="MiFinca"
                  width={36}
                  height={36}
                  sizes="36px"
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
          <div>Hecho en Colombia 🇨🇴</div>
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
