import { useState } from "react";
import type { SubscriptionItem } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { addDays, formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { ActionRow } from "./ActionRow";
import { copy } from "./copy";
import { FrequencySheet } from "./FrequencySheet";
import styles from "./ManageSection.module.css";
import { PauseSheet } from "./PauseSheet";
import { ProductsSheet } from "./ProductsSheet";
import { nextChargeWithItems, type SubscriptionView } from "./subscriptionView";

type ManageSectionProps = {
  view: SubscriptionView;
  onChangeFrequency: (days: number) => void;
  onChangeProducts: (items: SubscriptionItem[]) => void;
  onPause?: (days: number) => void;
  onNotice: (message: string) => void;
};

export function ManageSection({ view, onChangeFrequency, onChangeProducts, onPause, onNotice }: ManageSectionProps) {
  const [openSheet, setOpenSheet] = useState<"frequency" | "products" | "pause" | null>(null);
  const closeSheet = () => setOpenSheet(null);

  function saveFrequency(days: number) {
    const every = `${days} ${copy.frequency.days}`;
    onChangeFrequency(days);
    closeSheet();
    onNotice(
      view.nextChargeAt
        ? `${copy.frequency.doneActive} ${every}. ${copy.frequency.nextStays} ${formatDate(view.nextChargeAt)}.`
        : `${copy.frequency.donePaused} ${every}.`,
    );
  }

  function saveProducts(items: SubscriptionItem[]) {
    const total = formatPrice(nextChargeWithItems(view, items));
    onChangeProducts(items);
    closeSheet();
    onNotice(
      view.nextChargeAt
        ? `${copy.products.doneStart} ${copy.products.doneActive} ${total} ${copy.products.on} ${formatDate(view.nextChargeAt)}.`
        : `${copy.products.doneStart} ${copy.products.donePaused} ${total} ${copy.products.whenResumes}`,
    );
  }

  function confirmPause(days: number) {
    onPause?.(days);
    closeSheet();
    onNotice(`${copy.pause.done} ${formatDate(addDays(new Date().toISOString(), days))}.`);
  }

  return (
    <>
      <Card>
        <h2 className={styles.title}>{copy.manage.title}</h2>
        <div className={styles.rows}>
          <ActionRow
            label={copy.manage.frequency}
            detail={`${copy.manage.every} ${view.intervalDays} ${copy.manage.days}`}
            onClick={() => setOpenSheet("frequency")}
          />
          <ActionRow
            label={copy.manage.products}
            detail={`${view.items.length} ${copy.manage.productCount}`}
            onClick={() => setOpenSheet("products")}
          />
          {onPause && (
            <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} onClick={() => setOpenSheet("pause")} />
          )}
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet">{copy.manage.cancel}</Button>
      </div>
      <FrequencySheet view={view} open={openSheet === "frequency"} onClose={closeSheet} onSave={saveFrequency} />
      <ProductsSheet view={view} open={openSheet === "products"} onClose={closeSheet} onSave={saveProducts} />
      {onPause && <PauseSheet view={view} open={openSheet === "pause"} onClose={closeSheet} onConfirm={confirmPause} />}
    </>
  );
}
