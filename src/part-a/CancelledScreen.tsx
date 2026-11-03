import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { copy } from "./copy";
import { ShipmentCard } from "./ShipmentCard";
import type { SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type CancelledScreenProps = {
  view: SubscriptionView;
};

export function CancelledScreen({ view }: CancelledScreenProps) {
  if (!view.cancelledAt) return null;

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
        <Button>{copy.cancelled.reactivate}</Button>
      </SummaryCard>
      <ShipmentCard view={view} title={copy.cancelled.itemsTitle} muted />
    </>
  );
}
