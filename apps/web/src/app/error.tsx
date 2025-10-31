"use client";

import { useEffect } from "react";
import Rollbar from "rollbar";
import { ResetPage } from "@/components/common/ResetPage";
import { clientConfig } from "@/rollbar";

export default function Error({
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
  }, [error]);

  return <ResetPage reset={reset} />;
}
