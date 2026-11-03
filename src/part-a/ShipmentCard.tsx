import { Card } from "../components/Card";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { ProductThumb } from "./ProductThumb";
import styles from "./ShipmentCard.module.css";
import type { SubscriptionView } from "./subscriptionView";

type ShipmentCardProps = {
  view: SubscriptionView;
  title: string;
  muted?: boolean;
};

export function ShipmentCard({ view, title, muted = false }: ShipmentCardProps) {
  return (
    <Card>
      <h2 className={styles.title}>{title}</h2>
      <ul className={muted ? `${styles.items} ${styles.muted}` : styles.items}>
        {view.items.map((item) => (
          <li key={item.sku} className={styles.item}>
            <ProductThumb name={item.name} imageUrl={item.imageUrl} muted={muted} />
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.quantity}>{`${copy.shipment.quantity} ${item.quantity}`}</p>
            </div>
            {!muted && <p className={styles.linePrice}>{formatPrice(item.unitPriceCents * item.quantity)}</p>}
          </li>
        ))}
      </ul>
      {!muted && (
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
      )}
    </Card>
  );
}
