"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtDate, fmtNumber } from "@/lib/format";
import { Pesaje, TipoPesaje } from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import AreaChart from "@/components/AreaChart";

const TIPOS_PESAJE: { value: TipoPesaje; label: string }[] = [
  { value: "nacimiento", label: "Nacimiento" },
  { value: "destete", label: "Destete" },
  { value: "periodico", label: "Periódico" },
  { value: "venta", label: "Venta" },
];

export default function PesoPage() {
  const { db, ready } = useDB();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Pesaje | null>(null);
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoPesaje | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const pesajesOrdenados = useMemo(() => {
    if (!db) return [];
    return [...db.pesajes].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }, [db]);

  const pesajesFiltrados = useMemo(() => {
    return pesajesOrdenados
      .filter((p) => (filtroAnimal ? p.animalId === filtroAnimal : true))
      .filter((p) => (filtroTipo ? p.tipo === filtroTipo : true))
      .filter((p) => (desde ? p.fecha >= desde : true))
      .filter((p) => (hasta ? p.fecha <= hasta : true))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [pesajesOrdenados, filtroAnimal, filtroTipo, desde, hasta]);

  const filtrosActivos =
    !!filtroAnimal || !!filtroTipo || !!desde || !!hasta;

  function limpiarFiltros() {
    setFiltroAnimal("");
    setFiltroTipo("");
    setDesde("");
    setHasta("");
  }

  // Estadísticas
  const stats = useMemo(() => {
    if (!db) return null;
    const activos = db.animales.filter((a) => a.estado === "activo");
    const sinPesaje = activos.filter(
      (a) => !db.pesajes.some((p) => p.animalId === a.id)
    );
    // último pesaje por animal
    const ultimoPorAnimal = new Map<string, Pesaje>();
    for (const p of pesajesOrdenados) {
      ultimoPorAnimal.set(p.animalId, p);
    }
    const pesoPromedio =
      ultimoPorAnimal.size > 0
        ? Array.from(ultimoPorAnimal.values()).reduce(
            (s, p) => s + p.pesoKg,
            0
          ) / ultimoPorAnimal.size
        : 0;

    // GDP promedio del hato (últimos 60 días)
    const hace60 = new Date();
    hace60.setDate(hace60.getDate() - 60);
    const gdps: number[] = [];
    for (const a of activos) {
      const propios = pesajesOrdenados.filter((p) => p.animalId === a.id);
      if (propios.length < 2) continue;
      const ultimo = propios[propios.length - 1];
      const previos = propios.slice(0, -1);
      const anterior = [...previos]
        .reverse()
        .find((p) => new Date(p.fecha) >= hace60) ?? previos[previos.length - 1];
      if (!anterior) continue;
      const dias =
        (new Date(ultimo.fecha).getTime() -
          new Date(anterior.fecha).getTime()) /
        (1000 * 60 * 60 * 24);
      if (dias <= 0) continue;
      gdps.push(((ultimo.pesoKg - anterior.pesoKg) / dias) * 1000);
    }
    const gdpPromedio =
      gdps.length > 0 ? gdps.reduce((s, x) => s + x, 0) / gdps.length : null;

    return {
      totalPesajes: db.pesajes.length,
      animalesConPeso: ultimoPorAnimal.size,
      sinPesaje: sinPesaje.length,
      pesoPromedio,
      gdpPromedio,
    };
  }, [db, pesajesOrdenados]);

  // Curva de crecimiento del animal seleccionado
  const curva = useMemo(() => {
    if (!filtroAnimal) return null;
    const puntos = pesajesOrdenados.filter((p) => p.animalId === filtroAnimal);
    if (puntos.length === 0) return null;
    return puntos.map((p) => ({
      label: fmtDate(p.fecha).slice(0, 6),
      value: p.pesoKg,
    }));
  }, [filtroAnimal, pesajesOrdenados]);

  const animalSel = useMemo(() => {
    if (!db || !filtroAnimal) return null;
    return db.animales.find((a) => a.id === filtroAnimal) ?? null;
  }, [db, filtroAnimal]);

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted">
          {stats
            ? `${stats.totalPesajes} pesajes · ${stats.animalesConPeso}/${
                stats.animalesConPeso + stats.sinPesaje
              } animales con peso registrado`
            : ""}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          + Registrar pesaje
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatBox
            label="Peso promedio"
            value={
              stats.pesoPromedio > 0
                ? `${fmtNumber(stats.pesoPromedio, 0)}`
                : "—"
            }
            unit="kg"
            hint="último pesaje/animal"
          />
          <StatBox
            label="GDP promedio"
            value={
              stats.gdpPromedio !== null
                ? `${fmtNumber(stats.gdpPromedio, 0)}`
                : "—"
            }
            unit="g/día"
            hint="ganancia diaria"
          />
          <StatBox
            label="Con peso"
            value={String(stats.animalesConPeso)}
            unit="cab."
            hint="al menos 1 pesaje"
          />
          <StatBox
            label="Sin pesaje"
            value={String(stats.sinPesaje)}
            unit="cab."
            hint="animales activos"
            danger={stats.sinPesaje > 0}
          />
        </div>
      )}

      <div className="card card-tight">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div className="md:col-span-2">
            <div className="eyebrow mb-1">Animal</div>
            <select
              value={filtroAnimal}
              onChange={(e) => setFiltroAnimal(e.target.value)}
            >
              <option value="">Todos</option>
              {db!.animales
                .slice()
                .sort((a, b) =>
                  a.nroIdentificacion.localeCompare(b.nroIdentificacion)
                )
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
              onChange={(e) =>
                setFiltroTipo(e.target.value as TipoPesaje | "")
              }
            >
              <option value="">Todos</option>
              {TIPOS_PESAJE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="eyebrow mb-1">Desde</div>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div>
              <div className="eyebrow mb-1">Hasta</div>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>
        </div>
        {filtrosActivos && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-rule">
            <span className="text-xs text-muted">
              {pesajesFiltrados.length} pesaje
              {pesajesFiltrados.length === 1 ? "" : "s"}
            </span>
            <button
              className="text-xs text-primary hover:underline font-medium"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {curva && curva.length >= 2 && animalSel && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="text-[0.62rem] font-mono uppercase tracking-widest text-muted mb-1">
                Curva de crecimiento
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                {animalSel.nombre ?? "—"}{" "}
                <span className="font-mono text-sm text-muted">
                  #{animalSel.nroIdentificacion}
                </span>
              </h2>
            </div>
            <div className="text-right">
              <div className="text-[0.62rem] font-mono uppercase tracking-widest text-muted">
                Último peso
              </div>
              <div className="num text-3xl text-primary leading-none mt-1">
                {fmtNumber(curva[curva.length - 1].value, 0)}{" "}
                <span className="text-base text-muted">kg</span>
              </div>
            </div>
          </div>
          <AreaChart
            data={curva}
            color="var(--primary)"
            unit="kg"
            height={220}
          />
        </div>
      )}

      <div className="card p-0 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Animal</th>
              <th className="text-right">Peso (kg)</th>
              <th>Tipo</th>
              <th className="text-right">Gan. día (g)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pesajesFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-muted py-8 text-sm"
                >
                  {filtrosActivos
                    ? "Sin pesajes con esos filtros."
                    : "Aún no hay pesajes. Registra el primero."}
                </td>
              </tr>
            ) : (
              pesajesFiltrados.map((p) => {
                const animal = db!.animales.find((a) => a.id === p.animalId);
                const previos = pesajesOrdenados
                  .filter(
                    (x) =>
                      x.animalId === p.animalId &&
                      new Date(x.fecha).getTime() < new Date(p.fecha).getTime()
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                  );
                const anterior = previos[0];
                let gan: number | null = null;
                if (anterior) {
                  const dias =
                    (new Date(p.fecha).getTime() -
                      new Date(anterior.fecha).getTime()) /
                    (1000 * 60 * 60 * 24);
                  if (dias > 0)
                    gan = ((p.pesoKg - anterior.pesoKg) / dias) * 1000;
                }
                return (
                  <tr key={p.id}>
                    <td>{fmtDate(p.fecha)}</td>
                    <td>
                      {animal?.nombre ?? "—"}{" "}
                      <span className="font-mono text-xs text-muted">
                        #{animal?.nroIdentificacion}
                      </span>
                    </td>
                    <td className="text-right font-mono tabular-nums">
                      {fmtNumber(p.pesoKg, 1)}
                    </td>
                    <td>
                      <span className="chip">
                        {TIPOS_PESAJE.find((t) => t.value === p.tipo)?.label}
                      </span>
                    </td>
                    <td className="text-right font-mono tabular-nums">
                      {gan !== null ? fmtNumber(gan, 0) : "—"}
                    </td>
                    <td className="text-right">
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => {
                          setEdit(p);
                          setOpen(true);
                        }}
                      >
                        editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Editar pesaje" : "Registrar pesaje"}
      >
        <PesajeForm
          initial={edit}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function StatBox({
  label,
  value,
  unit,
  hint,
  danger,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  danger?: boolean;
}) {
  const color = danger ? "var(--danger)" : "var(--primary)";
  return (
    <div className="card card-tight relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: color, opacity: 0.5 }}
      />
      <div className="eyebrow" style={{ color }}>
        {label}
      </div>
      <div
        className="num text-2xl md:text-3xl mt-1.5 tabular-nums whitespace-nowrap"
        style={{ color: "var(--fg)" }}
      >
        {value}
        {unit && (
          <span className="text-sm text-muted ml-1 font-normal">{unit}</span>
        )}
      </div>
      {hint && <div className="text-[0.68rem] text-muted mt-1">{hint}</div>}
    </div>
  );
}

function PesajeForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Pesaje | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Pesaje>(
    initial ?? {
      id: uid(),
      animalId: "",
      fecha: new Date().toISOString().slice(0, 10),
      pesoKg: 0,
      tipo: "periodico",
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.animalId) return alert("Selecciona el animal");
    if (form.pesoKg <= 0) return alert("Ingresa un peso válido");
    updateCollection("pesajes", (list) => [
      ...list.filter((p) => p.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este pesaje?")) return;
    updateCollection("pesajes", (list) =>
      list.filter((p) => p.id !== initial.id)
    );
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
            .sort((a, b) =>
              a.nroIdentificacion.localeCompare(b.nroIdentificacion)
            )
            .map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
        </select>
      </FormRow>
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
          onChange={(e) =>
            setForm({ ...form, tipo: e.target.value as TipoPesaje })
          }
        >
          {TIPOS_PESAJE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Peso (kg)" required colspan={2}>
        <input
          type="number"
          step="0.5"
          value={form.pesoKg}
          onChange={(e) =>
            setForm({ ...form, pesoKg: parseFloat(e.target.value) || 0 })
          }
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
