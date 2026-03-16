"use client";

import type { ValidationResult } from "@/app/admin/(legacy)/missions/[id]/flow/utils/flowValidation";
import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/admin/components/shadcn-ui/collapsible";
import { useReactFlow } from "@xyflow/react";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ErrorSummaryPanelProps {
  validation: ValidationResult;
}

export function ErrorSummaryPanel({ validation }: ErrorSummaryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { setCenter, getNode } = useReactFlow();

  const errorCount = validation.errors.length;

  const handleErrorClick = (nodeId: string) => {
    const node = getNode(nodeId);
    if (node) {
      setCenter(node.position.x, node.position.y, {
        zoom: 1.5,
        duration: 500,
      });
    }
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "unreachable":
        return "🚫";
      case "dead-end":
        return "⚠️";
      case "missing-entry":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="absolute right-4 top-4 z-10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant={errorCount > 0 ? "destructive" : "default"} size="sm" className="gap-2">
            <AlertTriangle className="size-4" />
            해결해야 할 문제: {errorCount}건
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {errorCount > 0 && (
            <Card className="mt-2 w-[400px]">
              <CardHeader>
                <CardTitle className="text-sm">문제 목록</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validation.errors.map((error, index) => (
                  <button
                    key={`${error.nodeId}-${index}`}
                    type="button"
                    onClick={() => handleErrorClick(error.nodeId)}
                    className="flex w-full items-start gap-2 rounded-md border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-lg">{getErrorIcon(error.type)}</span>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-1 text-xs">
                        {error.type}
                      </Badge>
                      <p className="text-sm">{error.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">노드 ID: {error.nodeId}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
