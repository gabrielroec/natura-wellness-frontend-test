import { useId, useRef, useState } from "react";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { copy } from "./copy";
import styles from "./SupportSheet.module.css";

const SIMULATED_SEND_MS = 700;

type SupportSheetProps = {
  open: boolean;
  subject: string;
  reference: string | null;
  onClose: () => void;
};

export function SupportSheet({ open, subject, reference, onClose }: SupportSheetProps) {
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();
  const errorId = useId();

  function send() {
    if (!message.trim()) {
      setMissing(true);
      field.current?.focus();
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, SIMULATED_SEND_MS);
  }

  function close() {
    setMessage("");
    setMissing(false);
    setSent(false);
    onClose();
  }

  return (
    <Sheet open={open} title={sent ? copy.support.sentTitle : copy.support.title} onClose={close} locked={sending}>
      {sent ? (
        <p className={styles.sent} role="status">
          {copy.support.sentBody}
        </p>
      ) : (
        <>
          <dl className={styles.details}>
            <div className={styles.row}>
              <dt>{copy.support.subject}</dt>
              <dd>{subject}</dd>
            </div>
            {reference && (
              <div className={styles.row}>
                <dt>{copy.support.reference}</dt>
                <dd>{reference}</dd>
              </div>
            )}
          </dl>
          <label className={styles.label} htmlFor={fieldId}>
            {copy.support.message}
          </label>
          <textarea
            id={fieldId}
            ref={field}
            className={styles.field}
            rows={4}
            value={message}
            readOnly={sending}
            aria-invalid={missing || undefined}
            aria-describedby={missing ? errorId : undefined}
            onChange={(event) => {
              setMessage(event.target.value);
              setMissing(false);
            }}
          />
          {missing && (
            <p id={errorId} className={styles.error} role="alert">
              {copy.support.required}
            </p>
          )}
        </>
      )}
      <div className={styles.actions}>
        {!sent && (
          <Button onClick={send} disabled={sending}>
            {sending ? copy.support.sending : copy.support.send}
          </Button>
        )}
        <Button variant="secondary" onClick={close} disabled={sending}>
          {copy.support.close}
        </Button>
      </div>
    </Sheet>
  );
}
