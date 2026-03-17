"use client";

import { ToggleSettingRow } from "@/app/(site)/(main)/create/components/ToggleSettingRow";
import {
  Input,
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typo,
} from "@repo/ui/components";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateQuizMissionFormData } from "../../schema";

const GRADING_MODE_OPTIONS = [
  { value: "instant", label: "즉시 채점", description: "문제를 풀 때마다 바로 채점합니다." },
  {
    value: "final",
    label: "최종 채점",
    description: "모든 문제를 풀고 나서 한 번에 채점합니다.",
  },
] as const;

export function QuizConfigSection() {
  const { control } = useFormContext<CreateQuizMissionFormData>();

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <Controller
        control={control}
        name="quizConfig.gradingMode"
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
        control={control}
        name="quizConfig.showExplanation"
        render={({ field }) => (
          <ToggleSettingRow
            label="해설 표시"
            description="채점 후 문제에 대한 해설을 표시합니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="quizConfig.showCorrectOnWrong"
        render={({ field }) => (
          <ToggleSettingRow
            label="오답 시 정답 표시"
            description="오답인 경우 올바른 정답을 함께 표시합니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="quizConfig.shuffleQuestions"
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
        control={control}
        name="quizConfig.shuffleChoices"
        render={({ field }) => (
          <ToggleSettingRow
            label="선택지 순서 랜덤"
            description="객관식 문제의 선택지 순서를 무작위로 섞습니다."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="quizConfig.timeLimitPerQuestion"
        render={({ field }) => (
          <TimeLimitField
            label="문항별 제한시간"
            description="각 문항에 제한시간을 설정합니다. (초 단위)"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="quizConfig.timeLimitTotal"
        render={({ field }) => (
          <TimeLimitField
            label="전체 제한시간"
            description="퀴즈 전체에 제한시간을 설정합니다. (초 단위)"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}

interface TimeLimitFieldProps {
  label: string;
  description: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function TimeLimitField({ label, description, value, onChange }: TimeLimitFieldProps) {
  const isEnabled = value !== null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Typo.SubTitle>{label}</Typo.SubTitle>
            <Typo.Body size="medium" className="text-zinc-500">
              {description}
            </Typo.Body>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="미설정"
            value={isEnabled ? value.toString() : ""}
            onChange={e => {
              const raw = e.target.value;
              if (raw === "") {
                onChange(null);
                return;
              }
              const parsed = Number.parseInt(raw, 10);
              if (!Number.isNaN(parsed) && parsed > 0) {
                onChange(parsed);
              }
            }}
            containerClassName="flex-1"
            showLength={false}
          />
          <Typo.Body size="medium" className="shrink-0 text-zinc-500">
            초
          </Typo.Body>
        </div>
      </div>
    </div>
  );
}
