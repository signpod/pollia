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

/**
 * Date 객체와 시간 문자열을 결합하여 새로운 Date 객체 생성
 * @param date - 날짜 정보를 가진 Date 객체
 * @param time - HH:mm 형식의 시간 문자열
 * @returns 날짜와 시간이 결합된 Date 객체
 */
export const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return combined;
};

/**
 * Date 객체 또는 ISO 문자열을 YYYY-MM-DD 형식으로 변환
 * @param date - 변환할 Date 객체 또는 ISO 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체 또는 ISO 문자열을 HH:mm 형식으로 변환
 * @param date - 변환할 Date 객체 또는 ISO 문자열
 * @returns HH:mm 형식의 문자열
 */
export function formatDateToHHMM(date: Date | string): string {
  if (typeof date === "string") {
    const timeMatch = date.match(/T(\d{2}):(\d{2})/);
    if (timeMatch?.[1] && timeMatch?.[2]) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }
  }
  const d = typeof date === "string" ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
export const formatDateToYYYYMMDDTHHMM = (date: Date, time: string): Date => {
  const dateString = format(date, "yyyy-MM-dd");
  return new Date(`${dateString}T${time}`);
};

/**
 * Date 객체를 "M월 d일" 형식으로 변환 (한글)
 * @param date - 변환할 Date 객체
 * @returns "M월 d일" 형식의 문자열 (예: "1월 22일")
 */
export function formatToMonthDay(date: Date): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}
