"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

type Props = Parameters<typeof trackPurchase>[0];

/** Sends the GA4 purchase event from the order confirmation page. Renders nothing. */
export function TrackPurchase(props: Props) {
  useEffect(() => {
    trackPurchase(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.orderNumber]);
  return null;
}
