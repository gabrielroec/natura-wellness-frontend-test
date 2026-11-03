import { useState } from "react";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./SkipSheet.module.css";
import { chargeDateAfterSkip, type SubscriptionView } from "./subscriptionView";

type SkipSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function SkipSheet({ view, open, onClose, onConfirm }: SkipSheetProps) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const newDate = chargeDateAfterSkip(view);
  if (!view.nextChargeAt || !newDate) return null;
  const currentDate = formatDate(view.nextChargeAt);

  async function confirm() {
    setPending(true);
    setFailed(false);
    try {
      await onConfirm();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  function close() {
    setFailed(false);
    onClose();
  }

  return (
    <Sheet open={open} title={`${copy.skip.titleStart} ${currentDate} ${copy.skip.titleEnd}`} onClose={close} locked={pending}>
      <dl className={styles.dates}>
        <div className={styles.row}>
          <dt>{copy.skip.currentDate}</dt>
          <dd>{currentDate}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.skip.newDate}</dt>
          <dd className={styles.strong}>{formatDate(newDate)}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.skip.amount}</dt>
          <dd>{formatPrice(view.nextChargeTotalCents)}</dd>
        </div>
      </dl>
      <p className={styles.explain}>{`${copy.skip.explain} ${currentDate}.`}</p>
      {failed && (
        <p className={styles.error} role="alert">
          {`${copy.skip.failed} ${currentDate}.`}
        </p>
      )}
      <p className="sr-only" role="status">
        {pending ? copy.skip.skipping : ""}
      </p>
      <div className={styles.actions}>
        {!failed && (
          <Button onClick={confirm} disabled={pending}>
            {pending && <span className={styles.spinner} aria-hidden="true" />}
            {pending ? copy.skip.skipping : `${copy.skip.confirmStart} ${currentDate} ${copy.skip.confirmEnd}`}
          </Button>
        )}
        <Button variant="secondary" onClick={close} disabled={pending}>
          {failed ? copy.skip.close : copy.skip.keep}
        </Button>
      </div>
    </Sheet>
  );
}
