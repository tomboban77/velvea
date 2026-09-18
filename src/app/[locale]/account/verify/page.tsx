import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm your email", robots: { index: false, follow: false } };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const fr = locale === "fr";

  const ok = await verifyEmailToken(token ?? "");

  return (
    <div className="container-x max-w-xl py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lilac">
        {ok ? (
          <CheckCircle2 className="h-8 w-8 text-violet-deep" />
        ) : (
          <XCircle className="h-8 w-8 text-muted" />
        )}
      </div>
      <h1 className="mt-5 font-display text-3xl">
        {ok
          ? fr
            ? "Adresse confirmée"
            : "Email confirmed"
          : fr
          ? "Lien expiré"
          : "That link has expired"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {ok
          ? fr
            ? "Vos commandes passées en tant qu'invité apparaîtront maintenant dans votre compte."
            : "Orders you placed as a guest will now appear in your account."
          : fr
          ? "Ce lien de confirmation a déjà été utilisé ou a expiré. Vous pouvez en demander un nouveau depuis votre compte."
          : "This confirmation link was already used or has expired. You can request a new one from your account."}
      </p>
      <Link href="/account" className="btn btn-primary mt-7">
        {fr ? "Aller à mon compte" : "Go to my account"}
      </Link>
    </div>
  );
}
