import { useState } from "react";
import type { SubscriptionItem } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { addDays, formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { ActionRow } from "./ActionRow";
import { CancelSheet } from "./CancelSheet";
import { copy } from "./copy";
import { FrequencySheet } from "./FrequencySheet";
import styles from "./ManageSection.module.css";
import { PauseSheet } from "./PauseSheet";
import { ProductsSheet } from "./ProductsSheet";
import { nextChargeWithItems, type Offer, type SubscriptionView } from "./subscriptionView";

type ManageSectionProps = {
  view: SubscriptionView;
  onChangeFrequency: (days: number) => void;
  onChangeProducts: (items: SubscriptionItem[], couponPercent: number | null) => void;
  onApplyCoupon: (percent: number) => void;
  onPause?: (days: number) => void;
  onOpenSkip?: () => void;
  onCancel: () => void;
  onNotice: (message: string) => void;
};

export function ManageSection({
  view,
  onChangeFrequency,
  onChangeProducts,
  onApplyCoupon,
  onPause,
  onOpenSkip,
  onCancel,
  onNotice,
}: ManageSectionProps) {
  const [openSheet, setOpenSheet] = useState<"frequency" | "products" | "pause" | "cancel" | null>(null);
  const [swapCoupon, setSwapCoupon] = useState<number | null>(null);

  function closeSheet() {
    setOpenSheet(null);
    setSwapCoupon(null);
  }

  function chargeNotice(start: string, totalCents: number) {
    const total = formatPrice(totalCents);
    return view.nextChargeAt
      ? `${start} ${copy.products.doneActive} ${total} ${copy.products.on} ${formatDate(view.nextChargeAt)}.`
      : `${start} ${copy.products.donePaused} ${total} ${copy.products.whenResumes}`;
  }

  function saveFrequency(days: number) {
    const every = `${days} ${copy.frequency.days}`;
    onChangeFrequency(days);
    closeSheet();
    onNotice(
      view.nextChargeAt
        ? `${copy.frequency.doneActive} ${every}. ${copy.frequency.nextStays} ${formatDate(view.nextChargeAt)}.`
        : `${copy.frequency.donePaused} ${every}.`,
    );
  }

  function saveProducts(items: SubscriptionItem[], couponPercent: number | null) {
    const start = couponPercent
      ? `${copy.products.doneCoupon} ${couponPercent}% ${copy.products.offApplied}`
      : copy.products.doneStart;
    onChangeProducts(items, couponPercent);
    closeSheet();
    onNotice(chargeNotice(start, nextChargeWithItems(view, items, couponPercent ?? view.couponPercent)));
  }

  function confirmPause(days: number) {
    onPause?.(days);
    closeSheet();
    onNotice(`${copy.pause.done} ${formatDate(addDays(new Date().toISOString(), days))}.`);
  }

  function applyCoupon(percent: number) {
    onApplyCoupon(percent);
    closeSheet();
    onNotice(
      chargeNotice(`${percent}% ${copy.cancel.couponApplied}`, nextChargeWithItems(view, view.items, percent)),
    );
  }

  function confirmCancel() {
    onCancel();
    closeSheet();
    onNotice(copy.cancel.done);
  }

  function acceptOffer(offer: Offer) {
    closeSheet();
    if (offer.kind === "skip") onOpenSkip?.();
    if (offer.kind === "frequency") saveFrequency(offer.days);
    if (offer.kind === "coupon") applyCoupon(offer.percent);
    if (offer.kind === "reduce") setOpenSheet("products");
    if (offer.kind === "pause") setOpenSheet("pause");
    if (offer.kind === "swap") {
      setSwapCoupon(offer.couponPercent);
      setOpenSheet("products");
    }
  }

  return (
    <>
      <Card>
        <h2 className={styles.title}>{copy.manage.title}</h2>
        <div className={styles.rows}>
          <ActionRow
            label={copy.manage.frequency}
            detail={`${copy.manage.every} ${view.intervalDays} ${copy.manage.days}`}
            onClick={() => setOpenSheet("frequency")}
          />
          <ActionRow
            label={copy.manage.products}
            detail={`${view.items.length} ${copy.manage.productCount}`}
            onClick={() => setOpenSheet("products")}
          />
          {onPause && (
            <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} onClick={() => setOpenSheet("pause")} />
          )}
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet" onClick={() => setOpenSheet("cancel")}>
          {copy.manage.cancel}
        </Button>
      </div>
      <CancelSheet
        view={view}
        open={openSheet === "cancel"}
        onClose={closeSheet}
        onAccept={acceptOffer}
        onCancel={confirmCancel}
      />
      <FrequencySheet view={view} open={openSheet === "frequency"} onClose={closeSheet} onSave={saveFrequency} />
      <ProductsSheet
        view={view}
        swapCouponPercent={swapCoupon}
        open={openSheet === "products"}
        onClose={closeSheet}
        onSave={saveProducts}
      />
      {onPause && <PauseSheet view={view} open={openSheet === "pause"} onClose={closeSheet} onConfirm={confirmPause} />}
    </>
  );
}
