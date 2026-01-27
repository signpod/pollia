export function calculateDaysLeft(deadline: Date | null): number {
  if (!deadline) return 99;
  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "약 5분";
  if (minutes < 60) return `약 ${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `약 ${hours}시간 ${mins}분` : `약 ${hours}시간`;
}
