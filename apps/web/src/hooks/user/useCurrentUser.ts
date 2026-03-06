import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });
};

export type UseCurrentUserReturn = ReturnType<typeof useCurrentUser>;
