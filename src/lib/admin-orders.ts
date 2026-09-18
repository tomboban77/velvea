import type { Prisma } from "@prisma/client";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

/** Filter shared by the admin order list and the CSV export, so both agree. */
export function orderListWhere(status?: string, q?: string): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  if (status && status !== "all" && (ORDER_STATUSES as readonly string[]).includes(status)) {
    where.status = status as Prisma.OrderWhereInput["status"];
  }
  const term = q?.trim();
  if (term) {
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { trackingNumber: { contains: term, mode: "insensitive" } },
      { discountCode: { contains: term, mode: "insensitive" } },
    ];
  }
  return where;
}

/**
 * Escape one CSV cell. The leading-quote guard stops a cell beginning with
 * `=`, `+`, `-` or `@` from being executed as a formula when the export is
 * opened in Excel or Sheets.
 */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}
