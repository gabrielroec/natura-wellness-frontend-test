import { useRef, useState } from "react";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { ApiError } from "../api/types";
import { formatDate } from "../utils/dates";
import { formatPrice } from "../utils/formatPrice";
import { copy } from "./copy";
import styles from "./SkipSheet.module.css";
import { chargeDateAfterSkip, type SubscriptionView } from "./subscriptionView";

type Step = "confirm" | "changed" | "stillFailing" | "failed" | "reloadFailed";
type Busy = "skipping" | "checking" | null;

const titles = {
  stillFailing: copy.skip.stillTitle,
  failed: copy.skip.failedTitle,
  reloadFailed: copy.skip.reloadTitle,
};

type SkipSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onRefresh: () => Promise<SubscriptionView>;
  onNoLongerActive: (status: SubscriptionView["status"]) => void;
  onContactSupport: () => void;
};

export function SkipSheet({ view, open, onClose, onConfirm, onRefresh, onNoLongerActive, onContactSupport }: SkipSheetProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [busy, setBusy] = useState<Busy>(null);
  const conflicts = useRef(0);
  const newDate = chargeDateAfterSkip(view);
  if (!view.nextChargeAt || !newDate) return null;
  const currentDate = formatDate(view.nextChargeAt);

  async function checkLatest() {
    setBusy("checking");
    try {
      const latest = await onRefresh();
      if (latest.status !== "active") {
        onNoLongerActive(latest.status);
        return;
      }
      setStep(conflicts.current > 1 ? "stillFailing" : "changed");
    } catch {
      setStep("reloadFailed");
    } finally {
      setBusy(null);
    }
  }

  async function attemptSkip() {
    setBusy("skipping");
    try {
      await onConfirm();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        conflicts.current += 1;
        await checkLatest();
        return;
      }
      setStep("failed");
    }
    setBusy(null);
  }

  function close() {
    setStep("confirm");
    onClose();
  }

  function contactSupport() {
    close();
    onContactSupport();
  }

  const asking = step === "confirm" || step === "changed";
  const title = asking
    ? step === "changed"
      ? copy.skip.changedTitle
      : `${copy.skip.titleStart} ${currentDate} ${copy.skip.titleEnd}`
    : titles[step];
  const busyLabel = busy === "checking" ? copy.skip.checking : copy.skip.skipping;

  return (
    <Sheet open={open} title={title} onClose={close} locked={busy !== null}>
      <p className="sr-only" role="status">
        {busy ? busyLabel : ""}
      </p>
      {asking ? (
        <>
          {step === "changed" && <p className={styles.notice}>{copy.skip.changedBody}</p>}
          <dl className={styles.dates}>
            <div className={styles.row}>
              <dt>{copy.skip.currentDate}</dt>
              <dd>{currentDate}</dd>
            </div>
            <div className={styles.row}>
              <dt>{copy.skip.newDate}</dt>
              <dd className={styles.strong}>{formatDate(newDate)}</dd>
            </div>
            <div className={styles.row}>
              <dt>{copy.skip.amount}</dt>
              <dd>{formatPrice(view.nextChargeTotalCents)}</dd>
            </div>
          </dl>
          <p className={styles.explain}>{`${copy.skip.explain} ${currentDate}.`}</p>
        </>
      ) : (
        <p className={styles.error} role="alert">
          {`${copy.skip.nothingChanged} ${currentDate}. ${copy.skip.whatToDo}`}
        </p>
      )}
      <div className={styles.actions}>
        <Button onClick={step === "reloadFailed" ? checkLatest : attemptSkip} disabled={busy !== null}>
          {busy && <span className={styles.spinner} aria-hidden="true" />}
          {busy ? busyLabel : asking ? `${copy.skip.confirmStart} ${currentDate} ${copy.skip.confirmEnd}` : copy.skip.retry}
        </Button>
        {!asking && (
          <Button variant="secondary" onClick={contactSupport} disabled={busy !== null}>
            {copy.skip.contact}
          </Button>
        )}
        <Button variant={asking ? "secondary" : "quiet"} onClick={close} disabled={busy !== null}>
          {asking ? copy.skip.keep : copy.skip.close}
        </Button>
      </div>
    </Sheet>
  );
}
