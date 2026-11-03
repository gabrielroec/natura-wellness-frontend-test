import styles from "./Badge.module.css";

type BadgeProps = {
  label: string;
  tone?: "gold" | "green";
};

export function Badge({ label, tone = "gold" }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
