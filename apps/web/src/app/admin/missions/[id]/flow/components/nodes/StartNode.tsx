import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import type { Mission } from "@prisma/client";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Rocket } from "lucide-react";
import { PlusButton } from "../PlusButton";

type StartNodeData = {
  mission?: Mission;
  onPlusClick?: () => void;
};

export type StartNodeType = Node<StartNodeData, "start">;

export function StartNode({ data }: NodeProps<StartNodeType>) {
  const { mission, onPlusClick } = data;

  return (
    <Card className="min-w-[200px]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="size-4" />
          <span className="text-sm font-medium">시작</span>
        </div>
        {mission && !mission.entryActionId && onPlusClick && (
          <div className="flex justify-center mt-3">
            <PlusButton onOpenSelector={onPlusClick} />
          </div>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </Card>
  );
}
