import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of cents as CAD currency. */
export function formatMoney(cents: number, locale = "en-CA"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Turn any string into a URL-safe slug. */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Short human date. */
export function formatDate(date: Date | string, locale = "en-CA"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/** Generate a friendly order number. */
export function generateOrderNumber(): string {
  const y = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const t = Date.now().toString(36).slice(-4).toUpperCase();
  return `VLV-${y}-${t}${rand}`;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n).trimEnd() + "…" : str;
}
