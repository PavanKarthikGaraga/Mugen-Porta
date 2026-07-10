"use client";
import { useState } from "react";
import { FiDownload, FiShare2, FiCheckCircle, FiLock, FiExternalLink, FiFilter } from "react-icons/fi";
import { BADGES, LOCKED_BADGES } from "@/app/Data/development-mock";
import SearchBar from "@/app/components/dashboard/SearchBar";

const BRAND = "rgb(151,0,3)";

const RARITY_CONFIG = {
  Common:    { label: "Common",    stars: 1, ring: "#9CA3AF", glow: "rgba(156,163,175,0.15)" },
  Rare:      { label: "Rare",      stars: 2, ring: "#2563EB", glow: "rgba(37,99,235,0.15)"   },
  Epic:      { label: "Epic",      stars: 3, ring: "#7C3AED", glow: "rgba(124,58,237,0.15)"  },
  Legendary: { label: "Legendary", stars: 4, ring: "#D97706", glow: "rgba(217,119,6,0.25)"   },
};

// Tiny QR placeholder SVG
function QRPlaceholder({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-label="QR code placeholder">
      <rect width={60} height={60} rx={4} fill="#F9FAFB" />
      {/* Finder patterns */}
      <rect x={4} y={4} width={16} height={16} rx={1} fill="#111827" />
      <rect x={6} y={6} width={12} height={12} rx={0.5} fill="#F9FAFB" />
      <rect x={8} y={8} width={8} height={8} rx={0.5} fill="#111827" />
      <rect x={40} y={4} width={16} height={16} rx={1} fill="#111827" />
      <rect x={42} y={6} width={12} height={12} rx={0.5} fill="#F9FAFB" />
      <rect x={44} y={8} width={8} height={8} rx={0.5} fill="#111827" />
      <rect x={4} y={40} width={16} height={16} rx={1} fill="#111827" />
      <rect x={6} y={42} width={12} height={12} rx={0.5} fill="#F9FAFB" />
      <rect x={8} y={44} width={8} height={8} rx={0.5} fill="#111827" />
      {/* Data modules */}
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={24 + (i % 4) * 4} y={4 + Math.floor(i / 4) * 4} width={3} height={3} fill="#111827" />)}
      {Array.from({ length: 16 }, (_, i) => {
        const x = 4 + (i % 8) * 7;
        const y = 26 + Math.floor(i / 8) * 7;
        return x < 56 && y < 56 ? <rect key={i} x={x} y={y} width={3} height={3} fill="#111827" opacity={i % 3 === 0 ? 0 : 1} /> : null;
      })}
    </svg>
  );
}

function BadgeCard({ badge, onSelect }) {
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
  return (
    <button
      onClick={() => onSelect(badge)}
      className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 p-5 flex flex-col items-center gap-3 text-center group"
      style={{ borderColor: rarity.ring + "60", boxShadow: `0 0 0 0 ${rarity.glow}` }}
    >
      {/* Icon orb */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 transition-transform group-hover:scale-110"
        style={{ backgroundColor: badge.bg, borderColor: rarity.ring }}
      >
        {badge.icon}
      </div>
      {/* Rarity stars */}
      <div className="flex gap-0.5">
        {"★".repeat(rarity.stars).split("").map((s, i) => (
          <span key={i} className="text-xs" style={{ color: rarity.ring }}>{s}</span>
        ))}
      </div>
      {/* Name */}
      <p className="text-sm font-bold text-gray-900 leading-snug">{badge.name}</p>
      {/* Domain */}
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.color }}>
        {badge.domain}
      </span>
      {/* Issue date */}
      <p className="text-[10px] text-gray-400">{badge.issuedOn}</p>
    </button>
  );
}

