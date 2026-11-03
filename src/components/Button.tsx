import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quiet";
  disabled?: boolean;
};

export function Button({ children, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      type="button"
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}
