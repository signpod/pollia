"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { useCreateMission } from "@/app/admin/hooks/use-create-mission";
import { missionInputSchema } from "@/schemas/mission";
import type { MissionInput } from "@/schemas/mission";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AdminMissionCreatePage() {
  const router = useRouter();
  const createMission = useCreateMission({
    onSuccess: data => {
      toast.success("미션이 생성되었습니다.");
      router.push(`/admin/missions/${data.data.id}`);
    },
    onError: error => {
      toast.warning(error.message || "미션 생성 중 오류가 발생했습니다.");
    },
  });

  const form = useForm<MissionInput>({
    resolver: zodResolver(missionInputSchema),
    defaultValues: {
      title: "",
      description: "",
      target: "",
      imageUrl: "",
      brandLogoUrl: "",
      estimatedMinutes: undefined,
      deadline: undefined,
      isActive: undefined,
    },
  });

  const onSubmit = form.handleSubmit(data => {
    createMission.mutate(data);
  });

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">새 미션 만들기</h1>
        <p className="text-muted-foreground mt-2">
          미션의 기본 정보를 입력하세요. 액션과 리워드는 생성 후 추가할 수 있습니다.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
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
              <Textarea
                id="description"
                placeholder="미션에 대한 설명을 입력하세요"
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">대상</Label>
              <Input
                id="target"
                placeholder="미션 대상을 입력하세요"
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
                  valueAsNumber: true,
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

        <Card>
          <CardHeader>
            <CardTitle>이미지</CardTitle>
            <CardDescription>미션 이미지와 브랜드 로고를 업로드하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">미션 이미지 URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
              )}
              <p className="text-xs text-muted-foreground">TODO: 파일 업로드 기능 추가 예정</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandLogoUrl">브랜드 로고 URL</Label>
              <Input
                id="brandLogoUrl"
                type="url"
                placeholder="https://example.com/logo.jpg"
                {...form.register("brandLogoUrl")}
              />
              {form.formState.errors.brandLogoUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.brandLogoUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMission.isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={createMission.isPending}>
            {createMission.isPending ? "생성 중..." : "미션 생성"}
          </Button>
        </div>
      </form>
    </div>
  );
}
