import { deleteAnswer } from "@/actions/action-answer";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string) => {
      return deleteAnswer(answerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.all });
    },
  });
}
