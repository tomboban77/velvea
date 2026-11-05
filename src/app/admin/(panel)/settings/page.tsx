import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { RefreshStorefrontButton } from "@/components/admin/RefreshStorefrontButton";
import { getSettings } from "@/lib/settings";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminPage("settings:write");
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" subtitle="Store contact details, delivery and tax."
        action={<RefreshStorefrontButton />}
      />
      <SettingsForm initial={settings} />
    </>
  );
}
