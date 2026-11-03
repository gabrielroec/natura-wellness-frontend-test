import { totalAfterDiscount } from "../api/fixtures";
import type { CatalogProduct, Subscription, SubscriptionItem, SubscriptionStatus } from "../api/types";
import { addDays } from "../utils/dates";
import { copy } from "./copy";

export type CancelReason = "tooMuchProduct" | "tooExpensive" | "differentProduct" | "noResults" | "other";

export type Offer =
  | { kind: "skip" }
  | { kind: "frequency"; days: number }
  | { kind: "reduce" }
  | { kind: "pause"; couponPercent: number | null }
  | { kind: "coupon"; percent: number }
  | { kind: "swap"; couponPercent: number | null };

const STAY_COUPON_PERCENT = 10;
const SWAP_COUPON_PERCENT = 5;

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
  regularTotalCents: number;
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
    regularTotalCents: totalCents,
    nextChargeTotalCents: totalCents - couponSavingsCents,
    chargeDateOnResume: status === "paused" ? chargeDateOnResume(server, changes, now) : null,
    canSkip: status === "active" && !changes.skipUsed,
  };
}

export function nextChargeWithItems(
  view: SubscriptionView,
  items: SubscriptionItem[],
  couponPercent = view.couponPercent,
) {
  const totalCents = totalAfterDiscount(items, view.discountPercent);
  return totalCents - Math.round((totalCents * (couponPercent ?? 0)) / 100);
}

export function swapItem(items: SubscriptionItem[], sku: string, product: CatalogProduct): SubscriptionItem[] {
  return items.map((item) => (item.sku === sku ? { ...product, quantity: item.quantity } : item));
}

export function swapCandidates(catalog: CatalogProduct[], items: SubscriptionItem[]) {
  return catalog.filter((product) => !items.some((item) => item.sku === product.sku));
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

export function cancelOffers(reason: CancelReason, view: SubscriptionView): Offer[] {
  const isActive = view.status === "active";
  const stayCoupon = view.couponPercent === null ? STAY_COUPON_PERCENT : null;
  const offers: Offer[] = [];

  if (reason === "tooMuchProduct") {
    const days = copy.frequency.options.find((option) => option > view.intervalDays);
    if (view.canSkip) offers.push({ kind: "skip" });
    if (days) offers.push({ kind: "frequency", days });
  }
  if (reason === "tooExpensive") {
    if (!isActive && stayCoupon) offers.push({ kind: "coupon", percent: stayCoupon });
    if (view.items.some((item) => item.quantity > 1)) offers.push({ kind: "reduce" });
    if (isActive) offers.push({ kind: "pause", couponPercent: stayCoupon });
  }
  if (reason === "differentProduct") offers.push({ kind: "swap", couponPercent: null });
  if (reason === "noResults" || reason === "other") {
    offers.push({ kind: "swap", couponPercent: view.couponPercent === null ? SWAP_COUPON_PERCENT : null });
  }

  if (offers.length > 0) return offers;
  if (isActive) return [{ kind: "pause", couponPercent: null }];
  return stayCoupon ? [{ kind: "coupon", percent: stayCoupon }] : [{ kind: "swap", couponPercent: null }];
}

export function applyCancel(changes: LocalChanges, now = new Date()): LocalChanges {
  return {
    ...changes,
    status: "cancelled",
    cancelledAt: now.toISOString(),
    pausedUntil: undefined,
    couponPercent: undefined,
  };
}

export function chargeDateOnReactivate(view: SubscriptionView, now = new Date()) {
  return addDays(now.toISOString(), view.intervalDays);
}

export function applyReactivate(server: Subscription, changes: LocalChanges, now = new Date()): LocalChanges {
  return {
    ...changes,
    status: server.status === "active" ? undefined : "active",
    cancelledAt: undefined,
    nextChargeAt: addDays(now.toISOString(), changes.intervalDays ?? server.intervalDays),
    skipUsed: undefined,
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
