import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  tone?: "default" | "paused" | "cancelled";
};

export function Card({ children, tone = "default" }: CardProps) {
  return <div className={`${styles.card} ${styles[tone]}`}>{children}</div>;
}
