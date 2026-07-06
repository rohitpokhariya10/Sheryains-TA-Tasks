import { FiCheckCircle, FiMessageSquare, FiRadio } from "react-icons/fi";
import { ProductMark } from "../../../shared/ui/components/ProductMark.jsx";
import styles from "./AuthForm.module.css";

export function AuthLayout({
  title,
  subtitle,
  error,
  fieldErrors = [],
  children,
  footer,
  onSubmit,
}) {
  return (
    <main className={styles.wrap}>
      <section className={styles.contextPanel}>
        <ProductMark />
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <span>Workspace activity</span>
            <FiRadio size={16} />
          </div>
          <div className={styles.previewRows}>
            <PreviewRow icon={<FiMessageSquare size={16} />} title="Support" meta="2m" />
            <PreviewRow icon={<FiCheckCircle size={16} />} title="Operations" meta="8m" />
            <PreviewRow icon={<FiMessageSquare size={16} />} title="Field team" meta="14m" />
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.card} onSubmit={onSubmit}>
          <span className={styles.eyebrow}>Account access</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          {error && (
            <div className={styles.error}>
              <span>{error}</span>
              {fieldErrors.length > 0 && (
                <ul>
                  {fieldErrors.map((item) => (
                    <li key={item.field}>{item.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {children}
          {footer}
        </form>
      </section>
    </main>
  );
}

function PreviewRow({ icon, title, meta }) {
  return (
    <div className={styles.previewRow}>
      <span className={styles.previewIcon}>{icon}</span>
      <span className={styles.previewText}>
        <strong>{title}</strong>
        <small>Updated {meta} ago</small>
      </span>
    </div>
  );
}
