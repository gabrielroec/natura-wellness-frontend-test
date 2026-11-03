import { useState } from "react";
import { Button } from "../components/Button";
import { RadioGroup } from "../components/RadioGroup";
import { Sheet } from "../components/Sheet";
import { addDays, formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./PauseSheet.module.css";
import type { SubscriptionView } from "./subscriptionView";

const today = () => new Date().toISOString();

type PauseSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
};

export function PauseSheet({ view, open, onClose, onConfirm }: PauseSheetProps) {
  const [days, setDays] = useState(copy.pause.options[0]);

  function close() {
    setDays(copy.pause.options[0]);
    onClose();
  }

  return (
    <Sheet open={open} title={copy.pause.title} onClose={close}>
      <div className={styles.options}>
        <RadioGroup
          name="pause-length"
          legend={copy.pause.title}
          value={days}
          onChange={setDays}
          options={copy.pause.options.map((option) => ({
            value: option,
            label: `${copy.pause.for} ${option} ${copy.pause.days}`,
            detail: `${copy.pause.until} ${formatDate(addDays(today(), option))}`,
          }))}
        />
      </div>
      <p className={styles.preview} aria-live="polite">
        {`${copy.pause.noCharges} ${formatDate(addDays(today(), days))}. ${copy.pause.resumes} ${formatPrice(view.nextChargeTotalCents)} ${copy.pause.then}`}
      </p>
      <div className={styles.actions}>
        <Button onClick={() => onConfirm(days)}>{copy.pause.confirm}</Button>
        <Button variant="secondary" onClick={close}>
          {copy.pause.keep}
        </Button>
      </div>
    </Sheet>
  );
}
