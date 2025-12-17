import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { TiptapEditor } from "@/app/admin/components/common/TiptapEditor";
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
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
} from "@/schemas/mission";
import type { UseFormReturn } from "react-hook-form";

interface BasicInfoCardProps {
  form: UseFormReturn<{
    title: string;
    description?: string | undefined;
    target?: string | undefined;
    imageUrl?: string | undefined;
    imageFileUploadId?: string | undefined;
    brandLogoUrl?: string | undefined;
    brandLogoFileUploadId?: string | undefined;
    deadline?: Date | undefined;
    estimatedMinutes?: number | undefined;
    type: "GENERAL" | "EXPERIENCE_GROUP";
    actionIds?: string[] | undefined;
    isActive?: boolean | undefined;
  }>;
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

        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">예상 소요 시간 (분)</Label>
          <Input
            id="estimatedMinutes"
            type="number"
            placeholder="예상 소요 시간을 입력하세요"
            {...form.register("estimatedMinutes", {
              setValueAs: value => (value === "" ? undefined : Number(value)),
            })}
          />
          {form.formState.errors.estimatedMinutes && (
            <p className="text-sm text-destructive">
              {form.formState.errors.estimatedMinutes.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">마감일</Label>
          <Input
            id="deadline"
            type="datetime-local"
            {...form.register("deadline", {
              setValueAs: value => (value ? new Date(value) : undefined),
            })}
          />
          {form.formState.errors.deadline && (
            <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
