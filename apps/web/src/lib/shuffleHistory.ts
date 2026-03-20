import {
  getSessionStorageJSON,
  removeSessionStorage,
  setSessionStorageJSON,
} from "./sessionStorage";

const SHUFFLE_ORDER_KEY_PREFIX = "shuffle_order_";
const SHUFFLE_CURSOR_KEY_PREFIX = "shuffle_cursor_";

function orderKey(missionId: string): string {
  return `${SHUFFLE_ORDER_KEY_PREFIX}${missionId}`;
}

function cursorKey(missionId: string): string {
  return `${SHUFFLE_CURSOR_KEY_PREFIX}${missionId}`;
}

export function getShuffleHistory(missionId: string): string[] {
  return getSessionStorageJSON<string[]>(orderKey(missionId), []);
}

function getCursor(missionId: string): number {
  return getSessionStorageJSON<number>(cursorKey(missionId), -1);
}

function setCursor(missionId: string, cursor: number): void {
  setSessionStorageJSON(cursorKey(missionId), cursor);
}

export function recordShuffleVisit(missionId: string, actionId: string): void {
  const order = getShuffleHistory(missionId);
  const cursor = getCursor(missionId);

  if (cursor >= 0 && cursor < order.length && order[cursor] === actionId) {
    return;
  }

  const nextIndex = cursor + 1;
  if (nextIndex < order.length && order[nextIndex] === actionId) {
    setCursor(missionId, nextIndex);
    return;
  }

  // 커서 이후 항목 제거하고 새로 추가
  const trimmed = order.slice(0, cursor + 1);
  trimmed.push(actionId);
  setSessionStorageJSON(orderKey(missionId), trimmed);
  setCursor(missionId, trimmed.length - 1);
}

export function getShufflePrevious(missionId: string): string | null {
  const order = getShuffleHistory(missionId);
  const cursor = getCursor(missionId);

  if (cursor <= 0) return null;

  const prevCursor = cursor - 1;
  setCursor(missionId, prevCursor);
  return order[prevCursor] ?? null;
}

export function getShuffleNext(missionId: string): string | null {
  const order = getShuffleHistory(missionId);
  const cursor = getCursor(missionId);

  const nextCursor = cursor + 1;
  if (nextCursor < order.length) {
    setCursor(missionId, nextCursor);
    return order[nextCursor]!;
  }

  return null;
}

export function getShuffleVisitedSet(missionId: string): Set<string> {
  return new Set(getShuffleHistory(missionId));
}

export function clearShuffleHistory(missionId: string): void {
  removeSessionStorage(orderKey(missionId));
  removeSessionStorage(cursorKey(missionId));
}
