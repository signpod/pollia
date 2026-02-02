import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { cn } from "@/app/admin/lib/utils";
import type { Action, ActionOption } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { PlusButton } from "../PlusButton";

type BranchActionNodeData = {
  action?: Action & { options: ActionOption[] };
  isUnreachable?: boolean;
  isDeadEnd?: boolean;
  onOptionPlusClick?: (optionId: string) => void;
  onOptionClick?: (optionId: string) => void;
};

export type BranchActionNodeType = Node<BranchActionNodeData, "branch-action">;

export function BranchActionNode({ data }: NodeProps<BranchActionNodeType>) {
  const { action, isUnreachable, isDeadEnd, onOptionPlusClick, onOptionClick } = data;

  if (!action) return null;

  return (
    <Card
      className={cn(
        "min-w-[350px]",
        isUnreachable && "opacity-50 grayscale",
        isDeadEnd && "border-red-500",
      )}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <CardContent className="px-4">
        {isUnreachable && (
          <Badge variant="destructive" className="mb-2">
            🚫 도달 불가
          </Badge>
        )}
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="size-4" />
          <span className="text-sm font-medium">분기</span>
        </div>
        <p className="text-sm mb-4">{action.title}</p>
        <div className="grid grid-cols-2 gap-3">
          {action.options.map((option, index) => {
            const hasConnection = option.nextActionId || option.nextCompletionId;

            return (
              <div
                key={option.id}
                className={cn(
                  "relative border rounded p-3",
                  onOptionClick && hasConnection && "cursor-pointer hover:border-primary",
                )}
                onClick={
                  hasConnection && onOptionClick ? () => onOptionClick(option.id) : undefined
                }
                onKeyDown={
                  hasConnection && onOptionClick
                    ? e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOptionClick(option.id);
                        }
                      }
                    : undefined
                }
                role={hasConnection && onOptionClick ? "button" : undefined}
                tabIndex={hasConnection && onOptionClick ? 0 : undefined}
              >
                <p className="text-xs font-medium mb-1">옵션 {index + 1}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{option.title}</p>

                {!hasConnection && onOptionPlusClick && (
                  <div className="flex justify-center mt-2">
                    <PlusButton onOpenSelector={() => onOptionPlusClick(option.id)} />
                  </div>
                )}

                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={option.id}
                  style={{ left: index === 0 ? "25%" : "75%" }}
                  isConnectable={false}
                />
              </div>
            );
          })}
        </div>
        {isDeadEnd && <p className="text-xs text-destructive mt-2">⚠️ 다음 단계 미설정</p>}
      </CardContent>
    </Card>
  );
}
