import { redirect } from "next/navigation";

// The old 3-tab client-side shell lived here — refreshing on any tab but
// Overview reset back to it, since it was just useState, not a route. Each
// tab is now its own page under this folder; this bare /samam URL just
// forwards to Overview.
export default function LeadSamamPage() {
  redirect("/dashboard/lead/samam/overview");
}
