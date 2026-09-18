import { AdminResetPassword } from "@/components/admin/AdminPasswordForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default function Page() {
  return <AdminResetPassword />;
}
