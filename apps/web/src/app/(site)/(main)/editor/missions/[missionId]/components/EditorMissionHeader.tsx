"use client";

import { Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditorMissionHeaderProps {
  title: string;
}

export function EditorMissionHeader({ title }: EditorMissionHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => router.back()}
        className="flex size-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700"
      >
        <ChevronLeft className="size-5" />
      </button>
      <Typo.SubTitle>{title}</Typo.SubTitle>
    </div>
  );
}
