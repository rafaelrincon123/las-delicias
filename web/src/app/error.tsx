"use client";

import { useEffect } from "react";
import { reportarError } from "@/lib/reportarError";

// Se muestra cuando una página de la app falla al renderizar.
export default function ErrorPagina({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportarError(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-16 card text-center space-y-3">
      <div className="text-lg font-semibold">Algo salió mal en esta página</div>
      <p className="text-sm text-muted">
        Ya nos llegó el aviso y lo vamos a revisar. Puedes intentar de nuevo; tus datos
        guardados no se perdieron.
      </p>
      <div className="flex gap-2 justify-center">
        <button className="btn btn-primary" onClick={reset}>
          Intentar de nuevo
        </button>
        <button className="btn btn-ghost" onClick={() => (window.location.href = "/")}>
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
