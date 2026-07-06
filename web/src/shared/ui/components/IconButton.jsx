import styles from "./IconButton.module.css";

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const variantClass = {
  ghost: styles.ghost,
  muted: styles.muted,
  primary: styles.primary,
  danger: styles.danger,
};

export function IconButton({
  children,
  className = "",
  label,
  size = "md",
  variant = "ghost",
  ...props
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`${styles.button} ${sizeClass[size]} ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
