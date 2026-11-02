import styles from "./App.module.css";
import { SubscriptionCard } from "./part-a/SubscriptionCard";
import { BuyBox } from "./part-b/BuyBox";

const part = new URLSearchParams(window.location.search).get("part") === "b" ? "b" : "a";

const links = [
  { part: "a", href: "?part=a&fixture=active", label: "My subscriptions" },
  { part: "b", href: "?part=b", label: "Buy now" },
];

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Natura Wellness</span>
        <nav className={styles.nav}>
          {links.map((link) => (
            <a
              key={link.part}
              className={styles.link}
              href={link.href}
              aria-current={link.part === part ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      {part === "a" ? <SubscriptionCard /> : <BuyBox />}
    </div>
  );
}
