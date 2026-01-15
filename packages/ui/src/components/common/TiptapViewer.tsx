"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    setSanitizedContent(DOMPurify.sanitize(content));
  }, [content]);

  if (!sanitizedContent) {
    return <div className={cn("tiptap-viewer tiptap", className)} />;
  }

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
