"use client";

import { useState } from "react";
import { useDB } from "@/lib/useDB";
import { useAuth } from "@/lib/useAuth";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { todayISO } from "@/lib/format";
import { Ingreso, TipoIngreso } from "@/lib/types";
import FormRow from "@/components/FormRow";

export const TIPOS_INGRESO: { value: TipoIngreso; label: string }[] = [
  { value: "venta_leche", label: "Venta de leche" },
  { value: "venta_animal", label: "Venta de animal" },
  { value: "otros", label: "Otros" },
];

interface Props {
  initial: Ingreso | null;
  readOnly?: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

export default function IngresoForm({
  initial,
  readOnly = false,
  onSaved,
  onCancel,
}: Props) {
  const { db } = useDB();
  const { user } = useAuth();
  const [form, setForm] = useState<Ingreso>(
    initial ?? {
      id: uid(),
      fecha: todayISO(),
      tipo: "venta_leche",
      concepto: "",
      monto: 0,
      registradoPor: user?.id,
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.concepto.trim()) return alert("Escribe un concepto");
    if (form.monto <= 0) return alert("Ingresa un monto válido");
    const toSave: Ingreso = {
      ...form,
      registradoPor: form.registradoPor ?? user?.id,
    };
    updateCollection("ingresos", (list) => [
      ...list.filter((i) => i.id !== toSave.id),
      toSave,
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
        <FormRow label="Registrado por">
          <select
            value={form.registradoPor ?? ""}
            onChange={(e) =>
              setForm({ ...form, registradoPor: e.target.value || undefined })
            }
          >
            <option value="">—</option>
            {db?.propietarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
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
