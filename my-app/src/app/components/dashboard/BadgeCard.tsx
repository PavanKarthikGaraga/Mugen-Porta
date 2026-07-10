"use client";

/**
 * BadgeCard — single earned badge tile with rarity glow.
 * Props: badge { id, name, icon, earnedOn, rarity }
 */

const rarityConfig = {
  Common: { border: "#6B7280", glow: "rgba(107,114,128,0.25)", label: "text-gray-600 bg-gray-100" },
  Rare: { border: "#2563EB", glow: "rgba(37,99,235,0.25)", label: "text-blue-700 bg-blue-50" },
  Epic: { border: "#7C3AED", glow: "rgba(124,58,237,0.25)", label: "text-purple-700 bg-purple-50" },
  Legendary: { border: "#D97706", glow: "rgba(217,119,6,0.25)", label: "text-amber-700 bg-amber-50" },
};

export default function BadgeCard({ badge }) {
  const { name, icon, earnedOn, rarity } = badge;
  const config = rarityConfig[rarity] || rarityConfig.Common;

  return (
    <div
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center"
      style={{ borderColor: config.border, boxShadow: `0 0 12px ${config.glow}` }}
    >
      <div className="text-3xl leading-none">{icon}</div>
      <p className="text-xs font-semibold text-gray-800 leading-tight">{name}</p>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.label}`}>{rarity}</span>
      <p className="text-[10px] text-gray-400">{earnedOn}</p>
    </div>
  );
}
