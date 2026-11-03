import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { CancelIcon, type CancelIconName } from "./CancelIcon";
import { copy } from "./copy";
import styles from "./OfferCard.module.css";
import { chargeDateAfterSkip, nextChargeWithItems, type Offer, type SubscriptionView } from "./subscriptionView";

type OfferContent = {
  icon: CancelIconName;
  tag: string;
  label: string;
  detail: string;
  cta: string;
  discounted?: string;
};

function offerContent(offer: Offer, view: SubscriptionView): OfferContent {
  const { offers } = copy.cancel;
  const nextDate = view.nextChargeAt ? formatDate(view.nextChargeAt) : "";
  const dateAfterSkip = chargeDateAfterSkip(view);

  switch (offer.kind) {
    case "skip":
      return {
        icon: "calendar",
        tag: `${offers.noChargeOn} ${nextDate}`,
        label: copy.active.skip,
        detail: `${offers.skipFrom} ${nextDate} ${offers.to} ${dateAfterSkip ? formatDate(dateAfterSkip) : ""}.`,
        cta: offers.skipCta,
      };
    case "frequency":
      return {
        icon: "truck",
        tag: offers.fewerDeliveries,
        label: `${offers.deliverEvery} ${offer.days} ${copy.frequency.days}`,
        detail: nextDate ? `${copy.frequency.nextStays} ${nextDate}.` : offers.frequencyPaused,
        cta: `${offers.switchTo} ${offer.days} ${copy.frequency.days}`,
      };
    case "reduce":
      return {
        icon: "minus",
        tag: offers.payLess,
        label: offers.reduce,
        detail: `${offers.reduceDetail} ${formatPrice(view.nextChargeTotalCents)}.`,
        cta: offers.reduceCta,
      };
    case "pause":
      return {
        icon: "pause",
        tag: offers.noCharges,
        label: copy.manage.pause,
        detail: offers.pauseDetail,
        cta: offers.pauseCta,
      };
    case "coupon":
      return {
        icon: "ticket",
        tag: `${offer.percent}% ${offers.off}`,
        label: `${offers.get} ${offer.percent}% ${offers.off}`,
        detail: `${nextDate ? `${offers.onCharge} ${nextDate} ${offers.charge}.` : offers.whenResumes} ${offers.thisChargeOnly}`,
        cta: `${offers.get} ${offer.percent}% ${offers.off}`,
        discounted: formatPrice(nextChargeWithItems(view, view.items, offer.percent)),
      };
    case "swap":
      return offer.couponPercent
        ? {
            icon: "ticket",
            tag: `${offer.couponPercent}% ${offers.off}`,
            label: offers.tryAnother,
            detail: `${offers.swapAndGet} ${offer.couponPercent}% ${offers.offNext}`,
            cta: offers.seeProducts,
          }
        : {
            icon: "swap",
            tag: `${offers.keepYour} ${view.discountPercent}% ${offers.savings}`,
            label: offers.swap,
            detail: offers.swapDetail,
            cta: offers.seeProducts,
          };
  }
}

type OfferCardProps = {
  offer: Offer;
  view: SubscriptionView;
  tone: "hero" | "soft";
  onClick: () => void;
};

export function OfferCard({ offer, view, tone, onClick }: OfferCardProps) {
  const { icon, tag, label, detail, cta, discounted } = offerContent(offer, view);

  if (tone === "soft") {
    return (
      <button className={styles.soft} type="button" onClick={onClick}>
        <span className={styles.softIcon}>
          <CancelIcon name={icon} />
        </span>
        <span className={styles.softText}>
          <span className={styles.softLabel}>{label}</span>
          <span className={styles.softDetail}>{detail}</span>
        </span>
      </button>
    );
  }

  return (
    <button className={styles.hero} type="button" onClick={onClick}>
      <span className={styles.tag}>
        <CancelIcon name={icon} />
        {tag}
      </span>
      {discounted ? (
        <span className={styles.price}>
          <span className={styles.discounted}>{discounted}</span>
          <span className="sr-only">{copy.cancel.offers.insteadOf}</span>
          <s className={styles.usual}>{formatPrice(view.nextChargeTotalCents)}</s>
        </span>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
      <span className={styles.detail}>{detail}</span>
      <span className={styles.cta}>{cta}</span>
    </button>
  );
}
