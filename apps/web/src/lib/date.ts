/**
 * Date 객체를 로컬 타임존 기준 YYYY-MM-DD 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD 문자열을 로컬 타임존 기준 Date 객체로 변환
 * @param dateString - YYYY-MM-DD 형식의 문자열
 * @returns 로컬 타임존 기준 00:00:00으로 설정된 Date 객체
 */
export const parseDateFromLocalString = (dateString: string): Date => {
  const parts = dateString.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0]!;
};

export const getCurrentTime = ({
  roundMinutesTo = 5,
}: { roundMinutesTo?: number } = {}): string => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const roundedMinutes = roundMinutesTo
    ? Math.floor(minutes / roundMinutesTo) * roundMinutesTo
    : minutes;

  return `${String(hours).padStart(2, "0")}:${String(roundedMinutes).padStart(2, "0")}`;
};
