"use client";

import { Separator } from "@/components/ui/separator";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { GetMissionResponse } from "@/types/dto";
import { Button } from "@repo/ui/components";
import { Save } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useEditorBootstrapScrollController } from "../../../components/controller/useEditorBootstrapScrollController";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { ContentBasicInfoCard } from "../../../missions/[missionId]/components/ContentBasicInfoCard";
import { EditorBottomSaveSlot } from "../../../missions/[missionId]/components/EditorBottomSaveSlot";
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
import { QuizSkeletonSection } from "./QuizSkeletonSection";

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

  const [editorHasReward, setEditorHasReward] = useState(!!reward);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const hasAnyPendingChanges =
    basicState.hasPendingChanges ||
    rewardState.hasPendingChanges ||
    quizConfigState.hasPendingChanges;

  const hasAnyBusySection = basicState.isBusy || rewardState.isBusy || quizConfigState.isBusy;

  const hasAnyValidationIssues =
    basicState.hasValidationIssues ||
    rewardState.hasValidationIssues ||
    quizConfigState.hasValidationIssues;

  const handleSaveAll = useCallback(async () => {
    setIsSavingAll(true);
    try {
      const refs = [basicInfoRef, rewardRef, quizConfigRef];
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
        />
      </EditorSectionCard>

      <Separator className="h-2" />

      <div ref={actionSectionRef} className="scroll-mt-28">
        <EditorSectionCard
          title="진행 목록 수정"
          description="참여자가 수행할 퀴즈 문항을 추가하고 수정합니다."
        >
          <QuizSkeletonSection message="퀴즈 문항 편집 기능은 준비 중입니다." />
        </EditorSectionCard>
      </div>

      <Separator className="h-2" />

      <EditorSectionCard
        title="결과 화면 수정"
        description="퀴즈 완료 후 노출될 결과 화면을 설정합니다."
      >
        <QuizSkeletonSection message="결과 화면 편집 기능은 준비 중입니다." />
      </EditorSectionCard>
    </>
  );
}
