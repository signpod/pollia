"use client";

import { toggleMissionLike } from "@/actions/mission-like/toggle";
import { toast } from "@/components/common/Toast";
import { missionLikeQueryKeys } from "@/constants/queryKeys/missionLikeQueryKeys";
import type { ToggleMissionLikeResponse } from "@/types/dto/mission-like";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type LikeStatusCache = { data: { isLiked: boolean; likesCount: number } };

interface MissionLikeContext {
  previousData: LikeStatusCache | undefined;
}

const LIKE_MESSAGES = {
  error: "좋아요 처리 중 오류가 발생했어요.",
} as const;

export const useMissionLike = (missionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ToggleMissionLikeResponse, Error, void, MissionLikeContext>({
    mutationFn: async () => {
      return await toggleMissionLike({ missionId });
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: missionLikeQueryKeys.likeStatus(missionId),
      });

      const previousData = queryClient.getQueryData<LikeStatusCache>(
        missionLikeQueryKeys.likeStatus(missionId),
      );

      queryClient.setQueryData<LikeStatusCache>(
        missionLikeQueryKeys.likeStatus(missionId),
        oldData => {
          if (!oldData) return { data: { isLiked: true, likesCount: 1 } };
          const { isLiked, likesCount } = oldData.data;
          return {
            data: {
              isLiked: !isLiked,
              likesCount: isLiked ? Math.max(0, likesCount - 1) : likesCount + 1,
            },
          };
        },
      );

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: missionLikeQueryKeys.likeStatus(missionId),
      });
      queryClient.invalidateQueries({
        queryKey: missionLikeQueryKeys.likedMissions(),
      });
    },

    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(missionLikeQueryKeys.likeStatus(missionId), context.previousData);
      }
      toast.warning(LIKE_MESSAGES.error);
    },
  });
};

export type UseMissionLikeReturn = ReturnType<typeof useMissionLike>;
