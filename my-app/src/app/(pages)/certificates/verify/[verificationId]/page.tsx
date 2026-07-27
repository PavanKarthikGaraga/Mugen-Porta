import Image from "next/image";
import { FiCheckCircle, FiXCircle, FiCalendar, FiUser, FiAward, FiShield } from "react-icons/fi";
import { getCertificateVerification } from "@/lib/certificateVerification";

export const dynamic = "force-dynamic";

const BRAND = "rgb(151,0,3)";

const DOMAIN_LABEL: Record<string, string> = {
  TEC: "Technology & Emerging Technologies",
  LCH: "Literary, Cultural & Heritage",
  ESO: "Extension & Social Outreach",
  IIE: "Innovation & Entrepreneurship",
  HWB: "Health & Well-being",
};

export async function generateMetadata({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;
  const result = await getCertificateVerification(verificationId);
  if (!result.valid) {
    return { title: "Certificate not found · KL SAC", robots: { index: false } };
  }
  return {
    title: `${result.recipient.name} · ${result.certificate.activityTitle} · KL SAC`,
    description: `Verified SAMAM certificate issued by KL SAC (Student Activity Center) to ${result.recipient.name} for completing ${result.certificate.activityTitle}.`,
  };
}

/** Shared page chrome so both the valid and invalid states look the same. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Image src="/sac-logo.png" alt="KL SAC — Student Activity Center" width={240} height={61} className="mx-auto max-w-[180px] sm:max-w-[240px] h-auto" priority />
          <p className="text-xs text-gray-500 mt-3 tracking-wide">SAMAM ACTIVITY MANAGEMENT PROGRAM</p>
        </div>
        {children}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} KL University · Student Activity Center
        </p>
      </div>
    </div>
  );
}

export default async function CertificateVerifyPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;
  const result = await getCertificateVerification(verificationId);

  // Early return so TypeScript narrows the union by control flow.
  if (!result.valid) {
    return (
      <Shell>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gray-300" />
          <div className="px-5 py-10 sm:px-8 sm:py-14 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiXCircle size={28} className="text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Certificate could not be verified</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">{result.message}</p>
            <p className="text-xs text-gray-400 mt-6 font-mono break-all">{verificationId}</p>
          </div>
        </div>
      </Shell>
    );
  }

  const { certificate, recipient, issuer } = result;

  const details = [
    { icon: FiCalendar, label: "Date of issue", value: certificate.issuedOn, mono: false },
    { icon: FiUser, label: "Issued by", value: certificate.issuedByName, mono: false },
    { icon: FiShield, label: "Certificate ID", value: certificate.verificationId, mono: true },
    { icon: FiAward, label: "Issuing body", value: issuer.institution, mono: false },
  ];

  const meta = [
    certificate.activityCode ? `Activity ${certificate.activityCode}` : null,
    certificate.domain ? (DOMAIN_LABEL[certificate.domain] || certificate.domain) : null,
    certificate.credits ? `${certificate.credits} SAMAM Points` : null,
  ].filter(Boolean).join("  ·  ");

  return (
    <Shell>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />

        <div className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 border-b border-emerald-100">
          <FiCheckCircle size={16} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">Verified Certificate</p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8 text-center">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5"
            style={{ backgroundColor: "rgba(151,0,3,0.07)", border: "1.5px solid rgba(151,0,3,0.15)", color: BRAND }}
          >
            <FiAward size={26} />
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-widest">This certifies that</p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{recipient.name}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {[recipient.branch, recipient.username].filter(Boolean).join("  ·  ")}
          </p>

          <p className="text-xs text-gray-400 uppercase tracking-widest mt-5 sm:mt-6">has successfully completed</p>
          <h2 className="text-base sm:text-lg font-bold mt-2" style={{ color: BRAND }}>{certificate.activityTitle}</h2>
          {meta && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{meta}</p>}
        </div>

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details.map((d) => (
              <div key={d.label} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-left">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <d.icon size={11} />
                  <p className="text-[10px] uppercase tracking-wide font-semibold">{d.label}</p>
                </div>
                <p className={`text-xs font-semibold text-gray-800 break-all ${d.mono ? "font-mono" : ""}`}>{d.value}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-6 leading-relaxed">
            This certificate was issued through the SAMAM Activity Management Program and verified
            against {issuer.institution} records at the time of viewing.
          </p>
        </div>
      </div>
    </Shell>
  );
}
