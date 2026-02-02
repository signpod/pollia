import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { cn } from "@/app/admin/lib/utils";
import type { Action, ActionOption } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

type BranchActionNodeData = {
  action?: Action & { options: ActionOption[] };
  isUnreachable?: boolean;
  isDeadEnd?: boolean;
};

export type BranchActionNodeType = Node<BranchActionNodeData, "branch-action">;

export function BranchActionNode({ data }: NodeProps<BranchActionNodeType>) {
  const { action, isUnreachable, isDeadEnd } = data;

  if (!action) return null;

  return (
    <Card
      className={cn(
        "min-w-[350px]",
        isUnreachable && "opacity-50 grayscale",
        isDeadEnd && "border-red-500",
      )}
    >
      <Handle type="target" position={Position.Top} />
      <CardContent className="p-4">
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
          {action.options.map((option, index) => (
            <div key={option.id} className="relative border rounded p-3">
              <p className="text-xs font-medium mb-1">옵션 {index + 1}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{option.title}</p>
              <Handle
                type="source"
                position={Position.Bottom}
                id={option.id}
                style={{ left: index === 0 ? "25%" : "75%" }}
              />
            </div>
          ))}
        </div>
        {isDeadEnd && <p className="text-xs text-destructive mt-2">⚠️ 다음 단계 미설정</p>}
      </CardContent>
    </Card>
  );
}
