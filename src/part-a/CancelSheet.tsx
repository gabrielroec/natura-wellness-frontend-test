import { useId, useState } from "react";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { formatDate } from "../utils/dates";
import { CancelIcon, type CancelIconName } from "./CancelIcon";
import styles from "./CancelSheet.module.css";
import { copy } from "./copy";
import { OfferCard } from "./OfferCard";
import { cancelOffers, type CancelReason, type Offer, type SubscriptionView } from "./subscriptionView";

type Step =
  | { name: "reason" }
  | { name: "offer"; reason: CancelReason }
  | { name: "coupon"; reason: CancelReason; percent: number }
  | { name: "confirm" };

const STEP_COUNT = 3;

const stepNumbers: Record<Step["name"], number> = { reason: 1, offer: 2, coupon: 2, confirm: 3 };

const reasonIcons: Record<CancelReason, CancelIconName> = {
  tooMuchProduct: "box",
  tooExpensive: "tag",
  differentProduct: "swap",
  noResults: "results",
  other: "message",
};

type CancelSheetProps = {
  view: SubscriptionView;
  open: boolean;
  onClose: () => void;
  onAccept: (offer: Offer) => void;
  onCancel: () => void;
};

function stepTitle(step: Step, view: SubscriptionView) {
  switch (step.name) {
    case "reason":
      return copy.cancel.reasonTitle;
    case "confirm":
      return copy.cancel.confirmTitle;
    case "coupon":
      return `${copy.cancel.stayWith} ${step.percent}% ${copy.cancel.offers.off}?`;
    case "offer": {
      const [first] = cancelOffers(step.reason, view);
      const title = copy.cancel.offerTitles[step.reason];
      return first.kind === "swap" && first.couponPercent
        ? `${title} ${copy.cancel.with} ${first.couponPercent}% ${copy.cancel.offers.off}`
        : title;
    }
  }
}

const stepIntros: Record<Step["name"], string> = {
  reason: copy.cancel.reasonIntro,
  offer: copy.cancel.offerIntro,
  coupon: copy.cancel.offerIntro,
  confirm: copy.cancel.confirmIntro,
};

export function CancelSheet({ view, open, onClose, onAccept, onCancel }: CancelSheetProps) {
  const [step, setStep] = useState<Step>({ name: "reason" });
  const [note, setNote] = useState("");
  const noteId = useId();
  const stepNumber = stepNumbers[step.name];

  function reset() {
    setStep({ name: "reason" });
    setNote("");
  }

  function close() {
    reset();
    onClose();
  }

  function accept(offer: Offer, reason: CancelReason) {
    if (offer.kind === "pause" && offer.couponPercent) {
      setStep({ name: "coupon", reason, percent: offer.couponPercent });
      return;
    }
    reset();
    onAccept(offer);
  }

  function confirmCancel() {
    reset();
    onCancel();
  }

  return (
    <Sheet
      open={open}
      title={stepTitle(step, view)}
      display
      eyebrow={
        <div className={styles.progress}>
          <div className={styles.bars} aria-hidden="true">
            {Array.from({ length: STEP_COUNT }, (_, index) => (
              <span key={index} className={index < stepNumber ? `${styles.bar} ${styles.reached}` : styles.bar} />
            ))}
          </div>
          <p className={styles.stepText}>{`${copy.cancel.step} ${stepNumber} ${copy.cancel.of} ${STEP_COUNT}`}</p>
        </div>
      }
      onClose={close}
    >
      <p className={styles.intro}>{stepIntros[step.name]}</p>

      {step.name === "reason" && (
        <>
          <div className={styles.options}>
            {copy.cancelReasons.map((reason) => (
              <button
                key={reason.id}
                className={styles.reason}
                type="button"
                onClick={() => setStep({ name: "offer", reason: reason.id })}
              >
                <span className={styles.reasonIcon}>
                  <CancelIcon name={reasonIcons[reason.id]} />
                </span>
                <span className={styles.reasonLabel}>{reason.label}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m6 3.5 4.5 4.5L6 12.5" stroke="#4a5550" strokeWidth="1.5" />
                </svg>
              </button>
            ))}
          </div>
          <div className={styles.links}>
            <Button variant="quiet" onClick={close}>
              {copy.cancel.keep}
            </Button>
          </div>
        </>
      )}

      {step.name === "offer" && (
        <>
          {step.reason === "other" && (
            <>
              <label className={styles.noteLabel} htmlFor={noteId}>
                {copy.cancel.noteLabel}
              </label>
              <textarea
                id={noteId}
                className={styles.note}
                rows={2}
                value={note}
                placeholder={copy.cancel.notePlaceholder}
                onChange={(event) => setNote(event.target.value)}
              />
            </>
          )}
          <div className={styles.options}>
            {cancelOffers(step.reason, view).map((offer, index) => (
              <OfferCard
                key={offer.kind}
                offer={offer}
                view={view}
                tone={index === 0 ? "hero" : "soft"}
                onClick={() => accept(offer, step.reason)}
              />
            ))}
            <Button variant="secondary" onClick={() => setStep({ name: "confirm" })}>
              {copy.cancel.continue}
            </Button>
          </div>
          <div className={styles.links}>
            <Button variant="quiet" onClick={() => setStep({ name: "reason" })}>
              {copy.cancel.back}
            </Button>
            <Button variant="quiet" onClick={close}>
              {copy.cancel.keep}
            </Button>
          </div>
        </>
      )}

      {step.name === "coupon" && (
        <>
          <div className={styles.options}>
            <OfferCard
              offer={{ kind: "coupon", percent: step.percent }}
              view={view}
              tone="hero"
              onClick={() => accept({ kind: "coupon", percent: step.percent }, step.reason)}
            />
            <Button variant="secondary" onClick={() => accept({ kind: "pause", couponPercent: null }, step.reason)}>
              {copy.cancel.pauseAnyway}
            </Button>
          </div>
          <div className={styles.links}>
            <Button variant="quiet" onClick={() => setStep({ name: "offer", reason: step.reason })}>
              {copy.cancel.back}
            </Button>
            <Button variant="quiet" onClick={close}>
              {copy.cancel.keep}
            </Button>
          </div>
        </>
      )}

      {step.name === "confirm" && (
        <>
          <ul className={styles.outcomes}>
            <li className={styles.outcome}>
              <span className={`${styles.outcomeIcon} ${styles.stops}`}>
                <CancelIcon name="close" />
              </span>
              {view.nextChargeAt
                ? `${copy.cancel.noChargeOn} ${formatDate(view.nextChargeAt)}${copy.cancel.nothingShips}`
                : `${copy.cancel.noResumeOn} ${view.pausedUntil && formatDate(view.pausedUntil)}${copy.cancel.noMoreCharges}`}
            </li>
            {view.couponPercent && (
              <li className={styles.outcome}>
                <span className={`${styles.outcomeIcon} ${styles.stops}`}>
                  <CancelIcon name="ticket" />
                </span>
                {`${copy.cancel.couponStart} ${view.couponPercent}% ${copy.cancel.couponRemoved}`}
              </li>
            )}
            <li className={styles.outcome}>
              <span className={styles.outcomeIcon}>
                <CancelIcon name="refresh" />
              </span>
              {copy.cancel.reactivateLater}
            </li>
          </ul>
          <div className={styles.options}>
            <Button variant="danger" onClick={confirmCancel}>
              {copy.cancel.confirm}
            </Button>
            <Button variant="secondary" onClick={close}>
              {copy.cancel.keep}
            </Button>
          </div>
        </>
      )}
    </Sheet>
  );
}
