import { InputField } from "@/app/admin/components/common/InputField";
import { NumberField } from "@/app/admin/components/common/NumberField";
import { TiptapField } from "@/app/admin/components/common/TiptapField";
import { DateTimeField } from "@/app/admin/components/common/molecules/DateTimeField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  type MissionUpdate,
  missionUpdateSchema,
} from "@/schemas/mission";
import {
  type MissionCompletionForm,
  missionCompletionFormSchema,
} from "@/schemas/mission-completion";
import type { GetMissionCompletionResponse, GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";

export type MissionData = GetMissionResponse["data"];
export type MissionCompletionData = GetMissionCompletionResponse["data"];

export interface BasicInfoCardProps {
  form: UseFormReturn<MissionUpdate>;
}

export function BasicInfoCard({ form }: BasicInfoCardProps) {
  return (
    <>
      <InputField
        control={form.control}
        name="title"
        label="제목"
        description={`${UBQUITOUS_CONSTANTS.MISSION}의 제목을 입력하세요.`}
        placeholder={`${UBQUITOUS_CONSTANTS.MISSION} 제목을 입력하세요`}
        maxLength={MISSION_TITLE_MAX_LENGTH}
        showCounter
      />

      <TiptapField
        control={form.control}
        name="description"
        label="설명"
        description={`${UBQUITOUS_CONSTANTS.MISSION}에 대한 설명을 입력하세요.`}
        placeholder={`${UBQUITOUS_CONSTANTS.MISSION}에 대한 설명을 입력하세요`}
        maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
        showCounter
        showToolbar
        minHeight="200px"
        isOptional
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

      <InputField
        control={form.control}
        name="target"
        label="대상"
        description={`${UBQUITOUS_CONSTANTS.MISSION} 대상을 입력하세요.`}
        placeholder={`${UBQUITOUS_CONSTANTS.MISSION} 대상을 입력하세요`}
        maxLength={MISSION_TARGET_MAX_LENGTH}
        showCounter
        isOptional
      />

      <NumberField
        control={form.control}
        name="estimatedMinutes"
        label="예상 소요 시간 (분)"
        description={`${UBQUITOUS_CONSTANTS.MISSION} 완료에 필요한 예상 시간을 입력합니다.`}
        isOptional
        transformValue={value => (value === undefined ? null : value)}
      />

      <DateTimeField
        control={form.control}
        name="startDate"
        label="시작일"
        description={`${UBQUITOUS_CONSTANTS.MISSION}의 시작일을 설정합니다.`}
        datePlaceholder="시작일 선택"
        isOptional
        supportNull
      />

      <DateTimeField
        control={form.control}
        name="deadline"
        label="마감일"
        description={`${UBQUITOUS_CONSTANTS.MISSION}의 마감일을 설정합니다.`}
        datePlaceholder="마감일 선택"
        isOptional
        supportNull
      />
    </>
  );
}

export function useBasicInfoForm(mission: MissionData) {
  const defaultValues = {
    title: mission.title,
    type: mission.type,
    description: mission.description ?? "",
    target: mission.target ?? "",
    imageUrl: mission.imageUrl ?? undefined,
    brandLogoUrl: mission.brandLogoUrl ?? undefined,
    estimatedMinutes: mission.estimatedMinutes ?? null,
    startDate: mission.startDate ? new Date(mission.startDate) : null,
    deadline: mission.deadline ? new Date(mission.deadline) : null,
    maxParticipants: mission.maxParticipants ?? null,
    isActive: mission.isActive,
  };

  const form = useForm<MissionUpdate>({
    resolver: zodResolver(missionUpdateSchema),
    defaultValues,
  });

  const handleReset = () => form.reset(defaultValues);

  return { form, handleReset };
}

export function LinksSection({ form }: { form: UseFormReturn<MissionCompletionForm> }) {
  const links = form.watch("links") || {};
  const linkEntries = Object.entries(links);
  const [newLinkKey, setNewLinkKey] = useState("");
  const [newLinkValue, setNewLinkValue] = useState("");

  const handleAddLink = () => {
    if (!newLinkKey.trim() || !newLinkValue.trim()) {
      toast.error("링크 이름과 URL을 모두 입력해주세요");
      return;
    }

    try {
      new URL(newLinkValue);
    } catch {
      toast.error("올바른 URL 형식이 아닙니다");
      return;
    }

    const currentLinks = form.watch("links") || {};
    form.setValue(
      "links",
      { ...currentLinks, [newLinkKey.trim()]: newLinkValue.trim() },
      {
        shouldDirty: true,
      },
    );
    setNewLinkKey("");
    setNewLinkValue("");
  };

  const handleRemoveLink = (key: string) => {
    const currentLinks = form.watch("links") || {};
    const { [key]: _, ...rest } = currentLinks;
    form.setValue("links", Object.keys(rest).length > 0 ? rest : undefined, {
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-4">
      {linkEntries.length > 0 && (
        <div className="space-y-2">
          {linkEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">{key}</div>
                <div className="text-sm text-foreground break-all">{value}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLink(key)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="링크 이름"
          value={newLinkKey}
          onChange={e => setNewLinkKey(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLink();
            }
          }}
        />
        <Input
          placeholder="URL"
          type="url"
          value={newLinkValue}
          onChange={e => setNewLinkValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLink();
            }
          }}
        />
        <Button type="button" onClick={handleAddLink} aria-label="링크 추가">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function useCompletionForm(completion: MissionCompletionData | null) {
  const defaultValues: MissionCompletionForm = {
    title: completion?.title ?? "",
    description: completion?.description ?? "",
    imageUrl: completion?.imageUrl ?? undefined,
    imageFileUploadId: completion?.imageFileUploadId ?? undefined,
    links: completion?.links ?? undefined,
  };

  const form = useForm<MissionCompletionForm>({
    resolver: zodResolver(missionCompletionFormSchema),
    defaultValues,
  });

  const handleReset = () => form.reset(defaultValues);

  return { form, handleReset };
}
