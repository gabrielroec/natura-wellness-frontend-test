import { useState } from "react";
import type { SubscriptionItem } from "../api/types";
import type { BannerTone } from "../components/Banner";
import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import styles from "./ActiveScreen.module.css";
import { copy } from "./copy";
import { ManageSection } from "./ManageSection";
import { ShipmentCard } from "./ShipmentCard";
import { SkipSheet } from "./SkipSheet";
import type { SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type ActiveScreenProps = {
  view: SubscriptionView;
  onSkip: () => Promise<void>;
  onRefresh: () => Promise<SubscriptionView>;
  onChangeFrequency: (days: number) => void;
  onChangeProducts: (items: SubscriptionItem[], couponPercent: number | null) => void;
  onApplyCoupon: (percent: number) => void;
  onPause: (days: number) => void;
  onCancel: () => void;
  onNotice: (message: string, tone?: BannerTone) => void;
  onContactSupport: (subject: string) => void;
};

export function ActiveScreen({
  view,
  onSkip,
  onRefresh,
  onChangeFrequency,
  onChangeProducts,
  onApplyCoupon,
  onPause,
  onCancel,
  onNotice,
  onContactSupport,
}: ActiveScreenProps) {
  const [skipOpen, setSkipOpen] = useState(false);
  if (!view.nextChargeAt) return null;
  const date = formatDate(view.nextChargeAt);

  async function confirmSkip() {
    await onSkip();
    setSkipOpen(false);
    onNotice(`${copy.skip.done} ${date}.`);
  }

  function handleNoLongerActive(status: SubscriptionView["status"]) {
    onNotice(status === "paused" ? copy.skip.pausedElsewhere : copy.skip.cancelledElsewhere, "info");
  }

  return (
    <>
      <SummaryCard
        label={copy.active.nextCharge}
        badge={copy.active.badge}
        badgeTone="green"
        date={date}
        amount={formatPrice(view.nextChargeTotalCents)}
        meta={`${formatRelativeDate(view.nextChargeAt)} · ${copy.active.deliveredEvery} ${view.intervalDays} ${copy.active.days}`}
      >
        {view.canSkip ? (
          <Button onClick={() => setSkipOpen(true)}>{copy.active.skip}</Button>
        ) : (
          <>
            <p className={styles.skipped}>{`${copy.skip.skippedNote} ${date}.`}</p>
            <Button variant="quiet" onClick={() => onContactSupport(copy.support.subjects.undoSkip)}>
              {copy.skip.regret}
            </Button>
          </>
        )}
      </SummaryCard>
      <ShipmentCard view={view} title={copy.shipment.title} />
      <ManageSection
        view={view}
        onChangeFrequency={onChangeFrequency}
        onChangeProducts={onChangeProducts}
        onApplyCoupon={onApplyCoupon}
        onPause={onPause}
        onOpenSkip={() => setSkipOpen(true)}
        onCancel={onCancel}
        onNotice={onNotice}
      />
      {view.canSkip && (
        <SkipSheet
          view={view}
          open={skipOpen}
          onClose={() => setSkipOpen(false)}
          onConfirm={confirmSkip}
          onRefresh={onRefresh}
          onNoLongerActive={handleNoLongerActive}
          onContactSupport={() => onContactSupport(copy.support.subjects.skip)}
        />
      )}
    </>
  );
}
