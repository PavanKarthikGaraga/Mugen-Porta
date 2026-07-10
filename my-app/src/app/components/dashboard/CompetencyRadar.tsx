"use client";

/**
 * CompetencyRadar — pure SVG radar/spider chart.
 * Props: data [{ name, score }] — scores 0-100
 * No external chart dependencies.
 */
export default function CompetencyRadar({ data, accentColor = "rgb(151,0,3)" }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 65;
  const levels = 4;
  const n = data.length;

  const angleStep = (2 * Math.PI) / n;
  const getCoords = (idx, r) => {
    const angle = idx * angleStep - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (radius / levels) * (level + 1);
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = getCoords(i, r);
      return `${x},${y}`;
    }).join(" ");
  });

  // Data polygon
  const dataPolygon = data.map((d, i) => {
    const r = (d.score / 100) * radius;
    const { x, y } = getCoords(i, r);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible mx-auto"
      aria-label="Competency radar chart"
    >
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={0.8}
        />
      ))}

      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const { x, y } = getCoords(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth={0.8} />;
      })}

      {/* Data area */}
      <polygon
        points={dataPolygon}
        fill={accentColor}
        fillOpacity={0.15}
        stroke={accentColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const r = (d.score / 100) * radius;
        const { x, y } = getCoords(i, r);
        return <circle key={i} cx={x} cy={y} r={3} fill={accentColor} />;
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const { x, y } = getCoords(i, radius + 16);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.5"
            fill="#374151"
            fontWeight="500"
          >
            {d.name.length > 10 ? d.name.substring(0, 9) + "…" : d.name}
          </text>
        );
      })}
    </svg>
  );
}
