import { useEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { copy } from "./copy";
import styles from "./LoadFailed.module.css";

type LoadFailedProps = {
  errorStatus: number | null;
  onRetry: () => void;
  onContactSupport: () => void;
};

export function LoadFailed({ errorStatus, onRetry, onContactSupport }: LoadFailedProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const notFound = errorStatus === 404;
  const text = notFound ? copy.notFound : copy.loadFailed;

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div role="alert">
      <Card>
        <h2 className={styles.title} ref={heading} tabIndex={-1}>
          {text.title}
        </h2>
        <p className={styles.body}>{text.body}</p>
        <div className={styles.actions}>
          {!notFound && <Button onClick={onRetry}>{copy.loadFailed.retry}</Button>}
          <Button variant={notFound ? "primary" : "secondary"} onClick={onContactSupport}>
            {copy.skip.contact}
          </Button>
        </div>
      </Card>
    </div>
  );
}
