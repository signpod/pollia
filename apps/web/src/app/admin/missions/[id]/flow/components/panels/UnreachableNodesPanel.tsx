"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import { ACTION_TYPE_CONFIGS } from "@/app/admin/config/actionTypes";
import { useAvailableNodes } from "@/app/admin/hooks/flow/use-available-nodes";
import { AlertCircle, CheckCircle } from "lucide-react";

interface UnreachableNodesPanelProps {
  missionId: string;
  connectedNodeIds: Set<string>;
}

export function UnreachableNodesPanel({ missionId, connectedNodeIds }: UnreachableNodesPanelProps) {
  const { availableActions, availableCompletions } = useAvailableNodes(missionId, connectedNodeIds);

  const totalUnreachable = availableActions.length + availableCompletions.length;

  if (totalUnreachable === 0) {
    return null;
  }

  return (
    <div className="absolute left-4 bottom-4 z-10">
      <Card className="w-[300px] max-h-[400px] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            연결되지 않은 노드
            <Badge variant="destructive" className="ml-auto">
              {totalUnreachable}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {availableActions.map(action => {
            const config = ACTION_TYPE_CONFIGS.find(c => c.value === action.type);
            const Icon = config?.icon;

            return (
              <div key={action.id} className="flex items-start gap-2 p-2 border rounded-lg">
                {Icon && <Icon className="size-4 mt-0.5 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-1 text-xs">
                    액션
                  </Badge>
                  <p className="text-sm truncate">{action.title}</p>
                </div>
              </div>
            );
          })}
          {availableCompletions.map(completion => (
            <div key={completion.id} className="flex items-start gap-2 p-2 border rounded-lg">
              <CheckCircle className="size-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="mb-1 text-xs">
                  완료화면
                </Badge>
                <p className="text-sm truncate">{completion.title}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
