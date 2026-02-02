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
};

export type BranchActionNodeType = Node<BranchActionNodeData, "branch-action">;

export function BranchActionNode({ data }: NodeProps<BranchActionNodeType>) {
  const { action, isUnreachable, isDeadEnd, onOptionPlusClick } = data;

  if (!action) return null;

  const optionCount = action.options.length;
  const getHandlePosition = (index: number) => {
    return `${(100 / (optionCount + 1)) * (index + 1)}%`;
  };

  return (
    <div className={cn("relative min-w-[400px]", isUnreachable && "opacity-50 grayscale")}>
      <Handle type="target" position={Position.Top} isConnectable={false} />

      <Card className={cn(isDeadEnd && "border-red-500")}>
        <CardContent className="px-4">
          {isUnreachable && (
            <Badge variant="destructive" className="mb-2">
              🚫 도달 불가
            </Badge>
          )}
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="size-4" />
            <span className="text-sm font-medium">분기</span>
          </div>
          <p className="text-sm">{action.title}</p>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-4 mb-4">
        {action.options.map((option, index) => {
          const hasConnection = option.nextActionId || option.nextCompletionId;

          return (
            <div
              key={option.id}
              className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500 mb-1">옵션 {index + 1}</p>
              <p className="text-sm font-medium line-clamp-2">{option.title}</p>

              {!hasConnection && onOptionPlusClick && (
                <div className="flex justify-center mt-3">
                  <PlusButton onOpenSelector={() => onOptionPlusClick(option.id)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDeadEnd && <p className="text-xs text-destructive mb-2">⚠️ 다음 단계 미설정</p>}

      {action.options.map((option, index) => (
        <Handle
          key={option.id}
          type="source"
          position={Position.Bottom}
          id={option.id}
          style={{
            left: getHandlePosition(index),
            background: "#555",
            width: "12px",
            height: "12px",
          }}
          isConnectable={false}
        />
      ))}
    </div>
  );
}
