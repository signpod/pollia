"use client";

import { Typo } from "@repo/ui/components";
import { FolderOpen } from "lucide-react";

interface EditorEmptyTabContentProps {
  message: string;
}

export function EditorEmptyTabContent({ message }: EditorEmptyTabContentProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 px-5 py-10">
      <FolderOpen className="size-12 text-zinc-300" />
      <Typo.Body size="large" className="text-zinc-400">
        {message}
      </Typo.Body>
    </div>
  );
}
