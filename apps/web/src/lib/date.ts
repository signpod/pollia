import { format, parse } from "date-fns";

/**
 * Date 객체를 로컬 타임존 기준 YYYY-MM-DD 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateToLocalString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * YYYY-MM-DD 문자열을 로컬 타임존 기준 Date 객체로 변환
 * @param dateString - YYYY-MM-DD 형식의 문자열
 * @returns 로컬 타임존 기준 00:00:00으로 설정된 Date 객체
 */
export const parseDateFromLocalString = (dateString: string): Date => {
  return parse(dateString, "yyyy-MM-dd", new Date());
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const getCurrentDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * 현재 시간을 HH:mm 형식으로 반환 (분 단위 반올림 옵션)
 * @param roundMinutesTo - 분을 반올림할 단위 (기본값: 5)
 * @returns HH:mm 형식의 문자열
 */
export const getCurrentTime = ({
  roundMinutesTo = 5,
}: { roundMinutesTo?: number } = {}): string => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = roundMinutesTo
    ? Math.floor(minutes / roundMinutesTo) * roundMinutesTo
    : minutes;

  const adjustedDate = new Date(now);
  adjustedDate.setMinutes(roundedMinutes);

  return format(adjustedDate, "HH:mm");
};
