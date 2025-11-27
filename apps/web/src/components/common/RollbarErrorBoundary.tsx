"use client";

import { ResetPage } from "@/components/common/ResetPage";
import { ErrorBoundary } from "@rollbar/react";

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
