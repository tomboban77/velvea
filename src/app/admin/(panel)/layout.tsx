import { redirect } from "next/navigation";
import { getVerifiedAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The role is re-read from the database rather than trusted from the token,
  // so a revoked admin loses the panel on their next navigation.
  const admin = await getVerifiedAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell email={admin.email} role={admin.role}>
      {children}
    </AdminShell>
  );
}
