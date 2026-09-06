import { setRequestLocale } from "next-intl/server";
import { CustomerAuth } from "@/components/account/CustomerAuth";
export const metadata = { title: "Create account" };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; setRequestLocale(locale);
  return <CustomerAuth mode="register" />;
}
