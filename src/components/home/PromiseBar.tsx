import { getTranslations } from "next-intl/server";
import { Gift, Clock, PenLine, Truck } from "lucide-react";

/** Four store promises in one hairline strip under the hero. */
export async function PromiseBar() {
  const t = await getTranslations();
  const items = [
    { icon: Gift, title: t("promise.p1"), sub: t("promise.p1Sub") },
    { icon: Clock, title: t("promise.p2"), sub: t("promise.p2Sub") },
    { icon: PenLine, title: t("promise.p3"), sub: t("promise.p3Sub") },
    { icon: Truck, title: t("way.f2"), sub: t("way.f2Sub") },
  ];
  return (
    <div className="promise-strip">
      <div className="container-x">
        <div className="promise-grid">
          {items.map(({ icon: Icon, title, sub }) => (
            <div className="promise-item" key={title}>
              <Icon strokeWidth={1.4} />
              <div>
                <p>{title}</p>
                <p>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
