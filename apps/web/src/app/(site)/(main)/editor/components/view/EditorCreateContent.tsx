"use client";

import { CreateProjectInfoStep } from "@/app/(site)/(main)/create/components/CreateProjectInfoStep";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionCategory } from "@prisma/client";
import { Button } from "@repo/ui/components";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EditorBottomSaveSlot } from "../../missions/[missionId]/components/EditorBottomSaveSlot";
import { useEditorMissionTab } from "../../missions/[missionId]/components/EditorMissionTabContext";
import { useEditorCreateTransitionController } from "../controller/useEditorCreateTransitionController";
import { EditorEmptyTabContent } from "./EditorEmptyTabContent";
import { EditorSectionCard } from "./EditorSectionCard";

const VALID_CATEGORIES = new Set<string>(Object.values(MissionCategory));

const CREATE_FORM_BASE_VALUES = {
  creationMode: "custom",
  title: "",
  description: "",
  hasReward: false as const,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
  useAiCompletion: false,
} satisfies Omit<CreateMissionFormData, "category">;

export function EditorCreateContent() {
  const { currentTab } = useEditorMissionTab();
  const searchParams = useSearchParams();

  const initialCategory = useMemo(() => {
    const param = searchParams.get("category");
    if (param && VALID_CATEGORIES.has(param)) return param as MissionCategory;
    return null;
  }, [searchParams]);

  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: { ...CREATE_FORM_BASE_VALUES, category: initialCategory },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const controller = useEditorCreateTransitionController({ form });

  const submitButtonNode = useMemo(
    () => (
      <div className="px-5 py-3">
        <Button
          fullWidth
          loading={controller.isSubmitting}
          disabled={controller.isSubmitting}
          onClick={controller.handleCreate}
        >
          생성하기
        </Button>
      </div>
    ),
    [controller.isSubmitting, controller.handleCreate],
  );

  if (currentTab === "stats" || currentTab === "preview") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey="editor-create-submit"
          isActive={false}
          node={submitButtonNode}
        />
        <EditorEmptyTabContent message="프로젝트를 생성해주세요" />
      </>
    );
  }

  return (
    <FormProvider {...form}>
      <EditorBottomSaveSlot
        slotKey="editor-create-submit"
        isActive={currentTab === "editor"}
        node={submitButtonNode}
      />
      <EditorSectionCard title="프로젝트 기본정보" description="프로젝트 기본 정보를 입력합니다.">
        <div className="px-5 py-5">
          <CreateProjectInfoStep showRewardSettings showAiCompletionToggle />
        </div>
      </EditorSectionCard>
    </FormProvider>
  );
}
