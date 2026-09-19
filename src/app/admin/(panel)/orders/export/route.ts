import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { orderListWhere, csvRow } from "@/lib/admin-orders";
import { storeYmd } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

const HEADERS = [
  "Order number",
  "Placed",
  "Status",
  "Email",
  "Phone",
  "Locale",
  "Delivery method",
  "Delivery zone",
  "Delivery date",
  "Recipient",
  "Address 1",
  "Address 2",
  "City",
  "Province",
  "Postal code",
  "Items",
  "Subtotal",
  "Discount",
  "Discount code",
  "Shipping",
  "Tax",
  "Total",
  "Refunded",
  "Carrier",
  "Tracking",
  "Gift message",
  "Delivery notes",
];

/** Dollars with two decimals — the export is opened in a spreadsheet. */
const money = (cents: number) => (cents / 100).toFixed(2);

export async function GET(req: NextRequest) {
  // The middleware already gates /admin, but an export of every customer's
  // address deserves its own check rather than relying on the layer above.
  const admin = await getVerifiedAdmin();
  if (!admin || !can(admin.role, "orders:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const q = req.nextUrl.searchParams.get("q") ?? undefined;

  const orders = await prisma.order.findMany({
    where: orderListWhere(status, q),
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    include: { items: true },
  });

  const lines = [csvRow(HEADERS)];
  for (const o of orders) {
    const s = o.shipping as {
      fullName?: string;
      line1?: string;
      line2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
    };
    lines.push(
      csvRow([
        o.orderNumber,
        o.createdAt.toISOString(),
        o.status,
        o.email,
        o.phone ?? "",
        o.locale,
        o.deliveryMethod,
        o.deliveryZoneKey ?? "",
        o.deliveryDate ? storeYmd(o.deliveryDate) : "",
        s.fullName ?? "",
        s.line1 ?? "",
        s.line2 ?? "",
        s.city ?? "",
        s.province ?? "",
        s.postalCode ?? "",
        o.items
          .map(
            (i) =>
              `${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}` +
              (i.giftMessage ? ` [card: ${i.giftMessage}]` : "")
          )
          .join(" | "),
        money(o.subtotalCents),
        money(o.discountCents),
        o.discountCode ?? "",
        money(o.shippingCents),
        money(o.taxCents),
        money(o.totalCents),
        money(o.refundedCents),
        o.carrier ?? "",
        o.trackingNumber ?? "",
        o.giftMessage ?? "",
        o.deliveryNotes ?? "",
      ])
    );
  }

  // The BOM makes Excel read the file as UTF-8 (accented names, é in Québec).
  const body = "﻿" + lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="velvea-orders-${storeYmd()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
