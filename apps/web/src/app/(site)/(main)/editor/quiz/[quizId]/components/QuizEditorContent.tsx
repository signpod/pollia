"use client";

import { Separator } from "@/components/ui/separator";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { GetMissionResponse } from "@/types/dto";
import { Button } from "@repo/ui/components";
import { Save } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useEditorBootstrapScrollController } from "../../../components/controller/useEditorBootstrapScrollController";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { CompletionSettingsCard } from "../../../missions/[missionId]/components/CompletionSettingsCard";
import { ContentBasicInfoCard } from "../../../missions/[missionId]/components/ContentBasicInfoCard";
import { EditorBottomSaveSlot } from "../../../missions/[missionId]/components/EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "../../../missions/[missionId]/components/EditorMissionDraftContext";
import { useEditorMissionTab } from "../../../missions/[missionId]/components/EditorMissionTabContext";
import {
  RewardSettingsCard,
  type RewardSnapshot,
} from "../../../missions/[missionId]/components/RewardSettingsCard";
import type {
  SectionSaveHandle,
  SectionSaveState,
} from "../../../missions/[missionId]/components/editor-save.types";
import { QuizConfigSettingsCard } from "./QuizConfigSettingsCard";
import { QuizQuestionSettingsCard } from "./QuizQuestionSettingsCard";

interface QuizEditorContentProps {
  missionId: string;
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

export function QuizEditorContent({ missionId, mission, reward }: QuizEditorContentProps) {
  const { currentTab } = useEditorMissionTab();
  const actionSectionRef = useRef<HTMLDivElement>(null);
  useEditorBootstrapScrollController(missionId, actionSectionRef);

  const basicInfoRef = useRef<SectionSaveHandle>(null);
  const rewardRef = useRef<SectionSaveHandle>(null);
  const quizConfigRef = useRef<SectionSaveHandle>(null);
  const questionRef = useRef<SectionSaveHandle>(null);
  const completionRef = useRef<SectionSaveHandle>(null);

  const [basicState, setBasicState] = useState<SectionSaveState>({
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
  });
  const [rewardState, setRewardState] = useState<SectionSaveState>({
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
  });
  const [quizConfigState, setQuizConfigState] = useState<SectionSaveState>({
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
  });
  const [questionState, setQuestionState] = useState<SectionSaveState>({
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
  });
  const [completionState, setCompletionState] = useState<SectionSaveState>({
    hasPendingChanges: false,
    isBusy: false,
    hasValidationIssues: false,
    validationIssueCount: 0,
  });

  const [editorHasReward, setEditorHasReward] = useState(!!reward);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const initialShowHint =
    mission.quizConfig &&
    typeof mission.quizConfig === "object" &&
    "showExplanation" in mission.quizConfig
      ? (mission.quizConfig as { showExplanation?: boolean }).showExplanation !== false
      : true;
  const [showHint, setShowHint] = useState(initialShowHint);

  const hasAnyPendingChanges =
    basicState.hasPendingChanges ||
    rewardState.hasPendingChanges ||
    quizConfigState.hasPendingChanges ||
    questionState.hasPendingChanges ||
    completionState.hasPendingChanges;

  const hasAnyBusySection =
    basicState.isBusy ||
    rewardState.isBusy ||
    quizConfigState.isBusy ||
    questionState.isBusy ||
    completionState.isBusy;

  const hasAnyValidationIssues =
    basicState.hasValidationIssues ||
    rewardState.hasValidationIssues ||
    quizConfigState.hasValidationIssues ||
    questionState.hasValidationIssues ||
    completionState.hasValidationIssues;

  const handleSaveAll = useCallback(async () => {
    setIsSavingAll(true);
    try {
      const refs = [basicInfoRef, rewardRef, quizConfigRef, questionRef, completionRef];
      await Promise.all(refs.map(r => r.current?.save({ silent: true })));
    } finally {
      setIsSavingAll(false);
    }
  }, []);

  const saveButtonNode = useMemo(
    () => (
      <div className="flex gap-2 px-5 py-3">
        <Button
          variant="primary"
          fullWidth
          inlineIcon
          leftIcon={<Save className="size-4" />}
          onClick={() => void handleSaveAll()}
          loading={isSavingAll}
          disabled={
            isSavingAll || hasAnyBusySection || !hasAnyPendingChanges || hasAnyValidationIssues
          }
        >
          저장하기
        </Button>
      </div>
    ),
    [handleSaveAll, hasAnyBusySection, hasAnyPendingChanges, hasAnyValidationIssues, isSavingAll],
  );

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
          validationIssueCount={basicState.validationIssueCount + rewardState.validationIssueCount}
        >
          <ContentBasicInfoCard
            ref={basicInfoRef}
            mission={mission}
            onSaveStateChange={setBasicState}
            hasReward={editorHasReward}
            showAiCompletionToggle={false}
          />
          <RewardSettingsCard
            ref={rewardRef}
            mission={mission}
            initialReward={reward}
            onSaveStateChange={setRewardState}
            onHasRewardChange={setEditorHasReward}
          />
        </EditorSectionCard>

        <Separator className="h-2" />

        <EditorSectionCard
          title="퀴즈 설정"
          description="퀴즈 진행 방식을 설정합니다."
          validationIssueCount={quizConfigState.validationIssueCount}
        >
          <QuizConfigSettingsCard
            ref={quizConfigRef}
            mission={mission}
            onSaveStateChange={setQuizConfigState}
            onShowHintChange={setShowHint}
          />
        </EditorSectionCard>

        <Separator className="h-2" />

        <div ref={actionSectionRef} className="scroll-mt-28">
          <QuizQuestionSettingsCard
            ref={questionRef}
            missionId={missionId}
            onSaveStateChange={setQuestionState}
            showHint={showHint}
          />
        </div>

        <Separator className="h-2" />

        <CompletionSettingsCard
          ref={completionRef}
          missionId={missionId}
          isQuizMode
          onSaveStateChange={setCompletionState}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
