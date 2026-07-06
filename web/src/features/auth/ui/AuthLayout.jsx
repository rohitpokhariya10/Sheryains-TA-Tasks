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
