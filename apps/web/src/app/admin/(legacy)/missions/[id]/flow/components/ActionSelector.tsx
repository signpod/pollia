"use client";

import { CompletionEditDialog } from "@/app/admin/(legacy)/missions/[id]/components/edit/CompletionEditDialog";
import { CreateActionDialog } from "@/app/admin/(legacy)/missions/[id]/components/mission-tab-action-list-content/CreateActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/admin/components/shadcn-ui/dropdown-menu";
import { ACTION_TYPE_CONFIGS } from "@/app/admin/config/actionTypes";
import { useCreateAction } from "@/app/admin/hooks/action/use-create-action";
import { useAvailableNodes } from "@/app/admin/hooks/flow/use-available-nodes";
import { CheckCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ActionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  sourceType: "start" | "action" | "branch-option";
  onSelectAction: (actionId: string) => void;
  onSelectCompletion: (completionId: string) => void;
  trigger: React.ReactNode;
  connectedNodeIds: Set<string>;
}

export function ActionSelector({
  open,
  onOpenChange,
  missionId,
  sourceType,
  onSelectAction,
  onSelectCompletion,
  trigger,
  connectedNodeIds,
}: ActionSelectorProps) {
  const [createActionOpen, setCreateActionOpen] = useState(false);
  const [createCompletionOpen, setCreateCompletionOpen] = useState(false);

  const { availableActions, availableCompletions, isError } = useAvailableNodes(
    missionId,
    connectedNodeIds,
  );

  const nextOrder = useMemo(() => {
    if (availableActions.length === 0) return 0;
    const maxOrder = Math.max(...availableActions.map(action => action.order ?? 0));
    return maxOrder + 1;
  }, [availableActions]);

  const createAction = useCreateAction({
    onSuccess: () => {
      toast.success("액션이 생성되었습니다");
      setCreateActionOpen(false);
    },
    onError: error => {
      toast.error(error.message || "액션 생성 중 오류가 발생했습니다");
    },
  });

  const handleSelectAction = (actionId: string) => {
    onSelectAction(actionId);
    onOpenChange(false);
  };

  const handleSelectCompletion = (completionId: string) => {
    onSelectCompletion(completionId);
    onOpenChange(false);
  };

  const handleCreateAction = () => {
    onOpenChange(false);
    setCreateActionOpen(true);
  };

  const handleCreateCompletion = () => {
    onOpenChange(false);
    setCreateCompletionOpen(true);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-[400px]">
          {isError && (
            <div className="p-4 text-sm text-destructive">액션 목록을 불러오는데 실패했습니다.</div>
          )}

          {!isError && availableActions.length > 0 && (
            <>
              <DropdownMenuLabel>기존 액션 선택</DropdownMenuLabel>
              <DropdownMenuGroup>
                {availableActions.map(action => {
                  const config = ACTION_TYPE_CONFIGS.find(c => c.value === action.type);
                  const Icon = config?.icon;
                  return (
                    <DropdownMenuItem key={action.id} onClick={() => handleSelectAction(action.id)}>
                      {Icon && <Icon className="size-4" />}
                      <span className="flex-1 truncate">{action.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </>
          )}

          {!isError && sourceType !== "start" && availableCompletions.length > 0 && (
            <>
              {availableActions.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>완료 화면 선택</DropdownMenuLabel>
              <DropdownMenuGroup>
                {availableCompletions.map(completion => (
                  <DropdownMenuItem
                    key={completion.id}
                    onClick={() => handleSelectCompletion(completion.id)}
                  >
                    <CheckCircle className="size-4" />
                    <span className="flex-1 truncate">{completion.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </>
          )}

          {!isError && <DropdownMenuSeparator />}

          {!isError && (
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleCreateAction}>
                <Plus className="size-4" />
                <span>새 액션 만들기</span>
              </DropdownMenuItem>
              {sourceType !== "start" && (
                <DropdownMenuItem onClick={handleCreateCompletion}>
                  <Plus className="size-4" />
                  <span>새 완료화면 만들기</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateActionDialog
        open={createActionOpen}
        onOpenChange={setCreateActionOpen}
        onSubmit={data => {
          createAction.mutate({
            missionId,
            order: nextOrder,
            ...data,
          });
        }}
      />

      <CompletionEditDialog
        open={createCompletionOpen}
        onOpenChange={setCreateCompletionOpen}
        missionId={missionId}
        completion={null}
      />
    </>
  );
}
