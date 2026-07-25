import SubPageShell from "@/app/components/dashboard/SubPageShell";
import { FiAward } from "react-icons/fi";

export default function CertificatesPage() {
  return (
    <SubPageShell
      icon={FiAward}
      title="Certificates"
      subtitle="Download and share all your participation and achievement certificates from activities you have completed."
      features={[
        "Auto-generated certificates for all completed activities",
        "Downloadable PDF with QR verification code",
        "Shareable certificate links for LinkedIn",
        "Certificate of Holistic Development (annual)",
      ]}
      route="/dashboard/student/certificates"
    />
  );
}
