import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { customerLogoutAction, resendVerificationAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import type { ResendVerificationStatus } from "@/lib/actions/auth";
import {
  Package,
  LogOut,
  MailWarning,
  CheckCircle2,
  User,
  MapPin,
  KeyRound,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: { index: false, follow: false } };

const RESEND_MESSAGES: Record<ResendVerificationStatus, { en: string; fr: string }> = {
  sent: {
    en: "Confirmation email sent. Check your inbox and spam folder; it can take a minute to arrive.",
    fr: "Courriel de confirmation envoyé. Vérifiez votre boîte de réception et vos pourriels; il peut prendre une minute.",
  },
  limited: {
    en: "Too many requests. Please wait an hour before asking for another confirmation email.",
    fr: "Trop de demandes. Attendez une heure avant de redemander un courriel de confirmation.",
  },
  failed: {
    en: "We couldn't send the confirmation email right now. Please try again later or contact us.",
    fr: "Impossible d'envoyer le courriel de confirmation pour le moment. Réessayez plus tard ou contactez-nous.",
  },
  verified: {
    en: "Your email is already confirmed.",
    fr: "Votre courriel est déjà confirmé.",
  },
};

function resendStatus(value: string | undefined): ResendVerificationStatus | null {
  return value && value in RESEND_MESSAGES ? (value as ResendVerificationStatus) : null;
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ verify?: string }>;
}) {
  const { locale } = await params;
  const { verify } = await searchParams;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  const verified = Boolean(user!.emailVerified);
  const resend = resendStatus(verify);
  const resendMessage = resend ? RESEND_MESSAGES[resend][fr ? "fr" : "en"] : null;

  /**
   * Orders are matched on userId, plus the account email only once that email
   * has been verified. Matching an unverified email meant registering with a
   * guest's address handed you their order history.
   */
  const [orders, addressCount] = await Promise.all([
    prisma.order
      .findMany({
        where: verified
          ? { OR: [{ userId: user!.id }, { email: user!.email }] }
          : { userId: user!.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { _count: { select: { items: true } } },
      })
      .catch(() => []),
    prisma.address.count({ where: { userId: user!.id } }).catch(() => 0),
  ]);

  const sections = [
    {
      href: "/account/profile" as const,
      icon: User,
      title: fr ? "Profil" : "Profile",
      sub: fr ? "Nom et téléphone" : "Name and phone",
    },
    {
      href: "/account/addresses" as const,
      icon: MapPin,
      title: fr ? "Adresses" : "Addresses",
      sub:
        addressCount === 0
          ? fr
            ? "Aucune adresse enregistrée"
            : "No saved addresses"
          : fr
          ? `${addressCount} adresse${addressCount > 1 ? "s" : ""} enregistrée${addressCount > 1 ? "s" : ""}`
          : `${addressCount} saved address${addressCount > 1 ? "es" : ""}`,
    },
    {
      href: "/account/password" as const,
      icon: KeyRound,
      title: fr ? "Mot de passe" : "Password",
      sub: fr ? "Changer votre mot de passe" : "Change your password",
    },
  ];

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
        <div className="mt-8 rounded-lg border border-line bg-cream/50 px-5 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <MailWarning className="h-5 w-5 shrink-0 text-violet" />
            <p className="flex-1 text-sm text-ink-soft">
              {fr
                ? "Confirmez votre adresse courriel pour voir ici les commandes passées en tant qu'invité."
                : "Confirm your email address to see orders you placed as a guest here."}
            </p>
            <form action={resendVerificationAction}>
              <input type="hidden" name="locale" value={locale} />
              <button className="btn btn-outline btn-sm">
                {fr ? "Renvoyer le courriel" : "Resend email"}
              </button>
            </form>
          </div>
          {resendMessage && (
            <p
              role="status"
              className={`mt-3 flex items-start gap-2 text-sm ${
                resend === "sent" ? "text-violet-deep" : "text-ink-soft"
              }`}
            >
              {resend === "sent" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              {resendMessage}
            </p>
          )}
        </div>
      )}
      {verified && resend === "verified" && (
        <p role="status" className="mt-6 text-sm text-ink-soft">
          {RESEND_MESSAGES.verified[fr ? "fr" : "en"]}
        </p>
      )}

      <h2 className="mt-10 mb-4 font-display text-2xl">{fr ? "Vos renseignements" : "Your details"}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ href, icon: Icon, title, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition-colors hover:border-line-strong hover:bg-cream/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft group-hover:bg-lilac group-hover:text-violet-deep">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{title}</span>
              <span className="block truncate text-xs text-muted">{sub}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-2xl">{fr ? "Vos commandes" : "Your orders"}</h2>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-cream/40 px-6 py-16 text-center">
          <Package className="mx-auto h-7 w-7 text-muted" />
          <p className="mt-3 font-display text-xl">{fr ? "Aucune commande" : "No orders yet"}</p>
          <Link href="/baskets" className="btn btn-primary btn-sm mt-4">
            {fr ? "Magasiner" : "Start shopping"}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white">
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
