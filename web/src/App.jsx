import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.jsx";
import { useSessionBootstrap } from "./features/auth/hooks/useSessionBootstrap.js";
import { registerAuthHandlers, setAccessToken } from "./lib/axios.js";
import { store } from "./app/store.js";
import { setCredentials, logout } from "./features/auth/state/authSlice.js";
import { Spinner } from "./shared/ui/components/Spinner.jsx";
import styles from "./App.module.css";

// Wire the axios refresh interceptor to Redux (kept out of the store module
// to avoid a circular dependency between axios and the slice).
registerAuthHandlers({
  onToken: (token, user) => {
    setAccessToken(token);
    store.dispatch(setCredentials({ accessToken: token, user }));
  },
  onLogoutHandler: () => {
    setAccessToken(null);
    store.dispatch(logout());
  },
});

/**
 * App root: performs a silent session restore before rendering the router so
 * a refresh doesn't flash the login screen for authenticated users.
 */
export default function App() {
  const ready = useSessionBootstrap();

  if (!ready) {
    return (
      <div className={styles.boot}>
        <Spinner center />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
