import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { addDays, formatDate } from "../utils/dates";
import { ActionRow } from "./ActionRow";
import { copy } from "./copy";
import { FrequencySheet } from "./FrequencySheet";
import styles from "./ManageSection.module.css";
import { PauseSheet } from "./PauseSheet";
import type { SubscriptionView } from "./subscriptionView";

type ManageSectionProps = {
  view: SubscriptionView;
  onChangeFrequency: (days: number) => void;
  onPause?: (days: number) => void;
  onNotice: (message: string) => void;
};

export function ManageSection({ view, onChangeFrequency, onPause, onNotice }: ManageSectionProps) {
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);

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

  function confirmPause(days: number) {
    onPause?.(days);
    setPauseOpen(false);
    onNotice(`${copy.pause.done} ${formatDate(addDays(new Date().toISOString(), days))}.`);
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
          {onPause && (
            <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} onClick={() => setPauseOpen(true)} />
          )}
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet">{copy.manage.cancel}</Button>
      </div>
      <FrequencySheet view={view} open={frequencyOpen} onClose={() => setFrequencyOpen(false)} onSave={saveFrequency} />
      {onPause && <PauseSheet view={view} open={pauseOpen} onClose={() => setPauseOpen(false)} onConfirm={confirmPause} />}
    </>
  );
}
