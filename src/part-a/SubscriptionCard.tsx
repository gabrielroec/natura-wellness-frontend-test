import { Card } from "../components/Card";
import { formatDate } from "../utils/dates";
import { ActiveScreen } from "./ActiveScreen";
import { copy } from "./copy";
import { LoadFailed } from "./LoadFailed";
import { LoadingSkeleton } from "./LoadingSkeleton";
import styles from "./SubscriptionCard.module.css";
import { buildView, type SubscriptionView } from "./subscriptionView";
import { useSubscription } from "./useSubscription";

function StatusScreen({ view }: { view: SubscriptionView }) {
  if (view.status === "active") return <ActiveScreen view={view} />;
  return (
    <Card>
      {view.pausedUntil && <p>{`${copy.status.pausedUntil} ${formatDate(view.pausedUntil)}`}</p>}
      {view.cancelledAt && <p>{`${copy.status.cancelledOn} ${formatDate(view.cancelledAt)}`}</p>}
    </Card>
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
          {state.phase === "ready" && <StatusScreen view={buildView(state.server)} />}
        </div>
      </div>
    </main>
  );
}
