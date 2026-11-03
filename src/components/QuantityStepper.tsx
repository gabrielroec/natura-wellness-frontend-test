import styles from "./QuantityStepper.module.css";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  itemName?: string;
};

export function QuantityStepper({ value, onChange, itemName }: QuantityStepperProps) {
  const of = itemName ? ` of ${itemName}` : "";

  return (
    <div className={styles.stepper}>
      <button
        className={styles.button}
        type="button"
        aria-label={`Decrease quantity${of}`}
        aria-disabled={value === 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#4a5550" aria-hidden="true">
          <path d="M3.05 8.47h9.15v1.68H3.05z" />
        </svg>
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button className={styles.button} type="button" aria-label={`Increase quantity${of}`} onClick={() => onChange(value + 1)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#4a5550" aria-hidden="true">
          <path d="M7.54 4.59h1.65v3.94h3.89v1.55H9.19v3.94H7.54v-3.94H3.66V8.53h3.88z" />
        </svg>
      </button>
    </div>
  );
}
