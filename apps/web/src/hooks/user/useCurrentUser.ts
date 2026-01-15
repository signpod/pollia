import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { UserRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
    select: data => data.data,
    initialData: {
      data: {
        id: "",
        email: "",
        phone: null,
        name: "",
        role: UserRole.USER,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseCurrentUserReturn = ReturnType<typeof useCurrentUser>;
