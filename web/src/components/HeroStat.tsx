import React from "react";

export type StatTone = "moss" | "coral" | "citrus" | "copper" | "forest" | "sky" | "plum";

const STAT_TONES: Record<
  StatTone,
  { from: string; to: string; ink: string; fg: string; shadow: string }
> = {
  moss:   { from: "#E4EED4", to: "#A9C177", ink: "#3E5A24", fg: "#1D2F10", shadow: "rgba(120,150,80,0.30)" },
  coral:  { from: "#F8D5D0", to: "#E48A82", ink: "#7A2A21", fg: "#3E110C", shadow: "rgba(196,90,80,0.30)" },
  citrus: { from: "#F6EFC2", to: "#DFC85E", ink: "#6B5410", fg: "#2E2306", shadow: "rgba(180,160,60,0.30)" },
  copper: { from: "#F8E1C1", to: "#E4A46A", ink: "#7A4A1E", fg: "#3E230C", shadow: "rgba(196,128,60,0.32)" },
  forest: { from: "#D9EFD1", to: "#89C57B", ink: "#1E4A2A", fg: "#0F2A17", shadow: "rgba(46,106,60,0.32)" },
  sky:    { from: "#D6E6F5", to: "#7DA9D6", ink: "#20486D", fg: "#0F2438", shadow: "rgba(60,110,170,0.30)" },
  plum:   { from: "#E7D8EA", to: "#B48CC0", ink: "#5E2D6B", fg: "#2B0F33", shadow: "rgba(140,90,160,0.30)" },
};

interface Props {
  label: string;
  value: React.ReactNode;
  tone: StatTone;
  sub?: React.ReactNode;
  /** "md" para números enteros (default). "sm" para strings largos tipo moneda. */
  size?: "md" | "sm";
}

export default function HeroStat({ label, value, tone, sub, size = "md" }: Props) {
  const t = STAT_TONES[tone];
  return (
    <div
      className="hero-stat"
      style={
        {
          "--hs-from": t.from,
          "--hs-to": t.to,
          "--hs-ink": t.ink,
          "--hs-fg": t.fg,
          "--hs-shadow": t.shadow,
        } as React.CSSProperties
      }
    >
      <div className="hero-stat-label">{label}</div>
      <div className="hero-stat-body">
        <div className={"hero-stat-num" + (size === "sm" ? " sm" : "")}>{value}</div>
        {sub ? <div className="hero-stat-sub">{sub}</div> : null}
      </div>
    </div>
  );
}
