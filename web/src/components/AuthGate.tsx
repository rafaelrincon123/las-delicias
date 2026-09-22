"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useFincaActiva } from "@/lib/useFincaActiva";
import {
  loginWithEmail,
  signupWithEmail,
  sendPasswordReset,
  updatePassword,
  logout,
} from "@/lib/auth";
import { IconLock, IconUser } from "./icons";
import OnboardingWizard from "./OnboardingWizard";
import LandingPage from "./LandingPage";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { hasSession, user, ready, authEmail, recoveryMode, clearRecovery } =
    useAuth();
  const { ready: fincaReady, activa } = useFincaActiva();
  const pathname = usePathname();
  const [showLogin, setShowLogin] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Cargando…
      </div>
    );
  }

  // Prioridad máxima: si Supabase avisó que estamos en recuperación, mostrar
  // el formulario de nueva clave (aunque haya sesión válida).
  if (recoveryMode) {
    return <SetNewPasswordScreen email={authEmail} onDone={clearRecovery} />;
  }

  if (!hasSession) {
    // Sin sesión en la raíz → landing pública (marketing). En cualquier
    // otra ruta protegida saltamos directo al login.
    if (pathname === "/" && !showLogin) {
      return <LandingPage onLogin={() => setShowLogin(true)} />;
    }
    return <LoginScreen />;
  }

  // Con sesión pero aún no sabemos si tiene finca: esperar.
  if (!fincaReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Cargando tu finca…
      </div>
    );
  }

  // Sesión sin finca → wizard de onboarding (crear la primera finca).
  if (!activa) {
    return <OnboardingWizard email={authEmail} />;
  }

  // Sesión con finca pero el usuario no está vinculado como propietario.
  // Puede pasar si el usuario fue invitado por un admin pero aún no se
  // creó su fila en `propietarios`. Mostramos aviso claro.
  if (!user) {
    return <NoPropietarioScreen email={authEmail} fincaNombre={activa.nombre} />;
  }

  return <>{children}</>;
}

type Mode = "login" | "signup" | "reset";

function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Escribe tu email.");
      return;
    }
    if (mode !== "reset" && !password) {
      setError("Escribe tu contraseña.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await loginWithEmail(email.trim(), password);
        if (!res.ok) setError(traducirError(res.error));
      } else if (mode === "signup") {
        const res = await signupWithEmail(email.trim(), password);
        if (!res.ok) {
          setError(traducirError(res.error));
        } else if (res.needsConfirmation) {
          setInfo(
            "Revisa tu correo para confirmar la cuenta y luego inicia sesión."
          );
          setMode("login");
        }
      } else {
        const res = await sendPasswordReset(email.trim());
        if (!res.ok) {
          setError(traducirError(res.error));
        } else {
          setInfo(
            "Si el email existe, te llegará un enlace para crear una nueva contraseña. Revisa también spam."
          );
        }
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
            className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden relative"
            style={{
              background: "var(--surface-solid)",
              border: "1px solid var(--rule)",
              boxShadow: "0 12px 40px -8px var(--primary-glow)",
            }}
          >
            <Image
              src="/logo.png"
              alt="RumeApp"
              width={128}
              height={128}
              priority
              sizes="128px"
              className="w-full h-full object-contain p-3"
            />
          </div>
          <h1 className="display-lg tracking-tight font-serif">RumeApp</h1>
          <div className="text-[0.68rem] font-mono uppercase tracking-[0.14em] text-accent mt-1">
            Gestión ganadera
          </div>
          <p className="text-sm text-muted mt-3">
            {mode === "login"
              ? "Entra a tu finca"
              : mode === "signup"
              ? "Crea tu cuenta y registra tu finca"
              : "Te enviamos un enlace para restablecer tu contraseña"}
          </p>
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
                placeholder="tu@correo.com"
                autoFocus
                autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div className="flex flex-col gap-1">
                <span className="eyebrow flex items-center gap-1.5">
                  <IconLock size={11} />
                  Contraseña
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signup" ? "Al menos 8 caracteres" : "Tu contraseña"
                  }
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-fg bg-primary-soft/40 px-3 py-2 rounded-lg">
                {info}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary justify-center"
              disabled={loading}
            >
              <IconUser size={14} />
              {loading
                ? mode === "login"
                  ? "Entrando…"
                  : mode === "signup"
                  ? "Creando…"
                  : "Enviando…"
                : mode === "login"
                ? "Entrar"
                : mode === "signup"
                ? "Crear cuenta"
                : "Enviar enlace"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                className="text-[0.72rem] text-subtle hover:text-fg underline underline-offset-4 self-center"
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setMode("reset");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost justify-center"
              onClick={() => {
                setError(null);
                setInfo(null);
                if (mode === "login") setMode("signup");
                else setMode("login");
              }}
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : mode === "signup"
                ? "Ya tengo cuenta — iniciar sesión"
                : "Volver a iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SetNewPasswordScreen({
  email,
  onDone,
}: {
  email: string | null;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await updatePassword(password);
      if (!res.ok) {
        setError(traducirError(res.error));
        return;
      }
      setInfo("Contraseña actualizada. Ya puedes usar la app.");
      // Salir del modo recovery y dejar que AuthGate vuelva a renderizar
      // con la sesión ya activa (updateUser mantiene la sesión).
      setTimeout(onDone, 900);
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
          <h1 className="display-lg tracking-tight font-serif">Nueva contraseña</h1>
          <p className="text-sm text-muted mt-3">
            Elige una contraseña nueva para {email ?? "tu cuenta"}.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="eyebrow flex items-center gap-1.5">
                <IconLock size={11} />
                Nueva contraseña
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Al menos 8 caracteres"
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="eyebrow flex items-center gap-1.5">
                <IconLock size={11} />
                Confirma
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-fg bg-primary-soft/40 px-3 py-2 rounded-lg">
                {info}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary justify-center"
              disabled={loading}
            >
              <IconLock size={14} />
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>

            <button
              type="button"
              className="btn btn-ghost justify-center"
              onClick={() => void logout()}
            >
              Cancelar y cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function NoPropietarioScreen({
  email,
  fincaNombre,
}: {
  email: string | null;
  fincaNombre: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center card">
        <h2 className="display-lg font-serif mb-2">Cuenta sin vincular</h2>
        <p className="text-sm text-muted mb-4">
          Iniciaste sesión con <strong>{email ?? "?"}</strong> y perteneces a la finca{" "}
          <strong>{fincaNombre}</strong>, pero todavía no tienes un perfil de propietario.
          Pídele al owner de la finca que te agregue en la sección de socios, o cierra sesión.
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
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ese email ya está registrado. Inicia sesión.";
  if (m.includes("password")) return msg; // deja el mensaje de Supabase (limitaciones de fuerza)
  return msg;
}
