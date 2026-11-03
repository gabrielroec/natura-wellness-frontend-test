import { Card } from "../components/Card";
import { copy } from "./copy";
import styles from "./LoadingSkeleton.module.css";

function Bar({ size }: { size: "small" | "medium" | "large" | "wide" | "button" }) {
  return <div className={`${styles.bar} ${styles[size]}`} />;
}

function ProductRow() {
  return (
    <div className={styles.product}>
      <div className={`${styles.bar} ${styles.thumb}`} />
      <Bar size="medium" />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div role="status">
      <span className={styles.srOnly}>{copy.loading}</span>
      <div className={styles.stack} aria-hidden="true">
        <Card>
          <div className={`${styles.body} ${styles.next}`}>
            <Bar size="small" />
            <Bar size="large" />
            <Bar size="medium" />
            <Bar size="button" />
          </div>
        </Card>
        <Card>
          <div className={`${styles.body} ${styles.shipment}`}>
            <Bar size="small" />
            <ProductRow />
            <ProductRow />
            <Bar size="wide" />
            <Bar size="wide" />
            <Bar size="wide" />
          </div>
        </Card>
        <Card>
          <div className={`${styles.body} ${styles.manage}`}>
            <Bar size="small" />
            <Bar size="medium" />
            <Bar size="medium" />
            <Bar size="medium" />
          </div>
        </Card>
        <div className={styles.cancel} />
      </div>
    </div>
  );
}
