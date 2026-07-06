import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/state/authSlice.js";
import { SocketProvider } from "./SocketProvider.jsx";

/** Guards authenticated routes and mounts the realtime socket layer. */
export function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

/** Redirects already-authenticated users away from login/register. */
export function RedirectIfAuth({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
