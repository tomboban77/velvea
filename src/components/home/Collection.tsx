import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CollectionTabs, type CollectionTab } from "./CollectionTabs";

/** Tabbed collection block. The tabs are computed on the server (see the home page). */
export async function Collection({ tabs }: { tabs: CollectionTab[] }) {
  if (!tabs.length) return <div id="collection" />;
  const t = await getTranslations("collection");

  return (
    <section id="collection" className="section border-t border-line">
      <div className="container-x">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede2")} link="/baskets" linkLabel={t("viewAll")} />
        <div className="mt-8">
          <CollectionTabs tabs={tabs} />
        </div>
      </div>
    </section>
  );
}
