type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: "gold" | "ink";
};

export function Sparkline({
  data,
  width = 120,
  height = 36,
  className,
  tone = "gold",
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((value, i) => {
      const x = i * step;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke =
    tone === "gold" ? "var(--color-gold)" : "var(--color-ink-700)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - (((data[data.length - 1] ?? 0) - min) / range) * height}
        r="2.5"
        fill={stroke}
      />
    </svg>
  );
}
