"use client";

import { MobilePreviewPanel } from "@/app/admin/components/common/MobilePreviewPanel";
import { SelectField } from "@/app/admin/components/common/SelectField";
import { ToggleField } from "@/app/admin/components/common/ToggleField";
import {
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
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import type { GetMissionResponse } from "@/types/dto";
import { MissionCategory, MissionType } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicInfoEditDialog } from "../edit/BasicInfoEditDialog";
import { ImageEditDialog } from "../edit/ImageEditDialog";

interface MissionBasicInfoProps {
  mission: GetMissionResponse["data"];
}

interface InlineToggleFormValues {
  isActive: boolean;
  isExposed: boolean;
  category: MissionCategory;
}

export function MissionTabBasicInfoContent({ mission }: MissionBasicInfoProps) {
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const previewAnchorRef = useRef<HTMLDivElement>(null);

  const form = useForm<InlineToggleFormValues>({
    defaultValues: {
      isActive: mission.isActive,
      isExposed: mission.type === MissionType.GENERAL,
      category: mission.category,
    },
  });

  const updateMission = useUpdateMission();

  useEffect(() => {
    form.reset({
      isActive: mission.isActive,
      isExposed: mission.type === MissionType.GENERAL,
      category: mission.category,
    });
  }, [mission.isActive, mission.type, mission.category, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type !== "change") return;
      if (
        name === "isActive" &&
        value.isActive !== undefined &&
        value.isActive !== mission.isActive
      ) {
        updateMission.mutate({
          missionId: mission.id,
          data: { isActive: value.isActive },
        });
      }
      if (
        name === "isExposed" &&
        value.isExposed !== undefined &&
        value.isExposed !== (mission.type === MissionType.GENERAL)
      ) {
        updateMission.mutate({
          missionId: mission.id,
          data: {
            type: value.isExposed ? MissionType.GENERAL : MissionType.EXPERIENCE_GROUP,
          },
        });
      }
      if (
        name === "category" &&
        value.category !== undefined &&
        value.category !== mission.category
      ) {
        updateMission.mutate({
          missionId: mission.id,
          data: { category: value.category },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, mission.id, mission.isActive, mission.type, mission.category, updateMission]);

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
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ToggleField
                  control={form.control}
                  name="isActive"
                  label="활성 상태"
                  description="미션을 활성화하거나 비활성화합니다"
                  disabled={updateMission.isPending}
                />
                <ToggleField
                  control={form.control}
                  name="isExposed"
                  label="노출여부"
                  description="노출 시 미션 목록에 표시됩니다"
                  disabled={updateMission.isPending}
                />
                <SelectField
                  control={form.control}
                  name="category"
                  label="카테고리"
                  description="미션의 카테고리를 선택합니다."
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
                    {
                      value: MissionCategory.QUIZ,
                      label: MISSION_CATEGORY_LABELS[MissionCategory.QUIZ],
                    },
                  ]}
                  disabled={updateMission.isPending}
                />
              </div>
            </Form>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">기본 정보</h3>

                <Button variant="outline" size="sm" onClick={() => setIsBasicInfoDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  기본 정보 편집
                </Button>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">미디어</h3>
                <Button variant="outline" size="sm" onClick={() => setIsImageDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  미디어 편집
                </Button>
              </div>
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
