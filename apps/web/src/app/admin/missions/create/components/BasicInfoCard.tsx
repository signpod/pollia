"use client";

import { InputField } from "@/app/admin/components/common/InputField";
import { NumberField } from "@/app/admin/components/common/NumberField";
import { SelectField } from "@/app/admin/components/common/SelectField";
import { TiptapField } from "@/app/admin/components/common/TiptapField";
import { ToggleField } from "@/app/admin/components/common/ToggleField";
import { DateTimeField } from "@/app/admin/components/common/molecules/DateTimeField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "@/schemas/mission";
import { MissionCategory } from "@prisma/client";
import type { UseFormReturn } from "react-hook-form";
import type { CreateMissionFunnelFormData } from "../schemas";

interface BasicInfoCardProps {
  form: UseFormReturn<CreateMissionFunnelFormData>;
}

export function BasicInfoCard({ form }: BasicInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>
          {UBIQUITOUS_CONSTANTS.MISSION}의 제목과 설명을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputField
          control={form.control}
          name="title"
          label="제목"
          description={`${UBIQUITOUS_CONSTANTS.MISSION}의 제목을 입력하세요.`}
          placeholder={`${UBIQUITOUS_CONSTANTS.MISSION} 제목을 입력하세요`}
          maxLength={MISSION_TITLE_MAX_LENGTH}
          showCounter
        />

        <ToggleField
          control={form.control}
          name="isExposed"
          label="노출여부"
          description={`노출 시 ${UBIQUITOUS_CONSTANTS.MISSION} 목록에 표시됩니다`}
        />

        <SelectField
          control={form.control}
          name="category"
          label="카테고리"
          description={`${UBIQUITOUS_CONSTANTS.MISSION}의 카테고리를 선택합니다.`}
          options={[
            {
              value: MissionCategory.TEST,
              label: MISSION_CATEGORY_LABELS[MissionCategory.TEST],
            },
            {
              value: MissionCategory.EVENT,
              label: MISSION_CATEGORY_LABELS[MissionCategory.EVENT],
            },
            {
              value: MissionCategory.RESEARCH,
              label: MISSION_CATEGORY_LABELS[MissionCategory.RESEARCH],
            },
            {
              value: MissionCategory.CHALLENGE,
              label: MISSION_CATEGORY_LABELS[MissionCategory.CHALLENGE],
            },
            { value: MissionCategory.QUIZ, label: MISSION_CATEGORY_LABELS[MissionCategory.QUIZ] },
          ]}
        />

        <NumberField
          control={form.control}
          name="maxParticipants"
          label="최대 참여자 수"
          description="비워두면 제한 없음으로 설정됩니다."
          placeholder="제한 없음"
          isOptional
          transformValue={value => (value === undefined ? null : value)}
        />

        <TiptapField
          control={form.control}
          name="description"
          label="설명"
          description={`${UBIQUITOUS_CONSTANTS.MISSION}에 대한 설명을 입력하세요.`}
          placeholder={`${UBIQUITOUS_CONSTANTS.MISSION}에 대한 설명을 입력하세요`}
          maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
          showCounter
          showToolbar
          minHeight="200px"
          isOptional
        />

        <InputField
          control={form.control}
          name="target"
          label="대상"
          description={`${UBIQUITOUS_CONSTANTS.MISSION} 대상을 입력하세요.`}
          placeholder={`${UBIQUITOUS_CONSTANTS.MISSION} 대상을 입력하세요`}
          maxLength={MISSION_TARGET_MAX_LENGTH}
          showCounter
          isOptional
        />

        <NumberField
          control={form.control}
          name="estimatedMinutes"
          label="예상 소요 시간 (분)"
          description={`${UBIQUITOUS_CONSTANTS.MISSION} 완료에 필요한 예상 시간을 입력합니다.`}
          isOptional
          transformValue={value => (value === undefined ? null : value)}
        />

        <DateTimeField
          control={form.control}
          name="startDate"
          label="시작일"
          description={`${UBIQUITOUS_CONSTANTS.MISSION}의 시작일을 설정합니다.`}
          datePlaceholder="시작일 선택"
          isOptional
          supportNull
        />

        <DateTimeField
          control={form.control}
          name="deadline"
          label="마감일"
          description={`${UBIQUITOUS_CONSTANTS.MISSION}의 마감일을 설정합니다.`}
          datePlaceholder="마감일 선택"
          isOptional
          supportNull
        />
      </CardContent>
    </Card>
  );
}
