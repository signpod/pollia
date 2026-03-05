"use client";

import { useCallback, useState } from "react";

export function useMobilePreviewRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  return { refreshKey, refresh };
}
