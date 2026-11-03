import styles from "./Badge.module.css";

export type BadgeTone = "gold" | "green" | "neutral";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "gold" }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
