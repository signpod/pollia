"use client";

import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { NumberField } from "@/app/admin/components/common/NumberField";
import { SelectField } from "@/app/admin/components/common/SelectField";
import { TiptapEditor } from "@/app/admin/components/common/TiptapEditor";
import { DateTimeField } from "@/app/admin/components/common/molecule/DateTimeField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { MISSION_CATEGORY_LABELS, MISSION_TYPE_LABELS } from "@/constants/mission";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "@/schemas/mission";
import { MissionCategory, MissionType } from "@prisma/client";
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
        <CardDescription>미션의 제목과 설명을 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <CharacterCounter
              current={form.watch("title")?.length || 0}
              max={MISSION_TITLE_MAX_LENGTH}
            />
          </div>
          <Input
            id="title"
            placeholder="미션 제목을 입력하세요"
            maxLength={MISSION_TITLE_MAX_LENGTH}
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="type"
            label="타입"
            description="미션의 유형을 선택합니다."
            options={[
              { value: MissionType.GENERAL, label: MISSION_TYPE_LABELS[MissionType.GENERAL] },
              {
                value: MissionType.EXPERIENCE_GROUP,
                label: MISSION_TYPE_LABELS[MissionType.EXPERIENCE_GROUP],
              },
            ]}
          />

          <SelectField
            control={form.control}
            name="category"
            label="카테고리"
            description="미션의 카테고리를 선택합니다."
            options={[
              {
                value: MissionCategory.PROMOTION,
                label: MISSION_CATEGORY_LABELS[MissionCategory.PROMOTION],
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
        </div>

        <NumberField
          control={form.control}
          name="maxParticipants"
          label="최대 참여자 수"
          description="비워두면 제한 없음으로 설정됩니다."
          placeholder="제한 없음"
          isOptional
          transformValue={value => (value === undefined ? null : value)}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">설명</Label>
            <CharacterCounter
              current={form.watch("description")?.length || 0}
              max={MISSION_DESCRIPTION_MAX_LENGTH}
            />
          </div>
          <TiptapEditor
            content={form.watch("description") || ""}
            onUpdate={content => {
              form.setValue("description", content || undefined, { shouldDirty: true });
            }}
            placeholder="미션에 대한 설명을 입력하세요"
            showToolbar={true}
            className="min-h-[200px]"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="target">대상</Label>
            <CharacterCounter
              current={form.watch("target")?.length || 0}
              max={MISSION_TARGET_MAX_LENGTH}
            />
          </div>
          <Input
            id="target"
            placeholder="미션 대상을 입력하세요"
            maxLength={MISSION_TARGET_MAX_LENGTH}
            {...form.register("target")}
          />
          {form.formState.errors.target && (
            <p className="text-sm text-destructive">{form.formState.errors.target.message}</p>
          )}
        </div>

        <NumberField
          control={form.control}
          name="estimatedMinutes"
          label="예상 소요 시간 (분)"
          description="미션 완료에 필요한 예상 시간을 입력합니다."
          isOptional
          transformValue={value => (value === undefined ? null : value)}
        />

        <DateTimeField
          control={form.control}
          name="deadline"
          label="마감일"
          description="미션의 마감일을 설정합니다."
          datePlaceholder="마감일 선택"
          isOptional
        />
      </CardContent>
    </Card>
  );
}
