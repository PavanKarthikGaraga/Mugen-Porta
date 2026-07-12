"use client";

/**
 * DashboardCard — generic card wrapper with optional header action button.
 * Props: title, subtitle, action (ReactNode), children, className
 */
export default function DashboardCard({ title, subtitle, action = null, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
