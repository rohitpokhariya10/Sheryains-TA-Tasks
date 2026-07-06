import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { usersApi } from "../api/users.api.js";
import { setUser } from "../../auth/state/authSlice.js";

/** Debounced-friendly user search (enabled only when a term is present). */
export function useUserSearch(term) {
  return useQuery({
    queryKey: ["userSearch", term],
    queryFn: () => usersApi.search(term),
    enabled: Boolean(term && term.trim().length >= 1),
  });
}

/** Update profile; syncs the returned user back into auth state. */
export function useUpdateProfile() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (user) => {
      dispatch(setUser(user));
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
