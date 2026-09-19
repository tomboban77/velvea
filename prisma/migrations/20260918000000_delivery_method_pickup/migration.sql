-- Pickup joins the existing delivery methods.
--
-- Kept in its own migration: PostgreSQL will not let a newly added enum value
-- be used in the same transaction that adds it, so the table changes that
-- reference it live in the migration that follows.
ALTER TYPE "DeliveryMethod" ADD VALUE 'PICKUP';
