import { describe, expect, it } from "vitest";
import { catalog, fixtures } from "../api/fixtures";
import type { Subscription } from "../api/types";
import { addDays } from "../utils/dates";
import {
  applyCancel,
  applyPause,
  applyReactivate,
  applyResume,
  applySimulatedSkip,
  applySkip,
  buildView,
  cancelOffers,
  chargeDateAfterSkip,
  chargeDateOnReactivate,
  nextChargeWithItems,
  swapCandidates,
  swapItem,
} from "./subscriptionView";

const active = fixtures.active();

function skippedOnServer(server: Subscription): Subscription {
  return {
    ...server,
    nextChargeAt: addDays(server.nextChargeAt!, server.intervalDays),
    updatedAt: new Date().toISOString(),
  };
}

const oneMultivitamin = active.items.map((item) => (item.sku === "NW-MULTI-30" ? { ...item, quantity: 1 } : item));

describe("buildView totals", () => {
  it("uses the total from the API", () => {
    const view = buildView(active);
    expect(view.discountPercent).toBe(15);
    expect(view.subtotalCents).toBe(11985);
    expect(view.savingsCents).toBe(1798);
    expect(view.nextChargeTotalCents).toBe(10187);
  });

  it("does not add up per-line discounts, which would be a cent off", () => {
    const perLine = active.items.reduce((sum, item) => sum + Math.round(item.unitPriceCents * item.quantity * 0.85), 0);
    expect(perLine).toBe(10188);
    expect(buildView(active).nextChargeTotalCents).toBe(10187);
  });

  it("recalculates when the products change locally", () => {
    const view = buildView(active, { items: oneMultivitamin });
    expect(view.subtotalCents).toBe(7490);
    expect(view.nextChargeTotalCents).toBe(6367);
  });

  it("applies a coupon to the next charge only", () => {
    const view = buildView(active, { couponPercent: 10 });
    expect(view.couponSavingsCents).toBe(1019);
    expect(view.nextChargeTotalCents).toBe(9168);
    expect(view.savingsCents).toBe(1798);
  });
});

describe("buildView by status", () => {
  it("handles the empty fields of a paused subscription", () => {
    const paused = fixtures.paused();
    expect(paused.nextChargeAt).toBeNull();
    expect(paused.nextChargeTotalCents).toBeNull();

    const view = buildView(paused);
    expect(view.status).toBe("paused");
    expect(view.nextChargeAt).toBeNull();
    expect(view.pausedUntil).toBe(paused.pausedUntil);
    expect(view.nextChargeTotalCents).toBe(10187);
    expect(view.canSkip).toBe(false);
  });

  it("handles the empty fields of a cancelled subscription", () => {
    const cancelled = fixtures.cancelled();
    const view = buildView(cancelled);
    expect(view.status).toBe("cancelled");
    expect(view.nextChargeAt).toBeNull();
    expect(view.cancelledAt).toBe(cancelled.cancelledAt);
    expect(view.canSkip).toBe(false);
  });

  it("hides the next charge while paused locally and restores it afterwards", () => {
    const pausedUntil = addDays(active.nextChargeAt!, 30);
    const paused = buildView(active, { status: "paused", pausedUntil });
    expect(paused.nextChargeAt).toBeNull();
    expect(paused.pausedUntil).toBe(pausedUntil);
    expect(paused.canSkip).toBe(false);
    expect(buildView(active).nextChargeAt).toBe(active.nextChargeAt);
  });
});

