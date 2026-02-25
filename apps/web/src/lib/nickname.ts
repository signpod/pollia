const POSITIVE_ADJECTIVES = [
  "행복한",
  "기쁜",
  "밝은",
  "따뜻한",
  "활기찬",
  "유쾌한",
  "상쾌한",
  "맑은",
  "즐거운",
  "사랑스러운",
  "귀여운",
  "멋진",
  "용감한",
  "다정한",
  "친절한",
  "유연한",
  "차분한",
  "희망찬",
  "신나는",
  "재미있는",
] as const;

export function generateNickname(): string {
  const adjective = POSITIVE_ADJECTIVES[Math.floor(Math.random() * POSITIVE_ADJECTIVES.length)];
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${adjective}폴리안${digits}`;
}
