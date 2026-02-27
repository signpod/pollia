"use client";

import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import type { GetMissionResponse } from "@/types/dto";
import type { PaymentType } from "@prisma/client";
import { Button, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSettingsCard } from "./ActionSettingsCard";
import { CompletionSettingsCard } from "./CompletionSettingsCard";
import { EditorBottomSaveSlot } from "./EditorBottomSaveSlot";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { ProjectBasicInfoCard } from "./ProjectBasicInfoCard";
import { RewardSettingsCard } from "./RewardSettingsCard";
import type { SectionSaveHandle, SectionSaveState } from "./editor-save.types";

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

const UNIFIED_SAVE_TOAST_ID = "editor-mission-save-result";

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
  const basicInfoRef = useRef<SectionSaveHandle | null>(null);
  const rewardRef = useRef<SectionSaveHandle | null>(null);
  const actionRef = useRef<SectionSaveHandle | null>(null);
  const completionRef = useRef<SectionSaveHandle | null>(null);
  const saveInFlightRef = useRef(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [sectionStates, setSectionStates] = useState<
    Record<"basic" | "reward" | "action" | "completion", SectionSaveState>
  >({
    basic: { hasPendingChanges: false, isBusy: false },
    reward: { hasPendingChanges: false, isBusy: false },
    action: { hasPendingChanges: false, isBusy: false },
    completion: { hasPendingChanges: false, isBusy: false },
  });
  const isEditorTab = currentTab === "editor";

  const updateSectionState = useCallback(
    (section: "basic" | "reward" | "action" | "completion", nextState: SectionSaveState) => {
      setSectionStates(prev => {
        const currentState = prev[section];
        if (
          currentState.hasPendingChanges === nextState.hasPendingChanges &&
          currentState.isBusy === nextState.isBusy
        ) {
          return prev;
        }

        return {
          ...prev,
          [section]: nextState,
        };
      });
    },
    [],
  );

  const hasAnyPendingChanges = useMemo(
    () => Object.values(sectionStates).some(state => state.hasPendingChanges),
    [sectionStates],
  );
  const hasAnyBusySection = useMemo(
    () => Object.values(sectionStates).some(state => state.isBusy),
    [sectionStates],
  );

  const handleUnifiedSave = useCallback(async () => {
    if (!isEditorTab || saveInFlightRef.current || isSavingAll || hasAnyBusySection) {
      return;
    }

    if (!hasAnyPendingChanges) {
      toast({
        message: "저장할 변경사항이 없습니다.",
        id: UNIFIED_SAVE_TOAST_ID,
      });
      return;
    }

    saveInFlightRef.current = true;
    setIsSavingAll(true);
    try {
      const sections: Array<{
        label: string;
        ref: RefObject<SectionSaveHandle | null>;
      }> = [
        { label: "기본 정보", ref: basicInfoRef },
        { label: "리워드", ref: rewardRef },
        { label: "액션", ref: actionRef },
        { label: "결과 화면", ref: completionRef },
      ];

      let savedCount = 0;

      for (const section of sections) {
        const handle = section.ref.current;
        if (!handle || !handle.hasPendingChanges()) {
          continue;
        }

        const result = await handle.save({ silent: true });

        if (result.status === "saved") {
          savedCount += 1;
          continue;
        }

        if (result.status === "no_changes") {
          continue;
        }

        toast({
          message: result.message ?? `${section.label} 저장에 실패했습니다.`,
          icon: AlertCircle,
          iconClassName: "text-red-500",
          id: UNIFIED_SAVE_TOAST_ID,
        });
        return;
      }

      if (savedCount > 0) {
        toast({
          message: "변경사항이 저장되었습니다.",
          id: UNIFIED_SAVE_TOAST_ID,
        });
        return;
      }

      toast({
        message: "저장할 변경사항이 없습니다.",
        id: UNIFIED_SAVE_TOAST_ID,
      });
    } finally {
      saveInFlightRef.current = false;
      setIsSavingAll(false);
    }
  }, [hasAnyBusySection, hasAnyPendingChanges, isEditorTab, isSavingAll]);

  const saveButtonNode = useMemo(
    () => (
      <div className="px-5 py-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={handleUnifiedSave}
          loading={isSavingAll}
          disabled={isSavingAll || hasAnyBusySection || !hasAnyPendingChanges}
        >
          저장
        </Button>
      </div>
    ),
    [handleUnifiedSave, hasAnyBusySection, hasAnyPendingChanges, isSavingAll],
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
        isActive={isEditorTab}
        node={saveButtonNode}
      />
      <EditorMissionDraftProvider>
        <ProjectBasicInfoCard
          ref={basicInfoRef}
          mission={mission}
          onSaveStateChange={state => updateSectionState("basic", state)}
        />
        <Separator className="h-2" />
        <RewardSettingsCard
          ref={rewardRef}
          mission={mission}
          initialReward={reward}
          onSaveStateChange={state => updateSectionState("reward", state)}
        />
        <Separator className="h-2" />
        <ActionSettingsCard
          ref={actionRef}
          missionId={mission.id}
          onSaveStateChange={state => updateSectionState("action", state)}
        />
        <Separator className="h-2" />
        <CompletionSettingsCard
          ref={completionRef}
          missionId={mission.id}
          onSaveStateChange={state => updateSectionState("completion", state)}
        />
      </EditorMissionDraftProvider>
    </>
  );
}
