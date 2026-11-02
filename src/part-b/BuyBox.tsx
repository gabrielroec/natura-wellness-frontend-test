import { useState } from "react";
import { Select } from "../components/Select";
import styles from "./BuyBox.module.css";
import { copy } from "./copy";
import { PurchaseOption } from "./PurchaseOption";

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#d8a23a" aria-hidden="true">
      <path d="M8 1.27 10.08 5.5l4.75.69-3.46 3.25.73 4.56L8 11.84 3.9 14l.73-4.56-3.46-3.25L5.92 5.5Z" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 6 11.5 13 4.5" stroke="#17402f" strokeWidth="1.8" />
    </svg>
  );
}

export function BuyBox() {
  const [option, setOption] = useState<"oneTime" | "subscribe">("subscribe");
  const [frequency, setFrequency] = useState(copy.subscribe.frequencyOptions[0]);

  return (
    <main className={styles.page}>
      <div className={styles.photoCard}>
        <img className={styles.photo} src="/product.jpg" alt={copy.title} width={500} height={500} />
      </div>
      <div>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <div className={styles.rating}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} />
            ))}
          </div>
          <span className={styles.ratingValue}>{copy.rating}</span>
          <a className={styles.reviews} href="#reviews">
            {copy.reviewCount}
          </a>
        </div>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
        <hr className={styles.divider} />
        <div className={styles.options} role="radiogroup" aria-label="Purchase option">
          <PurchaseOption
            label={copy.oneTime.label}
            priceCents={copy.oneTime.priceCents}
            selected={option === "oneTime"}
            onSelect={() => setOption("oneTime")}
          />
          <PurchaseOption
            label={copy.subscribe.label}
            priceCents={copy.subscribe.priceCents}
            comparePriceCents={copy.subscribe.comparePriceCents}
            badge={copy.subscribe.badge}
            selected={option === "subscribe"}
            onSelect={() => setOption("subscribe")}
          >
            {option === "subscribe" && (
              <>
                <label className={styles.frequency}>
                  {copy.subscribe.frequencyLabel}
                  <Select value={frequency} options={copy.subscribe.frequencyOptions} onChange={setFrequency} />
                </label>
                <ul className={styles.perks}>
                  {copy.subscribe.perks.map((perk) => (
                    <li key={perk} className={styles.perk}>
                      <Check />
                      {perk}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </PurchaseOption>
        </div>
      </div>
    </main>
  );
}
