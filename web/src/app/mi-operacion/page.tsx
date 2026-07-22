"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDB } from "@/lib/useDB";
import { useAuth } from "@/lib/useAuth";
import { fmtDate, fmtCOP, fmtNumber, fmtPct, edadTexto, diasHasta } from "@/lib/format";
import { CATEGORIAS_ANIMAL, CATEGORIAS_GASTO } from "@/lib/types";
import { miParticipacion } from "@/lib/participacion";

export default function MiOperacionPage() {
  const { user } = useAuth();
  const { db, ready } = useDB();

  const data = useMemo(() => {
    if (!db || !user) return null;
    const myId = user.id;

    const misAnimales = db.animales.filter((a) => a.propietarioId === myId);
    const misAnimalesActivos = misAnimales.filter((a) => a.estado === "activo");
    const misAnimalIds = new Set(misAnimales.map((a) => a.id));

    const misGastos = db.gastos
      .filter(
        (g) =>
          g.pagadoPor === myId ||
          (g.participantes?.includes(myId) ?? false) ||
          (g.animalId && misAnimalIds.has(g.animalId))
      )
      .map((g) => {
        const nParticipantes = g.participantes?.length ?? 0;
        const miParte =
          nParticipantes > 0 && g.participantes!.includes(myId)
            ? g.monto / nParticipantes
            : g.monto;
        return { ...g, miParte };
      });

    const misIngresos = db.ingresos.filter(
      (i) => i.animalId && misAnimalIds.has(i.animalId)
    );

    const misTareas = db.tareas.filter(
      (t) =>
        t.asignadoAId === myId ||
        (t.animalId && misAnimalIds.has(t.animalId))
    );

    const misSanidad = db.sanidad.filter((s) => misAnimalIds.has(s.animalId));

    const misServicios = db.servicios.filter((s) =>
      misAnimalIds.has(s.hembraId)
    );

    const desde30 = new Date();
    desde30.setDate(desde30.getDate() - 30);
    const gastos30 = misGastos
      .filter((g) => new Date(g.fecha) >= desde30)
      .reduce((s, g) => s + g.miParte, 0);
    const ingresos30 = misIngresos
      .filter((i) => new Date(i.fecha) >= desde30)
      .reduce((s, i) => s + i.monto, 0);

    const gastosTotales = misGastos.reduce((s, g) => s + g.miParte, 0);
    const ingresosTotales = misIngresos.reduce((s, i) => s + i.monto, 0);

    const tareasPendientes = misTareas
      .filter((t) => !t.completada)
      .map((t) => ({ ...t, dias: diasHasta(t.fecha) }))
      .sort((a, b) => (a.dias ?? 9999) - (b.dias ?? 9999));

    const proximosPartos = misServicios
      .filter(
        (s) =>
          (s.resultado === "pendiente" || s.resultado === "prenada") &&
          s.fechaProbableParto
      )
      .map((s) => ({ ...s, dias: diasHasta(s.fechaProbableParto) }))
      .filter((s) => s.dias !== null && s.dias! >= -14 && s.dias! <= 300)
      .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0));

    const share = miParticipacion(myId, db.animales);

    return {
      misAnimales,
      misAnimalesActivos,
      misGastos,
      misIngresos,
      misTareas,
      misSanidad,
      misServicios,
      gastos30,
      ingresos30,
      gastosTotales,
      ingresosTotales,
      balance30: ingresos30 - gastos30,
      balanceTotal: ingresosTotales - gastosTotales,
      tareasPendientes,
      proximosPartos,
      participacionPct: share.pct,
    };
  }, [db, user]);

  if (!ready || !user || !data) {
    return <div className="text-muted">Cargando…</div>;
  }

  const initials = user.nombre.slice(0, 2).toUpperCase();
  const hoyLabel = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="hero-card">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 8px var(--primary)" }}
          />
          <span className="text-[0.72rem] font-mono uppercase tracking-widest text-muted capitalize">
            {hoyLabel}
          </span>
        </div>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="display-hero text-fg text-balance">
              Hola,{" "}
              <span
                className="text-primary"
                style={{ textShadow: "0 0 20px var(--primary-glow)" }}
              >
                {user.nombre}
              </span>
            </h2>
            <p className="text-muted mt-4 max-w-lg text-[0.95rem] leading-relaxed">
              Tienes{" "}
              <span className="text-fg font-medium">
                {data.misAnimalesActivos.length}
              </span>{" "}
              {data.misAnimalesActivos.length === 1 ? "animal" : "animales"} a tu
              nombre y participas del{" "}
              <span className="text-fg font-medium">
                {fmtPct(data.participacionPct)}
              </span>{" "}
              de la operación total.
              {data.tareasPendientes.length > 0
                ? ` Tienes ${data.tareasPendientes.length} tarea${data.tareasPendientes.length > 1 ? "s" : ""} pendiente${data.tareasPendientes.length > 1 ? "s" : ""}.`
                : " No tienes tareas pendientes."}
            </p>
          </div>
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-mono font-semibold shrink-0"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
              boxShadow: "0 0 40px -8px var(--primary-glow)",
            }}
          >
            {initials}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI
          label="Mis animales"
          value={data.misAnimalesActivos.length}
          sub={
            data.misAnimales.length > data.misAnimalesActivos.length
              ? `+ ${data.misAnimales.length - data.misAnimalesActivos.length} inactivos`
              : "todos activos"
          }
          accent="primary"
        />
        <KPI
          label="Mis gastos 30 d"
          value={fmtCOP(data.gastos30).replace("COP", "").trim()}
          sub={`Histórico: ${fmtCOP(data.gastosTotales)}`}
          accent="danger"
          isText
        />
        <KPI
          label="Mis ingresos 30 d"
          value={fmtCOP(data.ingresos30).replace("COP", "").trim()}
          sub={`Histórico: ${fmtCOP(data.ingresosTotales)}`}
          accent="primary"
          isText
        />
        <KPI
          label="Balance 30 d"
          value={fmtCOP(data.balance30).replace("COP", "").trim()}
          sub={`Total: ${fmtCOP(data.balanceTotal)}`}
          accent={data.balance30 >= 0 ? "primary" : "danger"}
          isText
        />
      </section>

      {/* Dos columnas: animales + tareas */}
      <section className="grid lg:grid-cols-2 gap-3">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow eyebrow-primary">Hato</div>
              <h2 className="text-lg font-semibold tracking-tight">Mis animales</h2>
            </div>
            <Link href="/animales" className="text-xs text-primary hover:underline font-medium">
              ver todos →
            </Link>
          </div>
          {data.misAnimales.length === 0 ? (
            <p className="text-sm text-muted">Aún no tienes animales a tu nombre.</p>
          ) : (
            <ul className="flex flex-col gap-1 -mx-1">
              {data.misAnimales.map((a) => {
                const cat = CATEGORIAS_ANIMAL.find((c) => c.value === a.categoria);
                return (
                  <li
                    key={a.id}
                    className="px-3 py-2.5 rounded-lg hover:bg-surface-2 transition flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                      style={{
                        background: "var(--primary-soft)",
                        color: "var(--primary)",
                      }}
                    >
                      {a.nroIdentificacion}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-fg">{a.nombre ?? "—"}</div>
                      <div className="text-xs text-muted">
                        {cat?.label} · {edadTexto(a.fechaNacimiento)}
                      </div>
                    </div>
                    <span
                      className={
                        "chip " +
                        (a.estado === "activo" ? "success" : "ghost")
                      }
                      style={{ padding: "0.15rem 0.55rem", fontSize: "0.62rem" }}
                    >
                      {a.estado}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow eyebrow-primary">Pendiente</div>
              <h2 className="text-lg font-semibold tracking-tight">Tus tareas</h2>
            </div>
            <Link href="/tareas" className="text-xs text-primary hover:underline font-medium">
              ver todas →
            </Link>
          </div>
          {data.tareasPendientes.length === 0 ? (
            <p className="text-sm text-muted">Sin pendientes. Todo al día.</p>
          ) : (
            <ul className="flex flex-col gap-1 -mx-1">
              {data.tareasPendientes.slice(0, 6).map((t) => {
                const vencida = t.dias !== null && t.dias < 0;
                const hoy = t.dias === 0;
                return (
                  <li
                    key={t.id}
                    className="px-3 py-2.5 rounded-lg hover:bg-surface-2 transition flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-fg truncate">{t.titulo}</div>
                      <div className="text-xs text-muted">{fmtDate(t.fecha)}</div>
                    </div>
                    <span
                      className={
                        "chip " +
                        (vencida
                          ? "danger"
                          : hoy
                          ? "accent"
                          : t.prioridad === "alta"
                          ? "primary"
                          : "ghost")
                      }
                      style={{ padding: "0.15rem 0.55rem", fontSize: "0.62rem" }}
                    >
                      {vencida
                        ? `${Math.abs(t.dias!)} d atrás`
                        : hoy
                        ? "hoy"
                        : `en ${t.dias} d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Próximos partos + gastos recientes */}
      <section className="grid lg:grid-cols-2 gap-3">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow eyebrow-primary">Reproducción</div>
              <h2 className="text-lg font-semibold tracking-tight">Tus próximos partos</h2>
            </div>
            <Link href="/reproduccion" className="text-xs text-primary hover:underline font-medium">
              ver todos →
            </Link>
          </div>
          {data.proximosPartos.length === 0 ? (
            <p className="text-sm text-muted">Sin partos previstos.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.proximosPartos.map((p) => {
                const hembra = db!.animales.find((a) => a.id === p.hembraId);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-fg">
                        {hembra?.nombre ?? "?"}
                      </div>
                      <div className="text-xs text-muted">
                        {fmtDate(p.fechaProbableParto)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="num text-2xl text-primary">{p.dias}</div>
                      <div className="text-[0.6rem] font-mono uppercase tracking-wider text-muted">
                        días
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow eyebrow-primary">Cuentas</div>
              <h2 className="text-lg font-semibold tracking-tight">Tus últimos gastos</h2>
            </div>
            <Link href="/gastos" className="text-xs text-primary hover:underline font-medium">
              ver todos →
            </Link>
          </div>
          {data.misGastos.length === 0 ? (
            <p className="text-sm text-muted">No hay gastos registrados a tu nombre.</p>
          ) : (
            <ul className="flex flex-col gap-1 -mx-1">
              {[...data.misGastos]
                .sort(
                  (a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )
                .slice(0, 6)
                .map((g) => {
                  const cat = CATEGORIAS_GASTO.find((c) => c.value === g.categoria);
                  const compartido =
                    (g.participantes?.length ?? 0) > 1 && g.miParte !== g.monto;
                  return (
                    <li
                      key={g.id}
                      className="px-3 py-2.5 rounded-lg hover:bg-surface-2 transition flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-fg truncate text-sm">
                          {g.concepto}
                        </div>
                        <div className="text-xs text-muted">
                          {fmtDate(g.fecha)} · {cat?.label}
                          {compartido && (
                            <span className="ml-1">
                              · compartido /{g.participantes!.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="font-mono text-sm text-danger">
                          {fmtCOP(g.miParte)}
                        </div>
                        {compartido && (
                          <div className="text-[0.62rem] text-subtle font-mono">
                            total {fmtCOP(g.monto)}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </section>

      {/* Resumen sanidad */}
      <section className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow eyebrow-primary">Salud</div>
            <h2 className="text-lg font-semibold tracking-tight">
              Sanidad de tus animales
            </h2>
          </div>
          <Link href="/sanidad" className="text-xs text-primary hover:underline font-medium">
            ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniPill label="Eventos totales" value={data.misSanidad.length} />
          <MiniPill
            label="Vacunas"
            value={data.misSanidad.filter((s) => s.tipo === "vacuna").length}
          />
          <MiniPill
            label="Tratamientos"
            value={data.misSanidad.filter((s) => s.tipo === "tratamiento").length}
          />
          <MiniPill
            label="Desparasitaciones"
            value={
              data.misSanidad.filter((s) => s.tipo === "desparasitacion").length
            }
          />
        </div>
      </section>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
  accent,
  isText,
}: {
  label: string;
  value: number | string;
  sub?: React.ReactNode;
  accent: "primary" | "danger";
  isText?: boolean;
}) {
  const color = accent === "danger" ? "var(--danger)" : "var(--primary)";
  return (
    <div className="card-tight card">
      <div className="eyebrow">{label}</div>
      <div className={"num mt-1 " + (isText ? "text-2xl" : "text-4xl")} style={{ color }}>
        {value}
      </div>
      {sub ? <div className="text-xs text-muted mt-2">{sub}</div> : null}
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-surface-2 flex items-center justify-between">
      <div className="text-xs text-muted">{label}</div>
      <div className="num text-2xl text-fg">{fmtNumber(value, 0)}</div>
    </div>
  );
}
