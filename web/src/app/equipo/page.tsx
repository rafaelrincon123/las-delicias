"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useFincaActiva } from "@/lib/useFincaActiva";
import {
  Miembro,
  RolMiembro,
  ROLES_ASIGNABLES,
  ROL_LABEL,
  ROL_DESC,
  listarMiembros,
  crearEmpleado,
  cambiarRolMiembro,
  setMiembroActivo,
  generarPasswordTemporal,
} from "@/lib/equipo";
import { PLAN_LIMITS, planEfectivo } from "@/lib/plans";
import Modal from "@/components/Modal";
import FormRow from "@/components/FormRow";
import { IconUser } from "@/components/icons";
import PlanUsageBanner from "@/components/PlanUsageBanner";

export default function EquipoPage() {
  const { authUserId } = useAuth();
  const { activa } = useFincaActiva();
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function reload() {
    if (!activa) return;
    setErr(null);
    try {
      const list = await listarMiembros(activa.id);
      setMiembros(list);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activa?.id]);

  const miMiembro = useMemo(
    () => miembros.find((m) => m.userId === authUserId) ?? null,
    [miembros, authUserId]
  );
  const esOwner = !!(activa && authUserId && activa.ownerUserId === authUserId);
  const puedoGestionar = esOwner || miMiembro?.rol === "admin";

  const activos = miembros.filter((m) => m.activo);
  const limit = activa ? PLAN_LIMITS[planEfectivo(activa)].maxUsuarios : null;
  const limitEditor = activa ? PLAN_LIMITS[planEfectivo(activa)].maxUsuariosEditor : null;

  if (!activa) return <div className="text-muted">Cargando…</div>;

  return (
    <div className="space-y-4">
      <PlanUsageBanner resource="usuarios" used={activos.length} />

      <div className="card">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="eyebrow">Tu equipo</div>
            <div className="text-base font-semibold mt-1">
              {activos.length}
              {limit !== null ? ` / ${limit}` : ""} personas con acceso
            </div>
          </div>
          {puedoGestionar && (
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <IconUser size={14} />
              + Agregar empleado
            </button>
          )}
        </div>
        {!puedoGestionar && (
          <p className="text-xs text-muted mt-2">
            Solo el owner o un admin de la finca pueden agregar o gestionar empleados.
          </p>
        )}
        {limitEditor !== null && (
          <p className="text-xs text-muted mt-2">
            Tu plan solo permite {limitEditor} persona con permiso de edición (el owner). Las
            demás deben quedar en &quot;Solo lectura&quot;.
          </p>
        )}
        {err && (
          <div className="mt-3 text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{err}</div>
        )}
      </div>

      {loading ? (
        <div className="text-muted">Cargando equipo…</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table" style={{ ["--cols" as string]: "1fr 1fr 9rem 8rem 7rem" }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <MiembroRow
                  key={m.userId}
                  miembro={m}
                  esTu={m.userId === authUserId}
                  puedoGestionar={puedoGestionar}
                  fincaId={activa.id}
                  onChanged={reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <CrearEmpleadoModal
          fincaId={activa.id}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            void reload();
          }}
        />
      )}
    </div>
  );
}

function MiembroRow({
  miembro,
  esTu,
  puedoGestionar,
  fincaId,
  onChanged,
}: {
  miembro: Miembro;
  esTu: boolean;
  puedoGestionar: boolean;
  fincaId: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const esOwnerRow = miembro.rol === "owner";

  async function cambiarRol(nuevoRol: RolMiembro) {
    setBusy(true);
    try {
      await cambiarRolMiembro(fincaId, miembro.userId, nuevoRol);
      onChanged();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActivo() {
    if (!confirm(miembro.activo ? "¿Desactivar a este miembro?" : "¿Reactivar a este miembro?")) return;
    setBusy(true);
    try {
      await setMiembroActivo(fincaId, miembro.userId, !miembro.activo);
      onChanged();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className={!miembro.activo ? "opacity-50" : ""}>
      <td>
        {miembro.nombre ?? "—"}
        {esTu && <span className="text-[0.65rem] text-accent ml-2">(tú)</span>}
      </td>
      <td className="text-muted">{miembro.email}</td>
      <td>
        {puedoGestionar && !esOwnerRow ? (
          <select
            value={miembro.rol}
            disabled={busy}
            onChange={(e) => void cambiarRol(e.target.value as RolMiembro)}
            className="w-auto text-xs"
          >
            {ROLES_ASIGNABLES.map((r) => (
              <option key={r} value={r}>
                {ROL_LABEL[r]}
              </option>
            ))}
          </select>
        ) : (
          <span>{ROL_LABEL[miembro.rol]}</span>
        )}
      </td>
      <td>
        <span
          className="text-[0.65rem] px-2 py-0.5 rounded-full"
          style={{
            background: miembro.activo ? "rgba(184, 206, 122, 0.25)" : "rgba(200, 60, 60, 0.12)",
            color: miembro.activo ? "var(--forest)" : "var(--danger)",
          }}
        >
          {miembro.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>
        {puedoGestionar && !esOwnerRow && (
          <button className="btn btn-ghost text-xs" disabled={busy} onClick={() => void toggleActivo()}>
            {miembro.activo ? "Desactivar" : "Reactivar"}
          </button>
        )}
      </td>
    </tr>
  );
}

function CrearEmpleadoModal({
  fincaId,
  onClose,
  onCreated,
}: {
  fincaId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<RolMiembro>("operario");
  const [password, setPassword] = useState(() => generarPasswordTemporal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await crearEmpleado({
        fincaId,
        email: email.trim(),
        password,
        rol,
        nombre: nombre.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });
      setCreado({ email: email.trim(), password });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (creado) {
    return (
      <Modal open onClose={onCreated} title="Empleado creado" eyebrow="Listo">
        <div className="space-y-4">
          <p className="text-sm">
            Comparte estas credenciales con la persona (WhatsApp, en persona, etc.) — no se
            vuelven a mostrar.
          </p>
          <div className="card bg-surface-2 space-y-2">
            <div>
              <span className="eyebrow">Email</span>
              <div className="font-mono text-sm">{creado.email}</div>
            </div>
            <div>
              <span className="eyebrow">Contraseña</span>
              <div className="font-mono text-sm">{creado.password}</div>
            </div>
          </div>
          <button className="btn btn-primary w-full justify-center" onClick={onCreated}>
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title="Agregar empleado" eyebrow="Nuevo acceso">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <FormRow label="Nombre" hint="Cómo aparece en la finca">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del empleado"
            autoFocus
            maxLength={80}
          />
        </FormRow>
        <FormRow label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="empleado@correo.com"
          />
        </FormRow>
        <FormRow label="Teléfono (opcional)">
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+57 300 123 4567"
          />
        </FormRow>
        <FormRow label="Rol" required>
          <select value={rol} onChange={(e) => setRol(e.target.value as RolMiembro)}>
            {ROLES_ASIGNABLES.map((r) => (
              <option key={r} value={r}>
                {ROL_LABEL[r]} — {ROL_DESC[r]}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Contraseña temporal" required hint="Se la compartes tú después de crearla">
          <div className="flex gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-mono"
            />
            <button
              type="button"
              className="btn btn-ghost shrink-0"
              onClick={() => setPassword(generarPasswordTemporal())}
            >
              Generar
            </button>
          </div>
        </FormRow>

        {error && (
          <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</div>
        )}

        <button type="submit" className="btn btn-primary justify-center" disabled={loading}>
          {loading ? "Creando…" : "Crear empleado"}
        </button>
      </form>
    </Modal>
  );
}
