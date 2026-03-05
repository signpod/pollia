"use client";

import {
  MobilePreviewPanel,
  useMobilePreviewRefresh,
} from "@/app/admin/components/common/MobilePreviewPanel";
import { SelectField } from "@/app/admin/components/common/SelectField";
import { ToggleField } from "@/app/admin/components/common/ToggleField";
import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageEditWithCrop } from "@/app/admin/components/common/cropper/use-image-edit-with-crop";
import {
  DateView,
  ImageEditableView,
  LabeledView,
  NumberView,
  TextView,
} from "@/app/admin/components/common/molecules/viewers";
import { TiptapViewer } from "@/app/admin/components/common/tiptap";
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
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { cleanTiptapHTML } from "@/lib/utils";
import type { GetMissionResponse } from "@/types/dto";
import { MissionCategory, MissionType } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BasicInfoEditDialog } from "../edit/BasicInfoEditDialog";

interface MissionBasicInfoProps {
  mission: GetMissionResponse["data"];
}

interface InlineToggleFormValues {
  isActive: boolean;
  isExposed: boolean;
  category: MissionCategory;
  allowGuestResponse: boolean;
  allowMultipleResponses: boolean;
}

export function MissionTabBasicInfoContent({ mission }: MissionBasicInfoProps) {
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const previewAnchorRef = useRef<HTMLDivElement>(null);
  const { refreshKey, refresh } = useMobilePreviewRefresh();

  const form = useForm<InlineToggleFormValues>({
    defaultValues: {
      isActive: mission.isActive,
      isExposed: mission.type === MissionType.GENERAL,
      category: mission.category,
      allowGuestResponse: mission.allowGuestResponse,
      allowMultipleResponses: mission.allowMultipleResponses,
    },
  });

  const updateMission = useUpdateMission();

  const projectImageEdit = useImageEditWithCrop({
    fileNamePrefix: `mission-image-${mission.id}`,
    initialUrl: mission.imageUrl,
    initialFileUploadId: mission.imageFileUploadId,
    onBeforeOpen: refresh,
    onUploadSuccess: (data, image) => {
      updateMission.mutate(
        {
          missionId: mission.id,
          data: {
            imageUrl: data.publicUrl,
            imageFileUploadId: data.fileUploadId,
          },
        },
        {
          onSuccess: () => {
            image.deleteMarkedInitial();
            refresh();
            toast.success(`${UBIQUITOUS_CONSTANTS.MISSION} 이미지가 수정되었습니다`);
          },
          onError: error => {
            image.discard();
            image.unmarkInitial();
            toast.error(
              error.message || `${UBIQUITOUS_CONSTANTS.MISSION} 이미지 저장에 실패했습니다`,
            );
          },
        },
      );
    },
    onUploadError: error => {
      toast.error(error.message || `${UBIQUITOUS_CONSTANTS.MISSION} 이미지 업로드에 실패했습니다`);
    },
  });

  const brandLogoEdit = useImageEditWithCrop({
    fileNamePrefix: `brand-logo-${mission.id}`,
    initialUrl: mission.brandLogoUrl,
    initialFileUploadId: mission.brandLogoFileUploadId,
    onBeforeOpen: refresh,
    onUploadSuccess: (data, image) => {
      updateMission.mutate(
        {
          missionId: mission.id,
          data: {
            brandLogoUrl: data.publicUrl,
            brandLogoFileUploadId: data.fileUploadId,
          },
        },
        {
          onSuccess: () => {
            image.deleteMarkedInitial();
            refresh();
            toast.success("브랜드 로고가 수정되었습니다");
          },
          onError: error => {
            image.discard();
            image.unmarkInitial();
            toast.error(error.message || "브랜드 로고 저장에 실패했습니다");
          },
        },
      );
    },
    onUploadError: error => {
      toast.error(error.message || "브랜드 로고 업로드에 실패했습니다");
    },
  });

  useEffect(() => {
    form.reset({
      isActive: mission.isActive,
      isExposed: mission.type === MissionType.GENERAL,
      category: mission.category,
      allowGuestResponse: mission.allowGuestResponse,
      allowMultipleResponses: mission.allowMultipleResponses,
    });
  }, [
    mission.isActive,
    mission.type,
    mission.category,
    mission.allowGuestResponse,
    mission.allowMultipleResponses,
    form,
  ]);

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
      if (
        name === "allowGuestResponse" &&
        value.allowGuestResponse !== undefined &&
        value.allowGuestResponse !== mission.allowGuestResponse
      ) {
        updateMission.mutate({
          missionId: mission.id,
          data: { allowGuestResponse: value.allowGuestResponse },
        });
      }
      if (
        name === "allowMultipleResponses" &&
        value.allowMultipleResponses !== undefined &&
        value.allowMultipleResponses !== mission.allowMultipleResponses
      ) {
        updateMission.mutate({
          missionId: mission.id,
          data: { allowMultipleResponses: value.allowMultipleResponses },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [
    form,
    mission.id,
    mission.isActive,
    mission.type,
    mission.category,
    mission.allowGuestResponse,
    mission.allowMultipleResponses,
    updateMission,
  ]);

  const isProjectImageBusy = projectImageEdit.image.isUploading || updateMission.isPending;
  const isBrandLogoBusy = brandLogoEdit.image.isUploading || updateMission.isPending;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>인트로 정보</CardTitle>
                <CardDescription>
                  {UBIQUITOUS_CONSTANTS.MISSION} 인트로 화면에 표시되는 정보
                </CardDescription>
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
                  description={`${UBIQUITOUS_CONSTANTS.MISSION}을 활성화하거나 비활성화합니다`}
                  disabled={updateMission.isPending}
                />
                <ToggleField
                  control={form.control}
                  name="isExposed"
                  label="노출여부"
                  description={`노출 시 ${UBIQUITOUS_CONSTANTS.MISSION} 목록에 표시됩니다`}
                  disabled={updateMission.isPending}
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
                    {
                      value: MissionCategory.QUIZ,
                      label: MISSION_CATEGORY_LABELS[MissionCategory.QUIZ],
                    },
                  ]}
                  disabled={updateMission.isPending}
                />
                <ToggleField
                  control={form.control}
                  name="allowGuestResponse"
                  label="비회원 참여 허용"
                  description="비회원(게스트)도 참여할 수 있도록 허용합니다"
                  disabled={updateMission.isPending}
                />
                <ToggleField
                  control={form.control}
                  name="allowMultipleResponses"
                  label="다중 응답 허용"
                  description="동일 사용자가 여러 번 응답할 수 있도록 허용합니다"
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
                {mission.description && cleanTiptapHTML(mission.description) ? (
                  <TiptapViewer
                    content={cleanTiptapHTML(mission.description)}
                    className="max-w-[600px] border"
                  />
                ) : (
                  <span className="text-muted-foreground italic">설정되지 않음</span>
                )}
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
                <ImageEditableView
                  title={`${UBIQUITOUS_CONSTANTS.MISSION} 이미지`}
                  description="권장 비율 9:16"
                  imageUrl={mission.imageUrl}
                  imageAlt={`${UBIQUITOUS_CONSTANTS.MISSION} 이미지`}
                  imageSize="lg"
                  disabled={isProjectImageBusy}
                  onAddFile={projectImageEdit.handleAddFile}
                  onEdit={() =>
                    projectImageEdit.handleEditImage(
                      mission.imageUrl,
                      `mission-image-${mission.id}.jpg`,
                    )
                  }
                  onDelete={() => {
                    refresh();
                    projectImageEdit.image.discard();
                    updateMission.mutate(
                      {
                        missionId: mission.id,
                        data: {
                          imageUrl: null,
                          imageFileUploadId: null,
                        },
                      },
                      {
                        onSuccess: () => {
                          projectImageEdit.image.deleteMarkedInitial();
                          refresh();
                          toast.success(`${UBIQUITOUS_CONSTANTS.MISSION} 이미지가 삭제되었습니다`);
                        },
                        onError: error => {
                          projectImageEdit.image.reset();
                          toast.error(
                            error.message ||
                              `${UBIQUITOUS_CONSTANTS.MISSION} 이미지 삭제에 실패했습니다`,
                          );
                        },
                      },
                    );
                  }}
                />
                <ImageEditableView
                  title="브랜드 로고"
                  description="권장 비율 1:1"
                  imageUrl={mission.brandLogoUrl}
                  imageAlt="브랜드 로고"
                  imageSize="md"
                  disabled={isBrandLogoBusy}
                  onAddFile={brandLogoEdit.handleAddFile}
                  onEdit={() =>
                    brandLogoEdit.handleEditImage(
                      mission.brandLogoUrl,
                      `brand-logo-${mission.id}.jpg`,
                    )
                  }
                  onDelete={() => {
                    refresh();
                    brandLogoEdit.image.discard();
                    updateMission.mutate(
                      {
                        missionId: mission.id,
                        data: {
                          brandLogoUrl: null,
                          brandLogoFileUploadId: null,
                        },
                      },
                      {
                        onSuccess: () => {
                          brandLogoEdit.image.deleteMarkedInitial();
                          refresh();
                          toast.success("브랜드 로고가 삭제되었습니다");
                        },
                        onError: error => {
                          brandLogoEdit.image.reset();
                          toast.error(error.message || "브랜드 로고 삭제에 실패했습니다");
                        },
                      },
                    );
                  }}
                />
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

      <MobilePreviewPanel
        anchor={previewAnchorRef}
        url={ROUTES.MISSION(mission.id)}
        refreshKey={refreshKey}
      />

      <BasicInfoEditDialog
        open={isBasicInfoDialogOpen}
        onOpenChange={setIsBasicInfoDialogOpen}
        missionId={mission.id}
      />

      <AdminImageCropDialog
        open={projectImageEdit.cropper.isOpen}
        imageSrc={projectImageEdit.cropper.imageSrc}
        aspect={9 / 16}
        title={`${UBIQUITOUS_CONSTANTS.MISSION} 이미지 편집`}
        description="이미지를 9:16 비율로 맞춰 저장합니다."
        fileName={projectImageEdit.cropper.fileName ?? `mission-image-${mission.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            projectImageEdit.cropper.close();
          }
        }}
        onConfirm={file => {
          projectImageEdit.image.upload(file);
        }}
      />

      <AdminImageCropDialog
        open={brandLogoEdit.cropper.isOpen}
        imageSrc={brandLogoEdit.cropper.imageSrc}
        aspect={1}
        title="브랜드 로고 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={brandLogoEdit.cropper.fileName ?? `brand-logo-${mission.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            brandLogoEdit.cropper.close();
          }
        }}
        onConfirm={file => {
          brandLogoEdit.image.upload(file);
        }}
      />
    </>
  );
}
