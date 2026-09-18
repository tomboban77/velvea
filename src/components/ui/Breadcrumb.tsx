import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ items, className }: { items: { label: string; href: string }[]; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1.5 overflow-hidden text-[0.82rem] text-muted", className)} aria-label="Breadcrumb">
      {items.map((b, i) => {
        const last = i === items.length - 1;
        return (
          <span key={b.href} className={cn("flex min-w-0 items-center gap-1.5", last && "truncate")}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />}
            {last ? (
              <span className="truncate font-medium text-ink" aria-current="page">{b.label}</span>
            ) : (
              <Link href={b.href} className="whitespace-nowrap transition-colors hover:text-violet-deep">
                {b.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
