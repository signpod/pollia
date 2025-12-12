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
          <Label htmlFor="title">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input id="title" placeholder="미션 제목을 입력하세요" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
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
          <Label htmlFor="target">대상</Label>
          <Input id="target" placeholder="미션 대상을 입력하세요" {...form.register("target")} />
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
