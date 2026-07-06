import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCredentials, setStatus } from "../state/authSlice.js";
import { setAccessToken as setAxiosToken } from "../../../lib/axios.js";

const baseURL = import.meta.env.VITE_API_URL || "";

/**
 * On first load there is no access token in memory (it isn't persisted).
 * We attempt a silent refresh using the httpOnly cookie; on success the user
 * is restored, otherwise they stay logged out.
 */
export function useSessionBootstrap() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      dispatch(setStatus("loading"));
      try {
        const res = await axios.post(
          `${baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (cancelled) return;
        const { user, accessToken } = res.data.data;
        setAxiosToken(accessToken);
        dispatch(setCredentials({ user, accessToken }));
      } catch {
        if (!cancelled) dispatch(setStatus("unauthenticated"));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return ready;
}
