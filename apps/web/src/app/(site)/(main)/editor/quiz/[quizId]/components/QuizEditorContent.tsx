"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { Separator } from "@/components/ui/separator";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import { parseQuizConfig } from "@/schemas/mission/quizConfigSchema";
import type { GetMissionResponse } from "@/types/dto";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
import { useEditorBootstrapScrollController } from "../../../components/controller/useEditorBootstrapScrollController";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { completionDraftsAtom } from "../../../missions/[missionId]/atoms/editorCompletionAtoms";
import { CompletionSettingsCard } from "../../../missions/[missionId]/components/CompletionSettingsCard";
import { ContentBasicInfoCard } from "../../../missions/[missionId]/components/ContentBasicInfoCard";
import { EditorBottomSaveSlot } from "../../../missions/[missionId]/components/EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "../../../missions/[missionId]/components/EditorMissionDraftContext";
import { useEditorMissionTab } from "../../../missions/[missionId]/components/EditorMissionTabContext";
import {
  RewardSettingsCard,
  type RewardSnapshot,
} from "../../../missions/[missionId]/components/RewardSettingsCard";
import type { SectionSaveState } from "../../../missions/[missionId]/components/editor-save.types";
import { EditorMissionActionBar } from "../../../missions/[missionId]/components/views/EditorMissionActionBar";
import { quizActionDraftItemsAtom } from "../atoms/quizActionAtoms";
import { QuizConfigSettingsCard } from "./QuizConfigSettingsCard";
import { QuizQuestionSettingsCard } from "./QuizQuestionSettingsCard";
import { QuizStatsDashboard } from "./QuizStatsDashboard";
import { useEditorQuizController } from "./controllers/useEditorQuizController";

interface QuizEditorContentProps {
  missionId: string;
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

export function QuizEditorContent({ missionId, mission, reward }: QuizEditorContentProps) {
  const { currentTab } = useEditorMissionTab();
  const actionSectionRef = useRef<HTMLDivElement>(null);
  useEditorBootstrapScrollController(missionId, actionSectionRef);

  const [editorHasReward, setEditorHasReward] = useState(!!reward);
  const [basicValidationCount, setBasicValidationCount] = useState(0);
  const [rewardValidationCount, setRewardValidationCount] = useState(0);

  const [showHint, setShowHint] = useState(parseQuizConfig(mission.quizConfig).showExplanation);
  const [showCorrectOnWrong, setShowCorrectOnWrong] = useState(
    parseQuizConfig(mission.quizConfig).showCorrectOnWrong,
  );

  const missionQuery = useReadMission(missionId);
  const actionsQuery = useReadActionsDetail(missionId);
  const completionsQuery = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const questionDraftItems = useAtomValue(quizActionDraftItemsAtom);
  const completionDrafts = useAtomValue(completionDraftsAtom);

  const { refs, sectionBindings, viewState, actions, undoRedo } = useEditorQuizController({
    quizId: missionId,
    mission,
    currentTab,
    missionQueryData: missionQuery.data?.data,
    serverActionsCount: actionsQuery.data?.data?.length ?? 0,
    serverCompletionsCount: completionsQuery.data?.data?.length ?? 0,
    questionDraftCount: questionDraftItems.length,
    completionDraftCount: completionDrafts.length,
    isActionsLoading: actionsQuery.isLoading,
    isCompletionsLoading: completionsQuery.isLoading,
  });

  const handleBasicStateChange = useCallback(
    (state: SectionSaveState) => {
      setBasicValidationCount(state.validationIssueCount);
      sectionBindings.onBasicStateChange(state);
    },
    [sectionBindings.onBasicStateChange],
  );

  const handleRewardStateChange = useCallback(
    (state: SectionSaveState) => {
      setRewardValidationCount(state.validationIssueCount);
      sectionBindings.onRewardStateChange(state);
    },
    [sectionBindings.onRewardStateChange],
  );

  const saveButtonNode = useMemo(
    () => (
      <EditorMissionActionBar
        isSavingAll={viewState.isSavingAll}
        hasAnyBusySection={viewState.hasAnyBusySection}
        hasAnyPendingChanges={viewState.hasAnyPendingChanges}
        hasAnyValidationIssues={viewState.hasAnyValidationIssues}
        onSave={() => {
          void actions.onSave();
        }}
        canUndo={undoRedo.canUndo}
        onUndo={() => void undoRedo.undo()}
      />
    ),
    [
      actions,
      undoRedo,
      viewState.hasAnyBusySection,
      viewState.hasAnyPendingChanges,
      viewState.hasAnyValidationIssues,
      viewState.isSavingAll,
    ],
  );

  if (currentTab === "stats") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey={`quiz-editor-save:${missionId}`}
          isActive={false}
          node={saveButtonNode}
        />
        <QuizStatsDashboard missionId={missionId} />
      </>
    );
  }

  return (
    <>
      <EditorBottomSaveSlot
        slotKey={`quiz-editor-save:${missionId}`}
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
            hasReward={editorHasReward}
            showAiCompletionToggle={false}
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

        <EditorSectionCard title="퀴즈 설정" description="퀴즈 진행 방식을 설정합니다.">
          <QuizConfigSettingsCard
            ref={refs.quizConfigRef}
            mission={mission}
            onSaveStateChange={sectionBindings.onQuizConfigStateChange}
            onShowHintChange={setShowHint}
            onShowCorrectOnWrongChange={setShowCorrectOnWrong}
          />
        </EditorSectionCard>

        <Separator className="h-2" />

        <div ref={actionSectionRef} className="scroll-mt-28">
          <QuizQuestionSettingsCard
            ref={refs.questionRef}
            missionId={missionId}
            onSaveStateChange={sectionBindings.onQuestionStateChange}
            showHint={showHint}
            showCorrectOnWrong={showCorrectOnWrong}
          />
        </div>

        <Separator className="h-2" />

        <CompletionSettingsCard
          ref={refs.completionRef}
          missionId={missionId}
          isQuizMode
          onSaveStateChange={sectionBindings.onCompletionStateChange}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
