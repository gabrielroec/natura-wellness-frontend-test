import styles from "./Select.module.css";

type SelectProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function Select({ value, options, onChange }: SelectProps) {
  return (
    <span className={styles.wrapper}>
      <select className={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2.5 4.5 6 8l3.5-3.5" stroke="#4a5550" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
