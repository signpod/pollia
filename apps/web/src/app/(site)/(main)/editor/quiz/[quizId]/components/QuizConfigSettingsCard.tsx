"use client";

import { updateMission } from "@/actions/mission/update";
import { ToggleSettingRow } from "@/app/(site)/(main)/create/components/ToggleSettingRow";
import { type QuizConfig, parseQuizConfig } from "@/schemas/mission/quizConfigSchema";
import type { GetMissionResponse } from "@/types/dto";
import {
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typo,
  toast,
} from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "../../../missions/[missionId]/components/editor-save.types";

const GRADING_MODE_OPTIONS = [
  { value: "instant", label: "즉시 채점", description: "문제를 풀 때마다 바로 채점합니다." },
  {
    value: "final",
    label: "최종 채점",
    description: "모든 문제를 풀고 나서 한 번에 채점합니다.",
  },
] as const;

interface QuizConfigSettingsCardProps {
  mission: GetMissionResponse["data"];
  onSaveStateChange?: SectionSaveStateChangeHandler;
  onShowHintChange?: (show: boolean) => void;
  onShowCorrectOnWrongChange?: (show: boolean) => void;
}

function QuizConfigSettingsCardComponent(
  {
    mission,
    onSaveStateChange,
    onShowHintChange,
    onShowCorrectOnWrongChange,
  }: QuizConfigSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const initialConfig = parseQuizConfig(mission.quizConfig);

  const form = useForm<QuizConfig>({
    defaultValues: initialConfig,
    mode: "onBlur",
  });

  const watchedShowExplanation = form.watch("showExplanation");
  const watchedShowCorrectOnWrong = form.watch("showCorrectOnWrong");

  useEffect(() => {
    onShowHintChange?.(watchedShowExplanation);
  }, [watchedShowExplanation, onShowHintChange]);

  useEffect(() => {
    onShowCorrectOnWrongChange?.(watchedShowCorrectOnWrong);
  }, [watchedShowCorrectOnWrong, onShowCorrectOnWrongChange]);

  const hasPendingChanges = form.formState.isDirty;
  const isBusy = form.formState.isSubmitting;
  const [validationIssueCount] = useState(0);

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy,
      hasValidationIssues: validationIssueCount > 0,
      validationIssueCount,
    });
  }, [hasPendingChanges, isBusy, onSaveStateChange, validationIssueCount]);

  const save = useCallback(
    async ({ silent = false }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      if (form.formState.isSubmitting) {
        return { status: "failed", message: "퀴즈 설정 저장이 진행 중입니다." };
      }

      if (!form.formState.isDirty) {
        return { status: "no_changes" };
      }

      const values = form.getValues();

      try {
        await updateMission(mission.id, { quizConfig: values });
        form.reset(values);

        if (!silent) {
          toast({ message: "퀴즈 설정이 수정되었습니다." });
        }

        return { status: "saved" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "퀴즈 설정 수정에 실패했습니다.";

        if (!silent) {
          toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
        }

        return { status: "failed", message };
      }
    },
    [form, mission.id],
  );

  useImperativeHandle(
    ref,
    () => ({
      save,
      hasPendingChanges: () => form.formState.isDirty,
      isBusy: () => form.formState.isSubmitting,
      exportDraftSnapshot: () => form.getValues(),
      importDraftSnapshot: (snapshot: unknown) => {
        if (!snapshot || typeof snapshot !== "object") return;
        const parsed = parseQuizConfig(snapshot);
        form.reset(parsed, { keepDefaultValues: true });
      },
    }),
    [form, save],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={e => e.preventDefault()}>
        <div className="flex flex-col gap-4 px-5 py-5">
          <Controller
            control={form.control}
            name="gradingMode"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <LabelText required={false}>채점 방식</LabelText>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="채점 방식을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADING_MODE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Typo.Body size="small" className="text-zinc-400">
                  {GRADING_MODE_OPTIONS.find(o => o.value === field.value)?.description}
                </Typo.Body>
              </div>
            )}
          />

          <Controller
            control={form.control}
            name="showExplanation"
            render={({ field }) => (
              <ToggleSettingRow
                label="힌트 표시"
                description="문제 풀이 시 힌트를 표시합니다."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={form.control}
            name="showCorrectOnWrong"
            render={({ field }) => (
              <ToggleSettingRow
                label="오답 시 정답 표시"
                description="오답인 경우 올바른 정답과 설명을 함께 표시합니다."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={form.control}
            name="shuffleQuestions"
            render={({ field }) => (
              <ToggleSettingRow
                label="문제 순서 랜덤"
                description="참여할 때마다 문제 순서를 무작위로 섞습니다."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={form.control}
            name="shuffleChoices"
            render={({ field }) => (
              <ToggleSettingRow
                label="선택지 순서 랜덤"
                description="객관식 문제의 선택지 순서를 무작위로 섞습니다."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </form>
    </FormProvider>
  );
}

export const QuizConfigSettingsCard = forwardRef<SectionSaveHandle, QuizConfigSettingsCardProps>(
  QuizConfigSettingsCardComponent,
);
QuizConfigSettingsCard.displayName = "QuizConfigSettingsCard";
