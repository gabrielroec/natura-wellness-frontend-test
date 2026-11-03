import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Sheet.module.css";

type SheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  locked?: boolean;
  children: ReactNode;
};

const DOUBLE_TAP_MS = 400;

export function Sheet({ open, title, onClose, locked = false, children }: SheetProps) {
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
        <h2 id={titleId} className={styles.title} ref={heading} tabIndex={-1}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
