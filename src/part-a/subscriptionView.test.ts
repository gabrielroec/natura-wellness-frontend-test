import { describe, expect, it } from "vitest";
import { fixtures } from "../api/fixtures";
import type { Subscription } from "../api/types";
import { addDays } from "../utils/dates";
import { applySkip, buildView } from "./subscriptionView";

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
