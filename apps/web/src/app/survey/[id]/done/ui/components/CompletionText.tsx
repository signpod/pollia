import { Typo } from "@repo/ui/components";
import React from "react";

interface CompletionTextProps {
  title?: string;
}

export const CompletionText = React.forwardRef<HTMLDivElement, CompletionTextProps>(
  ({ title }, ref) => (
    <div ref={ref}>
      <Typo.MainTitle size="small" className="text-center text-primary">
        {title}
      </Typo.MainTitle>
      <Typo.MainTitle size="small" className="text-center">
        응답을 성공적으로 제출했어요
      </Typo.MainTitle>
    </div>
  ),
);

CompletionText.displayName = "CompletionText";
