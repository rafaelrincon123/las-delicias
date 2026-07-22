"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtCOP, fmtDate } from "@/lib/format";
import {
  CATEGORIAS_GASTO,
  CategoriaGasto,
  Gasto,
  Ingreso,
  TipoIngreso,
} from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import StatCard from "@/components/StatCard";

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
        <StatCard
          label="Ingresos 30 d"
          value={fmtCOP(totales.totalI)}
          accent="success"
        />
        <StatCard
          label="Gastos 30 d"
          value={fmtCOP(totales.totalG)}
          accent="danger"
        />
        <StatCard
          label="Balance 30 d"
          value={<span className={totales.balance >= 0 ? "text-success" : "text-danger"}>{fmtCOP(totales.balance)}</span>}
          accent={totales.balance >= 0 ? "success" : "danger"}
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
                setOpenI(true);
              }}
            >
              + Nuevo ingreso
            </button>
          )}
        </div>
      </div>

      {tab === "gastos" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Pagó</th>
                <th>Participantes</th>
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
                return (
                  <tr key={g.id}>
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
                      ) : nParticipantes === db!.propietarios.length ? (
                        <span className="chip primary" style={{ fontSize: "0.62rem" }}>
                          Todos ({nParticipantes})
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {participantes.map((pid) => {
                            const p = db!.propietarios.find((x) => x.id === pid);
                            if (!p) return null;
                            return (
                              <span
                                key={pid}
                                className="chip"
                                style={{
                                  fontSize: "0.6rem",
                                  padding: "0.1rem 0.5rem",
                                }}
                                title={p.nombre}
                              >
                                {p.nombre.slice(0, 2).toUpperCase()}
                              </span>
                            );
                          })}
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
                        onClick={() => {
                          setEditG(g);
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
                <tr key={i.id}>
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
                      onClick={() => {
                        setEditI(i);
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
        title={editG ? "Editar gasto" : "Nuevo gasto"}
      >
        <GastoForm
          initial={editG}
          onSaved={() => setOpenG(false)}
          onCancel={() => setOpenG(false)}
        />
      </Modal>
      <Modal
        open={openI}
        onClose={() => setOpenI(false)}
        title={editI ? "Editar ingreso" : "Nuevo ingreso"}
      >
        <IngresoForm
          initial={editI}
          onSaved={() => setOpenI(false)}
          onCancel={() => setOpenI(false)}
        />
      </Modal>
    </div>
  );
}

function GastoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Gasto | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Gasto>(
    initial ?? {
      id: uid(),
      fecha: new Date().toISOString().slice(0, 10),
      categoria: "alimentacion",
      concepto: "",
      monto: 0,
      createdAt: nowISO(),
    }
  );

  const participantes = form.participantes ?? [];
  const nParticipantes = participantes.length;
  const porPersona = nParticipantes > 0 ? form.monto / nParticipantes : 0;

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
    </form>
  );
}

function IngresoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Ingreso | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Ingreso>(
    initial ?? {
      id: uid(),
      fecha: new Date().toISOString().slice(0, 10),
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
    </form>
  );
}
