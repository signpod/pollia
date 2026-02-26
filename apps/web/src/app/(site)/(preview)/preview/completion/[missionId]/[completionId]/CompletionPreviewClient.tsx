"use client";

import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { useRef, useState } from "react";

interface CompletionPreviewClientProps {
  imageUrl?: string | null;
  title?: string;
  description?: string;
}

export function CompletionPreviewClient({
  imageUrl,
  title,
  description,
}: CompletionPreviewClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <MissionCompletionPage
      imageUrl={imageUrl}
      title={title}
      description={description}
      imageMenu={{
        isOpen,
        menuRef,
        onToggle: () => setIsOpen(prev => !prev),
        onSave: () => {},
        onShare: () => {},
      }}
    />
  );
}
