import React from "react";
import Sparkline from "./Sparkline";
import { IconArrowUp, IconArrowDown } from "./icons";

interface Props {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "primary" | "accent" | "danger" | "success";
  spark?: number[];
  delta?: { value: number; label?: string } | null;
  unit?: string;
}

const accentToColor = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  danger: "var(--danger)",
  success: "var(--success)",
} as const;

export default function StatCard({
  label,
  value,
  sub,
  accent = "primary",
  spark,
  delta,
  unit,
}: Props) {
  const color = accentToColor[accent];

  return (
    <div className="card card-tight relative overflow-hidden group">
      {/* Ambient glow */}
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle, ${color === "var(--primary)" ? "var(--primary-glow)" : "var(--accent-soft)"}, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-[0.72rem] text-muted font-medium">{label}</span>
        </div>
        {delta ? (
          <span
            className={
              "delta " +
              (delta.value > 0 ? "up" : delta.value < 0 ? "down" : "flat")
            }
          >
            {delta.value > 0 ? (
              <IconArrowUp size={10} />
            ) : delta.value < 0 ? (
              <IconArrowDown size={10} />
            ) : null}
            {Math.abs(delta.value)}%
          </span>
        ) : null}
      </div>

      <div className="relative flex items-end justify-between gap-3 mt-4">
        <div className="num text-4xl md:text-[3.25rem] text-fg">
          {value}
          {unit && (
            <span className="text-lg text-muted ml-1 font-normal tracking-tight">
              {unit}
            </span>
          )}
        </div>
        {spark && spark.length >= 2 ? (
          <Sparkline
            values={spark}
            color={color}
            width={100}
            height={38}
            fillOpacity={0.18}
          />
        ) : null}
      </div>

      {sub ? (
        <div className="relative text-xs text-muted mt-4">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
