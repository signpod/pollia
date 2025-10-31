"use client";

import { ErrorBoundary } from "@rollbar/react";
import { ResetPage } from "@/components/common/ResetPage";

export default function RollbarErrorBoundary() {
  return (
    <ErrorBoundary
      fallbackUI={() => (
        <ResetPage
          reset={() => {
            location.reload();
          }}
        />
      )}
    >
      TODO: 추후 개발시 사용하면 됩니다. 현재는 사용하지 않습니다.
    </ErrorBoundary>
  );
}
