import { motion, useReducedMotion } from "framer-motion";
import styles from "./Ticks.module.css";

const pathOne = "M2.2 8.2 5.9 11.8 13.8 3.8";
const pathTwo = "M8.4 11.5 16.2 3.8";

export function Ticks({ status, pending }) {
  const reduceMotion = useReducedMotion();

  if (pending) return <span className={styles.clock}>•</span>;

  const isDelivered = status === "delivered" || status === "read";
  const isRead = status === "read";
  const draw = reduceMotion
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: 1, opacity: 1 };
  const initial = reduceMotion ? false : { pathLength: 0, opacity: 0 };

  return (
    <span className={`${styles.wrap} ${isRead ? styles.read : ""}`}>
      {isRead && !reduceMotion && (
        <motion.span
          className={styles.ripple}
          initial={{ scale: 0.45, opacity: 0.32 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
      <svg
        className={styles.svg}
        viewBox="0 0 19 15"
        aria-label={isRead ? "Read" : isDelivered ? "Delivered" : "Sent"}
        role="img"
      >
        <motion.path
          d={pathOne}
          initial={initial}
          animate={draw}
          transition={{ duration: 0.22, ease: "easeOut" }}
        />
        {isDelivered && (
          <motion.path
            d={pathTwo}
            initial={initial}
            animate={draw}
            transition={{ duration: 0.22, delay: reduceMotion ? 0 : 0.08, ease: "easeOut" }}
          />
        )}
      </svg>
    </span>
  );
}
