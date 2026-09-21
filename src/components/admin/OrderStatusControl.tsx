"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, StickyNote, Undo2 } from "lucide-react";
import { updateOrderStatus, shipOrder, addOrderNote, refundOrder } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

/**
 * PENDING and REFUNDED are outcomes, not choices: payment and refunds are
 * recorded by Stripe (or the Refund control), never by picking a status.
 * PAID stays for manual payments and is ADMIN-only on the server.
 */
const STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/** Statuses whose side effects (email, stock, refund) need an explicit choice. */
const NOTIFIES: OrderStatus[] = ["SHIPPED", "DELIVERED", "CANCELLED"];

function useSaver() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const run = (fn: () => Promise<unknown>) => {
    setError(null);
    start(async () => {
      try {
        await fn();
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return { pending, error, saved, run };
}

export function OrderStatusControl({
  id,
  current,
}: {
  id: string;
  current: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const { pending, error, saved, run } = useSaver();

  const dirty = status !== current;
  const showNotify = NOTIFIES.includes(status);

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="field w-full"
        disabled={pending}
      >
        {/* The current status is shown even when it is not a pickable one
            (PENDING, REFUNDED), so the dropdown never misrepresents the order. */}
        {!STATUSES.includes(current) && (
          <option value={current} disabled>
            {current} (current)
          </option>
        )}
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {dirty && (
        <>
          <input
            className="field w-full"
            placeholder="Reason / note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          {showNotify && (
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              Email the customer
            </label>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateOrderStatus({ id, status, note, notify }))}
            className="btn btn-primary btn-sm w-full"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save status
          </button>
        </>
      )}

      {saved && <p className="text-xs text-success">Saved</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function OrderTrackingControl({
  id,
  carrier: initialCarrier,
  trackingNumber: initialNumber,
  trackingUrl: initialUrl,
  shipped,
}: {
  id: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shipped: boolean;
}) {
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(initialNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(initialUrl ?? "");
  const [notify, setNotify] = useState(!shipped);
  const { pending, error, saved, run } = useSaver();

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="field"
          placeholder="Carrier (Canada Post…)"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          maxLength={80}
        />
        <input
          className="field"
          placeholder="Tracking number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          maxLength={120}
        />
      </div>
      <input
        className="field"
        placeholder="Tracking URL (optional)"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        maxLength={500}
      />
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Email the customer their tracking
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => shipOrder({ id, carrier, trackingNumber, trackingUrl, notify }))}
        className="btn btn-primary btn-sm w-full"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
        {shipped ? "Update tracking" : "Mark shipped"}
      </button>
      {saved && <p className="text-xs text-success">Saved</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function OrderNotes({ id, initial }: { id: string; initial: string }) {
  const [adminNotes, setAdminNotes] = useState(initial);
  const { pending, error, saved, run } = useSaver();

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        className="field w-full resize-y"
        placeholder="Internal notes — never shown to the customer."
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        maxLength={4000}
      />
      <button
        type="button"
        disabled={pending || adminNotes === initial}
        onClick={() => run(() => addOrderNote({ id, adminNotes }))}
        className="btn btn-outline btn-sm w-full"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
        Save note
      </button>
      {saved && <p className="text-xs text-success">Saved</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function OrderRefundControl({
  id,
  totalCents,
  refundedCents,
  viaStripe,
}: {
  id: string;
  totalCents: number;
  refundedCents: number;
  viaStripe: boolean;
}) {
  const remaining = totalCents - refundedCents;
  const [amount, setAmount] = useState((remaining / 100).toFixed(2));
  const [notify, setNotify] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const { pending, error, saved, run } = useSaver();

  if (remaining <= 0) {
    return <p className="text-sm text-muted">Fully refunded.</p>;
  }

  const amountCents = Math.round(Number(amount) * 100);
  const valid = Number.isFinite(amountCents) && amountCents > 0 && amountCents <= remaining;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {formatMoney(remaining)} available to refund
        {refundedCents > 0 ? ` · ${formatMoney(refundedCents)} already refunded` : ""}.
      </p>
      <div className="flex gap-2">
        <input
          className="field flex-1"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setAmount((remaining / 100).toFixed(2))}
        >
          Full
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Email the customer
      </label>
      <p className="text-xs text-muted">
        {viaStripe
          ? "Issued through Stripe against the original payment."
          : "No Stripe payment on this order — this records a refund you issued by hand."}
      </p>

      {confirming ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending || !valid}
            onClick={() => {
              setConfirming(false);
              run(() => refundOrder({ id, amountCents, notify }));
            }}
            className="btn btn-sm flex-1 bg-danger text-white hover:opacity-90"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirm {formatMoney(amountCents || 0)}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!valid}
          onClick={() => setConfirming(true)}
          className="btn btn-outline btn-sm w-full"
        >
          <Undo2 className="h-4 w-4" /> Refund
        </button>
      )}

      {saved && <p className="text-xs text-success">Refund recorded.</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
