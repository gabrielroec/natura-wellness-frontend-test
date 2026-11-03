import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { ManageSection } from "./ManageSection";
import { ShipmentCard } from "./ShipmentCard";
import type { SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type ActiveScreenProps = {
  view: SubscriptionView;
};

export function ActiveScreen({ view }: ActiveScreenProps) {
  if (!view.nextChargeAt) return null;

  return (
    <>
      <SummaryCard
        label={copy.active.nextCharge}
        badge={copy.active.badge}
        badgeTone="green"
        date={formatDate(view.nextChargeAt)}
        amount={formatPrice(view.nextChargeTotalCents)}
        meta={`${formatRelativeDate(view.nextChargeAt)} · ${copy.active.deliveredEvery} ${view.intervalDays} ${copy.active.days}`}
      >
        <Button>{copy.active.skip}</Button>
      </SummaryCard>
      <ShipmentCard view={view} title={copy.shipment.title} />
      <ManageSection view={view} showPause />
    </>
  );
}
