"use client";

import { useState } from "react";
import { crearFinca } from "@/lib/useFincaActiva";
import { logout } from "@/lib/auth";
import { IconLogout, IconUser } from "./icons";

interface Props {
  email: string | null;
}

const TZS = [
  { value: "America/Bogota",     label: "Colombia (Bogotá)" },
  { value: "America/Mexico_City", label: "México (CDMX)" },
  { value: "America/Lima",       label: "Perú (Lima)" },
  { value: "America/Buenos_Aires", label: "Argentina (Buenos Aires)" },
  { value: "America/Santiago",   label: "Chile (Santiago)" },
];

export default function OnboardingWizard({ email }: Props) {
  const [nombreFinca, setNombreFinca] = useState("");
  const [nombrePropietario, setNombrePropietario] = useState("");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombreFinca.trim()) {
      setError("Ponle un nombre a tu finca.");
      return;
    }
    setLoading(true);
    try {
      await crearFinca({
        nombre: nombreFinca.trim(),
        timezone,
        nombrePropietario: nombrePropietario.trim() || undefined,
      });
      // La finca activa ya se guardó en localStorage; el gate re-renderiza.
    } catch (err) {
      setError((err as Error).message ?? "No se pudo crear la finca");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="app-bg" aria-hidden />
      <div className="app-glow-1" aria-hidden />
      <div className="app-glow-2" aria-hidden />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="display-lg tracking-tight font-serif">Bienvenido a MiFinca</h1>
          <p className="text-sm text-muted mt-3 max-w-md mx-auto">
            Primero registremos tu finca. Podrás agregar animales, sanidad, gastos y
            más una vez creada.
          </p>
          {email && (
            <p className="text-[0.68rem] font-mono uppercase tracking-[0.14em] text-subtle mt-2">
              {email}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Nombre de la finca</span>
              <input
                type="text"
                value={nombreFinca}
                onChange={(e) => setNombreFinca(e.target.value)}
                placeholder="Ej. Hacienda El Palmar"
                autoFocus
                maxLength={80}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="eyebrow">Tu nombre (opcional)</span>
              <input
                type="text"
                value={nombrePropietario}
                onChange={(e) => setNombrePropietario(e.target.value)}
                placeholder="Cómo apareces en la finca"
                maxLength={60}
              />
              <span className="text-[0.68rem] text-subtle">
                Se usa para atribuir gastos, tareas y aportes.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="eyebrow">Zona horaria</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TZS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary justify-center"
              disabled={loading}
            >
              <IconUser size={14} />
              {loading ? "Creando…" : "Crear mi finca"}
            </button>

            <button
              type="button"
              className="btn btn-ghost justify-center"
              onClick={() => void logout()}
            >
              <IconLogout size={13} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
