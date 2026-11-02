import type { ReactNode } from "react";
import { Badge } from "../components/Badge";
import { formatPrice } from "../utils/formatPrice";
import styles from "./PurchaseOption.module.css";

type PurchaseOptionProps = {
  label: string;
  priceCents: number;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  comparePriceCents?: number;
  children?: ReactNode;
};

export function PurchaseOption({
  label,
  priceCents,
  selected,
  onSelect,
  badge,
  comparePriceCents,
  children,
}: PurchaseOptionProps) {
  return (
    <div className={selected ? `${styles.option} ${styles.selected}` : styles.option}>
      <label className={styles.row}>
        <input className={styles.radio} type="radio" name="purchase-option" checked={selected} onChange={onSelect} />
        <span className={styles.labels}>
          <span className={styles.label}>{label}</span>
          {badge && <Badge label={badge} />}
        </span>
        <span className={styles.prices}>
          <span className={styles.price}>{formatPrice(priceCents)}</span>
          {comparePriceCents !== undefined && <s className={styles.comparePrice}>{formatPrice(comparePriceCents)}</s>}
        </span>
      </label>
      {children && <div className={styles.details}>{children}</div>}
    </div>
  );
}
