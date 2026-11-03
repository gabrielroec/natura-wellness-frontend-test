import { useEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { copy } from "./copy";
import styles from "./LoadFailed.module.css";

type LoadFailedProps = {
  errorStatus: number | null;
  onRetry: () => void;
};

export function LoadFailed({ errorStatus, onRetry }: LoadFailedProps) {
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
        {!notFound && (
          <div className={styles.action}>
            <Button onClick={onRetry}>{copy.loadFailed.retry}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
