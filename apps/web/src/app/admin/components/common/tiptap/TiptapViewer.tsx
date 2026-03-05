"use client";

import "./tiptap.css";

import { cn } from "@/app/admin/lib/utils";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

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
      className={cn("tiptap-admin", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: TiptapViewer 사용안함. (번들사이즈 줄이기)
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
