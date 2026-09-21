"use client";

import Image from "next/image";
import {
  IconCow,
  IconHealth,
  IconMoney,
  IconCheck,
  IconArrowUp,
} from "./icons";

interface Props {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: Props) {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="app-bg" aria-hidden />
      <div className="app-glow-1" aria-hidden />
      <div className="app-glow-2" aria-hidden />

      {/* Nav superior */}
      <header className="relative z-10 border-b border-rule/60 bg-bg/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="text-base font-serif font-semibold tracking-tight leading-none">
                MiFinca
              </div>
              <div className="text-[0.6rem] text-accent font-mono tracking-[0.14em] uppercase mt-0.5">
                Gestión ganadera
              </div>
            </div>
          </div>
          <button className="btn" onClick={onLogin}>
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.68rem] font-mono uppercase tracking-[0.14em] mb-6"
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
          style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
        >
          Todo el control de tu ganadería <br className="hidden md:block" />
          en un solo lugar
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Registra tu finca, controla tu hato, tus gastos y tu sanidad.
          Diseñado para ganaderos de Colombia y Latinoamérica que quieren
          dejar el Excel y llevar todo desde el celular.
        </p>
        <div className="mt-10 flex gap-3 justify-center flex-wrap">
          <button
            className="btn btn-primary"
            onClick={onLogin}
            style={{ padding: "0.85rem 1.5rem", fontSize: "0.95rem" }}
          >
            Empieza gratis
          </button>
          <button
            className="btn btn-ghost"
            onClick={onLogin}
            style={{ padding: "0.85rem 1.5rem", fontSize: "0.95rem" }}
          >
            Ya tengo cuenta
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-[0.72rem] text-subtle flex-wrap">
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
      </section>

      {/* Pilares */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="text-center mb-12">
          <div className="eyebrow">Qué controlas</div>
          <h2 className="font-serif tracking-tight mt-2" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
            Tu operación completa, sin planillas
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Pillar
            Icon={IconCow}
            title="Hato y potreros"
            desc="Animales por categoría, potreros, control de peso, fotos y trazabilidad completa por cabeza."
            tone="moss"
          />
          <Pillar
            Icon={IconHealth}
            title="Sanidad y reproducción"
            desc="Vacunas, tratamientos, servicios y partos. Alertas de próximos eventos y calendario ordenado."
            tone="copper"
          />
          <Pillar
            Icon={IconMoney}
            title="Gastos entre socios"
            desc="Registra gastos, reparte entre socios (por %, cabezas o iguales) y ve deudas al día."
            tone="citrus"
          />
        </div>
      </section>

      {/* Cómo empezar */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <div className="text-center mb-10">
          <div className="eyebrow">Cómo empezar</div>
          <h2 className="font-serif tracking-tight mt-2" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
            Menos de 2 minutos
          </h2>
        </div>
        <div className="grid gap-4">
          <Step n="1" title="Crea tu cuenta" desc="Solo necesitas email y contraseña. Sin instalación." />
          <Step n="2" title="Registra tu finca" desc="Nombre, zona horaria y listo. Cada finca queda aislada del resto." />
          <Step n="3" title="Empieza a controlar" desc="Agrega tus animales, primeros gastos y tareas del mes." />
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pb-20">
        <div
          className="card text-center"
          style={{
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            background: "var(--surface-solid)",
            border: "1px solid var(--rule)",
            boxShadow: "0 20px 60px -20px var(--primary-glow)",
          }}
        >
          <h3 className="font-serif tracking-tight" style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)" }}>
            Empieza a llevar el control de tu finca hoy
          </h3>
          <p className="text-muted mt-3 max-w-lg mx-auto text-sm md:text-base">
            Gratis para empezar. Sin permanencia. Cambia de plan cuando crezcas.
          </p>
          <button
            className="btn btn-primary mt-6"
            onClick={onLogin}
            style={{ padding: "0.85rem 1.75rem", fontSize: "0.95rem" }}
          >
            <IconArrowUp size={14} />
            Crear mi cuenta
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-rule/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between text-[0.72rem] text-subtle flex-wrap gap-2">
          <div className="font-mono">MiFinca · {new Date().getFullYear()}</div>
          <div className="font-mono">Hecho en Colombia 🇨🇴</div>
        </div>
      </footer>
    </div>
  );
}

function Pillar({
  Icon,
  title,
  desc,
  tone,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tone: "moss" | "copper" | "citrus";
}) {
  const bgByTone: Record<typeof tone, string> = {
    moss: "linear-gradient(135deg, #E4EED4 0%, #A9C177 100%)",
    copper: "linear-gradient(135deg, #F8E1C1 0%, #E4A46A 100%)",
    citrus: "linear-gradient(135deg, #F6EFC2 0%, #DFC85E 100%)",
  };
  const fgByTone: Record<typeof tone, string> = {
    moss: "#1D2F10",
    copper: "#3E230C",
    citrus: "#2E2306",
  };
  return (
    <div className="card" style={{ background: "var(--surface-solid)" }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: bgByTone[tone], color: fgByTone[tone] }}
      >
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div
      className="card flex items-start gap-4"
      style={{ background: "var(--surface-solid)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-lg font-semibold shrink-0"
        style={{
          background: "var(--primary-soft)",
          color: "var(--primary)",
          border: "1px solid var(--rule)",
        }}
      >
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold tracking-tight">{title}</h4>
        <p className="text-sm text-muted mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
