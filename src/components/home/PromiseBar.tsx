import { getTranslations } from "next-intl/server";
import { Gift, Truck, PenLine } from "lucide-react";

export async function PromiseBar() {
  const t = await getTranslations("promise");
  const items = [{ icon: Gift, title: t("p1"), sub: t("p1Sub") }, { icon: Truck, title: t("p2"), sub: t("p2Sub") }, { icon: PenLine, title: t("p3"), sub: t("p3Sub") }];
  return <div className="promise-strip"><div className="container-x grid gap-5 py-7 md:grid-cols-3 md:gap-8">{items.map(({ icon: Icon, title, sub }) => <div className="promise-item" key={title}><Icon size={23} strokeWidth={1.35} /><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-ink-soft">{sub}</p></div></div>)}</div></div>;
}
