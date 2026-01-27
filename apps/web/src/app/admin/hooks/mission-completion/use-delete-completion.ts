"use client";

import { deleteMissionCompletion } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (completionId: string) => deleteMissionCompletion(completionId),
    onSuccess: () => {
      toast.success("완료 화면이 삭제되었습니다.");
      queryClient.invalidateQueries({
        queryKey: adminMissionCompletionQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      const message =
        error.cause === 403
          ? "삭제 권한이 없습니다."
          : error.cause === 404
            ? "완료 화면을 찾을 수 없습니다."
            : "완료 화면 삭제에 실패했습니다.";
      toast.error(message);
    },
  });
}

export type UseDeleteCompletionReturn = ReturnType<typeof useDeleteCompletion>;
