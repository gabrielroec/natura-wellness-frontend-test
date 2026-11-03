import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Sheet.module.css";

type SheetProps = {
  open: boolean;
  title: string;
  display?: boolean;
  eyebrow?: ReactNode;
  onClose: () => void;
  locked?: boolean;
  children: ReactNode;
};

const DOUBLE_TAP_MS = 400;

export function Sheet({ open, title, display = false, eyebrow, onClose, locked = false, children }: SheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const openedAt = useRef(0);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      heading.current?.focus();
      openedAt.current = performance.now();
    }
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (dialog.current?.open) {
      heading.current?.focus();
      openedAt.current = performance.now();
    }
  }, [title]);

  function requestClose() {
    if (!locked) onClose();
  }

  return (
    <dialog
      ref={dialog}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClickCapture={(event) => {
        if (performance.now() - openedAt.current < DOUBLE_TAP_MS) event.stopPropagation();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className={styles.content}>
        {eyebrow}
        <h2 id={titleId} className={display ? styles.display : styles.title} ref={heading} tabIndex={-1}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
