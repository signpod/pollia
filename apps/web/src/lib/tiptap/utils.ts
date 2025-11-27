/**
 * Tiptap HTML이 실제로 비어있는지 확인합니다.
 * Tiptap은 빈 상태일 때 <p></p>를 반환하므로, 실제 텍스트 콘텐츠가 있는지 확인합니다.
 */
export function isTiptapContentEmpty(html: string): boolean {
  if (!html || html.trim() === "") {
    return true;
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  return textContent.trim() === "";
}

export function sanitizeTiptapContent(html: string): string | null {
  return isTiptapContentEmpty(html) ? null : html;
}
