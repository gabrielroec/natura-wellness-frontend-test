import { useState } from "react";
import { Button } from "../components/Button";
import { RadioGroup } from "../components/RadioGroup";
import { Sheet } from "../components/Sheet";
import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./FrequencySheet.module.css";
import type { SubscriptionView } from "./subscriptionView";

type FrequencySheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onSave: (days: number) => void;
};

export function FrequencySheet({ view, open, onClose, onSave }: FrequencySheetProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const selected = picked ?? view.intervalDays;

  function close() {
    setPicked(null);
    onClose();
  }

  function save() {
    setPicked(null);
    if (selected === view.intervalDays) onClose();
    else onSave(selected);
  }

  const every = `${selected} ${copy.frequency.days}`;
  const preview = view.nextChargeAt
    ? `${copy.frequency.nextStays} ${formatDate(view.nextChargeAt)}, ${copy.frequency.then} ${every}.`
    : `${copy.frequency.afterResume} ${every}.`;

  return (
    <Sheet open={open} title={copy.frequency.title} onClose={close}>
      <div className={styles.options}>
        <RadioGroup
          name="delivery-frequency"
          legend={copy.frequency.title}
          value={selected}
          onChange={setPicked}
          options={copy.frequency.options.map((days) => ({
            value: days,
            label: `${copy.frequency.every} ${days} ${copy.frequency.days}`,
            detail: days === view.intervalDays ? copy.frequency.current : undefined,
          }))}
        />
      </div>
      <div className={styles.preview} aria-live="polite">
        <p>{preview}</p>
        <p className={styles.amount}>{`${formatPrice(view.regularTotalCents)} ${copy.frequency.perDelivery}`}</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={save}>{copy.frequency.save}</Button>
        <Button variant="secondary" onClick={close}>
          {copy.frequency.close}
        </Button>
      </div>
    </Sheet>
  );
}
