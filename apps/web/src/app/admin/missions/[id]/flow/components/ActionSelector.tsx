"use client";

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
import { useReadActionsDetail } from "@/app/admin/hooks/action/use-read-actions-detail";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion/use-read-completions";
import { CompletionEditDialog } from "@/app/admin/missions/[id]/components/edit/CompletionEditDialog";
import { CreateActionDialog } from "@/app/admin/missions/[id]/edit/components/CreateActionDialog";
import { CheckCircle, Plus } from "lucide-react";
import { useState } from "react";

interface ActionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  sourceType: "start" | "action" | "branch-option";
  onSelectAction: (actionId: string) => void;
  onSelectCompletion: (completionId: string) => void;
  trigger: React.ReactNode;
}

export function ActionSelector({
  open,
  onOpenChange,
  missionId,
  sourceType,
  onSelectAction,
  onSelectCompletion,
  trigger,
}: ActionSelectorProps) {
  const [createActionOpen, setCreateActionOpen] = useState(false);
  const [createCompletionOpen, setCreateCompletionOpen] = useState(false);

  const { data: actionsData } = useReadActionsDetail(missionId);
  const { data: completionsData } = useReadCompletions(missionId);

  const actions = actionsData?.data ?? [];
  const completions = completionsData?.data ?? [];

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
          {actions.length > 0 && (
            <>
              <DropdownMenuLabel>기존 액션 선택</DropdownMenuLabel>
              <DropdownMenuGroup>
                {actions.map(action => {
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

          {sourceType !== "start" && completions.length > 0 && (
            <>
              {actions.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>완료 화면 선택</DropdownMenuLabel>
              <DropdownMenuGroup>
                {completions.map(completion => (
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

          <DropdownMenuSeparator />

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
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateActionDialog
        open={createActionOpen}
        onOpenChange={setCreateActionOpen}
        onSubmit={data => {
          console.log("Create action:", data);
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
