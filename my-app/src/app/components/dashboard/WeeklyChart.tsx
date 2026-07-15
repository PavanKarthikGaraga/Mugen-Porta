"use client";

/**
 * WeeklyChart — pure SVG bar chart for weekly learning hours.
 * Props: data [{ day, hours }], maxHours (default auto)
 * No external chart dependencies.
 */
export default function WeeklyChart({ data, accentColor = "rgb(151,0,3)" }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const chartH = 80;
  const barW = 24;
  const gap = 12;
  const totalW = Math.max(0, data.length * (barW + gap) - gap);

  return (
    <div className="flex flex-col gap-2">
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${chartH + 20}`}
        className="overflow-visible"
        aria-label="Weekly learning hours bar chart"
      >
        {data.map((d, i) => {
          const x = i * (barW + gap);
          const barH = Math.max(4, (d.hours / maxHours) * chartH);
          const y = chartH - barH;
          const isToday = i === new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

          return (
            <g key={d.day}>
              {/* Background bar */}
              <rect x={x} y={0} width={barW} height={chartH} rx={4} fill="#F3F4F6" />
              {/* Value bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={accentColor}
                fillOpacity={0.85}
              />
              {/* Hour label */}
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#374151"
                fontWeight="600"
              >
                {d.hours}h
              </text>
              {/* Day label */}
              <text
                x={x + barW / 2}
                y={chartH + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#9CA3AF"
                fontWeight="500"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
