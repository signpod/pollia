import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  voteOption,
  unvoteOption,
  likePoll,
  unlikePoll,
  bookmarkPoll,
  unbookmarkPoll,
} from "@/lib/poll-api";
import type { Poll } from "@/types/dto/poll";

export const usePollMutations = (pollId: string) => {
  const queryClient = useQueryClient();

  const invalidatePoll = () => {
    queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
  };

  const voteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) =>
      voteOption(pollId, optionId),
    onSuccess: invalidatePoll,
    onError: (error) => console.error("투표 실패:", error),
  });

  const unvoteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) =>
      unvoteOption(pollId, optionId),
    onSuccess: invalidatePoll,
    onError: (error) => console.error("투표 취소 실패:", error),
  });

  const likeMutation = useMutation({
    mutationFn: () => likePoll(pollId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });
      const previousPoll = queryClient.getQueryData(["poll", pollId]);

      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: true,
          likeCount: old.likeCount + 1,
        };
      });

      return { previousPoll };
    },
    onError: (err, variables, context) => {
      if (context?.previousPoll) {
        queryClient.setQueryData(["poll", pollId], context.previousPoll);
      }
    },
    onSettled: invalidatePoll,
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePoll(pollId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });
      const previousPoll = queryClient.getQueryData(["poll", pollId]);

      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: false,
          likeCount: old.likeCount - 1,
        };
      });

      return { previousPoll };
    },
    onError: (err, variables, context) => {
      if (context?.previousPoll) {
        queryClient.setQueryData(["poll", pollId], context.previousPoll);
      }
    },
    onSettled: invalidatePoll,
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkPoll(pollId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });
      const previousPoll = queryClient.getQueryData(["poll", pollId]);

      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isBookmarked: true,
        };
      });

      return { previousPoll };
    },
    onError: (err, variables, context) => {
      if (context?.previousPoll) {
        queryClient.setQueryData(["poll", pollId], context.previousPoll);
      }
    },
    onSettled: invalidatePoll,
  });

  const unbookmarkMutation = useMutation({
    mutationFn: () => unbookmarkPoll(pollId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });
      const previousPoll = queryClient.getQueryData(["poll", pollId]);

      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isBookmarked: false,
        };
      });

      return { previousPoll };
    },
    onError: (err, variables, context) => {
      if (context?.previousPoll) {
        queryClient.setQueryData(["poll", pollId], context.previousPoll);
      }
    },
    onSettled: invalidatePoll,
  });

  return {
    vote: voteMutation,
    unvote: unvoteMutation,
    like: likeMutation,
    unlike: unlikeMutation,
    bookmark: bookmarkMutation,
    unbookmark: unbookmarkMutation,
  };
};

export type UsePollMutationsReturn = ReturnType<typeof usePollMutations>;
