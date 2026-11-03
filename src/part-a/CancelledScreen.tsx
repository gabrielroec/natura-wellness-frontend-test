import { useState } from "react";
import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { ChargeConfirmSheet } from "./ChargeConfirmSheet";
import { copy } from "./copy";
import { ShipmentCard } from "./ShipmentCard";
import { chargeDateOnReactivate, type SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type CancelledScreenProps = {
  view: SubscriptionView;
  onReactivate: () => void;
  onNotice: (message: string) => void;
};

export function CancelledScreen({ view, onReactivate, onNotice }: CancelledScreenProps) {
  const [reactivateOpen, setReactivateOpen] = useState(false);
  if (!view.cancelledAt) return null;
  const nextCharge = chargeDateOnReactivate(view);

  function confirmReactivate() {
    onReactivate();
    onNotice(
      `${copy.reactivate.done} ${formatPrice(view.nextChargeTotalCents)} ${copy.reactivate.on} ${formatDate(nextCharge)}.`,
    );
  }

  return (
    <>
      <SummaryCard
        tone="cancelled"
        label={copy.cancelled.label}
        badge={copy.cancelled.badge}
        badgeTone="neutral"
        date={formatDate(view.cancelledAt)}
        meta={`${formatRelativeDate(view.cancelledAt)} · ${copy.cancelled.noCharges}`}
      >
        <Button onClick={() => setReactivateOpen(true)}>{copy.cancelled.reactivate}</Button>
      </SummaryCard>
      <ShipmentCard view={view} title={copy.cancelled.itemsTitle} muted />
      <ChargeConfirmSheet
        view={view}
        open={reactivateOpen}
        title={copy.reactivate.title}
        date={nextCharge}
        confirmLabel={copy.reactivate.confirm}
        keepLabel={copy.reactivate.keep}
        onClose={() => setReactivateOpen(false)}
        onConfirm={confirmReactivate}
      />
    </>
  );
}
