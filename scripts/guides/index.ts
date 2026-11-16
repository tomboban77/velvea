import type { GuideSeed } from "./types";
import { corporateGifting } from "./corporate-gifting";
import { ontarioGiftingCalendar } from "./ontario-gifting-calendar";
import { giftMessage } from "./gift-message";
import { choosingABasket } from "./choosing-a-basket";
import { diwaliGiftHampers } from "./diwali-gift-hampers";
import { realtorClosingGifts } from "./realtor-closing-gifts";
import { corporateGiftHampers } from "./corporate-gift-hampers";
import { birthdayGiftBaskets } from "./birthday-gift-baskets";
import { anniversaryGifts } from "./anniversary-gifts";
import { christmasGiftBaskets } from "./christmas-gift-baskets";
import { diwaliVisitEtiquette } from "./diwali-visit-etiquette";
import { christmasGiftsAtWork } from "./christmas-gifts-at-work";
import { christmasGiftIdeas } from "./christmas-gift-ideas";
import { personalCorporateChristmasGifts } from "./personal-corporate-christmas-gifts";
import { sympathyGifts } from "./sympathy-gifts";
import { getWellGifts } from "./get-well-gifts";
import { housewarmingGifts } from "./housewarming-gifts";
import { christmasHostGifts } from "./christmas-host-gifts";
import { retirementGifts } from "./retirement-gifts";
import { lastMinuteChristmasGifts } from "./last-minute-christmas-gifts";
import { sendGiftToCanada } from "./send-gift-to-canada";
import { milestoneBirthdayGifts } from "./milestone-birthday-gifts";

/**
 * Guides cross-link to each other, so adding one means checking the others
 * still point at slugs that exist. The seeder verifies every internal
 * /guides/... link resolves within this set before it writes anything.
 */
export const GUIDES: GuideSeed[] = [
  corporateGifting,
  ontarioGiftingCalendar,
  giftMessage,
  choosingABasket,
  diwaliGiftHampers,
  realtorClosingGifts,
  corporateGiftHampers,
  birthdayGiftBaskets,
  anniversaryGifts,
  christmasGiftBaskets,
  diwaliVisitEtiquette,
  christmasGiftsAtWork,
  christmasGiftIdeas,
  personalCorporateChristmasGifts,
  sympathyGifts,
  getWellGifts,
  housewarmingGifts,
  christmasHostGifts,
  retirementGifts,
  lastMinuteChristmasGifts,
  sendGiftToCanada,
  milestoneBirthdayGifts,
];

/**
 * Guides that exist in the database but were written in the admin or by a
 * one-off script, so they have no file here. Listed so a seeded guide can link
 * to them without the seeder's cross-link check calling the link broken.
 */
export const LIVE_ONLY_GUIDE_SLUGS = [
  "birthday-gifts-for-someone-who-doesnt-want-anything",
  "what-to-send-when-a-friend-has-a-baby",
];

export type { GuideSeed };
