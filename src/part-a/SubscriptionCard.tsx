import { useEffect, useRef, useState } from "react";
import { Banner, type BannerTone } from "../components/Banner";
import { ActiveScreen } from "./ActiveScreen";
import { CancelledScreen } from "./CancelledScreen";
import { copy } from "./copy";
import { LoadFailed } from "./LoadFailed";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PausedScreen } from "./PausedScreen";
import styles from "./SubscriptionCard.module.css";
import { SupportSheet } from "./SupportSheet";
import { useSubscription } from "./useSubscription";

export function SubscriptionCard() {
  const {
    state,
    view,
    retry,
    skip,
    refresh,
    changeFrequency,
    changeProducts,
    applyCoupon,
    pause,
    resume,
    cancel,
    reactivate,
  } = useSubscription();
  const [notice, setNotice] = useState<{ message: string; tone?: BannerTone } | null>(null);
  const [supportSubject, setSupportSubject] = useState<string | null>(null);
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice) return;
    banner.current?.scrollIntoView({ block: "nearest" });
    if (document.activeElement === document.body) banner.current?.focus();
  }, [notice]);

  function showNotice(message: string, tone?: BannerTone) {
    setNotice({ message, tone });
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>{copy.title}</h1>
        <div className={styles.body}>
          {state.phase === "loading" && <LoadingSkeleton />}
          {state.phase === "failed" && (
            <LoadFailed
              errorStatus={state.errorStatus}
              onRetry={retry}
              onContactSupport={() => setSupportSubject(copy.support.subjects.load)}
            />
          )}
          {view && (
            <div className={styles.stack}>
              <div aria-live="polite">
                {notice && (
                  <Banner
                    ref={banner}
                    message={notice.message}
                    tone={notice.tone}
                    dismissLabel={copy.skip.dismiss}
                    onDismiss={() => setNotice(null)}
                  />
                )}
              </div>
              {view.status === "active" && (
                <ActiveScreen
                  view={view}
                  onSkip={skip}
                  onRefresh={refresh}
                  onChangeFrequency={changeFrequency}
                  onChangeProducts={changeProducts}
                  onApplyCoupon={applyCoupon}
                  onPause={pause}
                  onCancel={cancel}
                  onNotice={showNotice}
                  onContactSupport={setSupportSubject}
                />
              )}
              {view.status === "paused" && (
                <PausedScreen
                  view={view}
                  onChangeFrequency={changeFrequency}
                  onChangeProducts={changeProducts}
                  onApplyCoupon={applyCoupon}
                  onResume={resume}
                  onCancel={cancel}
                  onNotice={showNotice}
                />
              )}
              {view.status === "cancelled" && (
                <CancelledScreen view={view} onReactivate={reactivate} onNotice={showNotice} />
              )}
            </div>
          )}
        </div>
      </div>
      <SupportSheet
        open={supportSubject !== null}
        subject={supportSubject ?? ""}
        reference={view?.id ?? null}
        onClose={() => setSupportSubject(null)}
      />
    </main>
  );
}
