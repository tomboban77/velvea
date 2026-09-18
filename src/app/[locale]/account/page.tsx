import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { customerLogoutAction, resendVerificationAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import { Package, LogOut, MailWarning } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: { index: false, follow: false } };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  const verified = Boolean(user!.emailVerified);

  /**
   * Orders are matched on userId, plus the account email only once that email
   * has been verified. Matching an unverified email meant registering with a
   * guest's address handed you their order history.
   */
  const orders = await prisma.order
    .findMany({
      where: verified
        ? { OR: [{ userId: user!.id }, { email: user!.email }] }
        : { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { items: true } } },
    })
    .catch(() => []);

  return (
    <div className="container-x max-w-4xl py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{fr ? "Mon compte" : "My Account"}</p>
          <h1 className="font-display text-4xl">{user!.name || user!.email}</h1>
          <p className="mt-1 text-sm text-muted">{user!.email}</p>
        </div>
        <form action={customerLogoutAction}>
          <button className="btn btn-outline btn-sm">
            <LogOut className="h-4 w-4" /> {fr ? "Se déconnecter" : "Sign out"}
          </button>
        </form>
      </div>

      {!verified && (
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-cream/50 px-5 py-4">
          <MailWarning className="h-5 w-5 shrink-0 text-violet" />
          <p className="flex-1 text-sm text-ink-soft">
            {fr
              ? "Confirmez votre adresse courriel pour voir ici les commandes passées en tant qu'invité."
              : "Confirm your email address to see orders you placed as a guest here."}
          </p>
          <form action={resendVerificationAction}>
            <button className="btn btn-outline btn-sm">
              {fr ? "Renvoyer le courriel" : "Resend email"}
            </button>
          </form>
        </div>
      )}

      <h2 className="mt-10 mb-4 font-display text-2xl">{fr ? "Vos commandes" : "Your orders"}</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-cream/40 px-6 py-16 text-center">
          <Package className="mx-auto h-7 w-7 text-muted" />
          <p className="mt-3 font-display text-xl">{fr ? "Aucune commande" : "No orders yet"}</p>
          <Link href="/baskets" className="btn btn-primary btn-sm mt-4">
            {fr ? "Magasiner" : "Start shopping"}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-shell">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/30">
                  <td className="px-5 py-4">
                    <Link
                      href={`/order/${o.orderNumber}`}
                      className="font-medium text-ink hover:text-violet"
                    >
                      {o.orderNumber}
                    </Link>
                    <div className="text-xs text-muted">
                      {formatDate(o.createdAt, fr ? "fr-CA" : "en-CA")}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-muted">
                    {o._count.items} {fr ? "articles" : "items"}
                  </td>
                  <td className="px-3 py-4 text-ink-soft">{o.status}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatMoney(o.totalCents, fr ? "fr-CA" : "en-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
