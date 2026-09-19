-- Builder add-ons that cannot travel with a carrier: fresh flowers, anything
-- chilled, anything alcoholic. A custom basket is shippable only if every
-- add-on in it is.
--
-- Defaults to true so the existing builder keeps behaving as it does today;
-- turn it off per add-on.
ALTER TABLE "BuilderItem" ADD COLUMN "shippable" BOOLEAN NOT NULL DEFAULT true;
