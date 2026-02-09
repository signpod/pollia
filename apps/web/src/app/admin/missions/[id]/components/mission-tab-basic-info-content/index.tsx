"use client";

import { MobilePreviewPanel } from "@/app/admin/components/common/MobilePreviewPanel";
import { ToggleField } from "@/app/admin/components/common/ToggleField";
import {
  BadgeView,
  DateView,
  ImageView,
  LabeledView,
  NumberView,
  TextView,
} from "@/app/admin/components/common/molecules/viewers";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { useUpdateMission } from "@/app/admin/hooks/mission/use-update-mission";
import { stripHtmlTags } from "@/app/admin/lib/utils";
import { MISSION_CATEGORY_LABELS, MISSION_TYPE_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import type { GetMissionResponse } from "@/types/dto";
import { MissionType } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicInfoEditDialog } from "../edit/BasicInfoEditDialog";
import { ImageEditDialog } from "../edit/ImageEditDialog";

interface MissionBasicInfoProps {
  mission: GetMissionResponse["data"];
}

interface ActiveFormValues {
  isActive: boolean;
}

export function MissionTabBasicInfoContent({ mission }: MissionBasicInfoProps) {
  const missionTypeLabel = MISSION_TYPE_LABELS[mission.type];
  const missionCategoryLabel = MISSION_CATEGORY_LABELS[mission.category];
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const previewAnchorRef = useRef<HTMLDivElement>(null);

  const typeBadgeVariant = mission.type === MissionType.EXPERIENCE_GROUP ? "default" : "secondary";

  const form = useForm<ActiveFormValues>({
    defaultValues: {
      isActive: mission.isActive,
    },
  });

  const updateMission = useUpdateMission();

  useEffect(() => {
    form.reset({ isActive: mission.isActive });
  }, [mission.isActive, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "isActive" && value.isActive !== undefined) {
        updateMission.mutate({
          missionId: mission.id,
          data: { isActive: value.isActive },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, mission.id, updateMission]);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>인트로 정보</CardTitle>
                <CardDescription>미션 인트로 화면에 표시되는 정보</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsBasicInfoDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  기본 정보 편집
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsImageDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  미디어 편집
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <ToggleField
                control={form.control}
                name="isActive"
                label="활성 상태"
                description="미션을 활성화하거나 비활성화합니다"
                disabled={updateMission.isPending}
              />
            </Form>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LabeledView label="타입">
                  <BadgeView value={missionTypeLabel} variant={typeBadgeVariant} />
                </LabeledView>
                <LabeledView label="카테고리">
                  <BadgeView value={missionCategoryLabel} variant="outline" />
                </LabeledView>
              </div>
              <LabeledView label="제목">
                <TextView value={mission.title} />
              </LabeledView>
              <LabeledView label="타겟">
                <TextView value={mission.target} />
              </LabeledView>
              <LabeledView label="설명">
                <TextView
                  value={mission.description ? stripHtmlTags(mission.description) : null}
                  multiline
                />
              </LabeledView>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">일정 및 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LabeledView label="시작일">
                  <DateView value={mission.startDate} dateFormat="date" />
                </LabeledView>
                <LabeledView label="마감일">
                  <DateView value={mission.deadline} dateFormat="date" />
                </LabeledView>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LabeledView label="예상 소요 시간">
                  <NumberView value={mission.estimatedMinutes} unit="분" />
                </LabeledView>
                <LabeledView label="최대 참여자 수">
                  <NumberView value={mission.maxParticipants} unit="명" placeholder="제한 없음" />
                </LabeledView>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">미디어</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LabeledView label="미션 이미지">
                  <ImageView src={mission.imageUrl} alt="미션 이미지" size="lg" />
                </LabeledView>
                <LabeledView label="브랜드 로고">
                  <ImageView src={mission.brandLogoUrl} alt="브랜드 로고" size="md" />
                </LabeledView>
              </div>
            </section>

            <Separator />

            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LabeledView label="생성일">
                  <DateView value={mission.createdAt} dateFormat="datetime" />
                </LabeledView>
                <LabeledView label="수정일">
                  <DateView value={mission.updatedAt} dateFormat="datetime" />
                </LabeledView>
              </div>
            </section>
          </CardContent>
        </Card>

        <div ref={previewAnchorRef} className="hidden xl:block" />
      </div>

      <MobilePreviewPanel anchor={previewAnchorRef} url={ROUTES.MISSION(mission.id)} />

      <BasicInfoEditDialog
        open={isBasicInfoDialogOpen}
        onOpenChange={setIsBasicInfoDialogOpen}
        missionId={mission.id}
      />

      <ImageEditDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        missionId={mission.id}
      />
    </>
  );
}
