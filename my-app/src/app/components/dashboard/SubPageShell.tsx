/**
 * SubPageShell — reusable stub shell for modules under development.
 * Props: icon, title, subtitle, features (string[]), route
 */
export default function SubPageShell({ icon, title, subtitle, features = [], route }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Brand top bar */}
        <div className="h-1.5 w-full" style={{ background: "rgb(151,0,3)" }} />

        <div className="px-8 py-10 text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ backgroundColor: "rgba(151,0,3,0.07)", border: "1.5px solid rgba(151,0,3,0.15)" }}
          >
            {icon}
          </div>

          {/* Badge */}
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "rgba(151,0,3,0.08)", color: "rgb(151,0,3)" }}
          >
            Coming Soon
          </span>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm leading-relaxed mb-7 max-w-md mx-auto">{subtitle}</p>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-7" />

          {/* Features */}
          {features.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                What&apos;s coming
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-7">
                {features.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5" style={{ color: "rgb(151,0,3)" }}>✦</span>
                    <span className="text-sm text-gray-700 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer note */}
          <p className="text-xs text-gray-400">
            This module is being developed.{" "}
            <span className="font-semibold" style={{ color: "rgb(151,0,3)" }}>
              SAC Activities Team
            </span>{" "}
            will notify you when it&apos;s live.
          </p>
        </div>

        {/* Brand bottom bar */}
        <div className="h-1.5 w-full" style={{ background: "rgb(151,0,3)" }} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">
        Designed &amp; Developed by Pavan Karthik Garaga &nbsp;|&nbsp; ZeroOne CodeClub
      </p>
    </div>
  );
}
