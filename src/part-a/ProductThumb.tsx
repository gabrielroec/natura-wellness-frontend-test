import styles from "./ProductThumb.module.css";

type ProductThumbProps = {
  name: string;
  imageUrl: string | null;
  muted?: boolean;
};

export function ProductThumb({ name, imageUrl, muted = false }: ProductThumbProps) {
  const tone = muted ? `${styles.thumb} ${styles.muted}` : styles.thumb;

  if (imageUrl) return <img className={tone} src={imageUrl} alt="" width={56} height={56} />;
  return (
    <span className={`${tone} ${styles.placeholder}`} aria-hidden="true">
      {name[0]}
    </span>
  );
}
