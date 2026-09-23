"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSyncStatus,
  retryPendingWrites,
  SYNC_ERROR_EVENT,
  SYNC_STATUS_EVENT,
  type SyncStatus,
} from "@/lib/db";

type Tone = "warn" | "danger" | "ok";

const TONE_COLOR: Record<Tone, string> = {
  warn: "var(--accent)",
  danger: "var(--danger)",
  ok: "var(--success)",
};

function Toast({
  tone,
  children,
  onClose,
}: {
  tone: Tone;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className="pointer-events-auto w-full max-w-md flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg"
      style={{
        background: "var(--surface-solid)",
        color: "var(--fg)",
        border: "1px solid var(--rule-strong)",
        borderLeft: `4px solid ${TONE_COLOR[tone]}`,
      }}
    >
      <div className="flex-1 leading-snug">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aviso"
          className="shrink-0 text-base leading-none"
          style={{ color: "var(--muted)" }}
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Avisa del estado de guardado: cambios pendientes por falta de señal,
 * cambios rechazados por el servidor, y confirmación cuando lo pendiente
 * por fin se guarda.
 */
export default function SyncToaster() {
  const [status, setStatus] = useState<SyncStatus>({ pending: 0, online: true });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const prevPending = useRef(0);

  useEffect(() => {
    setStatus(getSyncStatus());
    const onStatus = (e: Event) => {
      const s = (e as CustomEvent<SyncStatus>).detail;
      if (prevPending.current > 0 && s.pending === 0) setSaved(true);
      prevPending.current = s.pending;
      setStatus(s);
    };
    const onError = (e: Event) => setError((e as CustomEvent<{ message: string }>).detail.message);
    const onNet = () => setStatus(getSyncStatus());
    window.addEventListener(SYNC_STATUS_EVENT, onStatus);
    window.addEventListener(SYNC_ERROR_EVENT, onError);
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    return () => {
      window.removeEventListener(SYNC_STATUS_EVENT, onStatus);
      window.removeEventListener(SYNC_ERROR_EVENT, onError);
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
    };
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 9000);
    return () => clearTimeout(t);
  }, [error]);

  const retryNow = async () => {
    setRetrying(true);
    try {
      await retryPendingWrites();
    } finally {
      setRetrying(false);
    }
  };

  const n = status.pending;

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 bottom-20 md:bottom-6 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      {error && (
        <Toast tone="danger" onClose={() => setError(null)}>
          {error}
        </Toast>
      )}

      {n > 0 ? (
        <Toast tone="warn">
          <strong>
            {n === 1 ? "1 cambio sin guardar" : `${n} cambios sin guardar`}
          </strong>
          {" · "}
          {status.online ? "reintentando…" : "sin conexión"}
          <div className="mt-1" style={{ color: "var(--muted)" }}>
            Se guardará solo cuando vuelva la señal. No cierres ni recargues la app mientras tanto.
          </div>
          {status.online && (
            <button
              type="button"
              onClick={retryNow}
              disabled={retrying}
              className="btn btn-ghost btn-sm mt-2"
            >
              {retrying ? "Reintentando…" : "Reintentar ahora"}
            </button>
          )}
        </Toast>
      ) : !status.online ? (
        <Toast tone="warn">
          <strong>Sin conexión.</strong> Lo que registres se guardará cuando vuelva la señal, siempre que no cierres la app.
        </Toast>
      ) : saved ? (
        <Toast tone="ok">Cambios guardados.</Toast>
      ) : null}
    </div>
  );
}
