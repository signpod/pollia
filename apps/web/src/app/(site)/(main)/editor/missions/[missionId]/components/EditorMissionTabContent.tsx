"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { Separator } from "@/components/ui/separator";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { GetMissionResponse } from "@/types/dto";
import { type PaymentType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ActionSettingsCard } from "./ActionSettingsCard";
import { CompletionSettingsCard } from "./CompletionSettingsCard";
import { EditorBottomSaveSlot } from "./EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { ProjectBasicInfoCard } from "./ProjectBasicInfoCard";
import { RewardSettingsCard } from "./RewardSettingsCard";
import { useEditorMissionController } from "./controllers/useEditorMissionController";
import { EditorMissionActionBar } from "./views/EditorMissionActionBar";

interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
  paymentType: PaymentType;
  scheduledDate: Date | null;
}

interface EditorMissionTabContentProps {
  missionId: string;
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

function MissionIntroPreview({ missionId }: { missionId: string }) {
  const previewUrl = ROUTES.MISSION(missionId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [previewUrl]);

  return (
    <div className="relative h-[calc(100vh-120px)] min-h-[720px] w-full overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="size-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-500" />
        </div>
      )}
      <iframe
        title="프로젝트 인트로 미리보기"
        src={previewUrl}
        className="h-full w-full border-0"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export function EditorMissionTabContent({
  missionId,
  mission,
  reward,
}: EditorMissionTabContentProps) {
  const { currentTab } = useEditorMissionTab();
  const missionQuery = useReadMission(missionId);
  const actionsQuery = useReadActionsDetail(missionId);
  const completionsQuery = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const { refs, sectionBindings, viewState, actions } = useEditorMissionController({
    missionId,
    mission,
    currentTab,
    missionQueryData: missionQuery.data?.data,
    actionsQueryData: actionsQuery.data?.data,
    completionsQueryData: completionsQuery.data?.data,
    isActionsLoading: actionsQuery.isLoading,
    isCompletionsLoading: completionsQuery.isLoading,
    refetchMission: missionQuery.refetch,
    refetchActions: actionsQuery.refetch,
    refetchCompletions: completionsQuery.refetch,
  });

  const saveButtonNode = useMemo(
    () => (
      <EditorMissionActionBar
        isPublished={viewState.isPublished}
        isSavingAll={viewState.isSavingAll}
        isPublishing={viewState.isPublishing}
        hasAnyBusySection={viewState.hasAnyBusySection}
        hasAnyPendingChanges={viewState.hasAnyPendingChanges}
        canPublish={viewState.canPublish}
        onSave={() => {
          void actions.onSave();
        }}
        onPublish={() => {
          void actions.onPublish();
        }}
      />
    ),
    [
      actions,
      viewState.canPublish,
      viewState.hasAnyBusySection,
      viewState.hasAnyPendingChanges,
      viewState.isPublished,
      viewState.isPublishing,
      viewState.isSavingAll,
    ],
  );

  if (currentTab === "stats") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey={`editor-mission-save:${missionId}`}
          isActive={false}
          node={saveButtonNode}
        />
        <MissionStatsDashboard missionId={missionId} />
      </>
    );
  }

  if (currentTab === "preview") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey={`editor-mission-save:${missionId}`}
          isActive={false}
          node={saveButtonNode}
        />
        <MissionIntroPreview missionId={missionId} />
      </>
    );
  }

  return (
    <>
      <EditorBottomSaveSlot
        slotKey={`editor-mission-save:${missionId}`}
        isActive={currentTab === "editor"}
        node={saveButtonNode}
      />
      <EditorMissionDraftProvider>
        <ProjectBasicInfoCard
          ref={refs.basicInfoRef}
          mission={mission}
          onSaveStateChange={sectionBindings.onBasicStateChange}
        />
        <Separator className="h-2" />
        <RewardSettingsCard
          ref={refs.rewardRef}
          mission={mission}
          initialReward={reward}
          onSaveStateChange={sectionBindings.onRewardStateChange}
        />
        <Separator className="h-2" />
        <ActionSettingsCard
          ref={refs.actionRef}
          missionId={mission.id}
          onSaveStateChange={sectionBindings.onActionStateChange}
          getCompletionDraftSnapshot={sectionBindings.getCompletionDraftSnapshot}
          completionWorkingSetVersion={sectionBindings.completionWorkingSetVersion}
          onWorkingSetChange={sectionBindings.onActionWorkingSetChange}
        />
        <Separator className="h-2" />
        <CompletionSettingsCard
          ref={refs.completionRef}
          missionId={mission.id}
          onSaveStateChange={sectionBindings.onCompletionStateChange}
          onWorkingSetChange={sectionBindings.onCompletionWorkingSetChange}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
