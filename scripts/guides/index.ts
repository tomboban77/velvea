import type { GuideSeed } from "./types";
import { corporateGifting } from "./corporate-gifting";
import { ontarioGiftingCalendar } from "./ontario-gifting-calendar";
import { giftMessage } from "./gift-message";
import { choosingABasket } from "./choosing-a-basket";

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
];

export type { GuideSeed };
