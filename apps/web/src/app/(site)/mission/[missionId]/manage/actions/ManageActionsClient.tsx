"use client";

import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadActionsDetail } from "@/hooks/action";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button, Dialog, DialogOverlay, DialogPortal, EmptyState, Typo } from "@repo/ui/components";
import { ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ActionCard } from "./components/ActionCard";
import { useManageActionsController } from "./logic";

interface ManageActionsClientProps {
  missionId: string;
}

interface CreateRouteIntent {
  connectKind: "action" | "branch-option";
  sourceActionId: string;
  sourceOptionId?: string;
}

function buildCreateActionRoute(missionId: string, intent?: CreateRouteIntent) {
  const baseRoute = ROUTES.MISSION_MANAGE_ACTIONS_NEW(missionId);

  if (!intent) {
    return baseRoute;
  }

  const searchParams = new URLSearchParams({
    connectKind: intent.connectKind,
    sourceActionId: intent.sourceActionId,
  });

  if (intent.sourceOptionId) {
    searchParams.set("sourceOptionId", intent.sourceOptionId);
  }

  return `${baseRoute}?${searchParams.toString()}`;
}

export function ManageActionsClient({ missionId }: ManageActionsClientProps) {
  const router = useRouter();
  const { data: actionsData, isLoading: actionsLoading } = useReadActionsDetail(missionId);

  const actions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const controller = useManageActionsController({ missionId, actions });

  return (
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
              onEdit={target =>
                router.push(ROUTES.MISSION_MANAGE_ACTIONS_EDIT(missionId, target.id))
              }
              onDelete={controller.setDeleteTarget}
              onMoveUp={controller.handleMoveUp}
              onMoveDown={controller.handleMoveDown}
              onRequestConnectAction={target =>
                router.push(
                  buildCreateActionRoute(missionId, {
                    connectKind: "action",
                    sourceActionId: target.id,
                  }),
                )
              }
              onRequestConnectBranchOption={(target, optionId) =>
                router.push(
                  buildCreateActionRoute(missionId, {
                    connectKind: "branch-option",
                    sourceActionId: target.id,
                    sourceOptionId: optionId,
                  }),
                )
              }
            />
          ))
        )}

        <button
          type="button"
          onClick={() => router.push(ROUTES.MISSION_MANAGE_ACTIONS_NEW(missionId))}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            액션 추가
          </Typo.Body>
        </button>
      </div>

      <Dialog
        open={Boolean(controller.deleteTarget)}
        onOpenChange={open => {
          if (!open && !controller.isDeleteLoading) {
            controller.setDeleteTarget(null);
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          {controller.deleteTarget ? (
            <DialogPrimitive.Content
              className="fixed top-1/2 left-1/2 z-[51] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 focus:outline-none"
              onInteractOutside={event => {
                if (controller.isDeleteLoading) {
                  event.preventDefault();
                }
              }}
              onEscapeKeyDown={event => {
                if (controller.isDeleteLoading) {
                  event.preventDefault();
                }
              }}
            >
              <DialogPrimitive.Title asChild>
                <Typo.SubTitle className="mb-2">액션 삭제</Typo.SubTitle>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description asChild>
                <Typo.Body size="medium" className="mb-6 text-zinc-500">
                  "{controller.deleteTarget.title}" 액션을 삭제하시겠습니까? 이 작업은 되돌릴 수
                  없습니다.
                </Typo.Body>
              </DialogPrimitive.Description>
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
            </DialogPrimitive.Content>
          ) : null}
        </DialogPortal>
      </Dialog>
    </div>
  );
}
