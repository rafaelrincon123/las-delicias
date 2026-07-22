"use client";

import { useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { Potrero } from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import { participacionPorPotrero } from "@/lib/participacion";
import { fmtPct } from "@/lib/format";

export default function PotrerosPage() {
  const { db, ready } = useDB();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Potrero | null>(null);

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          + Nuevo potrero
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {db!.potreros.map((p) => {
          const animalesAqui = db!.animales.filter(
            (a) => a.potreroId === p.id && a.estado === "activo"
          );
          const usados = animalesAqui.length;
          const ocupacion = p.capacidad ? Math.round((usados / p.capacidad) * 100) : 0;
          const sobre = ocupacion > 100;
          const shares = participacionPorPotrero(p.id, db!.animales, db!.propietarios);
          return (
            <div key={p.id} className="card">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold tracking-tight">{p.nombre}</h3>
                <button
                  className="text-xs text-accent hover:underline"
                  onClick={() => {
                    setEdit(p);
                    setOpen(true);
                  }}
                >
                  editar
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <div className="eyebrow">Área</div>
                  <div className="font-mono text-sm mt-1">{p.areaHectareas} ha</div>
                </div>
                <div>
                  <div className="eyebrow">Capacidad</div>
                  <div className="font-mono text-sm mt-1">{p.capacidad} cab.</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">Ocupación</span>
                  <span className={"font-mono " + (sobre ? "text-danger" : "text-fg")}>
                    {usados} / {p.capacidad}
                  </span>
                </div>
                <div className="h-2 rounded bg-surface-2 overflow-hidden">
                  <div
                    className={sobre ? "bg-danger h-full" : "bg-primary h-full"}
                    style={{ width: `${Math.min(ocupacion, 100)}%` }}
                  />
                </div>
              </div>

              {/* Participación por socio en este potrero */}
              <div className="mt-4 pt-4 border-t border-rule">
                <div className="flex items-center justify-between mb-2">
                  <div className="eyebrow">Participación</div>
                  <div className="text-[0.62rem] font-mono text-subtle">
                    {usados} {usados === 1 ? "cabeza" : "cabezas"}
                  </div>
                </div>
                {shares.length === 0 ? (
                  <p className="text-xs text-muted">Potrero vacío.</p>
                ) : (
                  <div className="space-y-2">
                    {shares.map((s) => (
                      <div key={s.socioId ?? "none"} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-mono font-semibold shrink-0"
                          style={{
                            background: s.socioId
                              ? "var(--primary-soft)"
                              : "var(--surface-2)",
                            color: s.socioId ? "var(--primary)" : "var(--muted)",
                          }}
                        >
                          {s.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs text-fg truncate">{s.nombre}</span>
                            <span className="text-[0.7rem] font-mono text-muted tabular-nums shrink-0">
                              {s.count} · {fmtPct(s.pct)}
                            </span>
                          </div>
                          <div className="h-1 rounded bg-surface-2 overflow-hidden mt-0.5">
                            <div
                              className="h-full rounded"
                              style={{
                                width: `${s.pct}%`,
                                background: s.socioId
                                  ? "var(--primary)"
                                  : "var(--muted)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {p.notas ? (
                <p className="text-xs text-muted mt-3">{p.notas}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? `Editar ${edit.nombre}` : "Nuevo potrero"}
      >
        <PotreroForm
          initial={edit}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function PotreroForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Potrero | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Potrero>(
    initial ?? {
      id: uid(),
      nombre: "",
      areaHectareas: 0,
      capacidad: 0,
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    updateCollection("potreros", (list) => {
      const withoutOld = list.filter((p) => p.id !== form.id);
      return [...withoutOld, form];
    });
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este potrero?")) return;
    updateCollection("potreros", (list) => list.filter((p) => p.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Nombre" required colspan={2}>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </FormRow>
      <FormRow label="Área (hectáreas)" required>
        <input
          type="number"
          step="0.1"
          value={form.areaHectareas}
          onChange={(e) => setForm({ ...form, areaHectareas: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Capacidad (cabezas)" required>
        <input
          type="number"
          value={form.capacidad}
          onChange={(e) => setForm({ ...form, capacidad: parseInt(e.target.value) || 0 })}
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
