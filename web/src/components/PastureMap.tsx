import { Animal, Potrero } from "@/lib/types";

interface Props {
  potreros: Potrero[];
  animales: Animal[];
}

export default function PastureMap({ potreros, animales }: Props) {
  const cols = Math.min(potreros.length, 4);
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {potreros.map((p) => {
        const usados = animales.filter(
          (a) => a.potreroId === p.id && a.estado === "activo"
        ).length;
        const ocupacion = p.capacidad ? usados / p.capacidad : 0;
        const sobre = ocupacion > 1;
        const h = Math.max(120, Math.min(180, p.areaHectareas * 28));
        const fillColor = sobre ? "var(--danger)" : "var(--primary)";
        return (
          <div
            key={p.id}
            className="relative rounded-xl border border-rule overflow-hidden group transition-all duration-300 hover:border-rule-strong"
            style={{
              height: h,
              background: "var(--surface)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Occupation fill with gradient */}
            <div
              className="absolute left-0 right-0 bottom-0 transition-all duration-500"
              style={{
                height: `${Math.min(ocupacion, 1) * 100}%`,
                background: `linear-gradient(180deg, transparent 0%, ${fillColor}15 40%, ${fillColor}30 100%)`,
              }}
            />
            {/* Fill line */}
            <div
              className="absolute left-0 right-0 transition-all duration-500"
              style={{
                bottom: `${Math.min(ocupacion, 1) * 100}%`,
                height: "1px",
                background: fillColor,
                boxShadow: `0 0 8px ${fillColor}`,
              }}
            />

            <div className="relative p-4 h-full flex flex-col justify-between">
              <div>
                <div className="text-[0.62rem] font-mono uppercase tracking-widest text-subtle">
                  {p.areaHectareas} ha
                </div>
                <div className="text-lg font-semibold tracking-tight mt-1">{p.nombre}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="num text-2xl" style={{ color: sobre ? "var(--danger)" : "var(--fg)" }}>
                    {usados}
                  </span>
                  <span className="text-muted text-sm ml-1">/{p.capacidad}</span>
                </div>
                {sobre ? (
                  <span className="chip danger" style={{ padding: "0.1rem 0.4rem", fontSize: "0.6rem" }}>
                    <span className="dot" />
                    saturado
                  </span>
                ) : (
                  <span className="text-[0.62rem] font-mono text-muted">
                    {Math.round(ocupacion * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
