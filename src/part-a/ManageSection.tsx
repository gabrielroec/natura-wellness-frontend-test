import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { formatDate } from "../utils/dates";
import { ActionRow } from "./ActionRow";
import { copy } from "./copy";
import { FrequencySheet } from "./FrequencySheet";
import styles from "./ManageSection.module.css";
import type { SubscriptionView } from "./subscriptionView";

type ManageSectionProps = {
  view: SubscriptionView;
  showPause?: boolean;
  onChangeFrequency: (days: number) => void;
  onNotice: (message: string) => void;
};

export function ManageSection({ view, showPause = false, onChangeFrequency, onNotice }: ManageSectionProps) {
  const [frequencyOpen, setFrequencyOpen] = useState(false);

  function saveFrequency(days: number) {
    const every = `${days} ${copy.frequency.days}`;
    onChangeFrequency(days);
    setFrequencyOpen(false);
    onNotice(
      view.nextChargeAt
        ? `${copy.frequency.doneActive} ${every}. ${copy.frequency.nextStays} ${formatDate(view.nextChargeAt)}.`
        : `${copy.frequency.donePaused} ${every}.`,
    );
  }

  return (
    <>
      <Card>
        <h2 className={styles.title}>{copy.manage.title}</h2>
        <div className={styles.rows}>
          <ActionRow
            label={copy.manage.frequency}
            detail={`${copy.manage.every} ${view.intervalDays} ${copy.manage.days}`}
            onClick={() => setFrequencyOpen(true)}
          />
          <ActionRow label={copy.manage.products} detail={`${view.items.length} ${copy.manage.productCount}`} />
          {showPause && <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} />}
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet">{copy.manage.cancel}</Button>
      </div>
      <FrequencySheet view={view} open={frequencyOpen} onClose={() => setFrequencyOpen(false)} onSave={saveFrequency} />
    </>
  );
}
