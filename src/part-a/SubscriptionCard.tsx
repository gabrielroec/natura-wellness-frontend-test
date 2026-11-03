import { ActiveScreen } from "./ActiveScreen";
import { CancelledScreen } from "./CancelledScreen";
import { copy } from "./copy";
import { LoadFailed } from "./LoadFailed";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PausedScreen } from "./PausedScreen";
import styles from "./SubscriptionCard.module.css";
import { buildView } from "./subscriptionView";
import { useSubscription } from "./useSubscription";

const screens = { active: ActiveScreen, paused: PausedScreen, cancelled: CancelledScreen };

export function SubscriptionCard() {
  const { state, retry } = useSubscription();
  const view = state.phase === "ready" ? buildView(state.server) : null;
  const Screen = view ? screens[view.status] : null;

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{copy.title}</h1>
        <div className={styles.body}>
          {state.phase === "loading" && <LoadingSkeleton />}
          {state.phase === "failed" && <LoadFailed errorStatus={state.errorStatus} onRetry={retry} />}
          {view && Screen && (
            <div className={styles.stack}>
              <Screen view={view} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
