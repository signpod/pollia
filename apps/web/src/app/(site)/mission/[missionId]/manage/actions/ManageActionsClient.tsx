"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadActionsDetail } from "@/hooks/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import {
  Button,
  DrawerContent,
  DrawerHeader,
  DrawerProvider,
  EmptyState,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ActionCard } from "./components/ActionCard";
import { ActionForm, type ActionFormValues } from "./components/ActionForm";
import { ActionTypeSelector } from "./components/ActionTypeSelector";
import { type DrawerMode, useManageActionsController } from "./logic";

interface ManageActionsClientProps {
  missionId: string;
}

export function ManageActionsClient({ missionId }: ManageActionsClientProps) {
  const router = useRouter();
  const { data: actionsData, isLoading: actionsLoading } = useReadActionsDetail(missionId);

  const { data: completionsData } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const actions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const completionOptions = useMemo(
    () =>
      (completionsData?.data ?? []).map(c => ({
        id: c.id,
        title: c.title ?? "완료 화면",
      })),
    [completionsData],
  );
  const controller = useManageActionsController({ missionId, actions });

  return (
    <DrawerProvider>
      <div className="min-h-screen bg-zinc-50">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
          <button type="button" onClick={() => router.back()} className="p-1">
            <ChevronLeft className="size-6" />
          </button>
          <Typo.SubTitle>액션 설정</Typo.SubTitle>
        </header>

        <div className="flex flex-col gap-3 p-4">
          {actionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Typo.Body size="medium" className="text-zinc-400">
                로딩 중...
              </Typo.Body>
            </div>
          ) : actions.length === 0 ? (
            <EmptyState
              title="아직 액션이 없습니다"
              description={`${UBIQUITOUS_CONSTANTS.MISSION}에 참여자가 수행할 액션을 추가해주세요.`}
            />
          ) : (
            actions.map((action, index) => (
              <ActionCard
                key={action.id}
                action={action}
                index={index}
                total={actions.length}
                allActions={actions}
                onEdit={controller.handleEdit}
                onDelete={controller.setDeleteTarget}
                onMoveUp={controller.handleMoveUp}
                onMoveDown={controller.handleMoveDown}
              />
            ))
          )}

          <button
            type="button"
            onClick={controller.openTypeSelector}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500"
          >
            <Plus className="size-5" />
            <Typo.Body size="medium" className="font-medium">
              액션 추가
            </Typo.Body>
          </button>
        </div>

        {controller.deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6">
              <Typo.SubTitle className="mb-2">액션 삭제</Typo.SubTitle>
              <Typo.Body size="medium" className="mb-6 text-zinc-500">
                "{controller.deleteTarget.title}" 액션을 삭제하시겠습니까? 이 작업은 되돌릴 수
                없습니다.
              </Typo.Body>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => controller.setDeleteTarget(null)}
                  disabled={controller.isDeleteLoading}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  onClick={controller.handleDeleteConfirm}
                  loading={controller.isDeleteLoading}
                  disabled={controller.isDeleteLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        <ActionDrawerContent
          mode={controller.drawerMode}
          selectedType={controller.selectedType}
          editingAction={controller.editingAction}
          actions={actions}
          completionOptions={completionOptions}
          isCreateLoading={controller.isCreateLoading}
          isUpdateLoading={controller.isUpdateLoading}
          onTypeSelect={controller.handleTypeSelect}
          onCreateSubmit={controller.handleCreateSubmit}
          onEditSubmit={controller.handleEditSubmit}
          onClose={controller.closeDrawer}
          getEditInitialValues={controller.getEditInitialValues}
        />
      </div>
    </DrawerProvider>
  );
}

interface ActionDrawerContentProps {
  mode: DrawerMode;
  selectedType: ActionType | null;
  editingAction: ActionDetail | null;
  actions: ActionDetail[];
  completionOptions: Array<{ id: string; title: string }>;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  onTypeSelect: (type: ActionType) => void;
  onCreateSubmit: (values: ActionFormValues) => void;
  onEditSubmit: (values: ActionFormValues) => void;
  onClose: () => void;
  getEditInitialValues: (action: ActionDetail) => ActionFormValues;
}

function ActionDrawerContent({
  mode,
  selectedType,
  editingAction,
  actions,
  completionOptions,
  isCreateLoading,
  isUpdateLoading,
  onTypeSelect,
  onCreateSubmit,
  onEditSubmit,
  onClose,
  getEditInitialValues,
}: ActionDrawerContentProps) {
  const { isOpen, open, close } = useDrawer();

  useEffect(() => {
    if (mode === "closed") {
      close();
    } else {
      open();
    }
  }, [mode, open, close]);

  useEffect(() => {
    if (!isOpen && mode !== "closed") {
      onClose();
    }
  }, [isOpen, mode, onClose]);

  if (mode === "closed") return null;

  return (
    <DrawerContent>
      <DrawerHeader>
        {mode === "type-select" ? "액션 유형 선택" : mode === "create" ? "새 액션" : "액션 수정"}
      </DrawerHeader>
      <div className="max-h-[70vh] overflow-y-auto">
        {mode === "type-select" && <ActionTypeSelector onSelect={onTypeSelect} />}
        {mode === "create" && selectedType && (
          <ActionForm
            key={`create-${selectedType}`}
            actionType={selectedType}
            allActions={actions}
            completionOptions={completionOptions}
            isLoading={isCreateLoading}
            onSubmit={onCreateSubmit}
            onCancel={onClose}
          />
        )}
        {mode === "edit" && editingAction && selectedType && (
          <ActionForm
            key={`edit-${editingAction.id}`}
            actionType={selectedType}
            editingAction={editingAction}
            initialValues={getEditInitialValues(editingAction)}
            allActions={actions}
            completionOptions={completionOptions}
            isLoading={isUpdateLoading}
            onSubmit={onEditSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </DrawerContent>
  );
}
