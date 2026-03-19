import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";
import { pickNewerDraft } from "../quizDraftResolveModel";

function createDraft(updatedAtMs: number | null): EditorMissionDraftPayload {
  return {
    basic: { title: "test" },
    reward: null,
    action: null,
    completion: null,
    quizConfig: null,
    meta: { updatedAtMs },
  };
}

describe("pickNewerDraft", () => {
  // Given: 양쪽 모두 null
  // Then: null을 반환한다
  it("양쪽 모두 null이면 null을 반환한다", () => {
    expect(pickNewerDraft(null, null)).toBeNull();
  });

  // Given: 서버 드래프트만 존재
  // Then: 서버 드래프트를 반환한다
  it("서버 드래프트만 있으면 서버 드래프트를 반환한다", () => {
    const server = createDraft(1000);
    expect(pickNewerDraft(server, null)).toBe(server);
  });

  // Given: 로컬 드래프트만 존재
  // Then: 로컬 드래프트를 반환한다
  it("로컬 드래프트만 있으면 로컬 드래프트를 반환한다", () => {
    const local = createDraft(2000);
    expect(pickNewerDraft(null, local)).toBe(local);
  });

  // Given: 로컬이 더 최신
  // Then: 로컬 드래프트를 반환한다
  it("로컬이 더 최신이면 로컬 드래프트를 반환한다", () => {
    const server = createDraft(1000);
    const local = createDraft(2000);
    expect(pickNewerDraft(server, local)).toBe(local);
  });

  // Given: 서버가 더 최신
  // Then: 서버 드래프트를 반환한다
  it("서버가 더 최신이면 서버 드래프트를 반환한다", () => {
    const server = createDraft(3000);
    const local = createDraft(1000);
    expect(pickNewerDraft(server, local)).toBe(server);
  });

  // Given: 동일한 타임스탬프
  // Then: 로컬 드래프트를 우선한다 (localUpdatedAt >= serverUpdatedAt)
  it("동일한 타임스탬프면 로컬 드래프트를 우선한다", () => {
    const server = createDraft(1000);
    const local = createDraft(1000);
    expect(pickNewerDraft(server, local)).toBe(local);
  });

  // Given: meta.updatedAtMs가 null인 경우
  // Then: 0으로 취급하여 비교한다
  it("meta.updatedAtMs가 null이면 0으로 취급한다", () => {
    const server = createDraft(null);
    const local = createDraft(1000);
    expect(pickNewerDraft(server, local)).toBe(local);
  });

  // Given: 양쪽 모두 meta.updatedAtMs가 null
  // Then: 로컬 드래프트를 우선한다 (0 >= 0)
  it("양쪽 모두 updatedAtMs가 null이면 로컬을 우선한다", () => {
    const server = createDraft(null);
    const local = createDraft(null);
    expect(pickNewerDraft(server, local)).toBe(local);
  });

  // Given: meta 자체가 없는 경우
  // Then: 0으로 취급하여 비교한다
  it("meta가 없는 드래프트도 정상 처리한다", () => {
    const server: EditorMissionDraftPayload = { basic: null };
    const local = createDraft(500);
    expect(pickNewerDraft(server, local)).toBe(local);
  });
});
