import { redirect } from "next/navigation";
import { getSession, isAdminRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/admin/login");
  }
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
