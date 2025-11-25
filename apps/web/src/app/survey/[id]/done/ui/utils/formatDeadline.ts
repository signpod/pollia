export const formatDeadline = (deadline: string | Date) => {
  return new Date(deadline)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\s/g, "");
};
