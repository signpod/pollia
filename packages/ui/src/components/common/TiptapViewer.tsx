import { cn } from "../../lib/utils";

export interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
