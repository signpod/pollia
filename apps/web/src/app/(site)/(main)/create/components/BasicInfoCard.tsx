"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "@/schemas/mission";
import { MissionCategory } from "@prisma/client";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toggle,
  Typo,
} from "@repo/ui/components";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { CreateMissionFunnelFormData } from "../schemas";

interface BasicInfoCardProps {
  form: UseFormReturn<CreateMissionFunnelFormData>;
}

export function BasicInfoCard({ form }: BasicInfoCardProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
      <div>
        <Typo.Body size="large" className="font-bold text-zinc-900">
          기본 정보
        </Typo.Body>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          {UBIQUITOUS_CONSTANTS.MISSION}의 제목과 설명을 입력하세요.
        </Typo.Body>
      </div>

      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="제목"
            required
            placeholder={`${UBIQUITOUS_CONSTANTS.MISSION} 제목을 입력하세요`}
            maxLength={MISSION_TITLE_MAX_LENGTH}
            showLength
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            errorMessage={errors.title?.message}
            helperText={`${UBIQUITOUS_CONSTANTS.MISSION}의 제목을 입력하세요.`}
          />
        )}
      />

      <Controller
        control={control}
        name="isExposed"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Typo.Body size="medium" className="font-medium text-zinc-900">
                노출 여부
              </Typo.Body>
              <Typo.Body size="small" className="text-zinc-500">
                노출 시 {UBIQUITOUS_CONSTANTS.MISSION} 목록에 표시됩니다
              </Typo.Body>
            </div>
            <Toggle checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <div className="space-y-2">
            <Typo.Body size="medium" className="font-medium text-zinc-900">
              카테고리
            </Typo.Body>
            <Select value={field.value} onValueChange={v => field.onChange(v as MissionCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MISSION_CATEGORY_LABELS) as MissionCategory[]).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {MISSION_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input
            label="설명 (선택)"
            placeholder={`${UBIQUITOUS_CONSTANTS.MISSION}에 대한 설명을 입력하세요`}
            maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
            showLength
            value={field.value ?? ""}
            onChange={e => field.onChange(e.target.value || undefined)}
            onBlur={field.onBlur}
            errorMessage={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="target"
        render={({ field }) => (
          <Input
            label="대상 (선택)"
            placeholder={`${UBIQUITOUS_CONSTANTS.MISSION} 대상을 입력하세요`}
            maxLength={MISSION_TARGET_MAX_LENGTH}
            showLength
            value={field.value ?? ""}
            onChange={e => field.onChange(e.target.value || undefined)}
            onBlur={field.onBlur}
            errorMessage={errors.target?.message}
          />
        )}
      />
    </div>
  );
}
