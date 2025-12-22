import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useStartSurveyResponse } from ".";
import { useReadMissionParticipantInfo } from "../participant";
import { useReadMissionResponseForMission } from "./useReadMissionResponseForMission";

export function useCreateMissionResponse({ missionId }: { missionId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
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
      toast.warning(error.message || "설문 응답을 시작할 수 없습니다.", { id: "init-error" });
      router.push(ROUTES.MISSION(missionId));
    },
  });

  const { data: missionParticipantInfo } = useReadMissionParticipantInfo(missionId);
  const { currentParticipants, maxParticipants } = missionParticipantInfo?.data ?? {};
  const hasParticipantCapacity =
    !!currentParticipants && !!maxParticipants && currentParticipants < maxParticipants;

  const isOverMaxParticipants =
    !!currentParticipants && !!maxParticipants && currentParticipants >= maxParticipants;

  const isParticipant = Boolean(
    missionResponse?.data?.id && missionResponse.data.completedAt === null,
  );

  const canStartResponse =
    (isParticipant && isOverMaxParticipants) || (!isParticipant && hasParticipantCapacity);

  return {
    canStartResponse,
    startResponse,
  };
}
