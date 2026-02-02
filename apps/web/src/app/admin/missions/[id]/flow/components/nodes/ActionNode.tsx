import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { ACTION_TYPE_CONFIGS } from "@/app/admin/config/actionTypes";
import { cn } from "@/app/admin/lib/utils";
import type { Action, ActionOption } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { PlusButton } from "../PlusButton";

type ActionNodeData = {
  action?: Action & { options: ActionOption[] };
  isUnreachable?: boolean;
  isDeadEnd?: boolean;
  onPlusClick?: () => void;
};

export type ActionNodeType = Node<ActionNodeData, "action">;

export function ActionNode({ data }: NodeProps<ActionNodeType>) {
  const { action, isUnreachable, isDeadEnd, onPlusClick } = data;

  if (!action) return null;

  const config = ACTION_TYPE_CONFIGS.find(c => c.value === action.type);
  const Icon = config?.icon;

  const hasConnection = action.nextActionId || action.nextCompletionId;

  return (
    <Card
      className={cn(
        "min-w-[250px]",
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
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="size-4" />}
          <span className="text-sm font-medium">{config?.label}</span>
        </div>
        <p className="text-sm line-clamp-2">{action.title}</p>
        {isDeadEnd && <p className="text-xs text-destructive mt-2">⚠️ 다음 단계 미설정</p>}

        {!hasConnection && onPlusClick && (
          <div className="flex justify-center mt-3">
            <PlusButton onOpenSelector={onPlusClick} />
          </div>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </Card>
  );
}
