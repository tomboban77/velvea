import { AdminForgotPassword } from "@/components/admin/AdminPasswordForms";

export const metadata = { title: "Reset admin password", robots: { index: false, follow: false } };

export default function Page() {
  return <AdminForgotPassword />;
}
