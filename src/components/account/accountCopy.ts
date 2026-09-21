import type { AccountError } from "@/lib/addresses";

const ERRORS: Record<AccountError, { en: string; fr: string }> = {
  unauthorized: {
    en: "Your session has expired. Please sign in again.",
    fr: "Votre session a expiré. Veuillez vous reconnecter.",
  },
  invalid: {
    en: "Please check the highlighted details and try again.",
    fr: "Veuillez vérifier les renseignements saisis et réessayer.",
  },
  invalid_phone: {
    en: "Enter a phone number using digits only.",
    fr: "Entrez un numéro de téléphone composé de chiffres.",
  },
  invalid_postal: {
    en: "Enter a valid Canadian postal code, like K1A 0B1.",
    fr: "Entrez un code postal canadien valide, par exemple H2X 1Y4.",
  },
  invalid_province: {
    en: "Choose a province or territory.",
    fr: "Choisissez une province ou un territoire.",
  },
  password_short: {
    en: "Enter your current password and a new one of at least 8 characters.",
    fr: "Entrez votre mot de passe actuel et un nouveau d'au moins 8 caractères.",
  },
  password_mismatch: {
    en: "Those new passwords don't match.",
    fr: "Les nouveaux mots de passe ne correspondent pas.",
  },
  password_wrong: {
    en: "Your current password is incorrect.",
    fr: "Votre mot de passe actuel est incorrect.",
  },
  password_same: {
    en: "Choose a password different from your current one.",
    fr: "Choisissez un mot de passe différent de l'actuel.",
  },
  limited: {
    en: "Too many attempts. Please wait a few minutes and try again.",
    fr: "Trop de tentatives. Attendez quelques minutes et réessayez.",
  },
  address_limit: {
    en: "You can save up to 10 addresses. Delete one to add another.",
    fr: "Vous pouvez enregistrer jusqu'à 10 adresses. Supprimez-en une pour en ajouter une autre.",
  },
  address_missing: {
    en: "That address no longer exists.",
    fr: "Cette adresse n'existe plus.",
  },
  failed: {
    en: "Something went wrong. Please try again.",
    fr: "Une erreur est survenue. Veuillez réessayer.",
  },
};

export function accountErrorMessage(code: AccountError, fr: boolean): string {
  return ERRORS[code][fr ? "fr" : "en"];
}
