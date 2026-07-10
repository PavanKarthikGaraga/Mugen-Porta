"use client";

export default function FilterPanel({ filters, activeFilters, onChange, onClear }) {
  return (
    <div className="space-y-5">
      {/* Clear all */}
      {Object.values(activeFilters).some((v) => v !== "" && v !== null) && (
        <button
          onClick={onClear}
          className="text-xs font-medium w-full text-center py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          Clear all filters
        </button>
      )}

      {filters.map((filter) => (
        <div key={filter.key}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {filter.label}
          </p>

          {filter.type === "select" && (
            <select
              value={activeFilters[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 text-gray-700"
              style={{ "--tw-ring-color": "rgb(151,0,3)" }}
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {filter.type === "chips" && (
            <div className="flex flex-wrap gap-1.5">
              {filter.options.map((opt) => {
                const isActive = activeFilters[filter.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onChange(filter.key, isActive ? "" : opt)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                      isActive
                        ? "text-white border-transparent"
                        : "text-gray-600 border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                    style={isActive ? { backgroundColor: "rgb(151,0,3)", borderColor: "rgb(151,0,3)" } : {}}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {filter.type === "range" && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                step={filter.step || 1}
                value={activeFilters[filter.key] || filter.max}
                onChange={(e) => onChange(filter.key, Number(e.target.value))}
                className="flex-1 accent-red-700"
              />
              <span className="text-xs font-medium text-gray-700 w-12 text-right">
                ≤{activeFilters[filter.key] || filter.max}{filter.unit || ""}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
