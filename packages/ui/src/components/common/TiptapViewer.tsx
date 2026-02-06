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
    setSanitizedContent(DOMPurify.sanitize(content, { ADD_ATTR: ["style"] }));
  }, [content]);

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: TiptapViewer 사용안함. (번들사이즈 줄이기)
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
