import { useQuery } from "@tanstack/react-query";
import { getPollUserStatus } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";

export const useGetPollUserStatus = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.userPollStatus(pollId),
    queryFn: () => {
      return getPollUserStatus(pollId);
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
