import Image from "next/image";

interface SamamLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export default function SamamLogo({
  className = "h-9 w-9 sm:h-10 sm:w-10",
  size = 64,
  priority = true,
}: SamamLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10 dark:ring-white/15 transition-transform ${className}`}
    >
      <Image
        src="/SAMAM.png"
        alt="SAMAM Logo"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority={priority}
      />
    </div>
  );
}
