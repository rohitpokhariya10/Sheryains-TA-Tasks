import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout.jsx";
import { PRODUCT } from "../../../shared/config/product.js";
import { useAuthActions } from "../hooks/useAuth.js";
import styles from "./AuthForm.module.css";

export function LoginPage() {
  const { login } = useAuthActions();
  const [form, setForm] = useState({ identifier: "", password: "" });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate(form);
  };

  const errorMsg =
    login.error?.response?.data?.message || login.error?.message;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your workspace."
      error={errorMsg}
      onSubmit={onSubmit}
      footer={
        <p className={styles.switch}>
          New to {PRODUCT.name}? <Link to="/register">Create an account</Link>
        </p>
      }
    >
        <div className={styles.field}>
          <label htmlFor="identifier">Email or username</label>
          <input
            id="identifier"
            name="identifier"
            value={form.identifier}
            onChange={onChange}
            autoComplete="username"
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
            autoComplete="current-password"
            required
          />
        </div>

        <button className={styles.submit} disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign in"}
        </button>
    </AuthLayout>
  );
}
