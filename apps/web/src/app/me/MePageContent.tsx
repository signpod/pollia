"use client";

import { FixedBottomLayout } from "@repo/ui/components";
import { useMemo } from "react";
import { EventSection, SettingsSection } from "./components";
import { useMyResponses } from "./hooks/useMyResponses";

export function MePageContent() {
  const { data } = useMyResponses();
  const responses = data?.data ?? [];

  const { inProgressResponses, completedResponses } = useMemo(() => {
    const inProgress = responses.filter(r => r.completedAt === null);
    const completed = responses.filter(r => r.completedAt !== null);
    return { inProgressResponses: inProgress, completedResponses: completed };
  }, [responses]);

  return (
    <FixedBottomLayout className="bg-background min-h-screen">
      <div className="space-y-6 px-5 pt-12 pb-8">
        <EventSection
          inProgressResponses={inProgressResponses}
          completedResponses={completedResponses}
        />
        <SettingsSection />
      </div>
    </FixedBottomLayout>
  );
}
