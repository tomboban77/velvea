import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { order: { findMany } } }));

import {
  bookedLocalDeliveries,
  capacityFor,
  earliestScheduledDay,
  firstOpenDay,
  fullDays,
  isWeekend,
  sameDayBlocker,
  sameDayWindow,
} from "@/lib/delivery-schedule";

const CAP = { weekdayCapacity: 4, weekendCapacity: 10 };
// Monday 26 Oct 2026, Toronto is on EDT (UTC-4).
const MON_10AM = new Date("2026-10-26T14:00:00Z");
const MON_5PM = new Date("2026-10-26T21:00:00Z");

describe("capacity", () => {
  it("knows the weekend", () => {
    expect(isWeekend("2026-10-26")).toBe(false);
    expect(isWeekend("2026-10-31")).toBe(true);
    expect(isWeekend("2026-11-01")).toBe(true);
  });

  it("allows 4 on a weekday and 10 on Saturday and Sunday", () => {
    expect(capacityFor("2026-10-30", CAP)).toBe(4);
    expect(capacityFor("2026-10-31", CAP)).toBe(10);
    expect(capacityFor("2026-11-01", CAP)).toBe(10);
  });

  it("moves a full day to the next one with room", () => {
    const booked = new Map([
      ["2026-10-27", 4],
      ["2026-10-28", 3],
    ]);
    expect(firstOpenDay("2026-10-27", booked, CAP)).toBe("2026-10-28");
    booked.set("2026-10-28", 4);
    expect(firstOpenDay("2026-10-27", booked, CAP)).toBe("2026-10-29");
  });

  it("does not treat 4 weekend orders as full", () => {
    const booked = new Map([["2026-10-31", 4]]);
    expect(firstOpenDay("2026-10-31", booked, CAP)).toBe("2026-10-31");
    booked.set("2026-10-31", 10);
    expect(firstOpenDay("2026-10-31", booked, CAP)).toBe("2026-11-01");
  });

  it("lists full days for the checkout", () => {
    const booked = new Map([
      ["2026-10-27", 4],
      ["2026-10-31", 9],
    ]);
    expect(fullDays("2026-10-26", booked, CAP, 7)).toEqual(["2026-10-27"]);
  });
});

describe("earliestScheduledDay", () => {
  const zone = { minLeadDays: 0 };

  it("respects lead time and the handoff cutoff", () => {
    const args = { zone, leadTimeDays: 1, hasBouquet: false, handoffCutoff: "16:00" };
    expect(earliestScheduledDay({ ...args, now: MON_10AM })).toBe("2026-10-27");
    expect(earliestScheduledDay({ ...args, now: MON_5PM })).toBe("2026-10-28");
  });

  it("never offers a bouquet before tomorrow", () => {
    expect(
      earliestScheduledDay({ zone, leadTimeDays: 0, hasBouquet: true, handoffCutoff: "16:00", now: MON_10AM })
    ).toBe("2026-10-27");
    expect(
      earliestScheduledDay({ zone, leadTimeDays: 0, hasBouquet: false, handoffCutoff: "16:00", now: MON_10AM })
    ).toBe("2026-10-26");
  });

  it("never books scheduled local delivery for today, which is the same-day option", () => {
    expect(
      earliestScheduledDay({
        zone,
        leadTimeDays: 0,
        hasBouquet: false,
        handoffCutoff: "16:00",
        local: true,
        now: MON_10AM,
      })
    ).toBe("2026-10-27");
  });
});

describe("sameDayBlocker", () => {
  const zone = { sameDayCutoff: "16:00" };
  const empty = new Map<string, number>();

  it("offers same-day before the cutoff", () => {
    expect(sameDayBlocker({ zone, hasBouquet: false, booked: empty, cap: CAP, now: MON_10AM })).toBeNull();
  });

  it("refuses zones without same-day and orders past the cutoff", () => {
    expect(
      sameDayBlocker({ zone: { sameDayCutoff: null }, hasBouquet: false, booked: empty, cap: CAP, now: MON_10AM })
    ).toBe("no-same-day");
    expect(sameDayBlocker({ zone, hasBouquet: false, booked: empty, cap: CAP, now: MON_5PM })).toBe("past-cutoff");
  });

  it("refuses bouquets", () => {
    expect(sameDayBlocker({ zone, hasBouquet: true, booked: empty, cap: CAP, now: MON_10AM })).toBe("bouquet");
  });

  it("refuses once today is full", () => {
    const booked = new Map([["2026-10-26", 4]]);
    expect(sameDayBlocker({ zone, hasBouquet: false, booked, cap: CAP, now: MON_10AM })).toBe("full");
  });
});

describe("sameDayWindow", () => {
  it("is 7 to 11 pm on weekdays and open on weekends", () => {
    expect(sameDayWindow("2026-10-26", false)).toBe("between 7 and 11 pm");
    expect(sameDayWindow("2026-10-26", true)).toBe("entre 19 h et 23 h");
    expect(sameDayWindow("2026-10-31", false)).toMatch(/during the day/);
  });
});

describe("bookedLocalDeliveries", () => {
  beforeEach(() => findMany.mockReset());

  it("counts orders per Toronto day", async () => {
    findMany.mockResolvedValue([
      // Stored at Toronto noon.
      { deliveryDate: new Date("2026-10-27T16:00:00Z") },
      { deliveryDate: new Date("2026-10-27T16:00:00Z") },
      // 11 pm Toronto on the 27th is already the 28th in UTC.
      { deliveryDate: new Date("2026-10-28T03:00:00Z") },
      { deliveryDate: null },
    ]);
    const booked = await bookedLocalDeliveries("2026-10-26", 60, MON_10AM);
    expect(booked.get("2026-10-27")).toBe(3);
    expect(booked.size).toBe(1);
  });

  it("only counts local deliveries that are paid or freshly pending", async () => {
    findMany.mockResolvedValue([]);
    await bookedLocalDeliveries("2026-10-26", 60, MON_10AM);
    const where = findMany.mock.calls[0][0].where;
    expect(where.deliveryMethod).toEqual({ in: ["LOCAL_SAMEDAY", "LOCAL_STANDARD"] });
    expect(where.OR[0].status.in).toContain("PAID");
    expect(where.OR[0].status.in).not.toContain("CANCELLED");
    expect(where.OR[1].status).toBe("PENDING");
    expect(where.OR[1].createdAt.gte.getTime()).toBe(MON_10AM.getTime() - 45 * 60000);
  });
});
