import { formatPrice } from "../utils/formatPrice";
import styles from "./PurchaseOption.module.css";

type PurchaseOptionProps = {
  label: string;
  priceCents: number;
  selected: boolean;
  onSelect: () => void;
};

export function PurchaseOption({ label, priceCents, selected, onSelect }: PurchaseOptionProps) {
  return (
    <div className={selected ? `${styles.option} ${styles.selected}` : styles.option}>
      <label className={styles.row}>
        <input className={styles.radio} type="radio" name="purchase-option" checked={selected} onChange={onSelect} />
        <span className={styles.label}>{label}</span>
        <span className={styles.price}>{formatPrice(priceCents)}</span>
      </label>
    </div>
  );
}
