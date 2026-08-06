"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtCOP, fmtDate, todayISO } from "@/lib/format";
import {
  CATEGORIAS_GASTO,
  CategoriaGasto,
  Gasto,
  Ingreso,
  Propietario,
  TipoIngreso,
} from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import HeroStat from "@/components/HeroStat";

/**
 * Devuelve el conjunto efectivo de participantes que ya pagaron su parte.
 * Quien puso la plata (pagadoPor) cuenta como pagado si es participante.
 */
function participantesPagados(g: Gasto): Set<string> {
  const paid = new Set(g.pagadoPorIds ?? []);
  const parts = g.participantes ?? [];
  if (g.pagadoPor && parts.includes(g.pagadoPor)) paid.add(g.pagadoPor);
  return paid;
}

/** Alterna el estado de pago de un participante en un gasto y persiste. */
function toggleParticipantePagado(g: Gasto, propietarioId: string): void {
  const parts = g.participantes ?? [];
  if (!parts.includes(propietarioId)) return;
  // No permitir marcar como "debe" a quien puso la plata (lo puso él mismo).
  if (g.pagadoPor === propietarioId) return;
  const set = new Set(g.pagadoPorIds ?? []);
  if (set.has(propietarioId)) set.delete(propietarioId);
  else set.add(propietarioId);
  const next: Gasto = { ...g, pagadoPorIds: Array.from(set) };
  updateCollection("gastos", (list) =>
    list.map((x) => (x.id === g.id ? next : x))
  );
}

const TIPOS_INGRESO: { value: TipoIngreso; label: string }[] = [
  { value: "venta_leche", label: "Venta de leche" },
  { value: "venta_animal", label: "Venta de animal" },
  { value: "otros", label: "Otros" },
];

