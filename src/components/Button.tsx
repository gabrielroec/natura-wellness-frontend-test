import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "quiet";
  disabled?: boolean;
  label?: string;
};

export function Button({ children, onClick, variant = "primary", disabled = false, label }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      type="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}
