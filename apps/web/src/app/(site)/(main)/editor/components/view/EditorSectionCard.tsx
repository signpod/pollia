"use client";

import { Typo } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface EditorSectionCardProps {
  title: string;
  description: string;
  validationIssueCount?: number;
  children: ReactNode;
}

export function EditorSectionCard({
  title,
  description,
  validationIssueCount,
  children,
}: EditorSectionCardProps) {
  const hasValidationIssues = validationIssueCount != null && validationIssueCount > 0;

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>{title}</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              {description}
            </Typo.Body>
          </div>
          {hasValidationIssues ? (
            <div
              className="flex shrink-0 items-center gap-1 text-red-500"
              title="입력 확인 필요"
              aria-label="입력 확인 필요"
            >
              <AlertCircle className="size-4" />
              <Typo.Body size="small" className="font-semibold text-red-500">
                {validationIssueCount}
              </Typo.Body>
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
