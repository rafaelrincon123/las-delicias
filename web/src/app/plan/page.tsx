"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { useFincaActiva } from "@/lib/useFincaActiva";
import { PLAN_LIMITS, planLabel, planEfectivo, diasDePruebaRestantes, fmtPrecio } from "@/lib/plans";
import type { PlanFinca } from "@/lib/types";

const ORDER: PlanFinca[] = ["ranchero", "ganadero", "hacienda"];

interface Feature {
  texto: string;
  proximamente?: boolean;
}

const FEATURES: Record<PlanFinca, Feature[]> = {
  ranchero: [
    { texto: "Hasta 5 animales" },
    { texto: "1 persona con permiso de edición (el owner)" },
    { texto: "Hasta 4 personas más en modo solo lectura" },
    { texto: "Hato, sanidad, gastos y tareas" },
    { texto: "1 finca" },
    { texto: "Soporte por email" },
  ],
  ganadero: [
    { texto: "Hasta 50 animales" },
    { texto: "Hasta 5 personas con acceso (cualquier rol)" },
    { texto: "Hasta 3 fincas" },
    { texto: "Todo lo del plan Ranchero" },
    { texto: "Reportes en PDF de cada sección" },
    { texto: "Alertas por WhatsApp", proximamente: true },
    { texto: "Soporte prioritario" },
  ],
  hacienda: [
    { texto: "Animales ilimitados" },
    { texto: "Personas con acceso ilimitadas" },
    { texto: "Fincas ilimitadas" },
    { texto: "Todo lo del plan Ganadero" },
    { texto: "Reportes en PDF de cada sección" },
    { texto: "Alertas por WhatsApp", proximamente: true },
    { texto: "App móvil (Android / iOS)", proximamente: true },
    { texto: "Soporte dedicado" },
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

  const planActual = planEfectivo(activa);
  const limits = PLAN_LIMITS[planActual];
  const diasPrueba = diasDePruebaRestantes(activa);
  const enPrueba = diasPrueba > 0 && activa.plan === planActual;
  const pruebaVencida = !activa.planPagado && !enPrueba && activa.plan !== "ranchero";

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
    const mailto = `mailto:rafael.rincong@gmail.com?subject=${emailAsunto}&body=${emailCuerpo}`;
    window.location.href = mailto;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="display-md tracking-tight font-serif">Tu plan</h1>
        <p className="text-sm text-muted mt-1">
          Elige el plan que se ajusta al tamaño de tu operación. Puedes cambiar cuando quieras.
        </p>
      </header>

      {enPrueba && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{ background: "rgba(184, 206, 122, 0.2)", border: "1px solid rgba(20,38,26,0.15)" }}
        >
          Estás probando el plan <strong>{planLabel(activa.plan)}</strong> gratis — quedan{" "}
          <strong>{diasPrueba} día{diasPrueba === 1 ? "" : "s"}</strong>. Cuando termine, tu finca
          vuelve al plan Ranchero salvo que la cambies a un plan pago.
        </div>
      )}
      {pruebaVencida && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{ background: "rgba(200, 60, 60, 0.10)", border: "1px solid rgba(200, 60, 60, 0.30)" }}
        >
          Tu prueba de 30 días terminó. Ahora estás en el plan <strong>Ranchero</strong>. Elige un
          plan abajo para seguir con más cupo.
        </div>
      )}

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
                  personas
                </>
              )}
              .
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-right" style={{ color: "var(--lime-bright)" }}>
          {fmtPrecio(planActual)}
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
              <div className="mt-3 text-2xl font-bold" style={{ color: "var(--forest)" }}>
                {fmtPrecio(p)}
                {info.precioUSD > 0 && <span className="text-sm font-normal text-muted"> /mes</span>}
              </div>
              <ul className="mt-4 space-y-1.5 text-sm flex-1">
                {FEATURES[p].map((f) => (
                  <li key={f.texto} className="flex gap-2">
                    <span aria-hidden style={{ color: "var(--forest-3)" }}>✓</span>
                    <span className={f.proximamente ? "text-muted" : undefined}>
                      {f.texto}
                      {f.proximamente && (
                        <span className="text-[0.62rem] font-mono uppercase tracking-widest ml-1.5 text-accent">
                          Próximamente
                        </span>
                      )}
                    </span>
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
        Los pagos automáticos llegarán próximamente. Por ahora los cambios se procesan
        manualmente por email. Precios en pesos son un valor aproximado de referencia.
      </p>
    </div>
  );
}
