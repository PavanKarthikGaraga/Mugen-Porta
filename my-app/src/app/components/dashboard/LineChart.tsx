"use client";
/**
 * LineChart — pure SVG multi-series line chart
 * Props: data (array of { month, ...series }), series (array of { key, color, label }), height
 */
export default function LineChart({ data, series, height = 140 }) {
  const W = 560;
  const H = height;
  const PAD = { top: 10, right: 20, bottom: 28, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // All values to determine Y scale
  const allValues = data.flatMap((d) => series.map((s) => d[s.key] || 0));
  const maxVal = Math.max(...allValues, 100);
  const minVal = 0;

  const xStep = chartW / (data.length - 1);
  const yScale = (v) => chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Build path for each series
  const buildPath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${PAD.left + i * xStep} ${PAD.top + yScale(d[key] || 0)}`).join(" ");

  // Y grid lines
  const yLines = [0, 25, 50, 75, 100].filter((v) => v <= maxVal);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      className="overflow-visible"
      aria-label="Line chart"
    >
      {/* Y grid */}
      {yLines.map((v) => {
        const y = PAD.top + yScale(v);
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} fontSize="8" fill="#9CA3AF" textAnchor="end">{v}</text>
          </g>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={PAD.left + i * xStep}
          y={H - 6}
          fontSize="8"
          fill="#9CA3AF"
          textAnchor="middle"
        >
          {d.month}
        </text>
      ))}

      {/* Series */}
      {series.map((s) => (
        <g key={s.key}>
          {/* Line */}
          <path
            d={buildPath(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={PAD.left + i * xStep}
              cy={PAD.top + yScale(d[s.key] || 0)}
              r={2.5}
              fill={s.color}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
