import styles from "./ActionRow.module.css";

type ActionRowProps = {
  label: string;
  detail: string;
  onClick?: () => void;
};

export function ActionRow({ label, detail, onClick }: ActionRowProps) {
  return (
    <button className={styles.row} type="button" onClick={onClick}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.detail}>{detail}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m6 3.5 4.5 4.5L6 12.5" stroke="#4a5550" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
