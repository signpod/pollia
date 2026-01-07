export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength - 3)}...`;
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function buildUniquePropertyName(
  title: string,
  index: number,
  existingNames: Set<string>,
): string {
  let propertyName = truncateText(title, 100);

  if (existingNames.has(propertyName)) {
    const suffix = ` (${index + 1})`;
    propertyName = truncateText(title, 100 - suffix.length) + suffix;
  }

  existingNames.add(propertyName);
  return propertyName;
}
