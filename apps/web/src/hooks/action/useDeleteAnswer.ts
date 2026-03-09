import { deleteAnswer } from "@/actions/action-answer";
import { toMutationFn } from "@/actions/common/error";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toMutationFn(deleteAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.all() });
    },
  });
}
