interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  height?: number;
  color?: string;
  unit?: string;
}

export default function AreaChart({
  data,
  height = 200,
  color = "var(--primary)",
  unit = "",
}: Props) {
  const width = 640;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values) * 1.1;
  const min = 0;
  const range = max - min || 1;

  const step = data.length > 1 ? chartW / (data.length - 1) : chartW;
  const pts = data.map((d, i) => {
    const x = padL + i * step;
    const y = padT + (1 - (d.value - min) / range) * chartH;
    return { x, y, ...d };
  });

  // Smooth curve using cardinal spline
  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${padT + chartH} L ${pts[0].x},${padT + chartH} Z`;

  const ticks = [0, 0.5, 1].map((t) => ({
    y: padT + (1 - t) * chartH,
    v: Math.round(min + t * range),
  }));

  const uid = `grad-${Math.random().toString(36).slice(2, 8)}`;
  const glowId = `glow-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ minWidth: 380 }}
      >
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="60%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ticks.map((t) => (
          <g key={t.v}>
            <line
              x1={padL}
              x2={width - padR}
              y1={t.y}
              y2={t.y}
              stroke="var(--rule)"
              strokeDasharray="2 4"
            />
            <text
              x={padL - 10}
              y={t.y + 3}
              textAnchor="end"
              fontSize="10"
              fill="var(--subtle)"
              fontFamily="var(--font-geist-mono)"
            >
              {t.v}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${uid})`} />

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />

        {pts.map((p, i) => (
          <g key={i}>
            {i === pts.length - 1 ? (
              <>
                <circle cx={p.x} cy={p.y} r={7} fill={color} opacity="0.2" />
                <circle cx={p.x} cy={p.y} r={4} fill="var(--surface-solid)" stroke={color} strokeWidth="2" />
              </>
            ) : (
              <circle cx={p.x} cy={p.y} r={2.5} fill="var(--surface-solid)" stroke={color} strokeWidth="1.5" />
            )}
            <title>
              {p.label}: {p.value.toFixed(1)} {unit}
            </title>
          </g>
        ))}

        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--subtle)"
            fontFamily="var(--font-geist-mono)"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
