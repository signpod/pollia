"use client";

import { Button, Typo } from "@repo/ui/components";

interface ResetPageProps {
  reset?: () => void;
}

export function ResetPage({ reset }: ResetPageProps) {
  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Typo.MainTitle size="medium">문제가 발생했습니다</Typo.MainTitle>
      <Typo.Body size="large" className="text-muted-foreground">
        페이지를 다시 로드해주세요
      </Typo.Body>
      <Button onClick={handleReset}>
        <Typo.ButtonText size="large">다시 시도</Typo.ButtonText>
      </Button>
    </div>
  );
}
