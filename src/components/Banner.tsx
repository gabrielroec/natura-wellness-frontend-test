import type { Ref } from "react";
import styles from "./Banner.module.css";

export type BannerTone = "success" | "info";

type BannerProps = {
  message: string;
  tone?: BannerTone;
  dismissLabel: string;
  onDismiss: () => void;
  ref?: Ref<HTMLDivElement>;
};

export function Banner({ message, tone = "success", dismissLabel, onDismiss, ref }: BannerProps) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} ref={ref} tabIndex={-1}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
        {tone === "success" ? (
          <path d="M3 8.5 6 11.5 13 4.5" strokeWidth="1.8" />
        ) : (
          <>
            <circle cx="8" cy="8" r="6.25" strokeWidth="1.5" />
            <path d="M8 7.25v3.5M8 5v1.25" strokeWidth="1.5" />
          </>
        )}
      </svg>
      <p className={styles.message}>{message}</p>
      <button className={styles.dismiss} type="button" aria-label={dismissLabel} onClick={onDismiss}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="m4 4 8 8M12 4l-8 8" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
