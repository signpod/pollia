"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { useCreateMission } from "@/app/admin/hooks/use-create-mission";
import { missionInputSchema } from "@/schemas/mission";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "../../constants/routes";
import { BasicInfoCard } from "./components/BasicInfoCard";
import { ImageCard } from "./components/ImageCard";

export default function AdminMissionCreatePage() {
  const router = useRouter();
  const createMission = useCreateMission({
    onSuccess: data => {
      toast.success("미션이 생성되었습니다.");
      router.push(ADMIN_ROUTES.ADMIN_MISSION_EDIT(data.data.id));
    },
    onError: error => {
      toast.warning(error.message || "미션 생성 중 오류가 발생했습니다.");
    },
  });

  const form = useForm({
    resolver: zodResolver(missionInputSchema),
    defaultValues: {
      title: "",
      description: "",
      target: "",
      imageUrl: undefined,
      brandLogoUrl: undefined,
      estimatedMinutes: undefined,
      deadline: undefined,
      isActive: undefined,
      actionIds: [],
    },
  });

  const onSubmit = form.handleSubmit(data => {
    createMission.mutate(data);
  });

  return (
    <div className="px-6 py-8 ">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">새 미션 만들기</h1>
        <p className="text-muted-foreground mt-2">
          미션의 기본 정보를 입력하세요. 액션과 리워드는 생성 후 추가할 수 있습니다.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
        <BasicInfoCard form={form} />
        <ImageCard form={form} />

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
