import styles from "./RadioGroup.module.css";

type RadioGroupProps = {
  name: string;
  legend: string;
  options: { value: number; label: string; detail?: string }[];
  value: number;
  onChange: (value: number) => void;
};

export function RadioGroup({ name, legend, options, value, onChange }: RadioGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={option.value === value ? `${styles.option} ${styles.selected}` : styles.option}>
          <input
            className={styles.radio}
            type="radio"
            name={name}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.label}>{option.label}</span>
          {option.detail && <span className={styles.detail}>{option.detail}</span>}
        </label>
      ))}
    </fieldset>
  );
}
