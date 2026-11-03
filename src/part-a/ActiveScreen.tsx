import { useState } from "react";
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
  onNotice: (message: string) => void;
};

export function ActiveScreen({ view, onSkip, onNotice }: ActiveScreenProps) {
  const [skipOpen, setSkipOpen] = useState(false);
  if (!view.nextChargeAt) return null;
  const date = formatDate(view.nextChargeAt);

  async function confirmSkip() {
    await onSkip();
    setSkipOpen(false);
    onNotice(`${copy.skip.done} ${date}.`);
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
          <p className={styles.skipped}>{`${copy.skip.skippedNote} ${date}.`}</p>
        )}
      </SummaryCard>
      <ShipmentCard view={view} title={copy.shipment.title} />
      <ManageSection view={view} showPause />
      {view.canSkip && <SkipSheet view={view} open={skipOpen} onClose={() => setSkipOpen(false)} onConfirm={confirmSkip} />}
    </>
  );
}
