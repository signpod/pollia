import { cn } from "../../lib/utils";

export interface TiptapViewerProps {
  content: string;
  className?: string;
}

/**
 * Tiptap HTML 콘텐츠를 렌더링하는 컴포넌트
 *
 * 주의: content는 서버에서 이미 sanitize된 안전한 HTML이어야 합니다.
 * XSS 공격을 방지하기 위해 서버 측에서 DOMPurify 등으로 sanitize된 HTML만 전달해야 합니다.
 */
export function TiptapViewer({ content, className }: TiptapViewerProps) {
  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
