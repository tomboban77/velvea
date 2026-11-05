import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { StaffManager } from "@/components/admin/StaffManager";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  // STAFF can reach the admin panel but must not be able to promote anyone.
  const admin = await requireAdminPage("staff:manage");

  let users;
  try {
    users = await prisma.user.findMany({
      where: { role: { in: ["STAFF", "ADMIN"] } },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  } catch {
    users = null;
  }

  return (
    <>
      <PageHeader
        title="Staff & roles"
        subtitle="Who can sign in to this panel, and how much they can change."
      />
      {!users ? (
        <EmptyState title="Database not connected" />
      ) : (
        <StaffManager users={users} currentUserId={admin.id} />
      )}
    </>
  );
}
