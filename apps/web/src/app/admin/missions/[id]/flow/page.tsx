"use client";

import { use } from "react";
import { FlowCanvas } from "./components/FlowCanvas";

interface FlowPageProps {
  params: Promise<{ id: string }>;
}

export default function FlowPage({ params }: FlowPageProps) {
  const unwrappedParams = use(params);
  const { id: missionId } = unwrappedParams;

  return (
    <div className="h-[calc(100vh-200px)] w-full">
      <FlowCanvas missionId={missionId} />
    </div>
  );
}
