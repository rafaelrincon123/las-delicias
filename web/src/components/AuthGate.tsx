"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { loginWithEmail, logout } from "@/lib/auth";
import { IconLock, IconUser } from "./icons";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { hasSession, user, ready, authEmail } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Cargando…
      </div>
    );
  }

  if (!hasSession) {
    return <LoginScreen />;
  }

  if (!user) {
    return <NoPropietarioScreen email={authEmail} />;
  }

  return <>{children}</>;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Escribe tu email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithEmail(email.trim(), password);
      if (!res.ok) {
        setError(traducirError(res.error));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="app-bg" aria-hidden />
      <div className="app-glow-1" aria-hidden />
      <div className="app-glow-2" aria-hidden />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden"
            style={{
              background: "var(--surface-solid)",
              border: "1px solid var(--rule)",
              boxShadow: "0 12px 40px -8px var(--primary-glow)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Las Delicias"
              className="w-full h-full object-contain p-3"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent && !parent.querySelector("svg")) {
                  parent.insertAdjacentHTML(
                    "beforeend",
                    `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M12 3l4 5-4 5-4-5z" stroke="var(--primary)" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 18h12" stroke="var(--primary)" stroke-width="1.6" stroke-linecap="round"/></svg>`
                  );
                }
              }}
            />
          </div>
          <h1 className="display-lg tracking-tight font-serif">Las Delicias</h1>
          <div className="text-[0.68rem] font-mono uppercase tracking-[0.14em] text-accent mt-1">
            Ganadería
          </div>
          <p className="text-sm text-muted mt-3">Entra con tu email</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow flex items-center gap-1.5">
                <IconUser size={11} />
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@lasdelicias.co"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="eyebrow flex items-center gap-1.5">
                <IconLock size={11} />
                Contraseña
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
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
              {loading ? "Entrando…" : "Entrar"}
            </button>

            <p className="text-[0.68rem] text-subtle text-center leading-relaxed">
              Los socios acceden con el email registrado en Supabase.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function NoPropietarioScreen({ email }: { email: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center card">
        <h2 className="display-lg font-serif mb-2">Cuenta sin vincular</h2>
        <p className="text-sm text-muted mb-4">
          Iniciaste sesión con <strong>{email ?? "?"}</strong>, pero ese email no
          está enlazado con ningún propietario en la finca. Pídele a un
          administrador que corra el vínculo en Supabase, o cierra sesión.
        </p>
        <button className="btn" onClick={() => void logout()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "El email todavía no está confirmado.";
  return msg;
}
