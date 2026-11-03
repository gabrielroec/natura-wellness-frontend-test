import { Card } from "../components/Card";
import { formatDate, formatRelativeDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import { LoadFailed } from "./LoadFailed";
import { LoadingSkeleton } from "./LoadingSkeleton";
import styles from "./SubscriptionCard.module.css";
import { buildView, type SubscriptionView } from "./subscriptionView";
import { useSubscription } from "./useSubscription";

function StatusSummary({ view }: { view: SubscriptionView }) {
  if (view.pausedUntil) return <p>{`${copy.status.pausedUntil} ${formatDate(view.pausedUntil)}`}</p>;
  if (view.cancelledAt) return <p>{`${copy.status.cancelledOn} ${formatDate(view.cancelledAt)}`}</p>;
  if (!view.nextChargeAt) return null;
  return (
    <p>
      {`${copy.status.nextCharge}: ${formatDate(view.nextChargeAt)}, ${formatRelativeDate(view.nextChargeAt)}. ${formatPrice(view.nextChargeTotalCents)}`}
    </p>
  );
}

export function SubscriptionCard() {
  const { state, retry } = useSubscription();

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{copy.title}</h1>
        <div className={styles.body}>
          {state.phase === "loading" && <LoadingSkeleton />}
          {state.phase === "failed" && <LoadFailed errorStatus={state.errorStatus} onRetry={retry} />}
          {state.phase === "ready" && (
            <Card>
              <StatusSummary view={buildView(state.server)} />
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
