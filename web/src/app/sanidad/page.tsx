"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtDate, fmtCOP, diasHasta } from "@/lib/format";
import { SanidadEvento, TIPOS_SANIDAD, TipoSanidad } from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";

export default function SanidadPage() {
  const { db, ready } = useDB();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SanidadEvento | null>(null);
  const [tab, setTab] = useState<"historial" | "proximos">("historial");
  const [q, setQ] = useState("");
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoSanidad | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const eventos = useMemo(() => {
    if (!db) return [];
    const term = q.trim().toLowerCase();
    return [...db.sanidad]
      .filter((e) => (filtroAnimal ? e.animalId === filtroAnimal : true))
      .filter((e) => (filtroTipo ? e.tipo === filtroTipo : true))
      .filter((e) => (desde ? e.fecha >= desde : true))
      .filter((e) => (hasta ? e.fecha <= hasta : true))
      .filter((e) => {
        if (!term) return true;
        const animal = db.animales.find((a) => a.id === e.animalId);
        return (
          e.producto.toLowerCase().includes(term) ||
          (e.dosis?.toLowerCase().includes(term) ?? false) ||
          (e.notas?.toLowerCase().includes(term) ?? false) ||
          (e.veterinario?.toLowerCase().includes(term) ?? false) ||
          (animal?.nombre?.toLowerCase().includes(term) ?? false) ||
          (animal?.nroIdentificacion.toLowerCase().includes(term) ?? false)
        );
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [db, q, filtroAnimal, filtroTipo, desde, hasta]);

  const proximos = useMemo(() => {
    return eventos
      .filter((e) => e.proximoEventoFecha)
      .map((e) => ({ ...e, dias: diasHasta(e.proximoEventoFecha) }))
      .filter((e) => e.dias !== null && e.dias! >= -30 && e.dias! <= 60)
      .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0));
  }, [eventos]);

  const filtrosActivos =
    !!q || !!filtroAnimal || !!filtroTipo || !!desde || !!hasta;

  function limpiarFiltros() {
    setQ("");
    setFiltroAnimal("");
    setFiltroTipo("");
    setDesde("");
    setHasta("");
  }

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            className={"btn " + (tab === "proximos" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("proximos")}
          >
            Próximos ({proximos.length})
          </button>
          <button
            className={"btn " + (tab === "historial" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("historial")}
          >
            Historial ({eventos.length})
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          + Nuevo evento
        </button>
      </div>

      <div className="card card-tight">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <div className="md:col-span-2">
            <div className="eyebrow mb-1">Buscar</div>
            <input
              type="search"
              placeholder="Producto, animal, notas…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <div className="eyebrow mb-1">Animal</div>
            <select value={filtroAnimal} onChange={(e) => setFiltroAnimal(e.target.value)}>
              <option value="">Todos</option>
              {db!.animales
                .sort((a, b) => a.nroIdentificacion.localeCompare(b.nroIdentificacion))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.nroIdentificacion} {a.nombre ?? ""}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <div className="eyebrow mb-1">Tipo</div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoSanidad | "")}
            >
              <option value="">Todos</option>
              {TIPOS_SANIDAD.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="eyebrow mb-1">Desde</div>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <div className="eyebrow mb-1">Hasta</div>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
        {filtrosActivos && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-rule">
            <span className="text-xs text-muted">
              Mostrando <span className="text-fg font-medium">{eventos.length}</span> resultado
              {eventos.length === 1 ? "" : "s"}
            </span>
            <button className="text-xs text-primary hover:underline font-medium" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {tab === "proximos" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Animal</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proximos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-6">
                    Sin eventos programados
                  </td>
                </tr>
              ) : (
                proximos.map((e) => {
                  const animal = db!.animales.find((a) => a.id === e.animalId);
                  const vencido = (e.dias ?? 0) < 0;
                  return (
                    <tr key={e.id}>
                      <td>{fmtDate(e.proximoEventoFecha)}</td>
                      <td>
                        {animal?.nombre ?? "—"}{" "}
                        <span className="font-mono text-xs text-muted">
                          #{animal?.nroIdentificacion}
                        </span>
                      </td>
                      <td>
                        <span className="chip">
                          {TIPOS_SANIDAD.find((t) => t.value === e.tipo)?.label}
                        </span>
                      </td>
                      <td>{e.producto}</td>
                      <td>
                        <span className={"chip " + (vencido ? "danger" : "accent")}>
                          {vencido ? `${Math.abs(e.dias!)} d vencida` : `en ${e.dias} d`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "historial" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Animal</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Dosis</th>
                <th>Costo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => {
                const animal = db!.animales.find((a) => a.id === e.animalId);
                return (
                  <tr key={e.id}>
                    <td>{fmtDate(e.fecha)}</td>
                    <td>
                      {animal?.nombre ?? "—"}{" "}
                      <span className="font-mono text-xs text-muted">
                        #{animal?.nroIdentificacion}
                      </span>
                    </td>
                    <td>
                      <span className="chip">
                        {TIPOS_SANIDAD.find((t) => t.value === e.tipo)?.label}
                      </span>
                    </td>
                    <td>{e.producto}</td>
                    <td className="font-mono text-xs">{e.dosis ?? "—"}</td>
                    <td className="font-mono text-xs">{fmtCOP(e.costo)}</td>
                    <td className="text-right">
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => {
                          setEdit(e);
                          setOpen(true);
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Editar evento" : "Nuevo evento sanitario"}
      >
        <SanidadForm
          initial={edit}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function SanidadForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: SanidadEvento | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<SanidadEvento>(
    initial ?? {
      id: uid(),
      animalId: "",
      tipo: "vacuna",
      producto: "",
      fecha: new Date().toISOString().slice(0, 10),
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.animalId) {
      alert("Selecciona un animal");
      return;
    }
    if (!form.producto.trim()) {
      alert("Falta el producto o descripción");
      return;
    }
    updateCollection("sanidad", (list) => [
      ...list.filter((s) => s.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este evento?")) return;
    updateCollection("sanidad", (list) => list.filter((s) => s.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Animal" required colspan={2}>
        <select
          value={form.animalId}
          onChange={(e) => setForm({ ...form, animalId: e.target.value })}
        >
          <option value="">— selecciona —</option>
          {db?.animales
            .filter((a) => a.estado === "activo")
            .map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
        </select>
      </FormRow>
      <FormRow label="Tipo" required>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoSanidad })}
        >
          {TIPOS_SANIDAD.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Producto / descripción" required>
        <input
          value={form.producto}
          onChange={(e) => setForm({ ...form, producto: e.target.value })}
          placeholder="Ej. Fiebre aftosa"
        />
      </FormRow>
      <FormRow label="Fecha" required>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow label="Próximo evento" hint="Opcional, para calendario">
        <input
          type="date"
          value={form.proximoEventoFecha?.slice(0, 10) ?? ""}
          onChange={(e) =>
            setForm({ ...form, proximoEventoFecha: e.target.value || undefined })
          }
        />
      </FormRow>
      <FormRow label="Dosis">
        <input
          value={form.dosis ?? ""}
          onChange={(e) => setForm({ ...form, dosis: e.target.value })}
          placeholder="Ej. 5 ml"
        />
      </FormRow>
      <FormRow label="Costo (COP)">
        <input
          type="number"
          value={form.costo ?? ""}
          onChange={(e) =>
            setForm({ ...form, costo: parseFloat(e.target.value) || undefined })
          }
        />
      </FormRow>
      <FormRow label="Veterinario" colspan={2}>
        <input
          value={form.veterinario ?? ""}
          onChange={(e) => setForm({ ...form, veterinario: e.target.value })}
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