describe("products", () => {
  const [, multivitamin] = active.items;
  const magnesium = catalog.find((product) => product.sku === "NW-MAG-90")!;
  const bundle = catalog.find((product) => product.sku === "NW-ESSENTIALS")!;

  it("offers only the products not in the subscription", () => {
    expect(swapCandidates(catalog, active.items).map((product) => product.sku)).toEqual(["NW-MAG-90", "NW-ESSENTIALS"]);
  });

  it("swaps a product and keeps its quantity", () => {
    const items = swapItem(active.items, multivitamin.sku, magnesium);
    expect(items[1]).toEqual({ ...magnesium, quantity: 2 });
    expect(items[0]).toEqual(active.items[0]);
    expect(swapCandidates(catalog, items).map((product) => product.sku)).toEqual(["NW-MULTI-30", "NW-ESSENTIALS"]);
  });

  it("calculates the new total with the subscriber discount", () => {
    const view = buildView(active);
    expect(nextChargeWithItems(view, active.items)).toBe(10187);
    expect(nextChargeWithItems(view, oneMultivitamin)).toBe(6367);
    expect(nextChargeWithItems(view, swapItem(active.items, multivitamin.sku, magnesium))).toBe(6787);
    expect(nextChargeWithItems(view, swapItem(oneMultivitamin, multivitamin.sku, bundle))).toBe(10192);
  });

  it("applies an active coupon to the new total", () => {
    expect(nextChargeWithItems(buildView(active, { couponPercent: 10 }), oneMultivitamin)).toBe(5730);
  });

  it("matches the view after saving", () => {
    const items = swapItem(active.items, multivitamin.sku, magnesium);
    const view = buildView(active, { items });
    expect(view.nextChargeTotalCents).toBe(nextChargeWithItems(buildView(active), items));
    expect(view.subtotalCents).toBe(7985);
    expect(view.savingsCents).toBe(1198);
  });
});

describe("cancel offers", () => {
  const paused = fixtures.paused();
  const skip = { kind: "skip" };
  const frequency = (days: number) => ({ kind: "frequency", days });
  const reduce = { kind: "reduce" };
  const pause = (couponPercent: number | null) => ({ kind: "pause", couponPercent });
  const coupon = { kind: "coupon", percent: 10 };
  const swap = (couponPercent: number | null) => ({ kind: "swap", couponPercent });

  it("offers skip or a longer interval for too much product", () => {
    expect(cancelOffers("tooMuchProduct", buildView(active))).toEqual([skip, frequency(60)]);
    expect(cancelOffers("tooMuchProduct", buildView(active, { skipUsed: true }))).toEqual([frequency(60)]);
    expect(cancelOffers("tooMuchProduct", buildView(active, { intervalDays: 60 }))).toEqual([skip, frequency(90)]);
    expect(cancelOffers("tooMuchProduct", buildView(active, { intervalDays: 90 }))).toEqual([skip]);
  });

  it("offers pause when skip and a longer interval are gone", () => {
    const view = buildView(active, { skipUsed: true, intervalDays: 90 });
    expect(cancelOffers("tooMuchProduct", view)).toEqual([pause(null)]);
  });

  it("offers reduce or pause for the price, with the coupon on the pause path", () => {
    expect(cancelOffers("tooExpensive", buildView(active))).toEqual([reduce, pause(10)]);
    expect(cancelOffers("tooExpensive", buildView(active, { couponPercent: 5 }))).toEqual([reduce, pause(null)]);
  });

  it("hides reduce when every quantity is 1", () => {
    const items = active.items.map((item) => ({ ...item, quantity: 1 }));
    expect(cancelOffers("tooExpensive", buildView(active, { items }))).toEqual([pause(10)]);
  });

  it("offers a swap, with 5% off only when no coupon is in use", () => {
    expect(cancelOffers("differentProduct", buildView(active))).toEqual([swap(null)]);
    expect(cancelOffers("noResults", buildView(active))).toEqual([swap(5)]);
    expect(cancelOffers("other", buildView(active))).toEqual([swap(5)]);
    expect(cancelOffers("noResults", buildView(active, { couponPercent: 10 }))).toEqual([swap(null)]);
  });

  it("never offers skip or pause on a paused subscription", () => {
    const reasons = ["tooMuchProduct", "tooExpensive", "differentProduct", "noResults", "other"] as const;
    for (const reason of reasons) {
      const kinds = cancelOffers(reason, buildView(paused)).map((offer) => offer.kind);
      expect(kinds).not.toContain("skip");
      expect(kinds).not.toContain("pause");
    }
    expect(cancelOffers("tooMuchProduct", buildView(paused))).toEqual([frequency(60)]);
    expect(cancelOffers("tooExpensive", buildView(paused))).toEqual([coupon, reduce]);
    expect(cancelOffers("noResults", buildView(paused))).toEqual([swap(5)]);
  });

  it("falls back to the coupon, then a swap, on a paused subscription", () => {
    expect(cancelOffers("tooMuchProduct", buildView(paused, { intervalDays: 90 }))).toEqual([coupon]);
    expect(cancelOffers("tooMuchProduct", buildView(paused, { intervalDays: 90, couponPercent: 10 }))).toEqual([swap(null)]);
    const items = paused.items.map((item) => ({ ...item, quantity: 1 }));
    expect(cancelOffers("tooExpensive", buildView(paused, { items }))).toEqual([coupon]);
    expect(cancelOffers("tooExpensive", buildView(paused, { items, couponPercent: 10 }))).toEqual([swap(null)]);
  });
});

