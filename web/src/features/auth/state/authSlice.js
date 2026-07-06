import { createSlice } from "@reduxjs/toolkit";

/**
 * Auth state. The access token lives here (in memory) as required — never in
 * localStorage. The refresh token is an httpOnly cookie handled by the server.
 */
const initialState = {
  user: null,
  accessToken: null,
  status: "idle", // idle | loading | authenticated | unauthenticated
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      if (user !== undefined) state.user = user;
      if (accessToken !== undefined) state.accessToken = accessToken;
      state.status = "authenticated";
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, setUser, setAccessToken, setStatus, logout } =
  authSlice.actions;

export const selectAuth = (s) => s.auth;
export const selectCurrentUser = (s) => s.auth.user;
export const selectAccessToken = (s) => s.auth.accessToken;
export const selectIsAuthenticated = (s) => Boolean(s.auth.accessToken);

export default authSlice.reducer;
