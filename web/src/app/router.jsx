import { createBrowserRouter } from "react-router-dom";
import { RequireAuth, RedirectIfAuth } from "./RequireAuth.jsx";
import { ChatLayout } from "../features/chats/ui/ChatLayout.jsx";
import { LoginPage } from "../features/auth/ui/LoginPage.jsx";
import { RegisterPage } from "../features/auth/ui/RegisterPage.jsx";

/** React Router data router. */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuth>
        <RegisterPage />
      </RedirectIfAuth>
    ),
  },
  {
    element: <RequireAuth />,
    children: [{ path: "/", element: <ChatLayout /> }],
  },
]);
