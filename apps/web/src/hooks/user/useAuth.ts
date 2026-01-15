import { useCallback } from "react";
import { useCurrentUser } from "./useCurrentUser";

export function useAuth() {
  const { data: currentUser, isLoading } = useCurrentUser();

  const isLoggedIn = !!currentUser?.id;

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (!isLoggedIn) {
        return false;
      }
      onSuccess?.();
      return true;
    },
    [isLoggedIn],
  );

  const withAuth = useCallback(
    <T extends unknown[]>(action: (...args: T) => void) => {
      return (...args: T) => {
        if (requireAuth()) {
          action(...args);
        }
      };
    },
    [requireAuth],
  );

  return {
    user: currentUser,
    isLoggedIn,
    isLoading,
    requireAuth,
    withAuth,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
