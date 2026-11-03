import { totalAfterDiscount } from "../api/fixtures";
import type { Subscription, SubscriptionItem, SubscriptionStatus } from "../api/types";
import { addDays } from "../utils/dates";

export type LocalChanges = {
  status?: SubscriptionStatus;
  items?: SubscriptionItem[];
  intervalDays?: number;
  nextChargeAt?: string;
  pausedUntil?: string;
  cancelledAt?: string;
  couponPercent?: number;
  skipUsed?: boolean;
};

export type SubscriptionView = {
  status: SubscriptionStatus;
  items: SubscriptionItem[];
  intervalDays: number;
  nextChargeAt: string | null;
  pausedUntil: string | null;
  cancelledAt: string | null;
  subtotalCents: number;
  savingsCents: number;
  couponPercent: number | null;
  couponSavingsCents: number;
  nextChargeTotalCents: number;
  canSkip: boolean;
};

export function buildView(server: Subscription, changes: LocalChanges = {}): SubscriptionView {
  const status = changes.status ?? server.status;
  const items = changes.items ?? server.items;
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const totalCents =
    changes.items || server.nextChargeTotalCents === null
      ? totalAfterDiscount(items, server.discountPercent)
      : server.nextChargeTotalCents;
  const couponSavingsCents = Math.round((totalCents * (changes.couponPercent ?? 0)) / 100);

  return {
    status,
    items,
    intervalDays: changes.intervalDays ?? server.intervalDays,
    nextChargeAt: status === "active" ? (changes.nextChargeAt ?? server.nextChargeAt) : null,
    pausedUntil: status === "paused" ? (changes.pausedUntil ?? server.pausedUntil) : null,
    cancelledAt: status === "cancelled" ? (changes.cancelledAt ?? server.cancelledAt) : null,
    subtotalCents,
    savingsCents: subtotalCents - totalCents,
    couponPercent: changes.couponPercent ?? null,
    couponSavingsCents,
    nextChargeTotalCents: totalCents - couponSavingsCents,
    canSkip: status === "active" && !changes.skipUsed,
  };
}

export function applySkip(changes: LocalChanges, before: SubscriptionView, after: Subscription): LocalChanges {
  const nextChargeAt = before.nextChargeAt ? addDays(before.nextChargeAt, before.intervalDays) : undefined;
  return {
    ...changes,
    skipUsed: true,
    nextChargeAt: nextChargeAt === after.nextChargeAt ? undefined : nextChargeAt,
  };
}
