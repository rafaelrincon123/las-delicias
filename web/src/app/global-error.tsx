"use client";

import { useEffect } from "react";
import { reportarError } from "@/lib/reportarError";

// Último recurso: falla el layout raíz. No hay estilos de la app aquí.
export default function ErrorGlobal({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    reportarError(error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ fontFamily: "Arial, sans-serif", background: "#F8F5EE", color: "#1A2418" }}>
        <div style={{ maxWidth: 420, margin: "80px auto", textAlign: "center", padding: 16 }}>
          <h1 style={{ fontSize: 20 }}>RumeApp tuvo un problema</h1>
          <p style={{ fontSize: 14, color: "#52584E" }}>
            Ya nos llegó el aviso. Recarga la página para seguir.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: "10px 18px", borderRadius: 999, border: 0, background: "#14261A", color: "#EFE8D8", fontWeight: 600 }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
