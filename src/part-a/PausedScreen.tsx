import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { ManageSection } from "./ManageSection";
import { ShipmentCard } from "./ShipmentCard";
import type { SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type PausedScreenProps = {
  view: SubscriptionView;
  onChangeFrequency: (days: number) => void;
  onNotice: (message: string) => void;
};

export function PausedScreen({ view, onChangeFrequency, onNotice }: PausedScreenProps) {
  if (!view.pausedUntil) return null;

  return (
    <>
      <SummaryCard
        tone="paused"
        label={copy.paused.label}
        badge={copy.paused.badge}
        badgeTone="gold"
        date={formatDate(view.pausedUntil)}
        meta={`${formatRelativeDate(view.pausedUntil)} · ${copy.paused.noCharges}`}
        note={`${copy.paused.charged} ${formatPrice(view.nextChargeTotalCents)} ${copy.paused.whenResumes}`}
      >
        <Button>{copy.paused.resume}</Button>
      </SummaryCard>
      <ShipmentCard view={view} title={copy.paused.shipmentTitle} />
      <ManageSection view={view} onChangeFrequency={onChangeFrequency} onNotice={onNotice} />
    </>
  );
}
