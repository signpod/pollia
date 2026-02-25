"use client";

import { ResetPage } from "@/components/common/ResetPage";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <ResetPage reset={reset} />
      </body>
    </html>
  );
}
