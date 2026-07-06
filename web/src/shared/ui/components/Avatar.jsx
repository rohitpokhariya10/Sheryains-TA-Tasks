import { FiUser, FiUsers } from "react-icons/fi";
import { initials } from "../lib/format.js";
import styles from "./Avatar.module.css";

/**
 * Round avatar that renders the ImageKit url when available, otherwise a
 * placeholder (initials for people, a group icon for groups).
 */
export function Avatar({ src, name, size = 44, group = false }) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      <img className={styles.avatar} style={dimension} src={src} alt={name || ""} />
    );
  }

  return (
    <div className={styles.placeholder} style={dimension}>
      {group ? (
        <FiUsers size={size * 0.5} />
      ) : name ? (
        <span style={{ fontSize: size * 0.4 }}>{initials(name)}</span>
      ) : (
        <FiUser size={size * 0.5} />
      )}
    </div>
  );
}
