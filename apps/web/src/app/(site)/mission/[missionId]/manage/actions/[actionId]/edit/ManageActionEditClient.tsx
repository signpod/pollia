"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action";
import { Button, Typo, toast } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ActionForm, type ActionFormValues } from "../../components/ActionForm";
import { useManageUpdateAction } from "../../hooks";
import { mapEditInitialValues, mapUpdateActionInput } from "../../logic";

interface ManageActionEditClientProps {
  missionId: string;
  actionId: string;
}

export function ManageActionEditClient({ missionId, actionId }: ManageActionEditClientProps) {
  const router = useRouter();
  const listRoute = ROUTES.MISSION_MANAGE_ACTIONS(missionId);
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

  const editingAction = useMemo(
    () => actions.find(action => action.id === actionId) ?? null,
    [actions, actionId],
  );

  const updateAction = useManageUpdateAction();

  const handleBack = () => {
    router.push(listRoute);
  };

  const handleSubmit = async (values: ActionFormValues) => {
    if (!editingAction) return;

    try {
      await updateAction.mutateAsync(
        mapUpdateActionInput({
          missionId,
          editingActionId: editingAction.id,
          values,
        }),
      );
      toast({ message: "액션이 수정되었습니다." });
      router.replace(listRoute);
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "액션 수정에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <button type="button" onClick={handleBack} className="p-1">
          <ChevronLeft className="size-6" />
        </button>
        <Typo.SubTitle>액션 수정</Typo.SubTitle>
      </header>

      <div className="pb-6">
        {actionsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Typo.Body size="medium" className="text-zinc-400">
              로딩 중...
            </Typo.Body>
          </div>
        ) : !editingAction ? (
          <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
            <Typo.SubTitle>수정할 액션을 찾을 수 없습니다.</Typo.SubTitle>
            <Button onClick={handleBack}>목록으로 돌아가기</Button>
          </div>
        ) : (
          <ActionForm
            key={`edit-${editingAction.id}`}
            actionType={editingAction.type}
            editingAction={editingAction}
            initialValues={mapEditInitialValues(editingAction)}
            allActions={actions}
            completionOptions={completionOptions}
            isLoading={updateAction.isPending}
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        )}
      </div>
    </div>
  );
}
