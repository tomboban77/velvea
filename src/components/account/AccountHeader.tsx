import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

/** Back link + eyebrow + title shared by the account sub-pages. */
export function AccountHeader({
  fr,
  title,
  lede,
  action,
}: {
  fr: boolean;
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-violet"
      >
        <ArrowLeft className="h-4 w-4" /> {fr ? "Mon compte" : "My account"}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{fr ? "Mon compte" : "My Account"}</p>
          <h1 className="font-display text-4xl">{title}</h1>
          {lede && <p className="mt-2 text-sm text-muted">{lede}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
