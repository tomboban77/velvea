import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { CheckCircle2, MapPin, Plus, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import { MAX_ADDRESSES, type AddressListStatus } from "@/lib/addresses";
import { AccountHeader } from "@/components/account/AccountHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved addresses", robots: { index: false, follow: false } };

const STATUS_MESSAGES: Record<AddressListStatus, { en: string; fr: string }> = {
  saved: { en: "Address saved.", fr: "Adresse enregistrée." },
  deleted: { en: "Address removed.", fr: "Adresse supprimée." },
  default: { en: "Default address updated.", fr: "Adresse par défaut mise à jour." },
};

function listStatus(value: string | undefined): AddressListStatus | null {
  return value && value in STATUS_MESSAGES ? (value as AddressListStatus) : null;
}

export default async function AddressesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const fr = locale === "fr";
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/account/login", locale });

  const addresses = await prisma.address
    .findMany({
      where: { userId: user!.id },
      orderBy: [{ isDefault: "desc" }, { label: "asc" }, { fullName: "asc" }],
    })
    .catch(() => []);

  const flag = listStatus(status);
  const message = flag ? STATUS_MESSAGES[flag][fr ? "fr" : "en"] : null;
  const full = addresses.length >= MAX_ADDRESSES;

  return (
    <div className="container-x max-w-4xl py-14">
      <AccountHeader
        fr={fr}
        title={fr ? "Adresses" : "Addresses"}
        lede={
          fr
            ? `Enregistrez jusqu'à ${MAX_ADDRESSES} adresses pour accélérer le passage à la caisse.`
            : `Save up to ${MAX_ADDRESSES} addresses to speed up checkout.`
        }
        action={
          !full && (
            <Link href="/account/addresses/new" className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" /> {fr ? "Ajouter une adresse" : "Add address"}
            </Link>
          )
        }
      />

      {message && (
        <p role="status" className="mt-6 flex items-start gap-2 text-sm text-violet-deep">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}

      {addresses.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line-strong bg-cream/40 px-6 py-16 text-center">
          <MapPin className="mx-auto h-7 w-7 text-muted" />
          <p className="mt-3 font-display text-xl">
            {fr ? "Aucune adresse enregistrée" : "No saved addresses yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {fr
              ? "Votre adresse par défaut sera présélectionnée à la caisse."
              : "Your default address is preselected at checkout."}
          </p>
          <Link href="/account/addresses/new" className="btn btn-primary btn-sm mt-4">
            {fr ? "Ajouter une adresse" : "Add an address"}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col rounded-lg border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-ink">{a.label || a.fullName}</p>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lilac px-2.5 py-0.5 text-xs font-semibold text-violet-deep">
                    <Star className="h-3 w-3" /> {fr ? "Par défaut" : "Default"}
                  </span>
                )}
              </div>
              <address className="mt-2 text-sm not-italic leading-relaxed text-ink-soft">
                {a.label && <div>{a.fullName}</div>}
                <div>{a.line1}</div>
                {a.line2 && <div>{a.line2}</div>}
                <div>
                  {a.city}, {a.province} {a.postalCode}
                </div>
                {a.phone && <div className="text-muted">{a.phone}</div>}
              </address>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Link href={`/account/addresses/${a.id}`} className="btn btn-outline btn-sm">
                  {fr ? "Modifier" : "Edit"}
                </Link>
                {!a.isDefault && (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn btn-ghost btn-sm">
                      {fr ? "Définir par défaut" : "Set as default"}
                    </button>
                  </form>
                )}
                <form action={deleteAddressAction} className="ml-auto">
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <button className="btn btn-ghost btn-sm text-danger">
                    {fr ? "Supprimer" : "Delete"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {full && (
        <p className="mt-4 text-sm text-muted">
          {fr
            ? `Vous avez atteint la limite de ${MAX_ADDRESSES} adresses. Supprimez-en une pour en ajouter une autre.`
            : `You've reached the ${MAX_ADDRESSES}-address limit. Delete one to add another.`}
        </p>
      )}
    </div>
  );
}
