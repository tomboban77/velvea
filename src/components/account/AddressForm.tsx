"use client";

import { useActionState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { saveAddressAction } from "@/lib/actions/account";
import { PROVINCES, PROVINCE_NAMES, type AccountState, type SavedAddress } from "@/lib/addresses";
import { accountErrorMessage } from "./accountCopy";

/** New (no `address`) or edit (with `address`) form; the server decides which by the hidden id. */
export function AddressForm({
  address,
  defaultName = "",
  defaultPhone = "",
}: {
  address?: SavedAddress;
  /** Sensible starting values for a first address, taken from the profile. */
  defaultName?: string;
  defaultPhone?: string;
}) {
  const locale = useLocale();
  const fr = locale === "fr";
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    saveAddressAction,
    null
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="mb-4">
        <label className="label" htmlFor="addr-label">
          {fr ? "Étiquette (facultatif)" : "Label (optional)"}
        </label>
        <input
          id="addr-label"
          name="label"
          defaultValue={address?.label ?? ""}
          maxLength={40}
          placeholder={fr ? "Maison, Bureau, Maman…" : "Home, Office, Mom's place…"}
          className="field"
        />
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="addr-fullName">
          {fr ? "Nom complet du destinataire" : "Recipient full name"}
        </label>
        <input
          id="addr-fullName"
          name="fullName"
          required
          defaultValue={address?.fullName ?? defaultName}
          maxLength={120}
          className="field"
          autoComplete="name"
        />
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="addr-line1">{fr ? "Adresse" : "Street address"}</label>
        <input
          id="addr-line1"
          name="line1"
          required
          defaultValue={address?.line1 ?? ""}
          maxLength={160}
          className="field"
          autoComplete="address-line1"
        />
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="addr-line2">
          {fr ? "Appartement, bureau (facultatif)" : "Apartment, suite (optional)"}
        </label>
        <input
          id="addr-line2"
          name="line2"
          defaultValue={address?.line2 ?? ""}
          maxLength={160}
          className="field"
          autoComplete="address-line2"
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="addr-city">{fr ? "Ville" : "City"}</label>
          <input
            id="addr-city"
            name="city"
            required
            defaultValue={address?.city ?? ""}
            maxLength={80}
            className="field"
            autoComplete="address-level2"
          />
        </div>
        <div>
          <label className="label" htmlFor="addr-province">{fr ? "Province" : "Province"}</label>
          <select
            id="addr-province"
            name="province"
            required
            defaultValue={address?.province ?? "ON"}
            className="field"
            autoComplete="address-level1"
          >
            {PROVINCES.map((code) => (
              <option key={code} value={code}>
                {PROVINCE_NAMES[code][fr ? "fr" : "en"]} ({code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="addr-postal">{fr ? "Code postal" : "Postal code"}</label>
          <input
            id="addr-postal"
            name="postalCode"
            required
            defaultValue={address?.postalCode ?? ""}
            maxLength={7}
            placeholder="K1A 0B1"
            className="field uppercase"
            autoComplete="postal-code"
          />
        </div>
        <div>
          <label className="label" htmlFor="addr-phone">
            {fr ? "Téléphone (facultatif)" : "Phone (optional)"}
          </label>
          <input
            id="addr-phone"
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? defaultPhone}
            maxLength={40}
            className="field"
            autoComplete="tel"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="h-4 w-4 rounded border-line-strong accent-violet"
        />
        {fr ? "Utiliser comme adresse par défaut" : "Use as my default address"}
      </label>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {accountErrorMessage(state.error, fr)}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "…" : fr ? "Enregistrer l'adresse" : "Save address"}
        </button>
        <Link href="/account/addresses" className="btn btn-outline">
          {fr ? "Annuler" : "Cancel"}
        </Link>
      </div>
    </form>
  );
}
