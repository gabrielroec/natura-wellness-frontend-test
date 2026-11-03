import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "quiet";
};

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
