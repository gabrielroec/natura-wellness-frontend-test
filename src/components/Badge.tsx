import styles from "./Badge.module.css";

type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return <span className={styles.badge}>{label}</span>;
}
