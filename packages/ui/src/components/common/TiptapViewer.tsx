"use client";

import DOMPurify from "dompurify";
import { cn } from "../../lib/utils";

export interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const sanitizedContent =
    typeof window !== "undefined" ? DOMPurify.sanitize(content) : content;

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
