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
  id: string;
  status: SubscriptionStatus;
  items: SubscriptionItem[];
  intervalDays: number;
  nextChargeAt: string | null;
  pausedUntil: string | null;
  cancelledAt: string | null;
  discountPercent: number;
  subtotalCents: number;
  savingsCents: number;
  couponPercent: number | null;
  couponSavingsCents: number;
  nextChargeTotalCents: number;
  chargeDateOnResume: string | null;
  canSkip: boolean;
};

function chargeDateOnResume(server: Subscription, changes: LocalChanges, now: Date) {
  const original = changes.nextChargeAt ?? server.nextChargeAt;
  if (original && Date.parse(original) > now.getTime()) return original;
  return addDays(now.toISOString(), changes.intervalDays ?? server.intervalDays);
}

export function buildView(server: Subscription, changes: LocalChanges = {}, now = new Date()): SubscriptionView {
  const status = changes.status ?? server.status;
  const items = changes.items ?? server.items;
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const totalCents =
    changes.items || server.nextChargeTotalCents === null
      ? totalAfterDiscount(items, server.discountPercent)
      : server.nextChargeTotalCents;
  const couponSavingsCents = Math.round((totalCents * (changes.couponPercent ?? 0)) / 100);

  return {
    id: server.id,
    status,
    items,
    intervalDays: changes.intervalDays ?? server.intervalDays,
    nextChargeAt: status === "active" ? (changes.nextChargeAt ?? server.nextChargeAt) : null,
    pausedUntil: status === "paused" ? (changes.pausedUntil ?? server.pausedUntil) : null,
    cancelledAt: status === "cancelled" ? (changes.cancelledAt ?? server.cancelledAt) : null,
    discountPercent: server.discountPercent,
    subtotalCents,
    savingsCents: subtotalCents - totalCents,
    couponPercent: changes.couponPercent ?? null,
    couponSavingsCents,
    nextChargeTotalCents: totalCents - couponSavingsCents,
    chargeDateOnResume: status === "paused" ? chargeDateOnResume(server, changes, now) : null,
    canSkip: status === "active" && !changes.skipUsed,
  };
}

export function applyPause(changes: LocalChanges, days: number, now = new Date()): LocalChanges {
  return { ...changes, status: "paused", pausedUntil: addDays(now.toISOString(), days) };
}

export function applyResume(server: Subscription, changes: LocalChanges, now = new Date()): LocalChanges {
  return {
    ...changes,
    status: server.status === "active" ? undefined : "active",
    pausedUntil: undefined,
    nextChargeAt: chargeDateOnResume(server, changes, now),
  };
}

export function chargeDateAfterSkip(view: SubscriptionView) {
  return view.nextChargeAt ? addDays(view.nextChargeAt, view.intervalDays) : undefined;
}

export function applySkip(changes: LocalChanges, before: SubscriptionView, after: Subscription): LocalChanges {
  const nextChargeAt = chargeDateAfterSkip(before);
  return {
    ...changes,
    skipUsed: true,
    nextChargeAt: nextChargeAt === after.nextChargeAt ? undefined : nextChargeAt,
  };
}

export function applySimulatedSkip(changes: LocalChanges, before: SubscriptionView): LocalChanges {
  return { ...changes, skipUsed: true, nextChargeAt: chargeDateAfterSkip(before) };
}