export default function GastosPage() {
  const { db, ready } = useDB();
  const [tab, setTab] = useState<"gastos" | "ingresos">("gastos");
  const [openG, setOpenG] = useState(false);
  const [openI, setOpenI] = useState(false);
  const [editG, setEditG] = useState<Gasto | null>(null);
  const [editI, setEditI] = useState<Ingreso | null>(null);
  const [modeG, setModeG] = useState<"view" | "edit">("view");
  const [modeI, setModeI] = useState<"view" | "edit">("view");

  const gastos = useMemo(() => {
    if (!db) return [];
    return [...db.gastos].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [db]);

  const ingresos = useMemo(() => {
    if (!db) return [];
    return [...db.ingresos].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [db]);

  const totales = useMemo(() => {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    const totalG = gastos
      .filter((g) => new Date(g.fecha) >= desde)
      .reduce((s, g) => s + g.monto, 0);
    const totalI = ingresos
      .filter((i) => new Date(i.fecha) >= desde)
      .reduce((s, i) => s + i.monto, 0);
    const porCat = CATEGORIAS_GASTO.map((c) => ({
      label: c.label,
      total: gastos
        .filter((g) => g.categoria === c.value && new Date(g.fecha) >= desde)
        .reduce((s, g) => s + g.monto, 0),
    }));
    return { totalG, totalI, balance: totalI - totalG, porCat };
  }, [gastos, ingresos]);

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <HeroStat
          label="Ingresos 30 d"
          value={fmtCOP(totales.totalI)}
          tone="moss"
          size="sm"
        />
        <HeroStat
          label="Gastos 30 d"
          value={fmtCOP(totales.totalG)}
          tone="coral"
          size="sm"
        />
        <HeroStat
          label="Balance 30 d"
          value={fmtCOP(totales.balance)}
          tone={totales.balance >= 0 ? "citrus" : "coral"}
          size="sm"
        />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold tracking-tight mb-3">Gastos por categoría (30 días)</h2>
        {(() => {
          const max = Math.max(1, ...totales.porCat.map((c) => c.total));
          return (
            <div className="space-y-2">
              {totales.porCat.map((c) => (
                <div key={c.label} className="flex items-center gap-3 text-sm">
                  <div className="w-32 text-muted">{c.label}</div>
                  <div className="flex-1 h-2 rounded bg-surface-2 overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(c.total / max) * 100}%` }}
                    />
                  </div>
                  <div className="w-32 text-right font-mono tabular-nums text-xs">
                    {fmtCOP(c.total)}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            className={"btn " + (tab === "gastos" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("gastos")}
          >
            Gastos ({gastos.length})
          </button>
          <button
            className={"btn " + (tab === "ingresos" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("ingresos")}
          >
            Ingresos ({ingresos.length})
          </button>
        </div>
        <div>
          {tab === "gastos" ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditG(null);
                setModeG("edit");
                setOpenG(true);
              }}
            >
              + Nuevo gasto
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditI(null);
                setModeI("edit");
                setOpenI(true);
              }}
            >
              + Nuevo ingreso
            </button>
          )}
        </div>
      </div>

      {tab === "gastos" && (
        <>
          <DeudasResumen gastos={gastos} propietarios={db!.propietarios} />
          <div className="card p-0 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Concepto</th>
                  <th>Pagó</th>
                  <th>Estado de pago</th>
                  <th className="text-right">Monto</th>
                  <th className="text-right">Por c/u</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => {
                  const socio = db!.propietarios.find((p) => p.id === g.pagadoPor);
                  const participantes = g.participantes ?? [];
                  const nParticipantes = participantes.length;
                  const porPersona = nParticipantes > 0 ? g.monto / nParticipantes : g.monto;
                  const pagados = participantesPagados(g);
                  const nPagados = participantes.filter((id) => pagados.has(id)).length;
                  const todosPagaron = nParticipantes > 0 && nPagados === nParticipantes;
                  return (
                    <tr
                      key={g.id}
                      onClick={() => {
                        setEditG(g);
                        setModeG("view");
                        setOpenG(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{fmtDate(g.fecha)}</td>
                      <td>
                        <span className="chip">
                          {CATEGORIAS_GASTO.find((c) => c.value === g.categoria)?.label}
                        </span>
                      </td>
                      <td>
                        <div>{g.concepto}</div>
                        {g.proveedor && (
                          <div className="text-muted text-xs">{g.proveedor}</div>
                        )}
                      </td>
                      <td className="text-xs">{socio?.nombre ?? "—"}</td>
                      <td>
                        {nParticipantes === 0 ? (
                          <span className="text-muted text-xs">—</span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap gap-1">
                              {participantes.map((pid) => {
                                const p = db!.propietarios.find((x) => x.id === pid);
                                if (!p) return null;
                                const on = pagados.has(pid);
                                const esPagador = g.pagadoPor === pid;
                                return (
                                  <button
                                    key={pid}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleParticipantePagado(g, pid);
                                    }}
                                    disabled={esPagador}
                                    className="rounded-full text-[0.6rem] font-mono font-semibold px-2 py-0.5 transition"
                                    style={{
                                      background: on ? "var(--success, #4CA45A)" : "transparent",
                                      color: on ? "#fff" : "var(--muted)",
                                      border: `1px solid ${on ? "var(--success, #4CA45A)" : "var(--rule-strong)"}`,
                                      cursor: esPagador ? "default" : "pointer",
                                      opacity: esPagador ? 0.85 : 1,
                                    }}
                                    title={
                                      esPagador
                                        ? `${p.nombre} · adelantó la plata`
                                        : on
                                        ? `${p.nombre} · ya pagó (click para desmarcar)`
                                        : `${p.nombre} · debe (click para marcar pagado)`
                                    }
                                  >
                                    {on ? "✓ " : ""}
                                    {p.nombre.slice(0, 2).toUpperCase()}
                                  </button>
                                );
                              })}
                            </div>
                            <span
                              className="text-[0.6rem] font-mono uppercase tracking-wider"
                              style={{
                                color: todosPagaron
                                  ? "var(--success, #4CA45A)"
                                  : nPagados === 0
                                  ? "var(--danger)"
                                  : "var(--accent)",
                              }}
                            >
                              {nPagados}/{nParticipantes} {todosPagaron ? "· al día" : "pagados"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="text-right font-mono tabular-nums">{fmtCOP(g.monto)}</td>
                      <td className="text-right font-mono tabular-nums text-xs">
                        {nParticipantes > 1 ? (
                          <span className="text-primary">{fmtCOP(porPersona)}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="text-xs text-accent hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditG(g);
                            setModeG("edit");
                            setOpenG(true);
                          }}
                        >
                          editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "ingresos" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Comprador</th>
                <th className="text-right">Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => {
                    setEditI(i);
                    setModeI("view");
                    setOpenI(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{fmtDate(i.fecha)}</td>
                  <td>
                    <span className="chip">
                      {TIPOS_INGRESO.find((t) => t.value === i.tipo)?.label}
                    </span>
                  </td>
                  <td>{i.concepto}</td>
                  <td className="text-muted text-xs">{i.comprador ?? "—"}</td>
                  <td className="text-right font-mono tabular-nums text-success">
                    {fmtCOP(i.monto)}
                  </td>
                  <td className="text-right">
                    <button
                      className="text-xs text-accent hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditI(i);
                        setModeI("edit");
                        setOpenI(true);
                      }}
                    >
                      editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={openG}
        onClose={() => setOpenG(false)}
        title={editG ? (modeG === "view" ? "Detalle de gasto" : "Editar gasto") : "Nuevo gasto"}
      >
        {editG && modeG === "view" && (
          <div className="flex justify-end mb-3">
            <button
              className="btn btn-primary"
              onClick={() => setModeG("edit")}
              style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}
            >
              Editar
            </button>
          </div>
        )}
        <GastoForm
          initial={editG}
          readOnly={!!editG && modeG === "view"}
          onSaved={() => setOpenG(false)}
          onCancel={() => setOpenG(false)}
        />
      </Modal>
      <Modal
        open={openI}
        onClose={() => setOpenI(false)}
        title={editI ? (modeI === "view" ? "Detalle de ingreso" : "Editar ingreso") : "Nuevo ingreso"}
      >
        {editI && modeI === "view" && (
          <div className="flex justify-end mb-3">
            <button
              className="btn btn-primary"
              onClick={() => setModeI("edit")}
              style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }}
            >
              Editar
            </button>
          </div>
        )}
        <IngresoForm
          initial={editI}
          readOnly={!!editI && modeI === "view"}
          onSaved={() => setOpenI(false)}
          onCancel={() => setOpenI(false)}
        />
      </Modal>
    </div>
  );
}

function DeudasResumen({
  gastos,
  propietarios,
}: {
  gastos: Gasto[];
  propietarios: Propietario[];
}) {
  const balances = useMemo(() => {
    // Por cada socio: cuánto le deben (positivo) y cuánto debe (negativo)
    const debe: Record<string, number> = {};
    const leDeben: Record<string, number> = {};
    for (const p of propietarios) {
      debe[p.id] = 0;
      leDeben[p.id] = 0;
    }

    for (const g of gastos) {
      const parts = g.participantes ?? [];
      if (parts.length === 0 || !g.pagadoPor) continue;
      const cuota = g.monto / parts.length;
      const pagados = participantesPagados(g);

      for (const pid of parts) {
        if (pid === g.pagadoPor) continue; // el pagador no se debe a sí mismo
        if (pagados.has(pid)) continue; // ya reembolsó
        // pid le debe cuota a g.pagadoPor
        debe[pid] = (debe[pid] ?? 0) + cuota;
        leDeben[g.pagadoPor] = (leDeben[g.pagadoPor] ?? 0) + cuota;
      }
    }

    return propietarios
      .map((p) => ({
        socio: p,
        debe: debe[p.id] ?? 0,
        leDeben: leDeben[p.id] ?? 0,
        neto: (leDeben[p.id] ?? 0) - (debe[p.id] ?? 0),
      }))
      .filter((r) => r.debe > 0 || r.leDeben > 0);
  }, [gastos, propietarios]);

  if (balances.length === 0) return null;

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Cuentas entre socios
        </h2>
        <span className="text-[0.65rem] font-mono uppercase tracking-widest text-subtle">
          basado en participantes y pagos
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {balances.map(({ socio, debe, leDeben, neto }) => {
          const alDia = debe === 0 && leDeben === 0;
          const acreedor = neto > 0;
          return (
            <div
              key={socio.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg"
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${
                  alDia
                    ? "var(--rule)"
                    : acreedor
                    ? "var(--success, #4CA45A)"
                    : "var(--danger)"
                }`,
              }}
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{socio.nombre}</div>
                <div className="text-[0.62rem] font-mono uppercase tracking-wider text-subtle mt-0.5">
                  {debe > 0 && <>debe {fmtCOP(debe)}</>}
                  {debe > 0 && leDeben > 0 && " · "}
                  {leDeben > 0 && <>le deben {fmtCOP(leDeben)}</>}
                  {alDia && "al día"}
                </div>
              </div>
              <div
                className="font-mono tabular-nums text-sm font-semibold shrink-0"
                style={{
                  color: acreedor
                    ? "var(--success, #4CA45A)"
                    : neto < 0
                    ? "var(--danger)"
                    : "var(--muted)",
                }}
              >
                {neto === 0 ? "±0" : `${acreedor ? "+" : ""}${fmtCOP(neto)}`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function GastoForm({
  initial,
  readOnly = false,
  onSaved,
  onCancel,
}: {
  initial: Gasto | null;
  readOnly?: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Gasto>(
    initial ?? {
      id: uid(),
      fecha: todayISO(),
      categoria: "alimentacion",
      concepto: "",
      monto: 0,
      createdAt: nowISO(),
    }
  );

  const participantes = form.participantes ?? [];
  const nParticipantes = participantes.length;
  const porPersona = nParticipantes > 0 ? form.monto / nParticipantes : 0;
  const pagadosSet = new Set(form.pagadoPorIds ?? []);
  if (form.pagadoPor && participantes.includes(form.pagadoPor)) {
    pagadosSet.add(form.pagadoPor);
  }

  function toggleParticipantePago(id: string) {
    if (id === form.pagadoPor) return;
    const set = new Set(form.pagadoPorIds ?? []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setForm({ ...form, pagadoPorIds: Array.from(set) });
  }

  function toggleParticipante(id: string) {
    const set = new Set(participantes);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const next = Array.from(set);
    setForm({ ...form, participantes: next.length ? next : undefined });
  }

  function seleccionarTodos() {
    const all = db?.propietarios.map((p) => p.id) ?? [];
    setForm({ ...form, participantes: all.length ? all : undefined });
  }

  function ninguno() {
    setForm({ ...form, participantes: undefined });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.concepto.trim()) return alert("Escribe un concepto");
    if (form.monto <= 0) return alert("Ingresa un monto válido");
    updateCollection("gastos", (list) => [
      ...list.filter((g) => g.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este gasto?")) return;
    updateCollection("gastos", (list) => list.filter((g) => g.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <fieldset disabled={readOnly} className="contents">
      <FormRow label="Fecha" required>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow label="Categoría" required>
        <select
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaGasto })}
        >
          {CATEGORIAS_GASTO.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Concepto" required colspan={2}>
        <input
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
          placeholder="Ej. Sal mineralizada 40 kg"
        />
      </FormRow>
      <FormRow label="Monto (COP)" required>
        <input
          type="number"
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Pagado por" hint="Quién puso la plata">
        <select
          value={form.pagadoPor ?? ""}
          onChange={(e) => setForm({ ...form, pagadoPor: e.target.value || undefined })}
        >
          <option value="">—</option>
          {db?.propietarios.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </FormRow>

      <div className="md:col-span-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            Participantes de la compra
            {nParticipantes > 0 && (
              <span className="text-muted normal-case tracking-normal font-sans ml-2">
                ({nParticipantes})
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={seleccionarTodos}
              className="text-[0.68rem] text-primary hover:underline font-mono uppercase tracking-wider"
            >
              todos
            </button>
            {nParticipantes > 0 && (
              <button
                type="button"
                onClick={ninguno}
                className="text-[0.68rem] text-muted hover:text-danger font-mono uppercase tracking-wider"
              >
                ninguno
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {db?.propietarios.map((p) => {
            const on = participantes.includes(p.id);
            const initials = p.nombre.slice(0, 2).toUpperCase();
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => toggleParticipante(p.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition"
                style={{
                  background: on ? "var(--primary-soft)" : "var(--surface)",
                  borderColor: on ? "var(--primary)" : "var(--rule)",
                  color: on ? "var(--primary)" : "var(--fg)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold shrink-0"
                  style={{
                    background: on ? "var(--primary)" : "var(--surface-2)",
                    color: on ? "var(--primary-ink)" : "var(--muted)",
                  }}
                >
                  {on ? "✓" : initials}
                </div>
                <span className="text-sm truncate">{p.nombre}</span>
              </button>
            );
          })}
        </div>
        {nParticipantes >= 1 && form.monto > 0 && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
            }}
          >
            <span>
              {nParticipantes === 1 ? "Un solo participante" : `${nParticipantes} participantes`} · reparto{" "}
              {nParticipantes > 1 ? "en partes iguales" : ""}
            </span>
            <span className="font-mono font-semibold">
              {fmtCOP(porPersona)} <span className="text-xs opacity-70">c/u</span>
            </span>
          </div>
        )}
        {nParticipantes === 0 && (
          <p className="text-[0.68rem] text-subtle">
            Sin participantes: el gasto lo asume completo quien lo pagó.
          </p>
        )}
      </div>

      {nParticipantes > 0 && form.monto > 0 && (
        <div className="md:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="eyebrow">
              Quién ya pagó su parte
              <span className="text-muted normal-case tracking-normal font-sans ml-2">
                ({pagadosSet.size}/{nParticipantes})
              </span>
            </span>
            <span className="text-[0.65rem] text-subtle">
              {fmtCOP(porPersona)} c/u
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {participantes.map((pid) => {
              const p = db?.propietarios.find((x) => x.id === pid);
              if (!p) return null;
              const on = pagadosSet.has(pid);
              const esPagador = form.pagadoPor === pid;
              return (
                <button
                  type="button"
                  key={pid}
                  onClick={() => toggleParticipantePago(pid)}
                  disabled={esPagador}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition"
                  style={{
                    background: on
                      ? "color-mix(in oklab, var(--success, #4CA45A) 14%, transparent)"
                      : "var(--surface)",
                    borderColor: on ? "var(--success, #4CA45A)" : "var(--rule)",
                    color: on ? "var(--success, #4CA45A)" : "var(--fg)",
                    cursor: esPagador ? "default" : "pointer",
                    opacity: esPagador ? 0.9 : 1,
                  }}
                  title={
                    esPagador
                      ? "Adelantó la plata — cuenta como pagado automáticamente"
                      : on
                      ? "Marcado como pagado (click para desmarcar)"
                      : "Debe su parte (click para marcar pagado)"
                  }
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold shrink-0"
                    style={{
                      background: on ? "var(--success, #4CA45A)" : "var(--surface-2)",
                      color: on ? "#fff" : "var(--muted)",
                    }}
                  >
                    {on ? "✓" : p.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{p.nombre}</div>
                    <div className="text-[0.6rem] text-subtle">
                      {esPagador ? "adelantó la plata" : on ? "al día" : "debe"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <FormRow label="Proveedor" colspan={2}>
        <input
          value={form.proveedor ?? ""}
          onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
        />
      </FormRow>
      <FormRow label="Notas" colspan={2}>
        <textarea
          rows={2}
          value={form.notas ?? ""}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
      </FormRow>
      </fieldset>
      {!readOnly && (
        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <div>
            {initial ? (
              <button type="button" className="btn btn-danger" onClick={remove}>
                Eliminar
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </div>
      )}
      {readOnly && (
        <div className="md:col-span-2 flex justify-end pt-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cerrar</button>
        </div>
      )}
    </form>
  );
}

function IngresoForm({
  initial,
  readOnly = false,
  onSaved,
  onCancel,
}: {
  initial: Ingreso | null;
  readOnly?: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Ingreso>(
    initial ?? {
      id: uid(),
      fecha: todayISO(),
      tipo: "venta_leche",
      concepto: "",
      monto: 0,
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.concepto.trim()) return alert("Escribe un concepto");
    if (form.monto <= 0) return alert("Ingresa un monto válido");
    updateCollection("ingresos", (list) => [
      ...list.filter((i) => i.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este ingreso?")) return;
    updateCollection("ingresos", (list) => list.filter((i) => i.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <fieldset disabled={readOnly} className="contents">
      <FormRow label="Fecha" required>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow label="Tipo" required>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoIngreso })}
        >
          {TIPOS_INGRESO.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Concepto" required colspan={2}>
        <input
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
        />
      </FormRow>
      <FormRow label="Monto (COP)" required>
        <input
          type="number"
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Comprador">
        <input
          value={form.comprador ?? ""}
          onChange={(e) => setForm({ ...form, comprador: e.target.value })}
        />
      </FormRow>
      {form.tipo === "venta_animal" && (
        <FormRow label="Animal vendido" colspan={2}>
          <select
            value={form.animalId ?? ""}
            onChange={(e) => setForm({ ...form, animalId: e.target.value || undefined })}
          >
            <option value="">—</option>
            {db?.animales.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
          </select>
        </FormRow>
      )}
      <FormRow label="Notas" colspan={2}>
        <textarea
          rows={2}
          value={form.notas ?? ""}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
      </FormRow>
      </fieldset>
      {!readOnly && (
        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <div>
            {initial ? (
              <button type="button" className="btn btn-danger" onClick={remove}>
                Eliminar
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </div>
      )}
      {readOnly && (
        <div className="md:col-span-2 flex justify-end pt-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cerrar</button>
        </div>
      )}
    </form>
  );
}
