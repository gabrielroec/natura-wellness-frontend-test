import { useState } from "react";
import type { SubscriptionItem } from "../api/types";
import { Button } from "../components/Button";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { ManageSection } from "./ManageSection";
import { ResumeSheet } from "./ResumeSheet";
import { ShipmentCard } from "./ShipmentCard";
import type { SubscriptionView } from "./subscriptionView";
import { SummaryCard } from "./SummaryCard";

type PausedScreenProps = {
  view: SubscriptionView;
  onChangeFrequency: (days: number) => void;
  onChangeProducts: (items: SubscriptionItem[]) => void;
  onResume: () => void;
  onNotice: (message: string) => void;
};

export function PausedScreen({ view, onChangeFrequency, onChangeProducts, onResume, onNotice }: PausedScreenProps) {
  const [resumeOpen, setResumeOpen] = useState(false);
  if (!view.pausedUntil || !view.chargeDateOnResume) return null;
  const amount = formatPrice(view.nextChargeTotalCents);
  const resumeDate = formatDate(view.chargeDateOnResume);

  function confirmResume() {
    onResume();
    onNotice(`${copy.resume.done} ${amount} ${copy.resume.on} ${resumeDate}.`);
  }

  return (
    <>
      <SummaryCard
        tone="paused"
        label={copy.paused.label}
        badge={copy.paused.badge}
        badgeTone="gold"
        date={formatDate(view.pausedUntil)}
        meta={`${formatRelativeDate(view.pausedUntil)} · ${copy.paused.noCharges}`}
        note={`${copy.paused.charged} ${amount} ${copy.paused.whenResumes}`}
      >
        <Button onClick={() => setResumeOpen(true)}>{copy.paused.resume}</Button>
      </SummaryCard>
      <ShipmentCard view={view} title={copy.paused.shipmentTitle} />
      <ManageSection
        view={view}
        onChangeFrequency={onChangeFrequency}
        onChangeProducts={onChangeProducts}
        onNotice={onNotice}
      />
      <ResumeSheet view={view} open={resumeOpen} onClose={() => setResumeOpen(false)} onConfirm={confirmResume} />
    </>
  );
}
