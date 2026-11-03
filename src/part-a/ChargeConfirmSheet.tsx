import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import styles from "./ChargeConfirmSheet.module.css";
import { copy } from "./copy";
import type { SubscriptionView } from "./subscriptionView";

type ChargeConfirmSheetProps = {
  view: SubscriptionView;
  open: boolean;
  title: string;
  date: string;
  confirmLabel: string;
  keepLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ChargeConfirmSheet({
  view,
  open,
  title,
  date,
  confirmLabel,
  keepLabel,
  onClose,
  onConfirm,
}: ChargeConfirmSheetProps) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <dl className={styles.details}>
        <div className={styles.row}>
          <dt>{copy.charge.nextCharge}</dt>
          <dd className={styles.strong}>{formatDate(date)}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.charge.amount}</dt>
          <dd>{formatPrice(view.nextChargeTotalCents)}</dd>
        </div>
        <div className={styles.row}>
          <dt>{copy.charge.delivered}</dt>
          <dd>{`${copy.charge.every} ${view.intervalDays} ${copy.charge.days}`}</dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="secondary" onClick={onClose}>
          {keepLabel}
        </Button>
      </div>
    </Sheet>
  );
}
