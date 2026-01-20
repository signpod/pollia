"use client";

import { useRecordActionEntry } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import {
  getOrCreateSessionId,
  getUtmParams,
  hasTrackedEntry,
  markEntryAsTracked,
} from "@/lib/tracking";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export function ActionClientTrackingWrapper({ children }: { children: React.ReactNode }) {
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const { mutate: recordEntry } = useRecordActionEntry();
  const { user } = useAuth();

  useEffect(() => {
    if (!missionId || !actionId) return;

    const sessionId = getOrCreateSessionId(actionId);

    if (!hasTrackedEntry(actionId)) {
      markEntryAsTracked(actionId);

      const utmParams = getUtmParams();

      recordEntry({
        missionId,
        sessionId,
        userId: user?.id || undefined,
        actionId,
        utmParams,
      });
    }
  }, [missionId, actionId, recordEntry, user?.id]);

  return <>{children}</>;
}
