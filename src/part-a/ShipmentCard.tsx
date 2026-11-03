import { Card } from "../components/Card";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./ShipmentCard.module.css";
import type { SubscriptionView } from "./subscriptionView";

type ShipmentCardProps = {
  view: SubscriptionView;
};

export function ShipmentCard({ view }: ShipmentCardProps) {
  return (
    <Card>
      <h2 className={styles.title}>{copy.shipment.title}</h2>
      <ul className={styles.items}>
        {view.items.map((item) => (
          <li key={item.sku} className={styles.item}>
            {item.imageUrl ? (
              <img className={styles.thumb} src={item.imageUrl} alt="" width={56} height={56} />
            ) : (
              <span className={`${styles.thumb} ${styles.placeholder}`} aria-hidden="true">
                {item.name[0]}
              </span>
            )}
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.quantity}>{`${copy.shipment.quantity} ${item.quantity}`}</p>
            </div>
            <p className={styles.linePrice}>{formatPrice(item.unitPriceCents * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className={styles.totals}>
        <div className={styles.line}>
          <dt>{copy.shipment.subtotal}</dt>
          <dd>{formatPrice(view.subtotalCents)}</dd>
        </div>
        <div className={styles.line}>
          <dt>{`${copy.shipment.savings} (${view.discountPercent}%)`}</dt>
          <dd>{`−${formatPrice(view.savingsCents)}`}</dd>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <dt>{copy.shipment.total}</dt>
          <dd>{formatPrice(view.nextChargeTotalCents)}</dd>
        </div>
      </dl>
    </Card>
  );
}
