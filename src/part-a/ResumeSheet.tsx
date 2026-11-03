import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./ResumeSheet.module.css";
import type { SubscriptionView } from "./subscriptionView";

type ResumeSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ResumeSheet({ view, open, onClose, onConfirm }: ResumeSheetProps) {
  if (!view.chargeDateOnResume) return null;

  return (
    <Sheet open={open} title={copy.resume.title} onClose={onClose}>
      <dl className={styles.details}>
        <div className={styles.row}>
          <dt>{copy.resume.nextCharge}</dt>
          <dd className={styles.strong}>{formatDate(view.chargeDateOnResume)}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.resume.amount}</dt>
          <dd>{formatPrice(view.nextChargeTotalCents)}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.resume.delivered}</dt>
          <dd>{`${copy.resume.every} ${view.intervalDays} ${copy.resume.days}`}</dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <Button onClick={onConfirm}>{copy.resume.confirm}</Button>
        <Button variant="secondary" onClick={onClose}>
          {copy.resume.keep}
        </Button>
      </div>
    </Sheet>
  );
}
