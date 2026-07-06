import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout.jsx";
import { useAuthActions } from "../hooks/useAuth.js";
import styles from "./AuthForm.module.css";

export function RegisterPage() {
  const { register } = useAuthActions();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    register.mutate(form);
  };

  const errorMsg =
    register.error?.response?.data?.message || register.error?.message;
  const fieldErrors = register.error?.response?.data?.errors || [];

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your workspace profile."
      error={errorMsg}
      fieldErrors={fieldErrors}
      onSubmit={onSubmit}
      footer={
        <p className={styles.switch}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      }
    >
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />
        </div>

        <div className={styles.field}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={onChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>

        <button className={styles.submit} disabled={register.isPending}>
          {register.isPending ? "Creating..." : "Create account"}
        </button>
    </AuthLayout>
  );
}
