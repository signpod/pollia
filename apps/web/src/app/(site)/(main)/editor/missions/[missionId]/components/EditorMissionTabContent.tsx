"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { Separator } from "@/components/ui/separator";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { GetMissionResponse } from "@/types/dto";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditorBootstrapScrollController } from "../../../components/controller/useEditorBootstrapScrollController";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import {
  actionDirtyByItemKeyAtom,
  actionDraftItemsAtom,
  actionFormSnapshotByItemKeyAtom,
  actionItemOrderKeysAtom,
  actionOpenItemKeyAtom,
  actionTypeByItemKeyAtom,
} from "../atoms/editorActionAtoms";
import {
  completionDirtyByItemKeyAtom,
  completionDraftsAtom,
  completionFormSnapshotByItemKeyAtom,
  completionOpenItemKeyAtom,
  removedCompletionIdsAtom,
} from "../atoms/editorCompletionAtoms";
import { serverCompletionsAtom } from "../atoms/editorDerivedAtoms";
import { mobilePreviewRefreshKeyAtom } from "../atoms/editorMobilePreviewAtom";
import { type ActionSectionDraftSnapshot, ActionSettingsCard } from "./ActionSettingsCard";
import { CompletionSettingsCard } from "./CompletionSettingsCard";
import { ContentBasicInfoCard } from "./ContentBasicInfoCard";
import { EditorBottomSaveSlot } from "./EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { RewardSettingsCard, type RewardSnapshot } from "./RewardSettingsCard";
import { useEditorMissionController } from "./controllers/useEditorMissionController";
import { EditorDesktopAbsolute } from "./desktop/EditorDesktopAbsolute";
import { EditorDesktopFlowPanel } from "./desktop/EditorDesktopFlowPanel";
import { EditorDesktopMobilePanel } from "./desktop/EditorDesktopMobilePanel";
import { resolveEditorDesktopFlowPolicy } from "./editor-desktop-flow-policy";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";
import { EditorMissionActionBar } from "./views/EditorMissionActionBar";

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
        title={`${UBIQUITOUS_CONSTANTS.MISSION} 인트로 미리보기`}
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
  const actionSectionRef = useRef<HTMLDivElement>(null);
  useEditorBootstrapScrollController(missionId, actionSectionRef);
  const [editorUseAiCompletion, setEditorUseAiCompletion] = useState(mission.useAiCompletion);
  const [editorHasReward, setEditorHasReward] = useState(!!reward);
  const [basicValidationCount, setBasicValidationCount] = useState(0);
  const [rewardValidationCount, setRewardValidationCount] = useState(0);
  const actionDraftItems = useAtomValue(actionDraftItemsAtom);
  const actionOpenItemKey = useAtomValue(actionOpenItemKeyAtom);
  const actionDirtyByItemKey = useAtomValue(actionDirtyByItemKeyAtom);
  const actionTypeByItemKey = useAtomValue(actionTypeByItemKeyAtom);
  const actionFormSnapshotByItemKey = useAtomValue(actionFormSnapshotByItemKeyAtom);
  const actionItemOrderKeys = useAtomValue(actionItemOrderKeysAtom);
  const completionDrafts = useAtomValue(completionDraftsAtom);
  const completionOpenItemKey = useAtomValue(completionOpenItemKeyAtom);
  const removedCompletionIds = useAtomValue(removedCompletionIdsAtom);
  const completionDirtyByItemKey = useAtomValue(completionDirtyByItemKeyAtom);
  const completionFormSnapshotByItemKey = useAtomValue(completionFormSnapshotByItemKeyAtom);
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
  const setServerCompletions = useSetAtom(serverCompletionsAtom);

  useEffect(() => {
    setServerCompletions(serverCompletions ?? []);
  }, [serverCompletions, setServerCompletions]);

  useEffect(() => {
    setEditorUseAiCompletion(mission.useAiCompletion);
  }, [mission.useAiCompletion]);

  const handleBasicStateChange = useCallback(
    (state: Parameters<typeof sectionBindings.onBasicStateChange>[0]) => {
      setBasicValidationCount(state.validationIssueCount);
      sectionBindings.onBasicStateChange(state);
    },
    [sectionBindings.onBasicStateChange],
  );

  const handleRewardStateChange = useCallback(
    (state: Parameters<typeof sectionBindings.onRewardStateChange>[0]) => {
      setRewardValidationCount(state.validationIssueCount);
      sectionBindings.onRewardStateChange(state);
    },
    [sectionBindings.onRewardStateChange],
  );

  const cachedActionDraftSnapshot = useMemo<ActionSectionDraftSnapshot>(
    () => ({
      draftItems: actionDraftItems,
      openItemKey: actionOpenItemKey,
      dirtyByItemKey: actionDirtyByItemKey,
      actionTypeByItemKey,
      formSnapshotByItemKey: actionFormSnapshotByItemKey,
      itemOrderKeys: actionItemOrderKeys,
    }),
    [
      actionDraftItems,
      actionOpenItemKey,
      actionDirtyByItemKey,
      actionTypeByItemKey,
      actionFormSnapshotByItemKey,
      actionItemOrderKeys,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: atom values trigger working set change notification
  useEffect(() => {
    sectionBindings.onActionWorkingSetChange();
  }, [
    actionDraftItems,
    actionDirtyByItemKey,
    actionFormSnapshotByItemKey,
    actionItemOrderKeys,
    sectionBindings.onActionWorkingSetChange,
  ]);

  const cachedCompletionDraftSnapshot = useMemo(
    () => ({
      draftItems: completionDrafts.map(item => ({ key: item.key, title: item.title })),
      openItemKey: completionOpenItemKey,
      removedExistingIds: [...removedCompletionIds],
      dirtyByItemKey: completionDirtyByItemKey,
      formSnapshotByItemKey: completionFormSnapshotByItemKey,
    }),
    [
      completionDrafts,
      completionOpenItemKey,
      removedCompletionIds,
      completionDirtyByItemKey,
      completionFormSnapshotByItemKey,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: atom values trigger working set change notification
  useEffect(() => {
    sectionBindings.onCompletionWorkingSetChange();
  }, [
    completionDrafts,
    removedCompletionIds,
    completionDirtyByItemKey,
    completionFormSnapshotByItemKey,
    sectionBindings.onCompletionWorkingSetChange,
  ]);

  const desktopFlowInput = useMemo(
    () =>
      resolveEditorDesktopFlowPolicy({
        isActive: effectiveMission.isActive,
        entryActionId: effectiveMission.entryActionId,
        useAiCompletion: editorUseAiCompletion,
        serverActions,
        serverCompletions,
        actionDraftSnapshot: cachedActionDraftSnapshot,
        completionDraftSnapshot: cachedCompletionDraftSnapshot,
      }),
    [
      cachedActionDraftSnapshot,
      cachedCompletionDraftSnapshot,
      editorUseAiCompletion,
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

  const bumpPreviewRefresh = useSetAtom(mobilePreviewRefreshKeyAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - bumpPreviewRefresh
  const saveButtonNode = useMemo(
    () => (
      <EditorMissionActionBar
        isPublished={viewState.isPublished}
        isSavingAll={viewState.isSavingAll}
        isPublishing={viewState.isPublishing}
        hasAnyBusySection={viewState.hasAnyBusySection}
        hasAnyPendingChanges={viewState.hasAnyPendingChanges}
        hasAnyValidationIssues={viewState.hasAnyValidationIssues}
        canSave={viewState.canSave}
        canPublish={viewState.canPublish}
        onSave={() => {
          void actions.onSave().then(() => bumpPreviewRefresh(v => v + 1));
        }}
        onPublish={() => {
          void actions.onPublish().then(() => bumpPreviewRefresh(v => v + 1));
        }}
      />
    ),
    [
      actions,
      viewState.canSave,
      viewState.canPublish,
      viewState.hasAnyBusySection,
      viewState.hasAnyPendingChanges,
      viewState.hasAnyValidationIssues,
      viewState.isPublished,
      viewState.isPublishing,
      viewState.isSavingAll,
    ],
  );
  const desktopPanels = (
    <>
      <EditorDesktopAbsolute side="left" panelWidth={440}>
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
        <EditorSectionCard
          title={`${UBIQUITOUS_CONSTANTS.MISSION} 기본정보`}
          description={`${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보를 입력합니다.`}
          validationIssueCount={basicValidationCount + rewardValidationCount}
        >
          <ContentBasicInfoCard
            ref={refs.basicInfoRef}
            mission={mission}
            onSaveStateChange={handleBasicStateChange}
            onUseAiCompletionChange={setEditorUseAiCompletion}
            hasReward={editorHasReward}
          />
          <RewardSettingsCard
            ref={refs.rewardRef}
            mission={mission}
            initialReward={reward}
            onSaveStateChange={handleRewardStateChange}
            onHasRewardChange={setEditorHasReward}
          />
        </EditorSectionCard>
        <Separator className="h-2" />
        <div ref={actionSectionRef}>
          <ActionSettingsCard
            ref={refs.actionRef}
            missionId={mission.id}
            useAiCompletion={editorUseAiCompletion}
            onSaveStateChange={sectionBindings.onActionStateChange}
          />
        </div>
        <Separator className="h-2" />
        <CompletionSettingsCard
          ref={refs.completionRef}
          missionId={mission.id}
          onSaveStateChange={sectionBindings.onCompletionStateChange}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
