import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "../components/Badge";
import { Card } from "../components/Card";
import styles from "./SummaryCard.module.css";

type SummaryCardProps = {
  tone?: "default" | "paused" | "cancelled";
  label: string;
  badge: string;
  badgeTone: BadgeTone;
  date: string;
  amount?: string;
  meta: string;
  note?: string;
  children: ReactNode;
};

export function SummaryCard({ tone, label, badge, badgeTone, date, amount, meta, note, children }: SummaryCardProps) {
  return (
    <Card tone={tone}>
      <div className={styles.top}>
        <h2 className={styles.label}>{label}</h2>
        <Badge label={badge} tone={badgeTone} />
      </div>
      <div className={styles.charge}>
        <p className={styles.date}>{date}</p>
        {amount && <p className={styles.amount}>{amount}</p>}
      </div>
      <p className={styles.meta}>{meta}</p>
      {note && <p className={styles.note}>{note}</p>}
      <div className={styles.action}>{children}</div>
    </Card>
  );
}
