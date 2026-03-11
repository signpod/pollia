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

export function computeMissionStatus(
  isActive: boolean,
  deadline: string | null,
  startDate: string | null,
): string | null {
  const now = new Date();

  if (!isActive) return "마감";
  if (deadline && new Date(deadline) < now) return "마감";
  if (startDate && new Date(startDate) > now) return "예정";
  return "모집 중";
}

export function toSurveyCardData(mission: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  estimatedMinutes: number | null;
  deadline: Date | null;
  maxParticipants: number | null;
  category: import("@prisma/client").MissionCategory;
  createdAt: Date;
  isActive: boolean;
  likesCount: number;
  viewCount: number;
}) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description ?? "",
    imageUrl: mission.imageUrl ?? "",
    duration: formatDuration(mission.estimatedMinutes),
    daysLeft: calculateDaysLeft(mission.deadline),
    reward: null,
    currentParticipants: 0,
    maxParticipants: mission.maxParticipants ?? 100,
    category: mission.category,
    createdAt: mission.createdAt.toISOString(),
    isActive: mission.isActive,
    deadline: mission.deadline?.toISOString() ?? null,
    startDate: (mission as unknown as { startDate?: Date }).startDate?.toISOString() ?? null,
    likesCount: mission.likesCount,
    viewCount: mission.viewCount,
  };
}
