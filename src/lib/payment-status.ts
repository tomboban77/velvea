/**
 * Whether a completed Checkout Session settles its order. A discount that
 * covers the whole total gives a $0 session, which Stripe completes as
 * "no_payment_required"; checking for "paid" alone left those orders PENDING
 * forever, with no confirmation and the discount never released.
 */
export function sessionSettles(session: { payment_status?: string | null }): boolean {
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}
