"use client";

import { FiClipboard, FiAward, FiStar, FiBell, FiInfo } from "react-icons/fi";

/**
 * NotificationCard — single notification item.
 * Props: notification { id, type, title, message, time, read }
 */

const typeConfig = {
  activity: { icon: FiClipboard, accent: "#2563EB" },
  badge: { icon: FiAward, accent: "#D97706" },
  sdc: { icon: FiStar, accent: "#059669" },
  reminder: { icon: FiBell, accent: "#7C3AED" },
  system: { icon: FiInfo, accent: "#6B7280" },
};

export default function NotificationCard({ notification }) {
  const { type, title, message, time, read } = notification;
  const config = typeConfig[type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 ${!read ? "bg-red-50/30" : ""}`}>
      {/* Icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${config.accent}15`, color: config.accent }}
      >
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-semibold text-gray-900 ${!read ? "font-bold" : ""}`}>{title}</p>
          {!read && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
