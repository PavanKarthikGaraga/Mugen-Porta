import Link from "next/link";
import SamamLogo from "@/components/SamamLogo";

export const metadata = {
  title: "Page not found | SAMAM",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-red-100/60 blur-[100px]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex items-center justify-center gap-3">
          <SamamLogo className="h-12 w-12 rounded-xl" />
          <span className="text-2xl font-extrabold tracking-tight text-red-950">SAMAM</span>
        </div>
        <p className="text-7xl font-extrabold tracking-tight text-red-900/90">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The link may be broken or the page may have moved. Check the address, or head back to a page you know.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-red-900 px-6 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
          >
            Go to my dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