function BadgeModal({ badge, onClose }) {
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${badge.bg}, white)` }}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto border-4 mb-3"
            style={{ backgroundColor: badge.bg, borderColor: rarity.ring }}
          >
            {badge.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{badge.name}</h2>
          <p className="text-xs font-semibold mt-1" style={{ color: rarity.ring }}>
            {"★".repeat(rarity.stars)} {badge.rarity}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">{badge.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-0.5">Earned From</p>
              <p className="font-semibold text-gray-800">{badge.earnedFrom}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-0.5">Issue Date</p>
              <p className="font-semibold text-gray-800">{badge.issuedOn}</p>
            </div>
          </div>

          {/* Competencies */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Competencies Evidenced</p>
            <div className="flex flex-wrap gap-1.5">
              {badge.competencies.map((c) => (
                <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* QR + verification */}
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <QRPlaceholder size={60} />
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <FiCheckCircle size={12} className="text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-700">Verified Digital Badge</p>
              </div>
              <p className="text-[10px] text-gray-500 break-all">{badge.verificationId}</p>
              <a
                href={badge.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] font-medium mt-1 hover:underline"
                style={{ color: BRAND }}
              >
                <FiExternalLink size={9} /> Verify online
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <FiDownload size={13} /> Download
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <FiShare2 size={13} /> Share
            </button>
            <a
              href={`https://www.linkedin.com/profile/add?certId=${badge.verificationId}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl text-white transition-colors"
              style={{ backgroundColor: "#0077B5" }}
            >
              Add to LinkedIn
            </a>
          </div>

          <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 pt-1">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function BadgesPage() {
  const [search,       setSearch]       = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [selected,     setSelected]     = useState(null);

  const domains  = [...new Set(BADGES.map((b) => b.domain))];
  const rarities = ["Common","Rare","Epic","Legendary"];

  const filtered = BADGES.filter((b) => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !b.earnedFrom.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter && b.domain !== domainFilter) return false;
    if (rarityFilter && b.rarity !== rarityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: "linear-gradient(90deg, rgb(151,0,3), #7C3AED, #2563EB, #D97706)" }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Digital Badge Wallet</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your verified achievement badges — shareable on LinkedIn and resumés.
              </p>
            </div>
            {/* Rarity breakdown */}
            <div className="flex flex-wrap gap-2">
              {rarities.map((r) => {
                const count = BADGES.filter((b) => b.rarity === r).length;
                const cfg = RARITY_CONFIG[r];
                return count > 0 ? (
                  <div key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-white">
                    <span className="text-xs font-bold" style={{ color: cfg.ring }}>{"★".repeat(cfg.stars)}</span>
                    <span className="text-xs text-gray-600">{r}</span>
                    <span className="text-xs font-bold text-gray-900">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Search badges…" className="flex-1 min-w-40" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none"
            >
              <option value="">All Domains</option>
              {domains.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none"
            >
              <option value="">All Rarities</option>
              {rarities.map((r) => <option key={r}>{r}</option>)}
            </select>
            {(domainFilter || rarityFilter || search) && (
              <button
                onClick={() => { setSearch(""); setDomainFilter(""); setRarityFilter(""); }}
                className="text-xs font-medium px-3 py-2 rounded-lg border text-red-700 border-red-200 hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Earned Badges Grid ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Earned Badges ({filtered.length})
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-medium text-gray-600">No badges match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* ── Locked Badges ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Locked Badges ({LOCKED_BADGES.length} to unlock)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LOCKED_BADGES.map((badge) => {
            const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
            return (
              <div
                key={badge.id}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-70"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gray-200 border-2 border-gray-300 grayscale">
                  {badge.icon}
                </div>
                <FiLock size={12} className="text-gray-400 -mt-1" />
                <p className="text-xs font-bold text-gray-500">{badge.name}</p>
                <span className="text-[9px] font-semibold" style={{ color: rarity.ring }}>{"★".repeat(rarity.stars)} {badge.rarity}</span>
                <p className="text-[9px] text-gray-400 leading-snug">{badge.requirement}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge detail modal */}
      {selected && <BadgeModal badge={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
