export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength - 3)}...`;
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
