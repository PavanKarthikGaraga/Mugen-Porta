"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FiDownload, FiExternalLink, FiAward, FiAlertCircle, FiSearch,
  FiCheckCircle, FiCopy, FiCalendar,
} from "react-icons/fi";
import { toast } from "sonner";
import { downloadCertificatePdf, certificateVerifyUrl } from "@/lib/certificateDesign";

const BRAND = "rgb(151,0,3)";

const DOMAIN_LABEL: Record<string, string> = {
  TEC: "Technology & Emerging Tech",
  LCH: "Literary, Cultural & Heritage",
  ESO: "Extension & Social Outreach",
  IIE: "Innovation & Entrepreneurship",
  HWB: "Health & Well-being",
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/student/certificates");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setCertificates(data.certificates || []);
      setLoadError(false);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (cert: any) => {
    setDownloading(cert.verificationId);
    try {
      await downloadCertificatePdf(cert);
      toast.success("Certificate downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the certificate. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const copyLink = async (cert: any) => {
    try {
      await navigator.clipboard.writeText(certificateVerifyUrl(cert.verificationId));
      toast.success("Verification link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const filtered = certificates.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.activityTitle?.toLowerCase().includes(q) ||
      c.activityCode?.toLowerCase().includes(q) ||
      c.verificationId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <Image src="/sac-logo.png" alt="KL SAC" width={132} height={34} className="mt-1 hidden sm:block" priority />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Certificates</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Verified certificates issued for activities you have completed.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            <p className="text-xs text-gray-400">Issued</p>
          </div>
        </div>
      </div>

      {certificates.length > 3 && (
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by activity, code or certificate ID"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 shadow-sm"
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <FiAlertCircle size={30} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">Couldn&apos;t load your certificates</p>
          <button onClick={load} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
            Try again
          </button>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <FiAward size={34} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No certificates yet</p>
          <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Certificates appear here once you complete an activity and your club lead or faculty
            mentor issues one. Completing an activity does not issue a certificate automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-14">
          <FiSearch size={26} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No certificates match &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((cert) => (
            <div key={cert.verificationId} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="h-1" style={{ background: BRAND }} />
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-gray-400">{cert.activityCode}</p>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug mt-0.5">{cert.activityTitle}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    <FiCheckCircle size={10} /> Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  {cert.domain && <span>{DOMAIN_LABEL[cert.domain] || cert.domain}</span>}
                  {cert.credits ? <span>{cert.credits} SAMAM Points</span> : null}
                  <span className="flex items-center gap-1"><FiCalendar size={11} /> {cert.issuedOn}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Certificate ID</p>
                  <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5 break-all">{cert.verificationId}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Issued by {cert.issuedByName}</p>
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === cert.verificationId}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white transition-all disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  <FiDownload size={12} />
                  {downloading === cert.verificationId ? "Generating…" : "Download PDF"}
                </button>
                <a
                  href={`/certificates/verify/${cert.verificationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white transition-colors"
                >
                  <FiExternalLink size={12} /> Verify
                </a>
                <button
                  onClick={() => copyLink(cert)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white transition-colors"
                >
                  <FiCopy size={12} /> Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
