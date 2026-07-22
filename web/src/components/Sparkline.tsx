interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showEndDot?: boolean;
  strokeWidth?: number;
}

export default function Sparkline({
  values,
  width = 120,
  height = 36,
  color = "var(--primary)",
  fillOpacity = 0.12,
  showEndDot = true,
  strokeWidth = 1.5,
}: Props) {
  if (!values || values.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="var(--rule)"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = height - 3 - ((v - min) / range) * (height - 6);
    return [x, y] as const;
  });
  const linePath = pts.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const [ex, ey] = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={areaPath} fill={color} opacity={fillOpacity} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {showEndDot && (
        <>
          <circle cx={ex} cy={ey} r={3.5} fill="var(--surface)" />
          <circle cx={ex} cy={ey} r={2.5} fill={color} />
        </>
      )}
    </svg>
  );
}
