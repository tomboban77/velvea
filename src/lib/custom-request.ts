import { z } from "zod";
import { addStoreDays, parseStoreDate, storeYmd } from "./dates";

/**
 * Custom basket requests: the customer tells us, in their own words, what they
 * want inside, and we reply with a price. There is no product picker on
 * purpose, so the only hard requirements are the description, a name, and one
 * way to reach them.
 *
 * Shared by the form (instant, per-field feedback) and the API route (the
 * authority). Keeping one schema means the browser can never accept something
 * the server then rejects with a vague error.
 */

export const CUSTOM_REQUEST_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  products: 3000,
  occasion: 120,
  budget: 60,
  deliveryArea: 120,
} as const;

/** The furthest ahead a "needed by" date may be. Anything later is a typo. */
export const NEEDED_BY_MAX_DAYS = 365;

/**
 * Field-level error codes. The form maps each to bilingual copy
 * (messages: customRequest.errors.*), so the API can stay language-neutral.
 */
export type CustomRequestErrorCode =
  | "required"
  | "tooLong"
  | "invalidEmail"
  | "invalidPhone"
  | "contactRequired"
  | "datePast"
  | "dateTooFar"
  | "invalidDate";

export type CustomRequestField =
  | "name"
  | "email"
  | "phone"
  | "products"
  | "occasion"
  | "budget"
  | "neededBy"
  | "deliveryArea";

const text = (max: number) => z.string().trim().max(max, "tooLong");
const optionalText = (max: number) => text(max).optional().default("");

/**
 * Phone numbers are free-form ("(416) 555-0199", "+1 416 555 0199") but must be
 * made of phone characters and carry 10 to 15 digits: 10 is a Canadian number
 * without the country code, 15 is the E.164 maximum. A number we cannot call
 * back is as good as no contact at all.
 */
export function isValidPhone(raw: string): boolean {
  if (!/^[\d\s()+.-]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}

export function customRequestSchema(today: string = storeYmd()) {
  return z
    .object({
      name: text(CUSTOM_REQUEST_LIMITS.name).min(1, "required"),
      email: optionalText(CUSTOM_REQUEST_LIMITS.email).refine(
        (v) => v === "" || z.string().email().safeParse(v).success,
        "invalidEmail"
      ),
      phone: optionalText(CUSTOM_REQUEST_LIMITS.phone).refine((v) => v === "" || isValidPhone(v), "invalidPhone"),
      products: text(CUSTOM_REQUEST_LIMITS.products).min(1, "required"),
      occasion: optionalText(CUSTOM_REQUEST_LIMITS.occasion),
      budget: optionalText(CUSTOM_REQUEST_LIMITS.budget),
      neededBy: z
        .string()
        .trim()
        .optional()
        .default("")
        .superRefine((v, ctx) => {
          if (v === "") return;
          if (!parseStoreDate(v)) return ctx.addIssue({ code: "custom", message: "invalidDate" });
          // YYYY-MM-DD compares correctly as a string.
          if (v < today) return ctx.addIssue({ code: "custom", message: "datePast" });
          if (v > addStoreDays(today, NEEDED_BY_MAX_DAYS))
            ctx.addIssue({ code: "custom", message: "dateTooFar" });
        }),
      deliveryArea: optionalText(CUSTOM_REQUEST_LIMITS.deliveryArea),
    })
    .superRefine((v, ctx) => {
      // Only flag the missing contact when both are blank. If one was typed but
      // is malformed, its own error already says what to fix.
      if (v.email === "" && v.phone === "") {
        ctx.addIssue({ code: "custom", path: ["email"], message: "contactRequired" });
        ctx.addIssue({ code: "custom", path: ["phone"], message: "contactRequired" });
      }
    });
}

export type CustomRequestInput = z.input<ReturnType<typeof customRequestSchema>>;
export type CustomRequestData = z.output<ReturnType<typeof customRequestSchema>>;

export type CustomRequestResult =
  | { ok: true; data: CustomRequestData }
  | { ok: false; errors: Partial<Record<CustomRequestField, CustomRequestErrorCode>> };

/** Validate and normalise. Returns the first error per field. */
export function validateCustomRequest(input: unknown, today?: string): CustomRequestResult {
  const res = customRequestSchema(today).safeParse(input);
  if (res.success) return { ok: true, data: res.data };
  const errors: Partial<Record<CustomRequestField, CustomRequestErrorCode>> = {};
  for (const issue of res.error.issues) {
    const field = issue.path[0] as CustomRequestField | undefined;
    if (!field || errors[field]) continue;
    // Zod's own messages (e.g. a non-string value) fall back to "required".
    const code = issue.message as CustomRequestErrorCode;
    errors[field] = KNOWN_CODES.has(code) ? code : "required";
  }
  return { ok: false, errors };
}

const KNOWN_CODES = new Set<CustomRequestErrorCode>([
  "required",
  "tooLong",
  "invalidEmail",
  "invalidPhone",
  "contactRequired",
  "datePast",
  "dateTooFar",
  "invalidDate",
]);
