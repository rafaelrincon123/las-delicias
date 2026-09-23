"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { useFincaActiva } from "@/lib/useFincaActiva";
import { PLAN_LIMITS, planLabel, planEfectivo, diasDePruebaRestantes, fmtPrecio } from "@/lib/plans";
import { CUENTA_PAGO, subirComprobantePago } from "@/lib/comprobantePago";
import type { PlanFinca } from "@/lib/types";
import Modal from "@/components/Modal";

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
  const [pagando, setPagando] = useState<PlanFinca | null>(null);

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
                    onClick={() => setPagando(p)}
                  >
                    Cambiar a {info.nombre}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary w-full justify-center"
                    onClick={() => setPagando(p)}
                  >
                    Cambiar a {info.nombre} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <p className="text-[0.7rem] text-subtle text-center">
        Los pagos automáticos llegarán próximamente. Por ahora los cambios se procesan
        manualmente: transfieres, subes el comprobante y activamos tu plan. Precios en pesos
        son un valor aproximado de referencia.
      </p>

      {pagando && (
        <PagoManualModal
          destino={pagando}
          planActual={planActual}
          fincaId={activa.id}
          fincaNombre={activa.nombre}
          onClose={() => setPagando(null)}
        />
      )}
    </div>
  );
}

function PagoManualModal({
  destino,
  planActual,
  fincaId,
  fincaNombre,
  onClose,
}: {
  destino: PlanFinca;
  planActual: PlanFinca;
  fincaId: string;
  fincaNombre: string;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function abrirCorreo(linkComprobante?: string) {
    const asunto = encodeURIComponent(`Upgrade a plan ${planLabel(destino)} — ${fincaNombre}`);
    const cuerpo = encodeURIComponent(
      `Hola,\n\nQuiero cambiarme al plan ${planLabel(destino)} para mi finca "${fincaNombre}" (id: ${fincaId}).\n\n` +
        `Estoy usando actualmente el plan ${planLabel(planActual)}.\n\n` +
        (linkComprobante
          ? `Aquí está mi comprobante de pago: ${linkComprobante}\n\n`
          : `Voy a enviar el comprobante de pago por este mismo correo en un momento.\n\n`) +
        `Por favor confirma y activa mi plan.\n\nGracias.`
    );
    window.location.href = `mailto:rafael.rincong@gmail.com?subject=${asunto}&body=${cuerpo}`;
  }

  async function handleEnviar() {
    setError(null);
    setEnviando(true);
    try {
      if (file && (destino === "ganadero" || destino === "hacienda")) {
        const { signedUrl } = await subirComprobantePago({
          fincaId,
          planSolicitado: destino,
          file,
        });
        abrirCorreo(signedUrl);
      } else {
        abrirCorreo();
      }
      setEnviado(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Modal open onClose={onClose} title="Solicitud enviada" eyebrow="Listo">
        <div className="space-y-4">
          <p className="text-sm">
            Se abrió tu correo con la solicitud{file ? " y el link a tu comprobante" : ""}. En
            cuanto Rafael lo confirme, tu plan queda activo.
          </p>
          <button className="btn btn-primary w-full justify-center" onClick={onClose}>
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Cambiar a ${planLabel(destino)}`}
      eyebrow="Pago manual"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Transfiere el valor del plan y sube tu comprobante. Te abrimos el correo listo para
          enviarle a Rafael, quien activa tu plan en cuanto lo confirme.
        </p>

        <div className="card bg-surface-2 space-y-2 text-sm">
          <div className="eyebrow">Cuenta bancaria</div>
          <div><strong>Banco:</strong> {CUENTA_PAGO.banco}</div>
          <div><strong>Tipo de cuenta:</strong> {CUENTA_PAGO.tipoCuenta}</div>
          <div><strong>Número:</strong> {CUENTA_PAGO.numeroCuenta}</div>
          <div><strong>Titular:</strong> {CUENTA_PAGO.titular}</div>
          <div className="pt-2 border-t border-rule">
            <strong>Nequi / Daviplata:</strong> {CUENTA_PAGO.nequi}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="eyebrow">Comprobante de pago (foto o PDF)</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="text-[0.68rem] text-subtle">
            Opcional aquí — si prefieres, puedes mandarlo directo por correo o WhatsApp después.
          </span>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button
          className="btn btn-primary w-full justify-center"
          onClick={() => void handleEnviar()}
          disabled={enviando}
        >
          {enviando ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </Modal>
  );
}
