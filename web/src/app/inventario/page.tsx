"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtDate, fmtCOP, fmtNumber } from "@/lib/format";
import {
  Insumo,
  MovimientoInsumo,
  CATEGORIAS_INSUMO,
  UNIDADES_INSUMO,
  CategoriaInsumo,
  UnidadInsumo,
  TipoMovimientoInsumo,
} from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import { IconAlert, IconArrowUp, IconArrowDown } from "@/components/icons";

export default function InventarioPage() {
  const { db, ready } = useDB();
  const [tab, setTab] = useState<"stock" | "movimientos">("stock");
  const [filtroCat, setFiltroCat] = useState<CategoriaInsumo | "todas">("todas");
  const [openInsumo, setOpenInsumo] = useState(false);
  const [editInsumo, setEditInsumo] = useState<Insumo | null>(null);
  const [openMov, setOpenMov] = useState(false);
  const [movInsumoId, setMovInsumoId] = useState<string | undefined>();

  const stats = useMemo(() => {
    if (!db) return { total: 0, bajo: 0, sinStock: 0, valor: 0 };
    let bajo = 0;
    let sinStock = 0;
    let valor = 0;
    for (const i of db.insumos) {
      if (i.stock <= 0) sinStock++;
      else if (i.stock <= i.minimo) bajo++;
      if (i.costoUnitario) valor += i.stock * i.costoUnitario;
    }
    return { total: db.insumos.length, bajo, sinStock, valor };
  }, [db]);

  const insumosVisibles = useMemo(() => {
    if (!db) return [];
    return db.insumos
      .filter((i) => filtroCat === "todas" || i.categoria === filtroCat)
      .sort((a, b) => {
        const aa = a.stock <= 0 ? 0 : a.stock <= a.minimo ? 1 : 2;
        const bb = b.stock <= 0 ? 0 : b.stock <= b.minimo ? 1 : 2;
        if (aa !== bb) return aa - bb;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [db, filtroCat]);

  const movimientos = useMemo(() => {
    if (!db) return [];
    return [...db.movimientosInsumo].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [db]);

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Insumos activos" value={stats.total} accent="primary" />
        <MiniStat label="Bajo mínimo" value={stats.bajo} accent="accent" />
        <MiniStat label="Sin stock" value={stats.sinStock} accent="danger" />
        <MiniStat
          label="Valor en bodega"
          value={fmtCOP(stats.valor).replace("COP", "").trim()}
          accent="primary"
          isText
        />
      </section>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            className={"btn " + (tab === "stock" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("stock")}
          >
            Stock ({db!.insumos.length})
          </button>
          <button
            className={"btn " + (tab === "movimientos" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("movimientos")}
          >
            Movimientos ({movimientos.length})
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tab === "stock" && (
            <select
              value={filtroCat}
              onChange={(e) =>
                setFiltroCat(e.target.value as CategoriaInsumo | "todas")
              }
              style={{ minWidth: "160px" }}
              className="!w-auto"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIAS_INSUMO.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => {
              setMovInsumoId(undefined);
              setOpenMov(true);
            }}
          >
            + Movimiento
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditInsumo(null);
              setOpenInsumo(true);
            }}
          >
            + Nuevo insumo
          </button>
        </div>
      </div>

      {tab === "stock" && (
        <div className="card p-0 overflow-x-auto">
          {insumosVisibles.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              No hay insumos registrados. Agrega el primero.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Categoría</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Mínimo</th>
                  <th className="text-right">Costo unit.</th>
                  <th className="text-right">Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {insumosVisibles.map((i) => {
                  const sinStock = i.stock <= 0;
                  const bajo = !sinStock && i.stock <= i.minimo;
                  const valor = (i.costoUnitario ?? 0) * i.stock;
                  const cat = CATEGORIAS_INSUMO.find((c) => c.value === i.categoria);
                  return (
                    <tr key={i.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {(sinStock || bajo) && (
                            <IconAlert
                              size={14}
                              className={sinStock ? "text-danger" : "text-accent"}
                            />
                          )}
                          <div>
                            <div className="font-medium">{i.nombre}</div>
                            {i.proveedor && (
                              <div className="text-xs text-muted">
                                {i.proveedor}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="chip">{cat?.label ?? i.categoria}</span>
                      </td>
                      <td className="text-right">
                        <span
                          className={
                            "num text-lg " +
                            (sinStock
                              ? "text-danger"
                              : bajo
                              ? "text-accent"
                              : "text-fg")
                          }
                        >
                          {fmtNumber(i.stock, 0)}
                        </span>
                        <span className="text-xs text-muted ml-1">
                          {UNIDADES_INSUMO.find((u) => u.value === i.unidad)?.label}
                        </span>
                      </td>
                      <td className="text-right font-mono text-xs text-muted">
                        {fmtNumber(i.minimo, 0)}
                      </td>
                      <td className="text-right font-mono text-xs">
                        {i.costoUnitario ? fmtCOP(i.costoUnitario) : "—"}
                      </td>
                      <td className="text-right font-mono text-xs">
                        {i.costoUnitario ? fmtCOP(valor) : "—"}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          className="text-xs text-primary hover:underline mr-3"
                          onClick={() => {
                            setMovInsumoId(i.id);
                            setOpenMov(true);
                          }}
                        >
                          movimiento
                        </button>
                        <button
                          className="text-xs text-accent hover:underline"
                          onClick={() => {
                            setEditInsumo(i);
                            setOpenInsumo(true);
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
          )}
        </div>
      )}

      {tab === "movimientos" && (
        <div className="card p-0 overflow-x-auto">
          {movimientos.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              Sin movimientos aún.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Insumo</th>
                  <th>Tipo</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Costo</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => {
                  const ins = db!.insumos.find((x) => x.id === m.insumoId);
                  const isEntrada = m.tipo === "entrada";
                  const isSalida = m.tipo === "salida";
                  return (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap">{fmtDate(m.fecha)}</td>
                      <td>{ins?.nombre ?? "—"}</td>
                      <td>
                        <span
                          className={
                            "chip " +
                            (isEntrada ? "success" : isSalida ? "danger" : "")
                          }
                          style={{ padding: "0.15rem 0.55rem", fontSize: "0.65rem" }}
                        >
                          {isEntrada ? (
                            <>
                              <IconArrowUp size={10} /> entrada
                            </>
                          ) : isSalida ? (
                            <>
                              <IconArrowDown size={10} /> salida
                            </>
                          ) : (
                            "ajuste"
                          )}
                        </span>
                      </td>
                      <td className="text-right font-mono">
                        <span
                          className={
                            isSalida
                              ? "text-danger"
                              : isEntrada
                              ? "text-success"
                              : "text-fg"
                          }
                        >
                          {isSalida ? "−" : isEntrada ? "+" : ""}
                          {fmtNumber(Math.abs(m.cantidad), 0)}
                        </span>
                        <span className="text-xs text-muted ml-1">
                          {ins &&
                            UNIDADES_INSUMO.find((u) => u.value === ins.unidad)?.label}
                        </span>
                      </td>
                      <td className="text-right font-mono text-xs">
                        {fmtCOP(m.costoTotal)}
                      </td>
                      <td className="text-xs text-muted">{m.motivo ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        open={openInsumo}
        onClose={() => setOpenInsumo(false)}
        title={editInsumo ? "Editar insumo" : "Nuevo insumo"}
        eyebrow="Inventario"
      >
        <InsumoForm
          initial={editInsumo}
          onSaved={() => setOpenInsumo(false)}
          onCancel={() => setOpenInsumo(false)}
        />
      </Modal>

      <Modal
        open={openMov}
        onClose={() => setOpenMov(false)}
        title="Nuevo movimiento"
        eyebrow="Inventario"
      >
        <MovimientoForm
          insumoIdPreseleccionado={movInsumoId}
          onSaved={() => setOpenMov(false)}
          onCancel={() => setOpenMov(false)}
        />
      </Modal>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
  isText,
}: {
  label: string;
  value: number | string;
  accent: "primary" | "danger" | "accent";
  isText?: boolean;
}) {
  const color =
    accent === "danger"
      ? "var(--danger)"
      : accent === "accent"
      ? "var(--accent)"
      : "var(--primary)";
  const hasValue = isText ? true : (value as number) > 0;
  return (
    <div className="card-tight card">
      <div className="eyebrow">{label}</div>
      <div
        className={"num mt-1 " + (isText ? "text-xl" : "text-3xl")}
        style={{ color: hasValue ? color : "var(--muted)" }}
      >
        {value}
      </div>
    </div>
  );
}

function InsumoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Insumo | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Insumo>(
    initial ?? {
      id: uid(),
      nombre: "",
      categoria: "alimentacion",
      unidad: "kg",
      stock: 0,
      minimo: 0,
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert("Falta el nombre del insumo");
      return;
    }
    updateCollection("insumos", (list) => [
      ...list.filter((i) => i.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este insumo? Sus movimientos quedarán huérfanos.")) return;
    updateCollection("insumos", (list) => list.filter((i) => i.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Nombre" required colspan={2}>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej. Sal mineralizada"
          autoFocus
        />
      </FormRow>
      <FormRow label="Categoría" required>
        <select
          value={form.categoria}
          onChange={(e) =>
            setForm({ ...form, categoria: e.target.value as CategoriaInsumo })
          }
        >
          {CATEGORIAS_INSUMO.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Unidad" required>
        <select
          value={form.unidad}
          onChange={(e) =>
            setForm({ ...form, unidad: e.target.value as UnidadInsumo })
          }
        >
          {UNIDADES_INSUMO.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Stock actual" required>
        <input
          type="number"
          step="any"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Mínimo (alerta)" required>
        <input
          type="number"
          step="any"
          value={form.minimo}
          onChange={(e) => setForm({ ...form, minimo: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Costo unitario (COP)">
        <input
          type="number"
          value={form.costoUnitario ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              costoUnitario: parseFloat(e.target.value) || undefined,
            })
          }
        />
      </FormRow>
      <FormRow label="Proveedor">
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
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}

function MovimientoForm({
  insumoIdPreseleccionado,
  onSaved,
  onCancel,
}: {
  insumoIdPreseleccionado?: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<MovimientoInsumo>({
    id: uid(),
    insumoId: insumoIdPreseleccionado ?? "",
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "entrada",
    cantidad: 0,
    createdAt: nowISO(),
  });

  const insumo = db?.insumos.find((i) => i.id === form.insumoId);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.insumoId) {
      alert("Selecciona un insumo");
      return;
    }
    if (!form.cantidad || form.cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }
    const ins = db!.insumos.find((i) => i.id === form.insumoId);
    if (!ins) return;

    let nuevoStock = ins.stock;
    if (form.tipo === "entrada") nuevoStock += form.cantidad;
    else if (form.tipo === "salida") nuevoStock -= form.cantidad;
    else nuevoStock = form.cantidad;

    if (form.tipo === "salida" && nuevoStock < 0) {
      if (
        !confirm(
          `Esta salida deja el stock en ${nuevoStock} ${ins.unidad}. ¿Registrar de todos modos?`
        )
      )
        return;
    }

    updateCollection("insumos", (list) =>
      list.map((i) => (i.id === ins.id ? { ...i, stock: nuevoStock } : i))
    );
    updateCollection("movimientosInsumo", (list) => [...list, form]);
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Insumo" required colspan={2}>
        <select
          value={form.insumoId}
          onChange={(e) => setForm({ ...form, insumoId: e.target.value })}
          disabled={!!insumoIdPreseleccionado}
        >
          <option value="">— selecciona —</option>
          {db?.insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre} · stock {fmtNumber(i.stock, 0)}{" "}
              {UNIDADES_INSUMO.find((u) => u.value === i.unidad)?.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Tipo" required>
        <select
          value={form.tipo}
          onChange={(e) =>
            setForm({ ...form, tipo: e.target.value as TipoMovimientoInsumo })
          }
        >
          <option value="entrada">Entrada (compra / ingreso)</option>
          <option value="salida">Salida (consumo / uso)</option>
          <option value="ajuste">Ajuste (fijar stock)</option>
        </select>
      </FormRow>
      <FormRow label="Fecha" required>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow
        label={form.tipo === "ajuste" ? "Nuevo stock" : "Cantidad"}
        required
        hint={insumo ? UNIDADES_INSUMO.find((u) => u.value === insumo.unidad)?.label : ""}
      >
        <input
          type="number"
          step="any"
          value={form.cantidad || ""}
          onChange={(e) =>
            setForm({ ...form, cantidad: parseFloat(e.target.value) || 0 })
          }
          autoFocus
        />
      </FormRow>
      <FormRow label="Costo total (COP)">
        <input
          type="number"
          value={form.costoTotal ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              costoTotal: parseFloat(e.target.value) || undefined,
            })
          }
        />
      </FormRow>
      <FormRow label="Motivo / notas" colspan={2}>
        <input
          value={form.motivo ?? ""}
          onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          placeholder="Ej. Compra en Agroinsumos"
        />
      </FormRow>
      <FormRow label="Animal (opcional)">
        <select
          value={form.animalId ?? ""}
          onChange={(e) =>
            setForm({ ...form, animalId: e.target.value || undefined })
          }
        >
          <option value="">— ninguno —</option>
          {db?.animales
            .filter((a) => a.estado === "activo")
            .map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
        </select>
      </FormRow>
      <FormRow label="Potrero (opcional)">
        <select
          value={form.potreroId ?? ""}
          onChange={(e) =>
            setForm({ ...form, potreroId: e.target.value || undefined })
          }
        >
          <option value="">— ninguno —</option>
          {db?.potreros.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </FormRow>
      <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Registrar
        </button>
      </div>
    </form>
  );
}
