import styles from "./BuyBox.module.css";
import { copy } from "./copy";

export function BuyBox() {
  return (
    <main className={styles.page}>
      <div className={styles.photoCard}>
        <img className={styles.photo} src="/product.jpg" alt={copy.title} width={500} height={500} />
      </div>
    </main>
  );
}
