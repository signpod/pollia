"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { updateMission } from "@/actions/mission/update";
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
  toast,
  useDrawer,
} from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActionCard } from "./components/ActionCard";
import { ActionForm, type ActionFormValues } from "./components/ActionForm";
import { ActionTypeSelector } from "./components/ActionTypeSelector";
import {
  type CreateActionInput,
  useManageCreateAction,
  useManageDeleteAction,
  useManageReorderActions,
  useManageUpdateAction,
} from "./hooks";

interface ManageActionsClientProps {
  missionId: string;
}

type DrawerMode = "closed" | "type-select" | "create" | "edit";

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

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);
  const [editingAction, setEditingAction] = useState<ActionDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);

  const createAction = useManageCreateAction({
    onSuccess: async data => {
      if (actions.length === 0 && data?.data?.id) {
        try {
          await updateMission(missionId, { entryActionId: data.data.id });
        } catch {
          toast({
            message: "시작 액션 설정 중 오류가 발생했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        }
      }
      toast({ message: "액션이 추가되었습니다." });
      closeDrawer();
    },
    onError: error => {
      toast({
        message: error.message || "액션 추가에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const updateAction = useManageUpdateAction({
    onSuccess: () => {
      toast({ message: "액션이 수정되었습니다." });
      closeDrawer();
    },
    onError: error => {
      toast({
        message: error.message || "액션 수정에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const deleteAction = useManageDeleteAction({
    onSuccess: () => {
      toast({ message: "액션이 삭제되었습니다." });
      setDeleteTarget(null);
    },
    onError: error => {
      toast({
        message: error.message || "액션 삭제에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const reorderActions = useManageReorderActions({
    onError: error => {
      toast({
        message: error.message || "순서 변경에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const closeDrawer = useCallback(() => {
    setDrawerMode("closed");
    setSelectedType(null);
    setEditingAction(null);
  }, []);

  const handleTypeSelect = (type: ActionType) => {
    setSelectedType(type);
    setDrawerMode("create");
  };

  const handleEdit = (action: ActionDetail) => {
    setEditingAction(action);
    setSelectedType(action.type);
    setDrawerMode("edit");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  };

  const handleMoveUp = (action: ActionDetail) => {
    const idx = actions.findIndex(a => a.id === action.id);
    if (idx <= 0) return;

    const newActions = [...actions];
    const prev = newActions[idx - 1];
    const curr = newActions[idx];
    if (!prev || !curr) return;
    newActions[idx - 1] = curr;
    newActions[idx] = prev;
    reorderActions.mutate({
      missionId,
      actionOrders: newActions.map((a, i) => ({ id: a.id, order: i })),
    });
  };

  const handleMoveDown = (action: ActionDetail) => {
    const idx = actions.findIndex(a => a.id === action.id);
    if (idx < 0 || idx >= actions.length - 1) return;

    const newActions = [...actions];
    const curr = newActions[idx];
    const next = newActions[idx + 1];
    if (!curr || !next) return;
    newActions[idx] = next;
    newActions[idx + 1] = curr;
    reorderActions.mutate({
      missionId,
      actionOrders: newActions.map((a, i) => ({ id: a.id, order: i })),
    });
  };

  const handleCreateSubmit = (values: ActionFormValues) => {
    if (!selectedType) return;

    const input: CreateActionInput = {
      missionId,
      type: selectedType,
      title: values.title,
      description: values.description,
      isRequired: values.isRequired,
      order: actions.length,
      imageUrl: null,
      imageFileUploadId: null,
      hasOther: values.hasOther,
      nextActionId: values.nextActionId,
      nextCompletionId: values.nextCompletionId,
      ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
      ...(values.options && {
        options: values.options.map((o, i) => ({
          title: o.title,
          description: o.description,
          nextActionId: o.nextActionId,
          order: i,
        })),
      }),
    };

    createAction.mutate(input);
  };

  const handleEditSubmit = (values: ActionFormValues) => {
    if (!editingAction) return;

    updateAction.mutate({
      actionId: editingAction.id,
      missionId,
      title: values.title,
      description: values.description,
      isRequired: values.isRequired,
      hasOther: values.hasOther,
      nextActionId: values.nextActionId,
      nextCompletionId: values.nextCompletionId,
      ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
      ...(values.options && {
        options: values.options.map((o, i) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          nextActionId: o.nextActionId,
          order: i,
        })),
      }),
    });
  };

  const getEditInitialValues = (action: ActionDetail): ActionFormValues => ({
    title: action.title,
    description: action.description,
    isRequired: action.isRequired,
    hasOther: action.hasOther ?? false,
    maxSelections: action.maxSelections ?? 1,
    options: action.options?.map(o => ({
      id: o.id,
      title: o.title,
      description: o.description,
      nextActionId: o.nextActionId,
      order: o.order,
    })),
    nextActionId: action.nextActionId,
    nextCompletionId: action.nextCompletionId,
  });

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
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))
          )}

          <button
            type="button"
            onClick={() => setDrawerMode("type-select")}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500"
          >
            <Plus className="size-5" />
            <Typo.Body size="medium" className="font-medium">
              액션 추가
            </Typo.Body>
          </button>
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6">
              <Typo.SubTitle className="mb-2">액션 삭제</Typo.SubTitle>
              <Typo.Body size="medium" className="mb-6 text-zinc-500">
                "{deleteTarget.title}" 액션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </Typo.Body>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteAction.isPending}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  onClick={handleDeleteConfirm}
                  loading={deleteAction.isPending}
                  disabled={deleteAction.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        <ActionDrawerContent
          mode={drawerMode}
          selectedType={selectedType}
          editingAction={editingAction}
          actions={actions}
          completionOptions={completionOptions}
          isCreateLoading={createAction.isPending}
          isUpdateLoading={updateAction.isPending}
          onTypeSelect={handleTypeSelect}
          onCreateSubmit={handleCreateSubmit}
          onEditSubmit={handleEditSubmit}
          onClose={closeDrawer}
          getEditInitialValues={getEditInitialValues}
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
