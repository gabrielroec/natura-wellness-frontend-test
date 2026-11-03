import { useState } from "react";
import { catalog } from "../api/fixtures";
import type { CatalogProduct, SubscriptionItem } from "../api/types";
import { Button } from "../components/Button";
import { QuantityStepper } from "../components/QuantityStepper";
import { Sheet } from "../components/Sheet";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { ProductThumb } from "./ProductThumb";
import styles from "./ProductsSheet.module.css";
import { nextChargeWithItems, swapCandidates, swapItem, type SubscriptionView } from "./subscriptionView";

type ProductsSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onSave: (items: SubscriptionItem[]) => void;
};

export function ProductsSheet({ view, open, onClose, onSave }: ProductsSheetProps) {
  const [draft, setDraft] = useState(view.items);
  const [swappingSku, setSwappingSku] = useState<string | null>(null);
  const swapping = draft.find((item) => item.sku === swappingSku);
  const changed = draft.some(
    (item, index) => item.sku !== view.items[index].sku || item.quantity !== view.items[index].quantity,
  );
  const previous = changed ? ` (${copy.products.was} ${formatPrice(view.nextChargeTotalCents)})` : "";

  function close() {
    setDraft(view.items);
    setSwappingSku(null);
    onClose();
  }

  function setQuantity(sku: string, quantity: number) {
    setDraft((items) => items.map((item) => (item.sku === sku ? { ...item, quantity } : item)));
  }

  function chooseProduct(product: CatalogProduct) {
    if (swappingSku) setDraft((items) => swapItem(items, swappingSku, product));
    setSwappingSku(null);
  }

  return (
    <Sheet open={open} title={swapping ? `${copy.products.swap} ${swapping.name}` : copy.products.title} onClose={close}>
      {swapping ? (
        <>
          <ul className={styles.choices}>
            {swapCandidates(catalog, draft).map((product) => (
              <li key={product.sku}>
                <button className={styles.choice} type="button" onClick={() => chooseProduct(product)}>
                  <ProductThumb name={product.name} imageUrl={product.imageUrl} />
                  <span className={styles.choiceText}>
                    <span className={styles.name}>{product.name}</span>
                    <span className={styles.price}>{`${formatPrice(product.unitPriceCents)} ${copy.products.each}`}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setSwappingSku(null)}>
              {copy.products.back}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ul className={styles.items}>
            {draft.map((item) => (
              <li key={item.sku} className={styles.item}>
                <div className={styles.product}>
                  <ProductThumb name={item.name} imageUrl={item.imageUrl} />
                  <div className={styles.choiceText}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.price}>{`${formatPrice(item.unitPriceCents)} ${copy.products.each}`}</span>
                  </div>
                </div>
                <div className={styles.controls}>
                  <QuantityStepper
                    value={item.quantity}
                    itemName={item.name}
                    onChange={(quantity) => setQuantity(item.sku, quantity)}
                  />
                  <Button
                    variant="secondary"
                    label={`${copy.products.swap} ${item.name}`}
                    onClick={() => setSwappingSku(item.sku)}
                  >
                    {copy.products.swap}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.preview} aria-live="polite">
            <p>{`${copy.products.nextCharge} ${formatPrice(nextChargeWithItems(view, draft))}${previous}`}</p>
            <p className={styles.savings}>{`${copy.products.includes} ${view.discountPercent}% ${copy.products.savings}`}</p>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => (changed ? onSave(draft) : close())}>{copy.products.save}</Button>
            <Button variant="secondary" onClick={close}>
              {copy.products.close}
            </Button>
          </div>
        </>
      )}
    </Sheet>
  );
}
