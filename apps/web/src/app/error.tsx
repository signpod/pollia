"use client";

import { ResetPage } from "@/components/common/ResetPage";
import { clientConfig } from "@/rollbar";
import { useEffect } from "react";
import Rollbar from "rollbar";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const rollbar = new Rollbar(clientConfig);
    rollbar.error(error);
    console.error("Error caught:", error);
    if (error.digest) console.error("[Error digest]", error.digest);
    if (error.cause) console.error("[Error cause]", error.cause);
    if (typeof error.message === "string" && error.message.includes("omitted in production")) {
      console.info(
        "[Tip] 실제 오류 내용을 보려면 개발 서버(npm run dev)에서 같은 동작을 재현해보세요.",
      );
    }
  }, [error]);

  return <ResetPage reset={reset} />;
}
