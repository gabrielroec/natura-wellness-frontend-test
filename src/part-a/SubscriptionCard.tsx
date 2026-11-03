import { useEffect, useRef, useState } from "react";
import { Banner } from "../components/Banner";
import { ActiveScreen } from "./ActiveScreen";
import { CancelledScreen } from "./CancelledScreen";
import { copy } from "./copy";
import { LoadFailed } from "./LoadFailed";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PausedScreen } from "./PausedScreen";
import styles from "./SubscriptionCard.module.css";
import { useSubscription } from "./useSubscription";

export function SubscriptionCard() {
  const { state, view, retry, skip } = useSubscription();
  const [notice, setNotice] = useState<string | null>(null);
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notice && document.activeElement === document.body) banner.current?.focus();
  }, [notice]);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{copy.title}</h1>
        <div className={styles.body}>
          {state.phase === "loading" && <LoadingSkeleton />}
          {state.phase === "failed" && <LoadFailed errorStatus={state.errorStatus} onRetry={retry} />}
          {view && (
            <div className={styles.stack}>
              <div aria-live="polite">
                {notice && (
                  <Banner ref={banner} message={notice} dismissLabel={copy.skip.dismiss} onDismiss={() => setNotice(null)} />
                )}
              </div>
              {view.status === "active" && <ActiveScreen view={view} onSkip={skip} onNotice={setNotice} />}
              {view.status === "paused" && <PausedScreen view={view} />}
              {view.status === "cancelled" && <CancelledScreen view={view} />}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
