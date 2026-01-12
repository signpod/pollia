import DOMPurify from "isomorphic-dompurify";
import { cn } from "../../lib/utils";

export interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
