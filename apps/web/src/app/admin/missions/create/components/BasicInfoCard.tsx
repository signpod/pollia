"use client";

import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { NumberField } from "@/app/admin/components/common/NumberField";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { MISSION_TYPE_LABELS } from "@/constants/action";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "@/schemas/mission";
import { MissionType } from "@prisma/client";
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

        <div className="flex gap-10">
          <div className="space-y-2">
            <Label htmlFor="type">
              타입 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("type")}
              onValueChange={value => {
                form.setValue("type", value as MissionType, { shouldDirty: true });
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="미션 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MissionType.GENERAL}>
                  {MISSION_TYPE_LABELS[MissionType.GENERAL]}
                </SelectItem>
                <SelectItem value={MissionType.EXPERIENCE_GROUP}>
                  {MISSION_TYPE_LABELS[MissionType.EXPERIENCE_GROUP]}
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">최대 참여자 수</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="제한 없음"
              min="1"
              {...form.register("maxParticipants", {
                setValueAs: value => {
                  if (!value || value === "") return null;
                  const num = Number(value);
                  return Number.isNaN(num) ? null : num;
                },
              })}
            />
            {form.formState.errors.maxParticipants && (
              <p className="text-sm text-destructive">
                {form.formState.errors.maxParticipants.message}
              </p>
            )}
          </div>
        </div>

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
