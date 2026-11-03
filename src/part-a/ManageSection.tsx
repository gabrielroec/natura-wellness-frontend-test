import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ActionRow } from "./ActionRow";
import { copy } from "./copy";
import styles from "./ManageSection.module.css";
import type { SubscriptionView } from "./subscriptionView";

type ManageSectionProps = {
  view: SubscriptionView;
  showPause?: boolean;
};

export function ManageSection({ view, showPause = false }: ManageSectionProps) {
  return (
    <>
      <Card>
        <h2 className={styles.title}>{copy.manage.title}</h2>
        <div className={styles.rows}>
          <ActionRow label={copy.manage.frequency} detail={`${copy.manage.every} ${view.intervalDays} ${copy.manage.days}`} />
          <ActionRow label={copy.manage.products} detail={`${view.items.length} ${copy.manage.productCount}`} />
          {showPause && <ActionRow label={copy.manage.pause} detail={copy.manage.pauseDetail} />}
        </div>
      </Card>
      <div className={styles.cancel}>
        <Button variant="quiet">{copy.manage.cancel}</Button>
      </div>
    </>
  );
}
