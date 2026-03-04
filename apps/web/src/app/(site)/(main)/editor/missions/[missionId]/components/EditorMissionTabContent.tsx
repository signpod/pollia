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
import { useCallback, useEffect, useMemo, useState } from "react";
import { type ActionSectionDraftSnapshot, ActionSettingsCard } from "./ActionSettingsCard";
import {
  type CompletionSectionDraftSnapshot,
  CompletionSettingsCard,
} from "./CompletionSettingsCard";
import { EditorBottomSaveSlot } from "./EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { ProjectBasicInfoCard } from "./ProjectBasicInfoCard";
import { RewardSettingsCard } from "./RewardSettingsCard";
import { useEditorMissionController } from "./controllers/useEditorMissionController";
import { EditorDesktopAbsolute } from "./desktop/EditorDesktopAbsolute";
import { EditorDesktopFlowPanel } from "./desktop/EditorDesktopFlowPanel";
import { EditorDesktopMobilePanel } from "./desktop/EditorDesktopMobilePanel";
import { resolveEditorDesktopFlowPolicy } from "./editor-desktop-flow-policy";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";
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
    if (!previewUrl) {
      return;
    }
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
  const [cachedActionDraftSnapshot, setCachedActionDraftSnapshot] =
    useState<ActionSectionDraftSnapshot | null>(null);
  const [cachedCompletionDraftSnapshot, setCachedCompletionDraftSnapshot] =
    useState<CompletionSectionDraftSnapshot | null>(null);
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
  const effectiveMission = missionQuery.data?.data ?? mission;
  const serverActions = actionsQuery.data?.data;
  const serverCompletions = completionsQuery.data?.data;

  const handleActionWorkingSetChange = useCallback(
    (snapshot: ActionSectionDraftSnapshot) => {
      setCachedActionDraftSnapshot(snapshot);
      sectionBindings.onActionWorkingSetChange();
    },
    [sectionBindings.onActionWorkingSetChange],
  );

  const handleCompletionWorkingSetChange = useCallback(
    (snapshot: CompletionSectionDraftSnapshot) => {
      setCachedCompletionDraftSnapshot(snapshot);
      sectionBindings.onCompletionWorkingSetChange();
    },
    [sectionBindings.onCompletionWorkingSetChange],
  );

  const desktopFlowInput = useMemo(
    () =>
      resolveEditorDesktopFlowPolicy({
        isActive: effectiveMission.isActive,
        entryActionId: effectiveMission.entryActionId,
        useAiCompletion: effectiveMission.useAiCompletion,
        serverActions,
        serverCompletions,
        actionDraftSnapshot: cachedActionDraftSnapshot,
        completionDraftSnapshot: cachedCompletionDraftSnapshot,
      }),
    [
      cachedActionDraftSnapshot,
      cachedCompletionDraftSnapshot,
      effectiveMission.entryActionId,
      effectiveMission.isActive,
      serverActions,
      serverCompletions,
    ],
  );

  const isDesktopFlowLoading =
    missionQuery.isLoading || actionsQuery.isLoading || completionsQuery.isLoading;
  const desktopFlowErrorMessage =
    missionQuery.error instanceof Error
      ? missionQuery.error.message
      : actionsQuery.error instanceof Error
        ? actionsQuery.error.message
        : completionsQuery.error instanceof Error
          ? completionsQuery.error.message
          : null;
  const desktopFlowAnalysis = useMemo(() => {
    if (!serverActions || !serverCompletions) {
      return null;
    }

    return analyzeEditorFlow(desktopFlowInput);
  }, [desktopFlowInput, serverActions, serverCompletions]);

  const saveButtonNode = useMemo(
    () => (
      <EditorMissionActionBar
        isPublished={viewState.isPublished}
        isSavingAll={viewState.isSavingAll}
        isPublishing={viewState.isPublishing}
        hasAnyBusySection={viewState.hasAnyBusySection}
        hasAnyPendingChanges={viewState.hasAnyPendingChanges}
        canSave={viewState.canSave}
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
      viewState.canSave,
      viewState.canPublish,
      viewState.hasAnyBusySection,
      viewState.hasAnyPendingChanges,
      viewState.isPublished,
      viewState.isPublishing,
      viewState.isSavingAll,
    ],
  );
  const desktopPanels = (
    <>
      <EditorDesktopAbsolute side="left">
        <EditorDesktopFlowPanel
          analysis={desktopFlowAnalysis}
          isLoading={isDesktopFlowLoading}
          errorMessage={desktopFlowErrorMessage}
        />
      </EditorDesktopAbsolute>
      <EditorDesktopAbsolute side="right" panelWidth={440}>
        <EditorDesktopMobilePanel missionId={missionId} />
      </EditorDesktopAbsolute>
    </>
  );

  if (currentTab === "stats") {
    return (
      <>
        {desktopPanels}
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
        {desktopPanels}
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
      {desktopPanels}
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
          onWorkingSetChange={handleActionWorkingSetChange}
        />
        <Separator className="h-2" />
        <CompletionSettingsCard
          ref={refs.completionRef}
          missionId={mission.id}
          onSaveStateChange={sectionBindings.onCompletionStateChange}
          onWorkingSetChange={handleCompletionWorkingSetChange}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
