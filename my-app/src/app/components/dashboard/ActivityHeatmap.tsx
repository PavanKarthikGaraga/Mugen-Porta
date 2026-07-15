"use client";
/**
 * ActivityHeatmap — GitHub-style contribution heatmap
 * Props: data (52×5 numbers 0-4), colors ([bg1..bg4])
 */
export default function ActivityHeatmap({
  data,
  color = "rgb(151,0,3)",
  cellSize = 10,
  gap = 2,
  months = ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"],
}) {
  const cols = data.length;       // 52 weeks
  const rows = data[0]?.length || 5;

  const opacity = [0, 0.15, 0.35, 0.6, 0.9];

  const totalW = Math.max(0, cols * (cellSize + gap) - gap);
  const totalH = Math.max(0, rows * (cellSize + gap) - gap);

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div
        className="flex mb-1 pl-0"
        style={{ gap: 0 }}
      >
        {months.map((m, i) => (
          <div
            key={m}
            className="text-[9px] text-gray-400"
            style={{ width: `${(cols / months.length) * (cellSize + gap)}px`, flexShrink: 0 }}
          >
            {m}
          </div>
        ))}
      </div>

      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        aria-label="Activity heatmap"
      >
        {data.map((week, wi) =>
          week.map((level, di) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * (cellSize + gap)}
              y={di * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={level === 0 ? "#F3F4F6" : color}
              fillOpacity={level === 0 ? 1 : opacity[level]}
              aria-label={`Level ${level}`}
            />
          ))
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[9px] text-gray-400">Less</span>
        {opacity.map((op, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: cellSize, height: cellSize,
              backgroundColor: i === 0 ? "#F3F4F6" : color,
              opacity: i === 0 ? 1 : op,
            }}
          />
        ))}
        <span className="text-[9px] text-gray-400">More</span>
      </div>
    </div>
  );
}
