import { FiMessageCircle } from "react-icons/fi";
import { PRODUCT } from "../../config/product.js";
import styles from "./ProductMark.module.css";

export function ProductMark({ compact = false }) {
  return (
    <div className={`${styles.mark} ${compact ? styles.compact : ""}`}>
      <span className={styles.icon}>
        <FiMessageCircle size={compact ? 18 : 22} />
      </span>
      {!compact && (
        <span className={styles.copy}>
          <strong>{PRODUCT.name}</strong>
          <small>{PRODUCT.tagline}</small>
        </span>
      )}
    </div>
  );
}
