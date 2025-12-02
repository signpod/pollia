/**
 * sessionStorage에서 값을 가져옴
 * @param key - 저장된 키
 * @returns 저장된 값 또는 null
 */
export function getSessionStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem(key);
}

/**
 * sessionStorage에 값을 저장
 * @param key - 저장할 키
 * @param value - 저장할 값
 */
export function setSessionStorage(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(key, value);
}

/**
 * sessionStorage에서 값을 삭제
 * @param key - 삭제할 키
 */
export function removeSessionStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(key);
}

/**
 * sessionStorage에서 JSON 객체를 가져옴
 * @param key - 저장된 키
 * @param defaultValue - 값이 없을 때 반환할 기본값
 * @returns 파싱된 객체 또는 기본값
 */
export function getSessionStorageJSON<T>(key: string, defaultValue: T): T {
  const stored = getSessionStorage(key);
  if (!stored) {
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * sessionStorage에 JSON 객체를 저장
 * @param key - 저장할 키
 * @param value - 저장할 객체
 */
export function setSessionStorageJSON<T>(key: string, value: T): void {
  setSessionStorage(key, JSON.stringify(value));
}
