"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtDate, fmtNumber } from "@/lib/format";
import { Pesaje, ProduccionLeche, TipoPesaje } from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import AreaChart from "@/components/AreaChart";

const TIPOS_PESAJE: { value: TipoPesaje; label: string }[] = [
  { value: "nacimiento", label: "Nacimiento" },
  { value: "destete", label: "Destete" },
  { value: "periodico", label: "Periódico" },
  { value: "venta", label: "Venta" },
];

export default function ProduccionPage() {
  const { db, ready } = useDB();
  const [tab, setTab] = useState<"leche" | "pesajes">("leche");
  const [openLec, setOpenLec] = useState(false);
  const [openPes, setOpenPes] = useState(false);
  const [editLec, setEditLec] = useState<ProduccionLeche | null>(null);
  const [editPes, setEditPes] = useState<Pesaje | null>(null);
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const [filtroTipoPes, setFiltroTipoPes] = useState<TipoPesaje | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const leche = useMemo(() => {
    if (!db) return [];
    return [...db.leche]
      .filter((l) => (filtroAnimal ? l.animalId === filtroAnimal : true))
      .filter((l) => (desde ? l.fecha >= desde : true))
      .filter((l) => (hasta ? l.fecha <= hasta : true))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [db, filtroAnimal, desde, hasta]);

  const pesajes = useMemo(() => {
    if (!db) return [];
    return [...db.pesajes]
      .filter((p) => (filtroAnimal ? p.animalId === filtroAnimal : true))
      .filter((p) => (filtroTipoPes ? p.tipo === filtroTipoPes : true))
      .filter((p) => (desde ? p.fecha >= desde : true))
      .filter((p) => (hasta ? p.fecha <= hasta : true))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [db, filtroAnimal, filtroTipoPes, desde, hasta]);

  const filtrosActivos = !!filtroAnimal || !!filtroTipoPes || !!desde || !!hasta;

  function limpiarFiltros() {
    setFiltroAnimal("");
    setFiltroTipoPes("");
    setDesde("");
    setHasta("");
  }

  // Últimos 7 días agrupados
  const leche7 = useMemo(() => {
    const map = new Map<string, number>();
    const desde = new Date();
    desde.setDate(desde.getDate() - 6);
    leche.forEach((l) => {
      if (new Date(l.fecha) < desde) return;
      const key = l.fecha.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + l.litrosManana + l.litrosTarde);
    });
    // completar días faltantes
    const out: { fecha: string; litros: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ fecha: key, litros: map.get(key) ?? 0 });
    }
    return out;
  }, [leche]);

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            className={"btn " + (tab === "leche" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("leche")}
          >
            Leche ({leche.length})
          </button>
          <button
            className={"btn " + (tab === "pesajes" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("pesajes")}
          >
            Pesajes ({pesajes.length})
          </button>
        </div>
        <div>
          {tab === "leche" ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditLec(null);
                setOpenLec(true);
              }}
            >
              + Registrar ordeño
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditPes(null);
                setOpenPes(true);
              }}
            >
              + Registrar pesaje
            </button>
          )}
        </div>
      </div>

      <div className="card card-tight">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-2">
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
          {tab === "pesajes" && (
            <div>
              <div className="eyebrow mb-1">Tipo pesaje</div>
              <select
                value={filtroTipoPes}
                onChange={(e) => setFiltroTipoPes(e.target.value as TipoPesaje | "")}
              >
                <option value="">Todos</option>
                {TIPOS_PESAJE.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              {tab === "leche"
                ? `${leche.length} registro${leche.length === 1 ? "" : "s"}`
                : `${pesajes.length} pesaje${pesajes.length === 1 ? "" : "s"}`}
            </span>
            <button className="text-xs text-primary hover:underline font-medium" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {tab === "leche" && (
        <>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="text-[0.62rem] font-mono uppercase tracking-widest text-muted mb-1">Ordeño</div>
                <h2 className="text-lg font-semibold tracking-tight">Producción · últimos 7 días</h2>
              </div>
              <div className="text-right">
                <div className="text-[0.62rem] font-mono uppercase tracking-widest text-muted">Total semana</div>
                <div className="num text-3xl text-primary leading-none mt-1">
                  {fmtNumber(leche7.reduce((s, d) => s + d.litros, 0), 0)} <span className="text-base text-muted">L</span>
                </div>
              </div>
            </div>
            <AreaChart
              data={leche7.map((d) => ({
                label: new Date(d.fecha).toLocaleDateString("es-CO", { weekday: "short" }).slice(0, 3),
                value: d.litros,
              }))}
              color="var(--primary)"
              unit="L"
              height={200}
            />
          </div>

          <div className="card p-0 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Vaca</th>
                  <th className="text-right">Mañana</th>
                  <th className="text-right">Tarde</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leche.slice(0, 50).map((l) => {
                  const animal = db!.animales.find((a) => a.id === l.animalId);
                  const total = l.litrosManana + l.litrosTarde;
                  return (
                    <tr key={l.id}>
                      <td>{fmtDate(l.fecha)}</td>
                      <td>
                        {animal?.nombre ?? "—"}{" "}
                        <span className="font-mono text-xs text-muted">
                          #{animal?.nroIdentificacion}
                        </span>
                      </td>
                      <td className="text-right font-mono tabular-nums">
                        {fmtNumber(l.litrosManana, 1)}
                      </td>
                      <td className="text-right font-mono tabular-nums">
                        {fmtNumber(l.litrosTarde, 1)}
                      </td>
                      <td className="text-right font-mono tabular-nums font-semibold">
                        {fmtNumber(total, 1)}
                      </td>
                      <td className="text-right">
                        <button
                          className="text-xs text-accent hover:underline"
                          onClick={() => {
                            setEditLec(l);
                            setOpenLec(true);
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

      {tab === "pesajes" && (
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
              {pesajes.map((p) => {
                const animal = db!.animales.find((a) => a.id === p.animalId);
                // ganancia diaria vs pesaje anterior del mismo animal
                const previos = pesajes
                  .filter(
                    (x) =>
                      x.animalId === p.animalId &&
                      new Date(x.fecha).getTime() < new Date(p.fecha).getTime()
                  )
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                const anterior = previos[0];
                let gan: number | null = null;
                if (anterior) {
                  const dias =
                    (new Date(p.fecha).getTime() - new Date(anterior.fecha).getTime()) /
                    (1000 * 60 * 60 * 24);
                  if (dias > 0) gan = ((p.pesoKg - anterior.pesoKg) / dias) * 1000;
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
                          setEditPes(p);
                          setOpenPes(true);
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
        open={openLec}
        onClose={() => setOpenLec(false)}
        title={editLec ? "Editar ordeño" : "Registrar ordeño"}
      >
        <LecheForm
          initial={editLec}
          onSaved={() => setOpenLec(false)}
          onCancel={() => setOpenLec(false)}
        />
      </Modal>
      <Modal
        open={openPes}
        onClose={() => setOpenPes(false)}
        title={editPes ? "Editar pesaje" : "Registrar pesaje"}
      >
        <PesajeForm
          initial={editPes}
          onSaved={() => setOpenPes(false)}
          onCancel={() => setOpenPes(false)}
        />
      </Modal>
    </div>
  );
}

function LecheForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: ProduccionLeche | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<ProduccionLeche>(
    initial ?? {
      id: uid(),
      animalId: "",
      fecha: new Date().toISOString().slice(0, 10),
      litrosManana: 0,
      litrosTarde: 0,
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.animalId) return alert("Selecciona la vaca");
    updateCollection("leche", (list) => [
      ...list.filter((l) => l.id !== form.id),
      form,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este registro?")) return;
    updateCollection("leche", (list) => list.filter((l) => l.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Vaca" required colspan={2}>
        <select
          value={form.animalId}
          onChange={(e) => setForm({ ...form, animalId: e.target.value })}
        >
          <option value="">— selecciona —</option>
          {db?.animales
            .filter((a) => a.sexo === "hembra" && a.categoria === "vaca" && a.estado === "activo")
            .map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
        </select>
      </FormRow>
      <FormRow label="Fecha" required colspan={2}>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow label="Litros mañana" required>
        <input
          type="number"
          step="0.1"
          value={form.litrosManana}
          onChange={(e) => setForm({ ...form, litrosManana: parseFloat(e.target.value) || 0 })}
        />
      </FormRow>
      <FormRow label="Litros tarde" required>
        <input
          type="number"
          step="0.1"
          value={form.litrosTarde}
          onChange={(e) => setForm({ ...form, litrosTarde: parseFloat(e.target.value) || 0 })}
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
    updateCollection("pesajes", (list) => list.filter((p) => p.id !== initial.id));
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
          onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPesaje })}
        >
          {TIPOS_PESAJE.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Peso (kg)" required colspan={2}>
        <input
          type="number"
          step="0.5"
          value={form.pesoKg}
          onChange={(e) => setForm({ ...form, pesoKg: parseFloat(e.target.value) || 0 })}
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
