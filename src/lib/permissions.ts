import type { Role } from "@prisma/client";

/**
 * What each admin role may do.
 *
 * STAFF used to be indistinguishable from ADMIN, which meant a seasonal packer
 * could rewrite tax rates or delete the catalogue. STAFF now covers day-to-day
 * fulfilment and content; anything that moves money, changes access or destroys
 * records is ADMIN-only.
 */
export const PERMISSIONS = [
  "orders:read",
  "orders:write",
  "orders:refund",
  "products:read",
  "products:write",
  "products:delete",
  "collections:write",
  "collections:delete",
  "reviews:moderate",
  "reviews:delete",
  "inquiries:write",
  "articles:write",
  "articles:delete",
  "builder:write",
  "builder:delete",
  "discounts:write",
  "settings:write",
  "customers:read",
  "staff:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STAFF_PERMISSIONS = new Set<Permission>([
  "orders:read",
  "orders:write",
  "products:read",
  "products:write",
  "collections:write",
  "reviews:moderate",
  "inquiries:write",
  "articles:write",
  "builder:write",
  "customers:read",
]);

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (role === "ADMIN") return true;
  if (role === "STAFF") return STAFF_PERMISSIONS.has(permission);
  return false;
}

/** Human-readable reason for a denial, surfaced in the admin UI. */
export function denialMessage(permission: Permission): string {
  return `Your role does not allow "${permission}". Ask an administrator.`;
}
