import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { ActionRow } from "./ActionRow";
import styles from "./ActiveScreen.module.css";
import { copy } from "./copy";
import { ShipmentCard } from "./ShipmentCard";
import type { SubscriptionView } from "./subscriptionView";

type ActiveScreenProps = {
  view: SubscriptionView;
};

export function ActiveScreen({ view }: ActiveScreenProps) {
  if (!view.nextChargeAt) return null;

  return (
    <div className={styles.stack}>
      <Card>
        <div className={styles.top}>
          <h2 className={styles.label}>{copy.active.nextCharge}</h2>
          <Badge label={copy.active.badge} tone="green" />
        </div>
        <div className={styles.charge}>
          <p className={styles.date}>{formatDate(view.nextChargeAt)}</p>
          <p className={styles.amount}>{formatPrice(view.nextChargeTotalCents)}</p>
        </div>
        <p className={styles.meta}>
          {`${formatRelativeDate(view.nextChargeAt)} · ${copy.active.deliveredEvery} ${view.intervalDays} ${copy.active.days}`}
        </p>
        <div className={styles.primary}>
          <Button>{copy.active.skip}</Button>
        </div>
      </Card>
      <ShipmentCard view={view} />
      <Card>
        <h2 className={styles.manage}>{copy.manage.title}</h2>
        <div className={styles.rows}>
          <ActionRow label={copy.manage.frequency} detail={`${copy.manage.every} ${view.intervalDays} ${copy.manage.days}`} />
          <ActionRow label={copy.manage.products} detail={`${view.items.length} ${copy.manage.productCount}`} />
          <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} />
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet">{copy.manage.cancel}</Button>
      </div>
    </div>
  );
}
