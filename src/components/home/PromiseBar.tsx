import { getTranslations } from "next-intl/server";

/**
 * Slow engraved ticker of the house promises. Replaces the icon strip.
 * Content is duplicated once so the loop is seamless; pauses on hover.
 */
export async function PromiseBar() {
  const t = await getTranslations("promise");
  const items = [t("p1"), t("p2"), t("p3"), t("p1Sub"), t("p2Sub"), t("p3Sub")];
  const row = [...items, ...items];

  return (
    <section className="ticker" aria-label="Velvea promises">
      <div className="marquee py-4">
        {row.map((text, i) => (
          <span key={i} className="caps flex items-center whitespace-nowrap text-[0.62rem] text-ink-soft">
            <span className="px-7">{text}</span>
            <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden className="text-lilac-deep">
              <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </section>
  );
}
