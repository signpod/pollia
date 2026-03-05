"use client";

import { CreateCategoryStep } from "@/app/(site)/(main)/create/components/CreateCategoryStep";
import { CreateProjectInfoStep } from "@/app/(site)/(main)/create/components/CreateProjectInfoStep";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Typo } from "@repo/ui/components";
import { FormProvider, useForm } from "react-hook-form";
import { useEditorMissionTab } from "../../missions/[missionId]/components/EditorMissionTabContext";
import { useEditorCreateTransitionController } from "../controller/useEditorCreateTransitionController";
import { EditorEmptyTabContent } from "./EditorEmptyTabContent";

const CREATE_FORM_DEFAULT_VALUES: CreateMissionFormData = {
  category: null,
  creationMode: "custom",
  title: "",
  description: "",
  hasReward: false,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
  useAiCompletion: false,
};

export function EditorCreateContent() {
  const { currentTab } = useEditorMissionTab();

  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: CREATE_FORM_DEFAULT_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const controller = useEditorCreateTransitionController({ form });

  if (currentTab === "stats" || currentTab === "preview") {
    return <EditorEmptyTabContent message="프로젝트를 생성해주세요" />;
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col">
        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <Typo.SubTitle>카테고리 선택</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              프로젝트 카테고리를 선택합니다.
            </Typo.Body>
          </div>
          <div className="px-5 py-5">
            <CreateCategoryStep />
          </div>
        </div>

        <Separator className="h-2" />

        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <Typo.SubTitle>프로젝트 기본정보</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              프로젝트 기본 정보를 입력합니다.
            </Typo.Body>
          </div>
          <div className="px-5 py-5">
            <CreateProjectInfoStep showRewardSettings showAiCompletionToggle />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-5 py-4">
          <Button
            fullWidth
            loading={controller.isSubmitting}
            disabled={controller.isSubmitting}
            onClick={controller.handleCreate}
          >
            생성하기
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
