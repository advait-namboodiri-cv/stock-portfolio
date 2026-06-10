import type { EquityPoint } from "@/lib/types";

type Props = {
  points: EquityPoint[];
  width?: number;
  height?: number;
};

export default function Sparkline({ points, width = 560, height = 120 }: Props) {
  if (points.length < 2) {
    return <div className="text-paper-dim text-xs">not enough history yet</div>;
  }
  const values = points.map((p) => p.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12 || 1;
  const lo = min - pad;
  const hi = max + pad;

  const x = (i: number) => (i / (points.length - 1)) * width;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;

  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const up = values[values.length - 1] >= values[0];
  const stroke = up ? "var(--gain)" : "var(--loss)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="equity over the past month"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle
        cx={x(points.length - 1)}
        cy={y(values[values.length - 1])}
        r="3.5"
        fill={stroke}
        className="live-dot"
      />
    </svg>
  );
}