describe("coupons", () => {
  it("takes 10% off the next charge", () => {
    const view = buildView(active, { couponPercent: 10 });
    expect(view.nextChargeTotalCents).toBe(9168);
    expect(view.couponSavingsCents).toBe(1019);
    expect(view.regularTotalCents).toBe(10187);
    expect(view.savingsCents).toBe(1798);
  });

  it("takes 5% off the next charge", () => {
    const view = buildView(active, { couponPercent: 5 });
    expect(view.nextChargeTotalCents).toBe(9678);
    expect(view.couponSavingsCents).toBe(509);
  });

  it("previews a coupon that isn't applied yet", () => {
    const magnesium = catalog.find((product) => product.sku === "NW-MAG-90")!;
    const items = swapItem(active.items, "NW-MULTI-30", magnesium);
    expect(nextChargeWithItems(buildView(active), items, 5)).toBe(6448);
    expect(buildView(active, { items, couponPercent: 5 }).nextChargeTotalCents).toBe(6448);
  });
});

describe("cancel and reactivate", () => {
  const now = new Date("2026-11-03T12:00:00.000Z");
  const today = now.toISOString();

  it("cancels and drops the coupon", () => {
    const view = buildView(active, applyCancel({ couponPercent: 10 }, now), now);
    expect(view.status).toBe("cancelled");
    expect(view.cancelledAt).toBe(today);
    expect(view.nextChargeAt).toBeNull();
    expect(view.couponPercent).toBeNull();
    expect(view.canSkip).toBe(false);
    expect(view.nextChargeTotalCents).toBe(10187);
  });

  it("cancels a paused subscription", () => {
    const view = buildView(fixtures.paused(), applyCancel({}, now), now);
    expect(view.status).toBe("cancelled");
    expect(view.pausedUntil).toBeNull();
    expect(view.chargeDateOnResume).toBeNull();
  });

  it("reactivates with the next charge one interval from today", () => {
    const cancelled = applyCancel({ skipUsed: true, intervalDays: 60 }, now);
    const view = buildView(active, applyReactivate(active, cancelled, now), now);
    expect(view.status).toBe("active");
    expect(view.nextChargeAt).toBe(addDays(today, 60));
    expect(view.cancelledAt).toBeNull();
    expect(view.canSkip).toBe(true);
    expect(chargeDateOnReactivate(buildView(active, cancelled, now), now)).toBe(view.nextChargeAt);
  });

  it.each(["paused", "cancelled"] as const)("reactivates when the API says %s", (status) => {
    const server = fixtures[status]();
    const view = buildView(server, applyReactivate(server, {}, now), now);
    expect(view.status).toBe("active");
    expect(view.nextChargeAt).toBe(addDays(today, server.intervalDays));
    expect(view.nextChargeTotalCents).toBe(10187);
  });
});

