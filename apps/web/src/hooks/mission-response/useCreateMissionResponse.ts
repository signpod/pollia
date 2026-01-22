import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useStartSurveyResponse } from ".";

export function useCreateMissionResponse({ missionId }: { missionId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const startResponse = useStartSurveyResponse({
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.mission(missionId) });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.userAnswerStatus(missionId) });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.missionParticipant(missionId) });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.missionPassword(missionId) });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.all() });
      queryClient.invalidateQueries({ queryKey: missionQueryKeys.userMissions() });
    },
    onError: (error: Error) => {
      toast.warning(error.message || "미션을 시작 할 수 없어요", { id: "init-error" });
      router.push(ROUTES.MISSION(missionId));
    },
  });

  return {
    startResponse,
  };
}
