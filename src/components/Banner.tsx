import type { Ref } from "react";
import styles from "./Banner.module.css";

type BannerProps = {
  message: string;
  dismissLabel: string;
  onDismiss: () => void;
  ref?: Ref<HTMLDivElement>;
};

export function Banner({ message, dismissLabel, onDismiss, ref }: BannerProps) {
  return (
    <div className={styles.banner} ref={ref} tabIndex={-1}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8.5 6 11.5 13 4.5" stroke="#17402f" strokeWidth="1.8" />
      </svg>
      <p className={styles.message}>{message}</p>
      <button className={styles.dismiss} type="button" aria-label={dismissLabel} onClick={onDismiss}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 4 8 8M12 4l-8 8" stroke="#17402f" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
