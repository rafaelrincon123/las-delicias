"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { useFincaActiva } from "@/lib/useFincaActiva";
import { PLAN_LIMITS, planLabel } from "@/lib/plans";
import type { PlanFinca } from "@/lib/types";

const ORDER: PlanFinca[] = ["ranchero", "ganadero", "hacienda"];

const FEATURES: Record<PlanFinca, string[]> = {
  ranchero: [
    "Hasta 15 animales",
    "1 usuario",
    "Hato, sanidad, gastos y tareas",
    "1 finca",
    "Soporte por email",
  ],
  ganadero: [
    "Hasta 200 animales",
    "5 usuarios",
    "Todo lo del plan Ranchero",
    "Reportes exportables (Excel/PDF)",
    "Alertas por WhatsApp",
    "Soporte prioritario",
  ],
  hacienda: [
    "Animales ilimitados",
    "Usuarios ilimitados",
    "Múltiples fincas",
    "Todo lo del plan Ganadero",
    "API para integraciones",
    "Backups automáticos diarios",
    "Soporte dedicado por WhatsApp",
  ],
};

export default function PlanPage() {
  const { db, ready } = useDB();
  const { activa } = useFincaActiva();
  const [pidiendo, setPidiendo] = useState<PlanFinca | null>(null);

  const usage = useMemo(() => {
    if (!db) return null;
    return {
      animales: db.animales.length,
      propietarios: db.propietarios.length,
    };
  }, [db]);

  if (!ready || !activa) return <div className="text-muted">Cargando…</div>;

  const planActual = activa.plan;
  const limits = PLAN_LIMITS[planActual];

  function abrirUpgrade(destino: PlanFinca) {
    setPidiendo(destino);
    const emailAsunto = encodeURIComponent(
      `Upgrade a plan ${planLabel(destino)} — ${activa!.nombre}`
    );
    const emailCuerpo = encodeURIComponent(
      `Hola,\n\nQuiero cambiarme al plan ${planLabel(destino)} para mi finca "${activa!.nombre}" (id: ${activa!.id}).\n\n` +
        `Estoy usando actualmente el plan ${planLabel(planActual)}.\n\n` +
        `Por favor cuéntame cómo procedo con el pago.\n\nGracias.`
    );
    const waCuerpo = encodeURIComponent(
      `Hola, quiero upgrade al plan ${planLabel(destino)} para mi finca "${activa!.nombre}".`
    );
    const mailto = `mailto:rafael.rincong@gmail.com?subject=${emailAsunto}&body=${emailCuerpo}`;
    const wa = `https://wa.me/573000000000?text=${waCuerpo}`; // TODO: número real cuando lo tengas
    // Abre email por default. El botón alternativo abre WhatsApp.
    window.location.href = mailto;
    // Guardamos en state para mostrar CTA de WA también
    void wa;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="display-md tracking-tight font-serif">Tu plan</h1>
        <p className="text-sm text-muted mt-1">
          Elige el plan que se ajusta al tamaño de tu operación. Puedes cambiar cuando quieras.
        </p>
      </header>

      {/* Estado actual */}
      <section
        className="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
        style={{
          background: "var(--forest)",
          color: "white",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[0.68rem] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--lime-bright)" }}>
            Plan actual
          </div>
          <div className="text-2xl font-bold mt-1">{planLabel(planActual)}</div>
          {usage && (
            <div className="text-sm mt-2 opacity-80">
              Estás usando{" "}
              <strong>
                {usage.animales}
                {limits.maxAnimales !== null ? ` / ${limits.maxAnimales}` : ""}
              </strong>{" "}
              animales
              {limits.maxUsuarios !== null && (
                <>
                  {" y "}
                  <strong>
                    {usage.propietarios} / {limits.maxUsuarios}
                  </strong>{" "}
                  usuarios
                </>
              )}
              .
            </div>
          )}
        </div>
        <div className="text-3xl font-bold" style={{ color: "var(--lime-bright)" }}>
          {formatPrecio(limits.precioCOP)}
        </div>
      </section>

      {/* Grid de planes */}
      <section className="grid md:grid-cols-3 gap-4">
        {ORDER.map((p) => {
          const info = PLAN_LIMITS[p];
          const isCurrent = p === planActual;
          const isDowngrade = ORDER.indexOf(p) < ORDER.indexOf(planActual);
          return (
            <div
              key={p}
              className="card p-5 flex flex-col relative"
              style={{
                borderColor: isCurrent ? "var(--forest)" : undefined,
                borderWidth: isCurrent ? 2 : undefined,
              }}
            >
              {p === "ganadero" && !isCurrent && (
                <div
                  className="absolute -top-2 right-4 text-[0.6rem] font-mono uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{ background: "var(--forest)", color: "var(--lime-bright)" }}
                >
                  Más popular
                </div>
              )}
              <div className="text-[0.68rem] font-mono uppercase tracking-[0.14em]" style={{ color: "var(--forest)" }}>
                Plan
              </div>
              <div className="text-xl font-bold uppercase tracking-tight mt-1" style={{ color: "var(--forest)" }}>
                {info.nombre}
              </div>
              <div className="mt-3 text-3xl font-bold" style={{ color: "var(--forest)" }}>
                {formatPrecio(info.precioCOP)}
                {info.precioCOP > 0 && <span className="text-sm font-normal text-muted"> / mes</span>}
              </div>
              <ul className="mt-4 space-y-1.5 text-sm flex-1">
                {FEATURES[p].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden style={{ color: "var(--forest-3)" }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <button className="btn w-full justify-center" disabled>
                    Plan actual
                  </button>
                ) : isDowngrade ? (
                  <button
                    className="btn btn-ghost w-full justify-center"
                    onClick={() => abrirUpgrade(p)}
                    disabled={pidiendo !== null}
                  >
                    Cambiar a {info.nombre}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary w-full justify-center"
                    onClick={() => abrirUpgrade(p)}
                    disabled={pidiendo !== null}
                  >
                    Cambiar a {info.nombre} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {pidiendo && (
        <div className="card p-5" style={{ background: "var(--surface-2)" }}>
          <div className="font-semibold" style={{ color: "var(--forest)" }}>
            Se abrió tu app de correo con la solicitud.
          </div>
          <div className="text-sm text-muted mt-2">
            Si no se abrió automáticamente, escríbenos a{" "}
            <a href="mailto:rafael.rincong@gmail.com" className="underline">
              rafael.rincong@gmail.com
            </a>{" "}
            pidiendo el cambio al plan <strong>{planLabel(pidiendo)}</strong>. Cambiaremos tu plan
            manualmente en cuanto confirmemos el pago.
          </div>
          <button
            className="btn btn-ghost mt-3"
            onClick={() => setPidiendo(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      <p className="text-[0.7rem] text-subtle text-center">
        Los pagos automáticos con tarjeta y PSE llegarán próximamente. Por ahora los cambios se
        procesan manualmente por email.
      </p>
    </div>
  );
}

function formatPrecio(cop: number): string {
  if (cop === 0) return "Gratis";
  return `$${cop.toLocaleString("es-CO")} COP`;
}
