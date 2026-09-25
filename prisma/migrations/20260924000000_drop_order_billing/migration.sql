-- Drop the never-written Order.billing column.
-- Nothing in the application ever wrote it; Stripe holds the billing address
-- on the payment intent. No data is lost because no row ever had a value.
ALTER TABLE "Order" DROP COLUMN IF EXISTS "billing";
