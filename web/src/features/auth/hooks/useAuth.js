import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api.js";
import {
  setCredentials,
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
} from "../state/authSlice.js";
import { setAccessToken as setAxiosToken } from "../../../lib/axios.js";
import { disconnectSocket } from "../../../lib/socket.js";

/** Convenience selectors for the current auth state. */
export function useCurrentUser() {
  return useSelector(selectCurrentUser);
}

export function useIsAuthenticated() {
  return useSelector(selectIsAuthenticated);
}

/** Login/register/logout mutations wired into Redux + axios + socket. */
export function useAuthActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const applyCredentials = ({ user, accessToken }) => {
    setAxiosToken(accessToken);
    dispatch(setCredentials({ user, accessToken }));
  };

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      applyCredentials(data);
      navigate("/", { replace: true });
    },
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      applyCredentials(data);
      navigate("/", { replace: true });
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setAxiosToken(null);
      disconnectSocket();
      dispatch(logoutAction());
      navigate("/login", { replace: true });
    },
  });

  return { login, register, logout };
}
