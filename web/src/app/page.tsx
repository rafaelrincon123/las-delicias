"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDB } from "@/lib/useDB";
import { diasHasta } from "@/lib/format";
import {
  IconPanel,
  IconTask,
  IconUser,
  IconCow,
  IconPasture,
  IconHealth,
  IconRepro,
  IconMilk,
  IconMoney,
  IconBox,
  IconScale,
} from "@/components/icons";

type TileTone =
  | "forest"
  | "copper"
  | "coral"
  | "sky"
  | "moss"
  | "sand"
  | "plum"
  | "citrus"
  | "sea"
  | "clay";

interface Tile {
  href: string;
  label: string;
  sub?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: TileTone;
  metric?: string | number;
  alert?: boolean;
  hero?: boolean;
}

/* Vivid but earthy palette — Revolut-style gradient tokens per tone.
   Each tone → soft top color, deeper bottom color, ink/text color, shadow.  */
const TONES: Record<TileTone, { from: string; to: string; ink: string; fg: string; shadow: string }> = {
  forest: {
    from: "#D9EFD1", to: "#89C57B", ink: "#1E4A2A", fg: "#0F2A17",
    shadow: "rgba(46, 106, 60, 0.32)",
  },
  copper: {
    from: "#F8E1C1", to: "#E4A46A", ink: "#7A4A1E", fg: "#3E230C",
    shadow: "rgba(196, 128, 60, 0.32)",
  },
  coral: {
    from: "#FBDACF", to: "#F19277", ink: "#8A3B24", fg: "#4A1B0F",
    shadow: "rgba(220, 110, 80, 0.32)",
  },
  sky: {
    from: "#D6E7F2", to: "#7DB3D2", ink: "#1E4A6B", fg: "#0F2A40",
    shadow: "rgba(90, 140, 180, 0.32)",
  },
  moss: {
    from: "#E4EED4", to: "#A9C177", ink: "#3E5A24", fg: "#1D2F10",
    shadow: "rgba(120, 150, 80, 0.30)",
  },
  sand: {
    from: "#F0EADA", to: "#CBB98D", ink: "#5A4A22", fg: "#2E240F",
    shadow: "rgba(160, 140, 90, 0.28)",
  },
  plum: {
    from: "#E9D9E6", to: "#B48AB0", ink: "#5A2C57", fg: "#2E1230",
    shadow: "rgba(150, 100, 150, 0.30)",
  },
  citrus: {
    from: "#F6EFC2", to: "#DFC85E", ink: "#6B5410", fg: "#2E2306",
    shadow: "rgba(180, 160, 60, 0.30)",
  },
  sea: {
    from: "#D5EBE4", to: "#7EBFA9", ink: "#1E5A48", fg: "#0F2E23",
    shadow: "rgba(90, 160, 140, 0.30)",
  },
  clay: {
    from: "#EBE0D1", to: "#B99A7A", ink: "#5A3C20", fg: "#2E1D0C",
    shadow: "rgba(160, 120, 90, 0.28)",
  },
};

export default function Home() {
  const { db, ready } = useDB();

  const stats = useMemo(() => {
    if (!db) return null;
    const activos = db.animales.filter((a) => a.estado === "activo").length;
    const pendientes = db.tareas.filter((t) => !t.completada).length;
    const vencidas = db.tareas.filter((t) => {
      if (t.completada) return false;
      const d = diasHasta(t.fecha);
      return d !== null && d < 0;
    }).length;
    const proximosPartos = db.servicios.filter(
      (s) =>
        (s.resultado === "prenada" || s.resultado === "pendiente") &&
        s.fechaProbableParto
    ).length;
    const sanidadCercana = db.sanidad.filter((s) => {
      const d = diasHasta(s.proximoEventoFecha || s.fecha);
      return d !== null && d >= -14 && d <= 30;
    }).length;
    const stockBajo = db.insumos.filter((i) => i.stock < i.minimo).length;

    return {
      activos,
      pendientes,
      vencidas,
      proximosPartos,
      sanidadCercana,
      stockBajo,
      potreros: db.potreros.length,
    };
  }, [db]);

  if (!ready || !stats) {
    return (
      <div className="text-muted text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Cargando…
      </div>
    );
  }

  const tiles: Tile[] = [
    {
      href: "/panel",
      label: "Panel",
      sub: "Vistazo general del hato",
      Icon: IconPanel,
      tone: "forest",
      hero: true,
    },
    {
      href: "/tareas",
      label: "Tareas",
      sub: stats.vencidas > 0 ? `${stats.vencidas} vencidas` : "pendientes",
      Icon: IconTask,
      tone: "copper",
      metric: stats.pendientes,
      alert: stats.vencidas > 0,
    },
    {
      href: "/animales",
      label: "Hato",
      sub: "cabezas activas",
      Icon: IconCow,
      tone: "moss",
      metric: stats.activos,
    },
    {
      href: "/potreros",
      label: "Potreros",
      sub: "lotes",
      Icon: IconPasture,
      tone: "sea",
      metric: stats.potreros,
    },
    {
      href: "/peso",
      label: "Peso",
      sub: "pesajes y curvas",
      Icon: IconScale,
      tone: "sand",
    },
    {
      href: "/sanidad",
      label: "Sanidad",
      sub: "eventos cercanos",
      Icon: IconHealth,
      tone: "coral",
      metric: stats.sanidadCercana,
      alert: stats.sanidadCercana > 0,
    },
    {
      href: "/reproduccion",
      label: "Reproducción",
      sub: "preñeces",
      Icon: IconRepro,
      tone: "plum",
      metric: stats.proximosPartos,
    },
    {
      href: "/produccion",
      label: "Producción",
      sub: "ordeño diario",
      Icon: IconMilk,
      tone: "sky",
    },
    {
      href: "/gastos",
      label: "Gastos",
      sub: "contabilidad",
      Icon: IconMoney,
      tone: "citrus",
    },
    {
      href: "/inventario",
      label: "Inventario",
      sub: "insumos",
      Icon: IconBox,
      tone: "clay",
      metric: stats.stockBajo,
      alert: stats.stockBajo > 0,
    },
    {
      href: "/mi-operacion",
      label: "Mi operación",
      sub: "tu vista",
      Icon: IconUser,
      tone: "forest",
    },
  ];

  return (
    <div className="relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {tiles.map((t) => (
          <TileCard key={t.href} tile={t} />
        ))}
      </div>
    </div>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  const t = TONES[tile.tone];
  const showMetric = tile.metric !== undefined && tile.metric !== 0;
  return (
    <Link
      href={tile.href}
      className={"tile-mod" + (tile.hero ? " tile-hero" : "")}
      style={
        {
          "--t-from": t.from,
          "--t-to": t.to,
          "--t-ink": t.ink,
          "--t-fg": t.fg,
          "--t-shadow": t.shadow,
        } as React.CSSProperties
      }
      aria-label={tile.label}
    >
      {tile.alert && <span className="tile-dot" aria-label="alerta" />}

      <div className="flex items-start justify-between gap-2">
        <div className="icon-orb">
          <tile.Icon size={tile.hero ? 26 : 22} />
        </div>
        {showMetric && <div className="tile-metric">{tile.metric}</div>}
      </div>

      <div className="mt-auto pt-2">
        <div className="tile-label">{tile.label}</div>
        {tile.sub && <div className="tile-sub">{tile.sub}</div>}
      </div>
    </Link>
  );
}
