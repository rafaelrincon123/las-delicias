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

type TileTone = "primary" | "accent" | "rose" | "info" | "sage" | "neutral";

interface Tile {
  href: string;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: TileTone;
  metric?: string | number;
  alert?: boolean;
}

// Family-consistent palette — earthy, closer to brand tokens.
const TONES: Record<TileTone, { icon: string; iconBg: string; ink: string; ring: string }> = {
  primary: {
    icon: "#2E5F3A",
    iconBg: "linear-gradient(135deg, #E6F0D9 0%, #C9DDB5 100%)",
    ink: "#1A2418",
    ring: "rgba(46, 95, 58, 0.30)",
  },
  accent: {
    icon: "#8A5A2E",
    iconBg: "linear-gradient(135deg, #F5E5D0 0%, #E8CDA6 100%)",
    ink: "#3E2A15",
    ring: "rgba(138, 90, 46, 0.30)",
  },
  rose: {
    icon: "#B34A3A",
    iconBg: "linear-gradient(135deg, #F7DED6 0%, #EEBFB3 100%)",
    ink: "#4A1D14",
    ring: "rgba(179, 74, 58, 0.28)",
  },
  info: {
    icon: "#446B84",
    iconBg: "linear-gradient(135deg, #DCE7EE 0%, #B9CDD9 100%)",
    ink: "#1E3140",
    ring: "rgba(68, 107, 132, 0.28)",
  },
  sage: {
    icon: "#556B47",
    iconBg: "linear-gradient(135deg, #E5EBDC 0%, #C6D2B4 100%)",
    ink: "#232D1A",
    ring: "rgba(85, 107, 71, 0.30)",
  },
  neutral: {
    icon: "#52584E",
    iconBg: "linear-gradient(135deg, #ECEAE2 0%, #D6D3C6 100%)",
    ink: "#2A2E25",
    ring: "rgba(82, 88, 78, 0.24)",
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
      sub: "Vistazo general",
      Icon: IconPanel,
      tone: "primary",
    },
    {
      href: "/tareas",
      label: "Tareas",
      sub: stats.vencidas > 0 ? `${stats.vencidas} vencidas` : "pendientes",
      Icon: IconTask,
      tone: "accent",
      metric: stats.pendientes,
      alert: stats.vencidas > 0,
    },
    {
      href: "/animales",
      label: "Hato",
      sub: "cabezas activas",
      Icon: IconCow,
      tone: "sage",
      metric: stats.activos,
    },
    {
      href: "/potreros",
      label: "Potreros",
      sub: "lotes en uso",
      Icon: IconPasture,
      tone: "primary",
      metric: stats.potreros,
    },
    {
      href: "/peso",
      label: "Control de peso",
      sub: "pesajes y curvas",
      Icon: IconScale,
      tone: "sage",
    },
    {
      href: "/sanidad",
      label: "Sanidad",
      sub: "eventos cercanos",
      Icon: IconHealth,
      tone: "rose",
      metric: stats.sanidadCercana,
      alert: stats.sanidadCercana > 0,
    },
    {
      href: "/reproduccion",
      label: "Reproducción",
      sub: "preñeces activas",
      Icon: IconRepro,
      tone: "rose",
      metric: stats.proximosPartos,
    },
    {
      href: "/produccion",
      label: "Producción",
      sub: "ordeño y pesajes",
      Icon: IconMilk,
      tone: "info",
    },
    {
      href: "/gastos",
      label: "Gastos",
      sub: "contabilidad",
      Icon: IconMoney,
      tone: "accent",
    },
    {
      href: "/inventario",
      label: "Inventario",
      sub: "bajo mínimo",
      Icon: IconBox,
      tone: "sage",
      metric: stats.stockBajo,
      alert: stats.stockBajo > 0,
    },
    {
      href: "/mi-operacion",
      label: "Mi operación",
      sub: "tu vista",
      Icon: IconUser,
      tone: "neutral",
    },
  ];

  return (
    <div className="relative z-10">
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
          {tiles.map((t) => (
            <TileCard key={t.href} tile={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  const t = TONES[tile.tone];
  const showMetric = tile.metric !== undefined && tile.metric !== 0;
  return (
    <Link
      href={tile.href}
      className="tile group"
      style={{
        // subtle CSS-var so the hover ring can pick up the tile's own tint
        // @ts-expect-error CSS variable
        "--tile-ring": t.ring,
      }}
    >
      {tile.alert && (
        <span
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{
            background: "var(--danger)",
            boxShadow: "0 0 8px var(--danger)",
          }}
          aria-label="alerta"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: t.iconBg,
            color: t.icon,
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <tile.Icon size={22} />
        </div>
        {showMetric && (
          <div
            className="num text-3xl md:text-4xl leading-none tabular-nums"
            style={{ color: t.icon }}
          >
            {tile.metric}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3">
        <div
          className="text-[1.02rem] md:text-[1.08rem] font-semibold tracking-tight leading-tight"
          style={{ color: "var(--fg)" }}
        >
          {tile.label}
        </div>
        <div
          className="text-[0.72rem] md:text-[0.75rem] mt-1 text-muted truncate lowercase"
          style={{ letterSpacing: "0.01em" }}
        >
          {tile.sub}
        </div>
      </div>
    </Link>
  );
}
