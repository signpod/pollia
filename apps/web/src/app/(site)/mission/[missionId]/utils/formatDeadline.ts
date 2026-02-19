export const formatDeadline = (deadline: string | Date) => {
  const date = new Date(deadline);

  const formatted = date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // "2024. 12. 23. 23:30" → "2024.12.23 23:30"
  return formatted.replace(/\. /g, ".").replace(/\.(\d{2}:)/, " $1");
};
