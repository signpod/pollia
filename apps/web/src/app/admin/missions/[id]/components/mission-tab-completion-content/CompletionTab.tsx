"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
import type { MissionCompletionWithMission } from "@/types/dto";
import { Calendar, ImageIcon } from "lucide-react";
import Image from "next/image";

interface CompletionTabProps {
  completion: MissionCompletionWithMission;
  isSelected: boolean;
  onClick: () => void;
}

export function CompletionTab({ completion, isSelected, onClick }: CompletionTabProps) {
  const hasImage = !!completion.imageUrl;
  const imageUrl = completion.imageUrl || "";
  const formattedDate = new Date(completion.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "w-full h-auto p-3 justify-start hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent border-2 border-primary/20",
        )}
      >
        <div className="flex items-center gap-3 w-full min-w-0">
          {hasImage ? (
            <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
              <Image 
                src={imageUrl} 
                alt={completion.title} 
                fill 
                sizes="48px" 
                className="object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 shrink-0 rounded-md bg-muted border border-border flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <h4 className={cn(
              "text-sm truncate",
              isSelected ? "font-semibold text-foreground" : "font-medium text-foreground/80"
            )}>
              {completion.title}
            </h4>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}
