import styles from "./Spinner.module.css";

export function Spinner({ center = false }) {
  const spinner = <span className="wa-spinner" />;
  if (!center) return spinner;
  return <div className={styles.center}>{spinner}</div>;
}