describe("pause and resume", () => {
  const now = new Date("2026-11-03T12:00:00.000Z");

  it("pauses for the chosen days from today", () => {
    const view = buildView(active, applyPause({}, 60, now), now);
    expect(view.status).toBe("paused");
    expect(view.pausedUntil).toBe(addDays(now.toISOString(), 60));
    expect(view.nextChargeAt).toBeNull();
    expect(view.canSkip).toBe(false);
  });

  it("keeps the original charge date when it is still in the future", () => {
    const paused = applyPause({}, 30, now);
    const future = addDays(now.toISOString(), 6);
    const server = { ...active, nextChargeAt: future };
    expect(buildView(server, paused, now).chargeDateOnResume).toBe(future);
    const view = buildView(server, applyResume(server, paused, now), now);
    expect(view.status).toBe("active");
    expect(view.nextChargeAt).toBe(future);
    expect(view.pausedUntil).toBeNull();
    expect(view.canSkip).toBe(true);
  });

  it("uses today plus the interval when the original date has passed", () => {
    const past = addDays(now.toISOString(), -2);
    const server = { ...active, nextChargeAt: past };
    const paused = applyPause({}, 30, now);
    expect(buildView(server, paused, now).chargeDateOnResume).toBe(addDays(now.toISOString(), 30));
    expect(buildView(server, { ...paused, intervalDays: 60 }, now).chargeDateOnResume).toBe(addDays(now.toISOString(), 60));
  });

  it("resumes a subscription the API reports as paused", () => {
    const server = fixtures.paused();
    expect(buildView(server, {}, now).chargeDateOnResume).toBe(addDays(now.toISOString(), 30));
    const view = buildView(server, applyResume(server, {}, now), now);
    expect(view.status).toBe("active");
    expect(view.nextChargeAt).toBe(addDays(now.toISOString(), 30));
    expect(view.nextChargeTotalCents).toBe(10187);
    expect(view.canSkip).toBe(true);
  });

  it("follows the API status again after resuming an active subscription", () => {
    const server = { ...active, nextChargeAt: addDays(now.toISOString(), 6) };
    const changes = applyResume(server, applyPause({}, 30, now), now);
    expect(changes.status).toBeUndefined();
    expect(buildView({ ...server, status: "cancelled" }, changes, now).status).toBe("cancelled");
  });

  it("still allows only one skip after pausing and resuming", () => {
    const server = { ...active, nextChargeAt: addDays(now.toISOString(), 6) };
    const skipped = applySimulatedSkip({}, buildView(server, {}, now));
    const resumed = applyResume(server, applyPause(skipped, 30, now), now);
    const view = buildView(server, resumed, now);
    expect(view.canSkip).toBe(false);
    expect(view.nextChargeAt).toBe(addDays(now.toISOString(), 36));
  });
});

describe("applySimulatedSkip", () => {
  it("moves the date by the current interval without the API", () => {
    const now = new Date("2026-11-03T12:00:00.000Z");
    const server = fixtures.paused();
    const resumed = applyResume(server, { intervalDays: 60 }, now);
    const before = buildView(server, resumed, now);
    const view = buildView(server, applySimulatedSkip(resumed, before), now);
    expect(view.nextChargeAt).toBe(addDays(now.toISOString(), 120));
    expect(view.canSkip).toBe(false);
  });
});

describe("chargeDateAfterSkip", () => {
  it("adds the current interval", () => {
    expect(chargeDateAfterSkip(buildView(active))).toBe(addDays(active.nextChargeAt!, 30));
    expect(chargeDateAfterSkip(buildView(active, { intervalDays: 90 }))).toBe(addDays(active.nextChargeAt!, 90));
  });

  it("has no date to offer when there is no next charge", () => {
    expect(chargeDateAfterSkip(buildView(fixtures.paused()))).toBeUndefined();
  });
});

describe("applySkip", () => {
  it("follows the API when nothing changed locally", () => {
    const after = skippedOnServer(active);
    const changes = applySkip({}, buildView(active), after);
    const view = buildView(after, changes);
    expect(view.nextChargeAt).toBe(after.nextChargeAt);
    expect(changes.nextChargeAt).toBeUndefined();
  });

  it("moves 60 days when the customer chose 60, though the API moves 30", () => {
    const local = { intervalDays: 60 };
    const after = skippedOnServer(active);
    const view = buildView(after, applySkip(local, buildView(active, local), after));
    expect(after.nextChargeAt).toBe(addDays(active.nextChargeAt!, 30));
    expect(view.nextChargeAt).toBe(addDays(active.nextChargeAt!, 60));
    expect(view.intervalDays).toBe(60);
  });

  it("keeps the edited total, though the API returns the old one", () => {
    const local = { items: oneMultivitamin };
    const after = skippedOnServer(active);
    const view = buildView(after, applySkip(local, buildView(active, local), after));
    expect(after.nextChargeTotalCents).toBe(10187);
    expect(view.nextChargeTotalCents).toBe(6367);
  });

  it("allows only one skip", () => {
    const after = skippedOnServer(active);
    const view = buildView(after, applySkip({}, buildView(active), after));
    expect(view.canSkip).toBe(false);
  });

  it("keeps local changes when the API data is replaced", () => {
    const changes = { intervalDays: 90, items: oneMultivitamin };
    const refreshed = { ...active, updatedAt: new Date().toISOString() };
    const view = buildView(refreshed, changes);
    expect(view.intervalDays).toBe(90);
    expect(view.nextChargeTotalCents).toBe(6367);
  });
});
