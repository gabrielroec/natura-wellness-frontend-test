import { Card } from "../components/Card";
import { copy } from "./copy";
import styles from "./LoadingSkeleton.module.css";

export function LoadingSkeleton() {
  return (
    <div role="status">
      <span className={styles.srOnly}>{copy.loading}</span>
      <div className={styles.stack} aria-hidden="true">
        <Card>
          <div className={`${styles.bar} ${styles.small}`} />
          <div className={`${styles.bar} ${styles.large}`} />
          <div className={`${styles.bar} ${styles.medium}`} />
        </Card>
        <Card>
          <div className={`${styles.bar} ${styles.medium}`} />
          <div className={`${styles.bar} ${styles.medium}`} />
        </Card>
      </div>
    </div>
  );
}
