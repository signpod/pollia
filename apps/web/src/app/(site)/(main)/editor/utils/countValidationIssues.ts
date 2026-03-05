export function countValidationIssues(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  if ("message" in value) {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countValidationIssues(item), 0);
  }

  return Object.values(value).reduce((sum, item) => sum + countValidationIssues(item), 0);
}
