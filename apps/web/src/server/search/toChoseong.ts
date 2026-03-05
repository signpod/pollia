const HANGUL_BASE = 44032;
const HANGUL_LAST = 55203;
const HANGUL_CYCLE = 588;

const CHOSEONG_TABLE = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

export function toChoseong(value: string): string {
  return Array.from(value.normalize("NFC"))
    .map(char => {
      if (char === " ") {
        return "";
      }

      const code = char.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
        const choseongIndex = Math.floor((code - HANGUL_BASE) / HANGUL_CYCLE);
        return CHOSEONG_TABLE[choseongIndex] ?? "";
      }

      if (/[a-zA-Z0-9]/.test(char)) {
        return char.toLowerCase();
      }

      return "";
    })
    .join("");
}
