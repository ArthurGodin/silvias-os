import { cn } from "@/lib/utils";

export type LinePoint = { x: string; y: number };

export function LineChart({
  data,
  height = 180,
  format = (n: number) => String(n),
  className,
}: {
  data: LinePoint[];
  height?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const w = 800;
  const pad = { top: 16, right: 16, bottom: 32, left: 56 };
  const maxY = Math.max(1, ...data.map((d) => d.y));
  const stepX =
    data.length > 1 ? (w - pad.left - pad.right) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    px: pad.left + i * stepX,
    py:
      height -
      pad.bottom -
      (d.y / maxY) * (height - pad.top - pad.bottom),
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.px.toFixed(1)},${p.py.toFixed(1)}`)
    .join(" ");

  // Path da área preenchida abaixo da linha
  const areaPath =
    points.length > 0
      ? `M${points[0]!.px.toFixed(1)},${(height - pad.bottom).toFixed(1)} L` +
        points.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(" L") +
        ` L${points[points.length - 1]!.px.toFixed(1)},${(height - pad.bottom).toFixed(1)} Z`
      : "";

  // Marcas no eixo Y (3 linhas: 0, meio, max)
  const yTicks = [0, maxY / 2, maxY];

  // Marcas no eixo X — mostra a cada N pontos pra não poluir
  const showEvery = data.length <= 14 ? 1 : data.length <= 31 ? 4 : 10;
  const xTicks = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i === 0 || i === data.length - 1 || i % showEvery === 0);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height }}
      >
        {/* Grid Y */}
        {yTicks.map((v, i) => {
          const y =
            height -
            pad.bottom -
            (v / maxY) * (height - pad.top - pad.bottom);
          return (
            <g key={i}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={y}
                y2={y}
                stroke="var(--color-rule)"
                strokeDasharray={i === 0 ? "0" : "2 4"}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-ink-500)"
                fontFamily="ui-monospace, monospace"
              >
                {format(v)}
              </text>
            </g>
          );
        })}

        {/* Área */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#lineChartGold)"
            opacity={0.18}
          />
        )}

        {/* Linha */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Pontos */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.px}
            cy={p.py}
            r="2.5"
            fill="var(--color-gold-deep)"
          />
        ))}

        {/* X ticks */}
        {xTicks.map(({ d, i }) => (
          <text
            key={i}
            x={pad.left + i * stepX}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-ink-500)"
            fontFamily="ui-monospace, monospace"
          >
            {d.x}
          </text>
        ))}

        <defs>
          <linearGradient id="lineChartGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
