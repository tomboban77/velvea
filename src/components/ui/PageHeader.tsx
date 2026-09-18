import { Breadcrumb } from "./Breadcrumb";
import { cn } from "@/lib/utils";

/**
 * Standard page header band: breadcrumb, eyebrow, title, lede. Cream
 * background with a hairline, so every secondary page opens the same way.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  breadcrumb,
  children,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  breadcrumb?: { label: string; href: string }[];
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("band-cream border-b border-line", className)}>
      <div className="container-x pb-9 pt-5 lg:pb-12">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <header className={cn("mt-6 max-w-3xl", centered && "mx-auto text-center")}>
          {eyebrow && <p className="caps mb-3">{eyebrow}</p>}
          <h1 className="h-display balance">{title}</h1>
          {lede && <p className={cn("mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft pretty", centered && "mx-auto")}>{lede}</p>}
          {children}
        </header>
      </div>
    </div>
  );
}
