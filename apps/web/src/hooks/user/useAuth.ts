import { useCallback } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useLoginModal } from "@/components/providers/LoginModalProvider";

export function useAuth() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { open: openLoginModal } = useLoginModal();

  const isLoggedIn = !!currentUser.id;

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (!isLoggedIn) {
        openLoginModal();
        return false;
      }
      onSuccess?.();
      return true;
    },
    [isLoggedIn, openLoginModal]
  );

  const withAuth = useCallback(
    <T extends any[]>(action: (...args: T) => void) => {
      return (...args: T) => {
        if (requireAuth()) {
          action(...args);
        }
      };
    },
    [requireAuth]
  );

  return {
    user: currentUser,
    isLoggedIn,
    isLoading,
    requireAuth,
    withAuth,
    openLoginModal,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
