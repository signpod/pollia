"use client";

import { useRecordActionEntry } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { getOrCreateSessionId, getUtmParams } from "@/lib/tracking";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function ActionClientTrackingWrapper({ children }: { children: React.ReactNode }) {
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const { mutate: recordEntry } = useRecordActionEntry();
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!hasTrackedRef.current && missionId && actionId) {
      hasTrackedRef.current = true;

      const sessionId = getOrCreateSessionId();
      const utmParams = getUtmParams();

      recordEntry({
        missionId,
        sessionId,
        userId: user.id || undefined,
        actionId,
        utmParams,
      });
    }
  }, [missionId, actionId, recordEntry, user.id]);

  return <>{children}</>;
}
