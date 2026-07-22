"use client";

import { useMemo, useState } from "react";
import { useDB } from "@/lib/useDB";
import { updateCollection, uid, nowISO } from "@/lib/storage";
import { fmtDate, diasHasta } from "@/lib/format";
import {
  CategoriaAnimal,
  Parto,
  ResultadoServicio,
  ServicioReproductivo,
  Sexo,
  TipoServicio,
} from "@/lib/types";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";

export default function ReproduccionPage() {
  const { db, ready } = useDB();
  const [tab, setTab] = useState<"servicios" | "partos">("servicios");
  const [openServ, setOpenServ] = useState(false);
  const [openPar, setOpenPar] = useState(false);
  const [editServ, setEditServ] = useState<ServicioReproductivo | null>(null);
  const [editPar, setEditPar] = useState<Parto | null>(null);
  const [filtroAnimal, setFiltroAnimal] = useState("");
  const [filtroResultado, setFiltroResultado] = useState<ResultadoServicio | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const servicios = useMemo(() => {
    if (!db) return [];
    return [...db.servicios]
      .filter((s) => (filtroAnimal ? s.hembraId === filtroAnimal : true))
      .filter((s) => (filtroResultado ? s.resultado === filtroResultado : true))
      .filter((s) => (desde ? s.fechaServicio >= desde : true))
      .filter((s) => (hasta ? s.fechaServicio <= hasta : true))
      .sort(
        (a, b) => new Date(b.fechaServicio).getTime() - new Date(a.fechaServicio).getTime()
      );
  }, [db, filtroAnimal, filtroResultado, desde, hasta]);

  const partos = useMemo(() => {
    if (!db) return [];
    return [...db.partos]
      .filter((p) => (filtroAnimal ? p.madreId === filtroAnimal : true))
      .filter((p) => (desde ? p.fecha >= desde : true))
      .filter((p) => (hasta ? p.fecha <= hasta : true))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [db, filtroAnimal, desde, hasta]);

  const filtrosActivos = !!filtroAnimal || !!filtroResultado || !!desde || !!hasta;

  function limpiarFiltros() {
    setFiltroAnimal("");
    setFiltroResultado("");
    setDesde("");
    setHasta("");
  }

  if (!ready) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            className={"btn " + (tab === "servicios" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("servicios")}
          >
            Servicios ({servicios.length})
          </button>
          <button
            className={"btn " + (tab === "partos" ? "btn-primary" : "btn-ghost")}
            onClick={() => setTab("partos")}
          >
            Partos ({partos.length})
          </button>
        </div>
        <div className="flex gap-2">
          {tab === "servicios" ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditServ(null);
                setOpenServ(true);
              }}
            >
              + Nuevo servicio
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditPar(null);
                setOpenPar(true);
              }}
            >
              + Registrar parto
            </button>
          )}
        </div>
      </div>

      <div className="card card-tight">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-2">
            <div className="eyebrow mb-1">
              {tab === "servicios" ? "Hembra" : "Madre"}
            </div>
            <select value={filtroAnimal} onChange={(e) => setFiltroAnimal(e.target.value)}>
              <option value="">Todas</option>
              {db!.animales
                .filter((a) => a.sexo === "hembra")
                .sort((a, b) => a.nroIdentificacion.localeCompare(b.nroIdentificacion))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.nroIdentificacion} {a.nombre ?? ""}
                  </option>
                ))}
            </select>
          </div>
          {tab === "servicios" && (
            <div>
              <div className="eyebrow mb-1">Resultado</div>
              <select
                value={filtroResultado}
                onChange={(e) =>
                  setFiltroResultado(e.target.value as ResultadoServicio | "")
                }
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="prenada">Preñada</option>
                <option value="vacia">Vacía</option>
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
              {tab === "servicios"
                ? `${servicios.length} servicio${servicios.length === 1 ? "" : "s"}`
                : `${partos.length} parto${partos.length === 1 ? "" : "s"}`}
            </span>
            <button className="text-xs text-primary hover:underline font-medium" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {tab === "servicios" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha servicio</th>
                <th>Hembra</th>
                <th>Macho / semen</th>
                <th>Tipo</th>
                <th>Resultado</th>
                <th>Parto probable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => {
                const hembra = db!.animales.find((a) => a.id === s.hembraId);
                const macho = db!.animales.find((a) => a.id === s.machoIdOReferencia);
                const dias = s.fechaProbableParto ? diasHasta(s.fechaProbableParto) : null;
                return (
                  <tr key={s.id}>
                    <td>{fmtDate(s.fechaServicio)}</td>
                    <td>
                      {hembra?.nombre ?? "—"}{" "}
                      <span className="font-mono text-xs text-muted">
                        #{hembra?.nroIdentificacion}
                      </span>
                    </td>
                    <td>
                      {macho
                        ? `#${macho.nroIdentificacion} ${macho.nombre ?? ""}`
                        : s.machoIdOReferencia}
                    </td>
                    <td>
                      <span className="chip">
                        {s.tipo === "monta_natural" ? "Monta" : "Inseminación"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          "chip " +
                          (s.resultado === "prenada"
                            ? "success"
                            : s.resultado === "vacia"
                            ? "danger"
                            : "accent")
                        }
                      >
                        {s.resultado}
                      </span>
                    </td>
                    <td>
                      {s.fechaProbableParto ? (
                        <span>
                          {fmtDate(s.fechaProbableParto)}
                          {dias !== null && dias >= 0 && dias <= 60 ? (
                            <span className="text-muted text-xs ml-1">
                              (en {dias} d)
                            </span>
                          ) : null}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="text-right">
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => {
                          setEditServ(s);
                          setOpenServ(true);
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

      {tab === "partos" && (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Madre</th>
                <th>Ternero</th>
                <th>Sexo</th>
                <th>Peso al nacer</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partos.map((p) => {
                const madre = db!.animales.find((a) => a.id === p.madreId);
                const ternero = db!.animales.find((a) => a.id === p.terneroId);
                return (
                  <tr key={p.id}>
                    <td>{fmtDate(p.fecha)}</td>
                    <td>
                      {madre?.nombre ?? "—"}{" "}
                      <span className="font-mono text-xs text-muted">
                        #{madre?.nroIdentificacion}
                      </span>
                    </td>
                    <td>
                      {ternero
                        ? `#${ternero.nroIdentificacion} ${ternero.nombre ?? ""}`
                        : "—"}
                    </td>
                    <td>{p.sexoTernero === "hembra" ? "♀" : p.sexoTernero === "macho" ? "♂" : "—"}</td>
                    <td className="font-mono text-xs">
                      {p.pesoTerneroKg ? `${p.pesoTerneroKg} kg` : "—"}
                    </td>
                    <td className="text-xs text-muted">
                      {p.complicaciones ?? p.notas ?? ""}
                    </td>
                    <td className="text-right">
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => {
                          setEditPar(p);
                          setOpenPar(true);
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
        open={openServ}
        onClose={() => setOpenServ(false)}
        title={editServ ? "Editar servicio" : "Nuevo servicio reproductivo"}
      >
        <ServicioForm
          initial={editServ}
          onSaved={() => setOpenServ(false)}
          onCancel={() => setOpenServ(false)}
        />
      </Modal>

      <Modal
        open={openPar}
        onClose={() => setOpenPar(false)}
        title={editPar ? "Editar parto" : "Registrar parto"}
      >
        <PartoForm
          initial={editPar}
          onSaved={() => setOpenPar(false)}
          onCancel={() => setOpenPar(false)}
        />
      </Modal>
    </div>
  );
}

function ServicioForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: ServicioReproductivo | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<ServicioReproductivo>(
    initial ?? {
      id: uid(),
      hembraId: "",
      machoIdOReferencia: "",
      tipo: "monta_natural",
      fechaServicio: new Date().toISOString().slice(0, 10),
      resultado: "pendiente",
      createdAt: nowISO(),
    }
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hembraId) return alert("Selecciona la hembra");
    if (!form.machoIdOReferencia.trim()) return alert("Indica el macho o el semen usado");
    // Calcular fecha probable de parto (~283 días desde el servicio) si no está seteada y quedó preñada
    const payload = { ...form };
    if (payload.resultado === "prenada" && !payload.fechaProbableParto) {
      const d = new Date(payload.fechaServicio);
      d.setDate(d.getDate() + 283);
      payload.fechaProbableParto = d.toISOString().slice(0, 10);
    }
    updateCollection("servicios", (list) => [
      ...list.filter((s) => s.id !== payload.id),
      payload,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este servicio?")) return;
    updateCollection("servicios", (list) => list.filter((s) => s.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Hembra" required colspan={2}>
        <select
          value={form.hembraId}
          onChange={(e) => setForm({ ...form, hembraId: e.target.value })}
        >
          <option value="">— selecciona —</option>
          {db?.animales
            .filter((a) => a.sexo === "hembra" && a.estado === "activo")
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
          onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoServicio })}
        >
          <option value="monta_natural">Monta natural</option>
          <option value="inseminacion">Inseminación</option>
        </select>
      </FormRow>
      <FormRow label="Fecha servicio" required>
        <input
          type="date"
          value={form.fechaServicio.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fechaServicio: e.target.value })}
        />
      </FormRow>
      {form.tipo === "monta_natural" ? (
        <FormRow label="Toro" required colspan={2}>
          <select
            value={form.machoIdOReferencia}
            onChange={(e) => setForm({ ...form, machoIdOReferencia: e.target.value })}
          >
            <option value="">— selecciona —</option>
            {db?.animales
              .filter((a) => a.sexo === "macho" && a.estado === "activo")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.nroIdentificacion} {a.nombre ?? ""}
                </option>
              ))}
          </select>
        </FormRow>
      ) : (
        <FormRow label="Semen / referencia" required colspan={2}>
          <input
            value={form.machoIdOReferencia}
            onChange={(e) => setForm({ ...form, machoIdOReferencia: e.target.value })}
            placeholder="Ej. Pajilla Girolando lote 22"
          />
        </FormRow>
      )}
      <FormRow label="Resultado" required>
        <select
          value={form.resultado}
          onChange={(e) => setForm({ ...form, resultado: e.target.value as ResultadoServicio })}
        >
          <option value="pendiente">Pendiente</option>
          <option value="prenada">Preñada</option>
          <option value="vacia">Vacía</option>
        </select>
      </FormRow>
      <FormRow label="Fecha diagnóstico">
        <input
          type="date"
          value={form.fechaDiagnostico?.slice(0, 10) ?? ""}
          onChange={(e) =>
            setForm({ ...form, fechaDiagnostico: e.target.value || undefined })
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
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar</button>
        </div>
      </div>
    </form>
  );
}

function PartoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Parto | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { db } = useDB();
  const [form, setForm] = useState<Parto>(
    initial ?? {
      id: uid(),
      madreId: "",
      fecha: new Date().toISOString().slice(0, 10),
      createdAt: nowISO(),
    }
  );
  const [crearTernero, setCrearTernero] = useState(!initial);
  const [nroTernero, setNroTernero] = useState("");
  const [nombreTernero, setNombreTernero] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.madreId) return alert("Selecciona la madre");
    const payload = { ...form };

    if (crearTernero && !initial) {
      if (!nroTernero.trim()) return alert("Ingresa el número del ternero");
      const madre = db!.animales.find((a) => a.id === form.madreId);
      const nuevoAnimal = {
        id: uid(),
        nroIdentificacion: nroTernero,
        nombre: nombreTernero || undefined,
        sexo: (payload.sexoTernero ?? "hembra") as Sexo,
        raza: madre?.raza ?? "",
        fechaNacimiento: payload.fecha,
        madreId: form.madreId,
        categoria: (payload.sexoTernero === "macho" ? "ternero" : "ternera") as CategoriaAnimal,
        estado: "activo" as const,
        potreroId: madre?.potreroId,
        createdAt: nowISO(),
      };
      updateCollection("animales", (list) => [...list, nuevoAnimal]);
      payload.terneroId = nuevoAnimal.id;

      // Registrar pesaje inicial si dieron peso
      if (payload.pesoTerneroKg) {
        updateCollection("pesajes", (list) => [
          ...list,
          {
            id: uid(),
            animalId: nuevoAnimal.id,
            fecha: payload.fecha,
            pesoKg: payload.pesoTerneroKg!,
            tipo: "nacimiento",
            createdAt: nowISO(),
          },
        ]);
      }
    }

    updateCollection("partos", (list) => [
      ...list.filter((p) => p.id !== payload.id),
      payload,
    ]);
    onSaved();
  }

  function remove() {
    if (!initial) return;
    if (!confirm("¿Eliminar este parto? (No borra al ternero)")) return;
    updateCollection("partos", (list) => list.filter((p) => p.id !== initial.id));
    onSaved();
  }

  return (
    <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
      <FormRow label="Madre" required colspan={2}>
        <select
          value={form.madreId}
          onChange={(e) => setForm({ ...form, madreId: e.target.value })}
        >
          <option value="">— selecciona —</option>
          {db?.animales
            .filter((a) => a.sexo === "hembra" && a.estado === "activo")
            .map((a) => (
              <option key={a.id} value={a.id}>
                #{a.nroIdentificacion} {a.nombre ?? ""}
              </option>
            ))}
        </select>
      </FormRow>
      <FormRow label="Fecha del parto" required>
        <input
          type="date"
          value={form.fecha.slice(0, 10)}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />
      </FormRow>
      <FormRow label="Sexo del ternero">
        <select
          value={form.sexoTernero ?? ""}
          onChange={(e) => setForm({ ...form, sexoTernero: (e.target.value || undefined) as Sexo | undefined })}
        >
          <option value="">—</option>
          <option value="hembra">Hembra</option>
          <option value="macho">Macho</option>
        </select>
      </FormRow>
      <FormRow label="Peso al nacer (kg)">
        <input
          type="number"
          step="0.5"
          value={form.pesoTerneroKg ?? ""}
          onChange={(e) =>
            setForm({ ...form, pesoTerneroKg: parseFloat(e.target.value) || undefined })
          }
        />
      </FormRow>
      <FormRow label="Complicaciones">
        <input
          value={form.complicaciones ?? ""}
          onChange={(e) => setForm({ ...form, complicaciones: e.target.value })}
        />
      </FormRow>
      {!initial && (
        <>
          <FormRow label="¿Crear ficha del ternero?" colspan={2}>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={crearTernero}
                onChange={(e) => setCrearTernero(e.target.checked)}
                className="!w-4"
              />
              <span>Sí, crear automáticamente en el módulo Animales</span>
            </label>
          </FormRow>
          {crearTernero && (
            <>
              <FormRow label="Nº identificación ternero" required>
                <input
                  value={nroTernero}
                  onChange={(e) => setNroTernero(e.target.value)}
                  placeholder="011"
                />
              </FormRow>
              <FormRow label="Nombre ternero">
                <input
                  value={nombreTernero}
                  onChange={(e) => setNombreTernero(e.target.value)}
                />
              </FormRow>
            </>
          )}
        </>
      )}
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
